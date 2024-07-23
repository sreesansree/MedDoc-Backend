// models/activityModel.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    }, // e.g., 'user_registered', 'appointment_booked'
    description: {
      type: String,
      required: true,
    }, // e.g., 'New user registered'
    name: {
      type: String,
      required: true,
    }, // e.g., 'Yuvaraj Singh'
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // Reference to User model
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    }, // Reference to Doctor model
    time: {
      type: String,
      required: true,
    }, // e.g., '5 mins ago'
    badgeColor: {
      type: String,
      required: true,
    }, // e.g., 'info', 'success'
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
