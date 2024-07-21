// models/Doctor.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  is_blocked: {
    type: Boolean,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "doctor",
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
