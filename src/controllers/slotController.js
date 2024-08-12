import mongoose from "mongoose";
import BookingSlot from "../models/BookingSlotModel.js";
import Doctor from "../models/DoctorModel.js";
// create a new booking slot
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

    const slotDate = new Date(date);
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

    const existingSlots = await BookingSlot.find({
      date: slotDate,
      doctor: doctorId,
    });

    if (fixedSlot) {
      const predefinedFixedSlots = [
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "10:00", endTime: "11:00" },
        { startTime: "11:00", endTime: "12:00" },
        { startTime: "13:00", endTime: "14:00" },
        { startTime: "14:00", endTime: "15:00" },
        // Add more fixed slots as needed
      ];

      const slotExists = predefinedFixedSlots.some(
        (slot) => startTime === slot.startTime && endTime === slot.endTime
      );

      if (!slotExists) {
        return res.status(400).json({ message: "Fixed slot not available" });
      }
    } else {
      if (existingSlots.length >= 8) {
        return res.status(400).json({
          message: "Cannot create more than eight slots for this date",
        });
      }

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

    const newSlot = new BookingSlot({
      date: slotDate,
      startTime: startTime,
      endTime: endTime,
      isBooked: false,
      price,
      doctor: doctorId,
    });

    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

//Get all booking slots for a doctor
export const getDoctorsSlots = async (req, res) => {
  const { id } = req.params;
  // const { doctorId } = req.params;
  console.log(req.params);

  console.log("Received doctor ID:", id);

  try {
    // Ensure doctorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    const slots = await BookingSlot.find({ doctor: id });
    console.log(slots);
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a slot

export const bookSlotWithPayment = async (req, res) => {
  const { slotId } = req.params;
  // console.log(slotId, "slotIddddddddddddddddddd");
  try {
    const slot = await BookingSlot.findById(slotId);
    // console.log(slot, "found slotttttttttttttttttttttt");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: slot.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${slotId}`,
      payment_capture: 1,
    });
    console.log(order, "ORdereeeeeeeeee");
    slot.orderId = order.id; // Adjust according to your schema
    await slot.save();

    res.status(200).json({
      orderId: order.id,
      amount: slot.price * 100,
      currency: "INR",
      key_id: process.env.RazorpayId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  console.log(req.body, " From Verify payment");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RazorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature === signature) {
    const slot = await BookingSlot.findOne({ orderId });

    console.log(slot, "slot");
    console.log(orderId, "orderId");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    slot.isBooked = true;
    await slot.save();
    console.log("Slot booking sucesssssss");
    res.status(200).json({ message: "Payment successful and slot booked" });
  } else {
    console.log("Slot booking Failedddddddddddddd");
    res.status(400).json({ message: "Invalid signature" });
  }
};

// Update a booking slot
export const updateBookingSlot = async (req, res) => {
  const { slotId } = req.params;
  const { date, startTime, endTime, price, fixedSlot } = req.body;
  const token = req.cookies.doctorToken;

  try {
    const slot = await BookingSlot.findById(slotId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctorId = decoded.id;

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Cannot update a booked slot" });
    }

    // Ensure date is properly formatted
    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if the slot time is valid
    if (startTime >= endTime) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    // Fetch existing slots for validation
    const existingSlots = await BookingSlot.find({
      date: slotDate,
      doctor: doctorId,
    });
    // const existingSlots = await BookingSlot.find({
    //   date: slotDate,
    //   doctor: doctorId,
    // });

    const overlappingSlot = existingSlots.find(
      (existingSlot) =>
        existingSlot._id.toString() !== slotId &&
        startTime < existingSlot.endTime &&
        endTime > existingSlot.startTime
    );

    if (overlappingSlot) {
      return res.status(400).json({ message: "Time overlap with an existing slot" });
    }

    // Update the slot details
    slot.date = slotDate;
    slot.startTime = startTime;
    slot.endTime = endTime;
    slot.price = price;
    slot.fixedSlot = fixedSlot;

    const updatedSlot = await slot.save();
    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a booking slot

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

    // Delete the slot
    await BookingSlot.deleteOne({ _id: slotId });
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
