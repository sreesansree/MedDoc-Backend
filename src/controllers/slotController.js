import mongoose from "mongoose";
import BookingSlot from "../models/BookingSlotModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import sendEmail from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RazorpayId,
  key_secret: process.env.RazorpayKeySecret,
});

const parseTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const createBookingSlot = async (req, res) => {
  const { date, startTime, endTime, price, fixedSlot } = req.body;
  const token = req.cookies.doctorToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctorId = decoded.id;

    // const slotDate = new Date(date);
    // Parse the date string from the request body
    const parsedDate = new Date(date);

    // Set the time to 00:00:00 to ensure it represents the intended date
    // slotDate.setHours(0, 0, 0, 0);

    // console.log("Slot Date from slot Controller 33 : ", slotDate);
    // const adjustedDate = new Date(slotDate.getTime());
    
    // console.log("Adjusted Slot Date: ", adjustedDate);
    // if (isNaN(slotDate.getTime())) {
      //   return res.status(400).json({ message: "Invalid date format" });
      // }
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      // Adjust the date to the local time zone (IST)
      const slotDate = new Date(parsedDate.getTime() + 5.5 * 60 * 60 * 1000);
      console.log("Slot Date from slot Controller 51 : ", slotDate);


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("todayy",today);
    if (slotDate < today) {
      return res
        .status(400)
        .json({ message: "Cannot create slots for past dates" });
    }

    // If the slot date is today, check if the startTime is in the past
    const currentTime = new Date();
    if (slotDate.getTime() === today.getTime()) {
      if (
        parseTime(startTime) <=
        currentTime.getHours() * 60 + currentTime.getMinutes()
      ) {
        return res
          .status(400)
          .json({ message: "Cannot create slots for past times" });
      }
    }
    if (parseTime(startTime) >= parseTime(endTime)) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    // Enforce minimum 10-minute difference between startTime and endTime
    if (parseTime(endTime) - parseTime(startTime) < 10) {
      return res
        .status(400)
        .json({ message: "Slot duration must be at least 10 minutes" });
    }

    // Fetch existing slots for the same doctor and date
    const existingSlots = await BookingSlot.find({
      date: slotDate,
      doctor: doctorId,
    });

    // Helper function for calculate the difference between two times in minutes
    // const timeDifferenceInMinutes = (start1, end1, start2, end2) => {
    //   const startTime1 = parseTime(start1);
    //   const endTime1 = parseTime(end1);
    //   const startTime2 = parseTime(start2);
    //   const endTime2 = parseTime(end2);

    //   const gap1 = (startTime2 - endTime1) / (1000 * 60);
    //   const gap2 = (startTime1 - endTime2) / (1000 * 60);

    //   return Math.min(gap1, gap2);
    // };

    // If the slot is a fixed slot, check against predefined fixed slots
    if (fixedSlot) {
      const predefinedFixedSlots = [
        { startTime: "09:00", endTime: "09:30" },
        { startTime: "10:00", endTime: "10:30" },
        { startTime: "11:00", endTime: "11:30" },
        { startTime: "13:00", endTime: "13:30" },
        { startTime: "14:00", endTime: "14:30" },
        { startTime: "15:00", endTime: "15:30" },
        { startTime: "16:00", endTime: "16:30" },
        { startTime: "18:00", endTime: "18:30" },
      ];

      const slotExists = predefinedFixedSlots.some(
        (slot) => startTime === slot.startTime && endTime === slot.endTime
      );

      if (!slotExists) {
        return res.status(400).json({ message: "Fixed slot not available" });
      }

      // Check if the fixed slot overlaps with any existing slot
      // const overlappingSlot = existingSlots.find(
      //   (slot) =>
      //     timeDifferenceInMinutes(
      //       startTime,
      //       endTime,
      //       slot.startTime,
      //       slot.endTime
      //     ) < 10
      // );
      const overlappingSlot = existingSlots.find(
        (slot) =>
          parseTime(startTime) < parseTime(slot.endTime) &&
          parseTime(endTime) > parseTime(slot.startTime)
      );
      if (overlappingSlot) {
        return res
          .status(400)
          .json({ message: "Time overlap with an existing slot" });
      }

      // if (overlappingSlot) {
      //   return res.status(400).json({
      //     message:
      //       "Time overlap or gap less than 10 minutes with an existing slot",
      //   });
      // }
    } else {
      // For non-fixed slots, check if there are already 8 slots
      if (existingSlots.length >= 8) {
        return res.status(400).json({
          message: "Cannot create more than eight slots for this date",
        });
      }

      // Check for time overlap with existing slots
      const overlappingSlot = existingSlots.find(
        (slot) =>
          parseTime(startTime) < parseTime(slot.endTime) &&
          parseTime(endTime) > parseTime(slot.startTime)
      );

      if (overlappingSlot) {
        return res
          .status(400)
          .json({ message: "Time overlap with an existing slot" });
      }
    }

    // Create the new slot
    const newSlot = new BookingSlot({
      date: slotDate,
      startTime: startTime,
      endTime: endTime,
      isBooked: false,
      price,
      doctor: doctorId,
      fixedSlot,
    });
    console.log("newSlots from createSlots 162", newSlot);

    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const getDoctorsSlots = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const slots = await BookingSlot.find({
      doctor: id,
    });
    // console.log("Slotssssssss ================",slots)

    res.status(200).json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const bookSlotWithPayment = async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await BookingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    const order = await razorpay.orders.create({
      amount: slot.price * 100,
      currency: "INR",
      receipt: `receipt_order_${slotId}`,
      payment_capture: 1,
    });

    slot.orderId = order.id;
    await slot.save();

    res.status(200).json({
      orderId: order.id,
      amount: slot.price * 100,
      currency: "INR",
      key_id: process.env.RazorpayId,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RazorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature === signature) {
    const slot = await BookingSlot.findOne({ orderId });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    slot.isBooked = true;
    slot.user = req.user.id;
    slot.paymentId = paymentId;
    await slot.save();
    // console.log(slot," : =====> slot booked")
    res.status(200).json({ message: "Payment successful and slot booked" });
  } else {
    res.status(400).json({ message: "Invalid signature" });
  }
};

export const updateBookingSlot = async (req, res) => {
  const { slotId } = req.params;
  const { date, startTime, endTime, price, fixedSlot } = req.body;
  const token = req.cookies.doctorToken;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctorId = decoded.id;

    const slot = await BookingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Cannot update a booked slot" });
    }

    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    const existingSlots = await BookingSlot.find({
      date: slotDate,
      doctor: doctorId,
    });

    const overlappingSlot = existingSlots.find(
      (existingSlot) =>
        existingSlot._id.toString() !== slotId &&
        startTime < existingSlot.endTime &&
        endTime > existingSlot.startTime
    );

    if (overlappingSlot) {
      return res
        .status(400)
        .json({ message: "Time overlap with an existing slot" });
    }

    slot.date = slotDate;
    slot.startTime = startTime;
    slot.endTime = endTime;
    slot.price = price;
    slot.fixedSlot = fixedSlot;

    const updatedSlot = await slot.save();
    res.status(200).json(updatedSlot);
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const deleteBookingSlot = async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await BookingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: "Cannot delete a booked slot" });
    }

    await BookingSlot.deleteOne({ _id: slotId });
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// single Appointment
export const getAppointment = async (req, res) => {
  const { id } = req.params;
  console.log("id from getAppointment : ", id);
  try {
    const appointment = await BookingSlot.findById(id)
      .populate("doctor")
      .populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    console.log("Appointmnet  : ", appointment);

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel appointment and issue refund
export const cancelAppointment = async (req, res) => {
  const { id } = req.params; // appointment ID
  const { reason } = req.body;
  let refundSuccess = false;
  try {
    const appointment = await BookingSlot.findById(id);
    // console.log(appointment, " : appointment ");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // if appointment is already cancelled, return an error
    if (appointment.status === "canceled") {
      return res.status(400).json({ message: "Appointment already canceled" });
    }

    // refund logic
    if (appointment.isBooked && appointment.paymentId) {
      const refund = await razorpay.payments.refund(appointment.paymentId);

      if (!refund) {
        return res.status(500).json({ message: "Refund failed" });
      }
      refundSuccess = true;
    }

    // update appointment status to canceled
    appointment.status = "canceled";
    appointment.cancelReason = reason;
    appointment.isBooked = false;
    await appointment.save();
    res
      .status(200)
      .json({ message: "Appointment Canceled Successfully", refundSuccess });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

// Fetch only canceled appointments for the user

// export const getCanceledAppointmentsUser = async (req, res) => {
//   const id= req.user.id;
//   try {
//     const canceledAppointments = await BookingSlot.find({
//       user: id,
//       status: "canceled",
//     })
//       .populate("doctor")
//       .populate("user")
//       .sort({ date: 1 });
//     res.status(200).json(canceledAppointments);
//   } catch (error) {
//     console.error("Error fetching canceled appointments:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const selectNewSlot = async (req, res) => {
  const { appointmentId } = req.params;
  const { selectedSlot } = req.body;
  try {
    const appointment = await BookingSlot.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not Found" });
    }

    // Update the appointment with selected new slot
    appointment.startTime = selectedSlot.startTime;
    appointment.endTime = selectedSlot.endTime;
    appointment.date = selectedSlot.date;
    appointment.rescheduled = true;

    await appointment.save();

    const doctor = await Doctor.findById(appointment.doctor);
    const user = await User.findById(appointment.user);

    // Send confirmation emails to both the doctor and user
    sendEmail(
      doctor.email,
      "Appointment Rescheduled",
      `Your appointment with ${user.name} has been rescheduled to ${appointment.date} - ${appointment.startTime} to ${appointment.endTime}.`
    );
    sendEmail(
      user.email,
      "Appointment Rescheduled Confirmation",
      `Your appointment with Dr. ${doctor.name} has been rescheduled to ${appointment.date} - ${appointment.startTime} to ${appointment.endTime}.`
    );

    res
      .status(200)
      .json({ message: "Appointment Rescheduled successfully", appointment });
  } catch (error) {
    console.error("Error selecting new slot:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const getAvailableRescheduledSlots = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    // Fetching the appointment details
    const appointment = await BookingSlot.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    // Assume that the new available slots are part of the appointment data
    // OR if newSlots are not in the appointment, fetch them from a separate Slots table
    const availableSlots = appointment.newSlots || [];
    // Check if availableSlots exists, otherwise return an error
    if (!availableSlots.length) {
      return res
        .status(404)
        .json({ message: "No available reschedule slots." });
    }

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error("Error fetching available reschedule slots:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching reschedule slots." });
  }
};
