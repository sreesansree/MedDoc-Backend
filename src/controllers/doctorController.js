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

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (doctor) {
      const token = await authService.generateToken(doctor);
      const { password, ...rest } = doctor._doc;
      res
        .status(200)
        .cookie("doctorToken", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const newDoctor = new Doctor({
        name,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      newDoctor.isVerified = true;
      await newDoctor.save();
      const token = authService.generateToken(newDoctor);
      const { password, ...rest } = newDoctor._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const logoutDoctor = asyncHandler(async (req, res) => {
  res.clearCookie("doctorToken");
  res.status(200).json({ message: "Logout successfull" });
});
