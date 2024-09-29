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
  // New fields for reminders
  patientReminderSent: {
    type: Boolean,
    default: false,
  },
  doctorReminderSent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "canceled"], // Defines possible status values
    default: "upcoming", // Default value for new appointments
  },
  // Field for cancellation reason
  cancelReason: {
    type: String,
    required: function () {
      return this.status === "canceled"; // Required only if status is 'canceled'
    },
    default: null, // Default is null when not canceled
  },
  paymentId: {
    type: String,
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
  },
  rating: {
    type: Number,
  },
});

const BookingSlot = mongoose.model("BookingSlot", bookingSlotSchema);

export default BookingSlot;
