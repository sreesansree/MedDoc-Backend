import Doctor from "../models/DoctorModel.js";
import {
  generateToken,
  hashPassword,
  comparePassword,
} from "../utils/authUtils.js";
// import asyncHandler from "express-async-handler";

import otpService from "../service/otpService.js";

export const registerDoctorUseCase = async (name, email, password) => {
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new Error("Doctor already exists with this email.");
  }

  const hashedPassword = await hashPassword(password);
  const otp = otpService.generateOTP();

  const doctor = new Doctor({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpires: Date.now() + 3600000, // one hour
  });

  await doctor.save();
  await otpService.sendOTP(email, otp);

  return doctor;
};

export const verifyOtpUseCase = async (email, enteredOtp) => {
  const doctor = await Doctor.findOne({ email });
  if (
    !doctor ||
    !otpService.validateOtp(doctor.otp, doctor.otpExpires, enteredOtp)
  ) {
    throw new Error("Invalid OTP or OTP has expired");
  }
  doctor.is_blocked = false;
  doctor.isVerified = true;
  doctor.otp = undefined;
  doctor.otpExpires = undefined;
  await doctor.save();

  return doctor;
};

export const loginDoctorUseCase = async (email, password) => {
  if (!email || !password) {
    throw new Error("please fill all the field");
  }
  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    throw new Error("Doctor not Found");
  }
  if (!doctor.isVerified) {
    throw new Error("You have to verify your're account before login");
  }
  if (doctor.is_blocked) {
    throw new Error("Your account got blocked by the admin");
  }
  const isPasswordValid = await comparePassword(password, doctor.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const doctorToken = generateToken({ id: doctor._id, role: "doctor" });

  return {
    id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    doctorToken: doctorToken,
  };
};
