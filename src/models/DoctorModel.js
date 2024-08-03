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
  profilePicture: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  },
  mobile: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  certificate: {
    type: String,
    required: false,
  },
  qualification: {
    type: String,
    required: false,
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
  state: {
    type: String,
    default: "kerala",
  },
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "doctor",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  experience: {
    type: Number,
    required: false,
  },
  starRating: {
    type: Number,
    required: false,
    min: 1,
    max: 5,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
