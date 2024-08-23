import { Server } from "socket.io";
import cron from "node-cron";
import BookingSlot from "../models/BookingSlotModel.js";

const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let activeUsers = [];

  io.on("connection", (socket) => {
    console.log("Connected to socket", socket.id);
    const userId = socket.handshake.query.userId; // Pass userId when connecting
    if (userId) {
      socket.join(userId); // Join the room named after the userId
    }
    /*  socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("chat connected");
    });

    socket.on("join-chat", (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit("chat-connected");
    });

    socket.on("send_message", (message) => {
      io.to(message.receiverId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    }); */

    // Chat and user management logic
    /* add new user */
    socket.on("new-user-add", (newUserId) => {
      // if user is not added previously
      console.log(newUserId, "New User Id");
      if (!activeUsers.some((user) => user.userId === newUserId)) {
        activeUsers.push({
          userId: newUserId,
          socketId: socket.id,
        });
      }
      console.log("Connected Users ==> ", activeUsers);
      io.emit("get-users", activeUsers);
    });

    /* Send-messages */
    socket.on("send-message", (data) => {
      const { receiverId } = data;
      const user = activeUsers.find((user) => user.userId === receiverId);
      console.log("Sending from Socket to : ", receiverId);
      console.log("Data : ", data);
      if (user) {
        io.to(user.socketId).emit("receive-message", data);
      }
    });

    // Disconnect logic
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log(
        "Active user Disconnected and Remaining users ==>  ",
        activeUsers
      );
      io.emit("get-users", activeUsers);
    });
  });

  // Function to send appointment reminders
  async function sendAppointmentReminders() {
    const now = new Date("2024-08-21T18:00:00.000Z");
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    // const slots = await BookingSlot.find({
    //   date: {
    //     $gte: now,
    //     $lte: nextHour,
    //   },
    //   isBooked: true,
    //   $or: [{ patientReminderSent: false }, { doctorReminderSent: false }],
    // }).populate("doctor user"); // Fixed the populate syntax

    // console.log("Slots found:", slots);

    const slotsTest = await BookingSlot.find({ date: { $gte: now } });
    // console.log("Slot One", slotsTest); // Check if this returns data

    const allSlots = await BookingSlot.find({}).populate("doctor user");
    // console.log(
    //   "All Slots:",
    //   allSlots.map((slot) => slot.date)
    // );
    const slots = allSlots.filter((slot) => {
      return slot.date >= now && slot.date <= nextHour;
    });

    // console.log("Matching Slots (adjusted time):", slots);

    // const slotsTesttwo = await BookingSlot.find({
    //   date: { $gte: now, $lte: nextHour },
    // });
    // console.log("Slots Two",slotsTesttwo); // Check again if it still has data

    // slots.forEach((slot) => {
    //   const user = activeUsers.find(
    //     (u) => u.userId === slot.user._id.toString()
    //   );
    //   const doctor = activeUsers.find(
    //     (u) => u.userId === slot.doctor._id.toString()
    //   );
    //   console.log("User Reminder ", user);
    //   console.log("Doctor from Reminder ", doctor);
    //   if (user) {
    //     io.to(user.socketId).emit("appointmentReminder", {
    //       message: `Reminder : You have an appointment with Dr. ${slot.doctor.name} at ${slot.startTime}.`,
    //     });
    //   }
    //   if (doctor) {
    //     io.to(doctor.socketId).emit("appointmentReminder", {
    //       message: `Reminder : You have an appointment with ${slot.user.name} at ${slot.startTime}.`,
    //     });
    //   }
    // });
    slots.forEach(async (slot) => {
      if (!slot.patientReminderSent && slot.user) {
        // Send notification to patient
        io.to(slot.user._id.toString()).emit("appointmentReminder", {
          message: `You have an appointment  with Dr ${
            slot.doctor.name
          } on  ${slot.date.toLocaleDateString()} at ${slot.startTime}.`,
          type: "reminder",
        });
        slot.patientReminderSent = false;
      }
    
      if (!slot.doctorReminderSent && slot.doctor) {
        // Ensure slot.user is defined and has a name property
        const userName = slot.user?.name || "User";
        // Send notification to doctor
        io.to(slot.doctor._id.toString()).emit("appointmentReminder", {
          message: `You have an appointment with ${userName} on ${slot.date.toLocaleDateString()} at ${slot.startTime}.`,
          type: "reminder",
        });
        slot.doctorReminderSent = false;
      }
      await slot.save();
    });
  }
  // Schedule the job to run every 10 minutes
  cron.schedule("* * * * *", sendAppointmentReminders);

  return io;
};

export default setupSocket;
