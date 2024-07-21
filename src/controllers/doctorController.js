import Doctor from "../models/DoctorModel.js";
import authService from "../service/authService.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

import {
  registerDoctorUseCase,
  verifyOtpUseCase,
  loginDoctorUseCase,
} from "../usecase/doctorUseCase.js";

export const registerDoctor = asyncHandler(async (req, res) => {
  try {
    console.log(req.body, "req bodyyy");
    const { name, email, password } = req.body;
    await registerDoctorUseCase(name, email, password);
    res.status(200).json({
      message: "Doctor register successfully , check your email for OTP",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  await verifyOtpUseCase(email, otp);

  res
    .status(200)
    .json({ message: "OTP verified successfully. You can log in." });
});

export const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const response = await loginDoctorUseCase(email, password);

  res.cookie("doctorToken", response.doctorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });
  res.status(200).json({ message: "Login Successful", response });
});

export const logoutDoctor = asyncHandler(async (req, res) => {
  res.clearCookie("doctorToken");
  res.status(200).json({ message: "Logout successfull" });
});
