import mongoose from "mongoose";

const bookingSlotSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
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
});

const BookingSlot = mongoose.model("BookingSlot", bookingSlotSchema);

export default BookingSlot;
