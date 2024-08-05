import Doctor from "../models/DoctorModel.js";
import authService from "../service/authService.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import {
  registerDoctorUseCase,
  verifyOtpUseCase,
  loginDoctorUseCase,
  initiatePasswordResetUseCase,
  completePasswordResetUseCase,
  doctorProfilUpdateUseCase,
} from "../usecase/doctorUseCase.js";

export const registerDoctor = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const certificate = req.file ? req.file.path : null;
    await registerDoctorUseCase(name, email, password, certificate);
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
  try {
    const { email, password } = req.body;
    const response = await loginDoctorUseCase(email, password);

    res.cookie("doctorToken", response.doctorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
      console.log(newDoctor._doc, "doccc");
      res
        .status(200)
        .cookie("doctorToken", token, {
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

export const initiatePasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await initiatePasswordResetUseCase(email);
  res.status(200).json({
    message: "Password reset initiated. check your email for the link.",
  });
});

export const completePasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  await completePasswordResetUseCase(email, otp, password);
  res.status(200).json({ message: "Password reset Successful." });
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  try {
    const doctorId = req.params.id;

    const updatedDoctor = await doctorProfilUpdateUseCase(doctorId, req);
    console.log(updatedDoctor, "updated doctor");
    if (updatedDoctor) {
      res.status(200).json(updatedDoctor);
      // .json({ message: "Profile updated successfully",  updatedDoctor });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
