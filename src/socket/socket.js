import { Server } from "socket.io";
import cron from "node-cron";
import BookingSlot from "../models/BookingSlotModel.js";
import sendEmail from "../utils/sendEmail.js";
import Notification from "../models/NotificationModel.js";

const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: [
        "http://localhost:5173",
        "https://meddoctor.online",
        "https://peppy-sfogliatella-ed8557.netlify.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let activeUsers = [];

  // console.log("Active User : ", activeUsers);

  io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Chat and user management logic
    // Add new user to activeUsers
    socket.on("new-user-add", async (newUserId) => {
      // if user is not added previously
      const existingUser = activeUsers.find(
        (user) => user.userId === newUserId
      );

      if (!existingUser) {
        activeUsers.push({
          userId: newUserId,
          socketId: socket.id,
        });
      } else {
        existingUser.socketId = socket.id; // Update socketId if user reconnects
      }
      // Fetch and emit all stored notifications when user reconnects
      const storedNotifications = await Notification.find({
        receiverId: newUserId,
      });
      if (storedNotifications.length > 0) {
        io.to(socket.id).emit("getStoredNotifications", storedNotifications);
        await Notification.deleteMany({ receiverId: newUserId }); // Clear after sending
      }

      io.emit("get-users", activeUsers); // Update active users for everyone

      // if (!activeUsers.some((user) => user.userId === newUserId)) {
      //   activeUsers.push({
      //     userId: newUserId,
      //     socketId: socket.id,
      //   });
      // }
      // console.log("Connected Users ==> ", activeUsers);
      /*      
      io.emit("get-users", activeUsers);

      // Fetch stored notifications for the user
      const storedNotifications = await Notification.find({ receiverId: newUserId });
      console.log("Stored Notifications :",storedNotifications)
      if (storedNotifications.length > 0) {
        io.to(socket.id).emit("getStoredNotifications", storedNotifications);
        // Optionally, clear the notifications from the DB after sending
        await Notification.deleteMany({ receiverId: newUserId });
      } */

      // Emit stored notifications to the user
      // socket.emit("getStoredNotifications", storedNotifications);
    });

    /* Send-messages */
    // Handle file and message sending

    socket.on("send-message", async (data) => {
      const { receiverId, senderId, senderName, text, userType } = data;
      const user = activeUsers.find((user) => user.userId === receiverId);

      if (receiverId !== senderId) {
        if (user) {
          // Send real-time notification to the active user
          io.to(user.socketId).emit("receive-message", {
            message: data.message,
            file: data.file, // Include file URL
            fileType: data.fileType, // Include file type
            chatId: data.chatId,
            text,
            senderId,
            senderName,
          });

          // Emit real-time notification for the active user
          io.to(user.socketId).emit("getNotification", {
            senderId,
            senderName,
            isRead: false,
            date: new Date(),
            userType,
            message: `You received a new message from ${senderName}`,
          });
        } else {
          // User is offline, store the notification in the database
          const newNotification = new Notification({
            receiverId,
            senderId,
            senderName,
            message: `You received a new message from ${senderName}`,
            chatId: data.chatId,
            isRead: false,
            userType,
            date: new Date(),
          });
          await newNotification.save(); // Save the notification in MongoDB
          // Emit a "store-notification" event to the client
          io.emit("store-notification", newNotification);
        }
      }
    });
    console.log("---------------------- ");
    console.log("activeUserss : ", activeUsers);
    console.log("---------------------- ");
    // Disconnect logic
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log(
        "Active user Disconnected and Remaining users ==>  ",
        activeUsers
      );
      io.emit("get-users", activeUsers);
      console.log(`❌: ${socket.id} user just disconnected.`);
    });
  });

  // Function to send appointment reminders
  async function sendAppointmentReminders() {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead in UTC
    // console.log("now 102:", now);
    // console.log("now 102:", nextHour);
    // Convert `now` and `nextHour` to the local time (IST)
    const nowLocal = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000
    );
    const nextHourLocal = new Date(
      nextHour.getTime() +
        nextHour.getTimezoneOffset() * 60000 +
        5.5 * 60 * 60 * 1000
    );
    // console.log("Now Local time : ", nowLocal);
    // console.log(" Next hour local time : ", nextHourLocal);

    try {
      const allSlots = await BookingSlot.find({ isBooked: true }).populate(
        "doctor user"
      );

      // console.log("All Slots reminder 120 : ", allSlots);

      // console.log(
      //   "All Slots from Socket Reminder ===> ",
      //   allSlots.map((slot) => slot.date)
      // );

      const slots = allSlots.filter((slot) => {
        // Combine slot date with startTime and endTime to create DateTime objects
        const [startHour, startMinute] = slot.startTime.split(":");
        const [endHour, endMinute] = slot.endTime.split(":");

        const slotStartTime = new Date(slot.date);
        slotStartTime.setUTCHours(startHour, startMinute);

        const slotEndTime = new Date(slot.date);
        slotEndTime.setUTCHours(endHour, endMinute);
        // console.log("Slots StartTime from slotss 135 :", slotStartTime);
        // console.log("Slots EndTime from slotss 136 :", slotEndTime);

        // Adjust slot times to the local time zone (IST)
        const slotStartTimeLocal = new Date(
          slotStartTime.getTime() +
            slotStartTime.getTimezoneOffset() * 60000 +
            5.5 * 60 * 60 * 1000
        );
        // console.log(
        //   "Slots StartTime Local from slotss 145 :",
        //   slotStartTimeLocal
        // );
        const slotEndTimeLocal = new Date(
          slotEndTime.getTime() +
            slotEndTime.getTimezoneOffset() * 60000 +
            5.5 * 60 * 60 * 1000
        );
        // console.log("Slots EndTime Local from slotss 153 :", slotEndTimeLocal);

        // console.log(
        //   `Slot Start Local: ${slotStartTimeLocal}, Slot End Local: ${slotEndTimeLocal}`
        // );

        return (
          slotStartTimeLocal >= nowLocal && slotStartTimeLocal <= nextHourLocal
        );
      });

      // console.log("Slots from Socket Reminder ===> ", slots);

      slots.forEach(async (slot) => {
        const formattedDate = slot.date.toLocaleDateString();
        const time = slot.startTime;
        // console.log("Formatted Date from reminder listner", formattedDate);

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
