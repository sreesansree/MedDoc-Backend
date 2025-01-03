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

// Store the temporary doctor data
let temporaryDoctorData = {};

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
      await existingDoctor.save();
    } else {
      throw new Error("Doctor already exists with this email.");
    }
  }

  /*  
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

  await doctor.save(); */

  // Store temporary doctor data
  temporaryDoctorData[email] = {
    name,
    email,
    password: await hashPassword(password),
    certificate,
    otp: otpService.generateOTP(),
    otpExpires: Date.now() + 3600000, // OTP expires in 1 hour
  };

  // Send OTP
  await otpService.sendOTP(email, temporaryDoctorData[email].otp);
  console.log(temporaryDoctorData[email], "Temporary");
  return temporaryDoctorData[email];
};

// Resend OTP use case

export const resendOtpUseCase = async (email) => {
  const doctorData = temporaryDoctorData[email];
  console.log(doctorData, "Doctor Data");
  if (!doctorData) {
    throw new Error("No registration data found for this email.");
  }

  // Generate a new OTP
  doctorData.otp = otpService.generateOTP();
  doctorData.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  // Resend the OTP
  await otpService.sendOTP(email, doctorData.otp);
  console.log(doctorData, "from resend-otp");
  return doctorData;
};

export const verifyOtpUseCase = async (email, enteredOtp) => {
  // const doctor = await Doctor.findOne({ email });
  // if (
  //   !doctor ||
  //   !otpService.validateOtp(doctor.otp, doctor.otpExpires, enteredOtp)
  // ) {
  //   throw new Error("Invalid OTP or OTP has expired");
  //   // return errorHandler(400, "Invalid OTP or OTP has expired");
  // }
  // doctor.is_blocked = false;
  // doctor.isVerified = true;
  // doctor.otp = undefined;
  // doctor.otpExpires = undefined;
  // await doctor.save();

  // return doctor;

  const doctorData = temporaryDoctorData[email];

  if (!doctorData) {
    throw new Error("No registration data found for this email. ");
  }
  // Validate the OTP
  if (
    !otpService.validateOtp(doctorData.otp, doctorData.otpExpires, enteredOtp)
  ) {
    throw new Error("Invalide OTP or OTP has Expired.");
  }

  // Save the doctor to the database after OTP validation

  const newDoctor = new Doctor({
    ...doctorData,
    isVerified: true,
    otp: undefined,
    otpExpires: undefined,
  });

  await newDoctor.save();

  // Clean up temporary data
  delete temporaryDoctorData[email];
  return newDoctor;
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
  if (!email || !enteredOtp || !newPassword) {
    throw new Error("Email, OTP, and new password are required.");
  }
  const doctor = await Doctor.findOne({ email });

  // console.log(doctor,'docotorrrr');
  // Ensure doctor exists
  if (!doctor) {
    throw new Error("No user found with the provided email.");
  }
  // Validate OTP
  if (!otpService.validateOtp(doctor.otp, doctor.otpExpires, enteredOtp)) {
    throw new Error("Invalid OTP or OTP has expired.");
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
      status: "upcoming",
    }).populate("user");
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};

export const getCanceledAppointments = async (doctorId) => {
  try {
    return await BookingSlot.find({
      doctor: doctorId,
      status: "canceled",
    }).populate("doctor user");
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};

export const getCompletedAppointments = async (doctorId) => {
  try {
    return await BookingSlot.find({
      doctor: doctorId,
      status: "completed",
    }).populate("doctor user prescription");
  } catch (error) {
    throw new Error("Error fetching appointments: " + error.message);
  }
};
