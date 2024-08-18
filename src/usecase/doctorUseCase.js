import Doctor from "../models/DoctorModel.js";
import {
  generateToken,
  hashPassword,
  comparePassword,
} from "../utils/authUtils.js";
// import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";

import otpService from "../service/otpService.js";
import BookingSlot from "../models/BookingSlotModel.js";

export const registerDoctorUseCase = async (
  name,
  email,
  password,
  certificate
) => {
  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    if (existingDoctor.status === "rejected" && existingDoctor.canReapply) {
      // Reset previous application data
      existingDoctor.status = "pending";
      existingDoctor.rejectionReason = null;
      existingDoctor.applicationAttempts = 0;
    } else {
      throw new Error("Doctor already exists with this email.");
    }
  }

  const hashedPassword = await hashPassword(password);
  const otp = otpService.generateOTP();

  const doctor = new Doctor({
    name,
    email,
    password: hashedPassword,
    certificate,
    otp,
    otpExpires: Date.now() + 3600000, // one hour
  });

  await doctor.save();
  await otpService.sendOTP(email, otp);
  console.log(otpService.sendOTP(email, otp));

  return doctor;
};

export const verifyOtpUseCase = async (email, enteredOtp) => {
  const doctor = await Doctor.findOne({ email });
  if (
    !doctor ||
    !otpService.validateOtp(doctor.otp, doctor.otpExpires, enteredOtp)
  ) {
    throw new Error("Invalid OTP or OTP has expired");
    // return errorHandler(400, "Invalid OTP or OTP has expired");
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
    // return errorHandler(400, "please fill all the field");
  }
  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    throw new Error("Doctor not Found");
    // return errorHandler(400, "Doctor not Found");
  }
  if (!doctor.isVerified) {
    throw new Error("You have to verify your're account before login");
    // return errorHandler(400, "You have to verify your're account before login");
  }
  if (!doctor.isApproved) {
    throw new Error("Your account were not approved by admin yet.");
    // return errorHandler(400, "You have to verify your're account before login");
  }
  if (doctor.is_blocked) {
    throw new Error("Your account got blocked by the admin");
    // return errorHandler(400, "Your account got blocked by the admin");
  }
  const isPasswordValid = await comparePassword(password, doctor.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
    // return errorHandler(400, "Invalid password");
  }
  const doctorToken = generateToken({ id: doctor._id, role: "doctor" });

  return {
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    profilePicture: doctor.profilePicture,
    isApproved: doctor.isApproved,
    mobile: doctor.mobile,
    profilePicture: doctor.profilePicture,
    state: doctor.state,
    qualification: doctor.qualification,
    certificate: doctor.certificate,
    department: doctor.department,
    experience: doctor.experience,
    isVerified: doctor.isVerified,
    doctorToken: doctorToken,
  };
};

export const initiatePasswordResetUseCase = async (email) => {
  const doctor = await Doctor.findOne({ email });
  if (!doctor) {
    throw new Error("No Doctor Found with this email");
  }
  const resetToken = otpService.generateOTP();
  doctor.otp = resetToken;
  // console.log(doctor.otp,'doc otppppp');
  doctor.otpExpires = Date.now() + 3600000; // 1 hour
  await doctor.save();
  // console.log(doctor,'doctorrr');
  await otpService.sendOTP(email, resetToken);
};

export const completePasswordResetUseCase = async (
  email,
  enteredOtp,
  newPassword
) => {
  const doctor = await Doctor.findOne({ email });

  // console.log(doctor,'docotorrrr');
  if (
    !doctor ||
    !otpService.validateOtp(doctor.otp, doctor.otpExpires, enteredOtp)
  ) {
    throw new Error("Invalid OTP or OTP has Expired");
  }
  doctor.password = await hashPassword(newPassword);
  doctor.otp = undefined;
  doctor.otpExpires = undefined;

  await doctor.save();
};

export const doctorProfilUpdateUseCase = async (doctorId, req) => {
  const bodyData = req.body;
  // console.log(bodyData, "body dataaa");
  if (!bodyData) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // const updatedData = {
  //   name: req.body.name,
  //   email: req.body.email,
  //   mobile: req.body.mobile,
  //   profilePicture: req.body.profilePicture,
  //   state: req.body.state,
  //   qualification: req.body.qualification,
  //   certificate: req.body.certificate,
  //   department: req.body.department,
  // };
  // if (req.file) {
  //   updatedData.certificate = req.file.path; // path to the uploaded file
  // }
  const updatedDoctor = await Doctor.findByIdAndUpdate(
    doctorId,
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        profilePicture: req.body.profilePicture,
        state: req.body.state,
        qualification: req.body.qualification,
        certificate: req.body.certificate,
        department: req.body.department,
        experience: req.body.experience,
      },
    },
    { new: true }
  );
  return updatedDoctor;
};

export const getAppointmentByDoctorID = async (doctorId) => {
  try {
    return await BookingSlot.find({
      doctor: doctorId,
      isBooked: true,
    }).populate("user");
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};
