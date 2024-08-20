import User from "../models/UserModel.js";

import otpService from "../service/otpService.js";
import authService from "../service/authService.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/authUtils.js";
import Doctor from "../models/DoctorModel.js";
import BookingSlot from "../models/BookingSlotModel.js";

const registerUser = async ({ name, email, mobile, password }) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already Exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = otpService.generateOTP();
  const user = new User({
    name,
    email,
    mobile,
    password: hashedPassword,
    otp,
  });
  await user.save();
  await otpService.sendOTP(email, otp);

  return { message: "User registered, please veriify your email" };
};

const verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  console.log(otp, "OTP");
  console.log(user.otp, "userOTP");
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }
  user.isVerified = true;
  user.otp = null;
  await user.save();
  return { message: "User verified,you can now login" };
};

const loginUser = async ({ email, password }) => {
  const user = await authService.authenticateUser(email, password);
  const token = user.token;
  console.log(token);
  console.log(user,'user from login userCase')
  return { user, token };
};

export const initiatePasswordResetUseCase = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No user found with this email");
  }
  const resetToken = otpService.generateOTP();
  user.otp = resetToken;
  user.otpExpires = Date.now() + 3600000; // 1 hour

  await user.save();
  await otpService.sendOTP(email, resetToken);
};

export const completePasswordResetUseCase = async (
  email,
  enteredOtp,
  newPassword
) => {
  const user = await User.findOne({ email });
  // console.log(user,'userrrrrrrrr')
  if (!user || !otpService.validateOtp(user.otp, user.otpExpires, enteredOtp)) {
    throw new Error("Invalid OTP or OTP has Expired");
  }
  // console.log('Hashing password:', newPassword);
  user.password = await hashPassword(newPassword);
  // console.log(user.password);
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();
};

export const UserProfilUpdateUseCase = async (userId, req) => {
  const bodyData = req.body;
  console.log(bodyData, "body dataaa");
  if (!bodyData) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
      },
    },
    { new: true }
  );
  return updatedUser;
};
const getDoctorById = async (id) => {
  return await Doctor.findById(id).populate("department");
};

const getAppointmentsByUserId = async (userId) => {
  try {
    // const appointments = await bookingSlot
    //   .find({ user: userId })
    //   .populate("doctor");
    // return appointments;
    return await BookingSlot.find({user:userId,isBooked: true}).populate("doctor");
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};

export default {
  registerUser,
  verifyOTP,
  loginUser,
  // google,
  getDoctorById,
  getAppointmentsByUserId,
};
