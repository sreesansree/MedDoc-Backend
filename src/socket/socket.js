import { Server } from "socket.io";
import cron from "node-cron";
import BookingSlot from "../models/BookingSlotModel.js";
import sendEmail from "../utils/sendEmail.js";

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
    // console.log("Connected to socket", socket.id);
    console.log(`⚡: ${socket.id} user just connected!`);
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
    // Handle file and message sending

    socket.on("send-message", (data) => {
      const { receiverId, senderId, senderName } = data;
      const user = activeUsers.find((user) => user.userId === receiverId);
      console.log("Sending from Socket to : ", receiverId);
      console.log("Data : ", data);
      console.log("senderId : ", senderId);
      console.log("senderName : ", senderName);

      if (user) {
        io.to(user.socketId).emit("receive-message", {
          message: data.message,
          file: data.file, // Include file URL
          fileType: data.fileType, // Include file type
          chatId: data.chatId,
        });
        // Emit the notification with senderName
        io.to(user.socketId).emit("getNotification", {
          senderId: senderId,
          senderName: senderName, // Include the senderName in the notification
          isRead: false,
          date: new Date(),
        });
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
      console.log(`❌: ${socket.id} user disconnected.`);
    });
  });

  // Function to send appointment reminders
  async function sendAppointmentReminders() {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead in UTC

    // Convert `now` and `nextHour` to the local time (IST)
    const nowLocal = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000
    );
    const nextHourLocal = new Date(
      nextHour.getTime() +
        nextHour.getTimezoneOffset() * 60000 +
        5.5 * 60 * 60 * 1000
    );

    try {
      const allSlots = await BookingSlot.find({ isBooked: true }).populate(
        "doctor user"
      );

      console.log(
        "All Slots from Socket Reminder ===> ",
        allSlots.map((slot) => slot.date)
      );

      const slots = allSlots.filter((slot) => {
        // Combine slot date with startTime and endTime to create DateTime objects
        const [startHour, startMinute] = slot.startTime.split(":");
        const [endHour, endMinute] = slot.endTime.split(":");

        const slotStartTime = new Date(slot.date);
        slotStartTime.setUTCHours(startHour, startMinute);

        const slotEndTime = new Date(slot.date);
        slotEndTime.setUTCHours(endHour, endMinute);

        // Adjust slot times to the local time zone (IST)
        const slotStartTimeLocal = new Date(
          slotStartTime.getTime() +
            slotStartTime.getTimezoneOffset() * 60000 +
            5.5 * 60 * 60 * 1000
        );
        const slotEndTimeLocal = new Date(
          slotEndTime.getTime() +
            slotEndTime.getTimezoneOffset() * 60000 +
            5.5 * 60 * 60 * 1000
        );

        console.log(
          `Slot Start Local: ${slotStartTimeLocal}, Slot End Local: ${slotEndTimeLocal}`
        );

        return (
          slotStartTimeLocal >= nowLocal && slotStartTimeLocal <= nextHourLocal
        );
      });

      console.log("Slots from Socket Reminder ===> ", slots);

      slots.forEach(async (slot) => {
        const formattedDate = slot.date.toLocaleDateString();
        const time = slot.startTime;

        if (!slot.patientReminderSent && slot.user) {
          // Send real-time reminder via Socket.io
          io.to(slot.user._id.toString()).emit("appointmentReminder", {
            message: `You have an appointment with Dr. ${slot.doctor.name} on ${formattedDate} at ${time}.`,
            type: "reminder",
          });

          // Send Email reminder
          await sendEmail(
            slot.user.email,
            "Appointment Reminder @ MedDoc",
            `You have an appointment with Dr. ${slot.doctor.name} on ${formattedDate} at ${time}.`
          );

          console.log(
            "-------------------email sent to user from reminder------------------"
          );
          slot.patientReminderSent = true;
        }

        if (!slot.doctorReminderSent && slot.doctor) {
          const userName = slot.user?.name || "User";

          // Send real-time reminder via Socket.io
          io.to(slot.doctor._id.toString()).emit("appointmentReminder", {
            message: `You have an appointment with ${userName} on ${formattedDate} at ${time}.`,
            type: "reminder",
          });

          // Send Email reminder
          await sendEmail(
            slot.doctor.email,
            "Appointment Reminder @ MedDoc",
            `You have an appointment with ${userName} on ${formattedDate} at ${time}.`
          );
          slot.doctorReminderSent = true;
        }

        // Save the updated reminder status
        await slot.save();
      });
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  }

  // Schedule cron job to check every 10 minutes
  cron.schedule("*/10 * * * *", sendAppointmentReminders);

  return io;
};

export default setupSocket;
