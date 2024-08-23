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
  getAppointmentByDoctorID,
  resendOtpUseCase,
} from "../usecase/doctorUseCase.js";
import User from "../models/UserModel.js";
import otpService from "../service/otpService.js";

export const registerDoctor = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, certificate } = req.body;
    // const certificate = req.file ? req.file.path : null;
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

export const resendOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is Required. " });
    }

    await resendOtpUseCase(email);

    res.status(200).json({ message: "OTP has been resent to your email." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  /*  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found." });
  }
  const otp = otpService.generateOTP();
  doctor.otp = otp;
  doctor.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  await doctor.save();
  await otpService.sendOTP(email, otp); */
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
      // console.log(newDoctor._doc, "doccc");
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

// Get doctor appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log("Doctor ID : ", doctorId);
    const appointments = await getAppointmentByDoctorID(doctorId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctor = async (req, res) => {
  const id = req.params.id;
  console.log("'Params Id in Doctor Route Get User ====>  ", id);
  try {
    const user = await User.findById(id);
    if (user) {
      const { password, ...rest } = user._doc;
      res.status(200).json(rest);
    } else {
      res.status(404).json("No such User");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  console.log("user Id : ", req.params.id);
  try {
    const user = await User.findById(id);
    console.log("user ====>", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
