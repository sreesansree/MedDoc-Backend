import mongoose from "mongoose";

const bookingSlotSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for booking
  },
  orderId: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: true, // Add this field to represent slot price
  },
  fixedSlot: {
    type: Boolean,
    default: false, // If you want to differentiate fixed slots
  },
});

const BookingSlot = mongoose.model("BookingSlot", bookingSlotSchema);

export default BookingSlot;
