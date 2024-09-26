import mongoose from "mongoose";
import BookingSlot from "../models/BookingSlotModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
    console.log("date from create Slot : ", date);

    const slotDate = new Date(date);

    console.log("Slot Date from createSlot : ", slotDate);
    const adjustedDate = new Date(slotDate.getTime());

    console.log("Adjusted Slot Date: ", adjustedDate);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (slotDate < today) {
      return res
        .status(400)
        .json({ message: "Cannot create slots for past dates" });
    }

    if (parseTime(startTime) >= parseTime(endTime)) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    // Fetch existing slots for the same doctor and date
    const existingSlots = await BookingSlot.find({
      date: slotDate,
      doctor: doctorId,
    });

    // If the slot is a fixed slot, check against predefined fixed slots
    if (fixedSlot) {
      const predefinedFixedSlots = [
        { startTime: "09:00", endTime: "09:30" },
        { startTime: "10:00", endTime: "10:30" },
        { startTime: "11:00", endTime: "11:30" },
        { startTime: "13:00", endTime: "13:30" },
        { startTime: "14:00", endTime: "14:30" },
        { startTime: "15:00", endTime: "15:30" },
        { startTime: "18:00", endTime: "18:30" },
      ];

      const slotExists = predefinedFixedSlots.some(
        (slot) => startTime === slot.startTime && endTime === slot.endTime
      );

      if (!slotExists) {
        return res.status(400).json({ message: "Fixed slot not available" });
      }

      // Check if the fixed slot overlaps with any existing slot
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
