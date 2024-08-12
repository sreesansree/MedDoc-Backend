import mongoose from "mongoose";
import BookingSlot from "../models/BookingSlotModel.js";
import Doctor from "../models/DoctorModel.js";
// create a new booking slot
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RazorpayId,
  key_secret: process.env.RazorpayKeySecret,
});

export const createBookingSlot = async (req, res) => {
  const { doctorEmailOrName, date, startTime, endTime, price } = req.body;

  try {
    // Find doctor by email or name
    const doctor = await Doctor.findOne({
      $or: [{ email: doctorEmailOrName }, { name: doctorEmailOrName }],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if the doctor already has five slots for the specified date
    const existingSlots = await BookingSlot.find({ doctor: doctor._id, date });
    if (existingSlots.length >= 5) {
      return res
        .status(400)
        .json({ message: "Doctor already has five slots for this date" });
    }

    // Check if there is any overlap with existing slots
    const overlappingSlot = existingSlots.find(
      (slot) => startTime < slot.endTime && endTime > slot.startTime
    );
    if (overlappingSlot) {
      return res
        .status(400)
        .json({ message: "There is a time overlap with an existing slot" });
    }

    // Create the new slot
    const newSlot = new BookingSlot({
      doctor: doctor._id,
      date: new Date(date), // Ensure date is properly formatted
      startTime,
      endTime,
      isBooked: false,
      price,
    });
    // Save the slot to the database
    const savedSlot = await newSlot.save();

    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    console.log(slots)
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a slot

export const bookSlotWithPayment = async (req, res) => {
  const { slotId } = req.params;
  console.log(slotId, "slotIddddddddddddddddddd");
  try {
    const slot = await BookingSlot.findById(slotId);
    console.log(slot, "found slotttttttttttttttttttttt");
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
