import adminUseCase from "../usecase/adminCase.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import Activity from "../models/ActivityModel.js";
// Login admin

export const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await adminUseCase.loginAdmin(email, password);

    res.cookie("adminToken", response.adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
    });
    res.status(200).json(response.admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Logout admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    console.log("Logging out admin");
    res.clearCookie("adminToken").status(200).json("Admin has been logout");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return errorHandler(400, error.message);
  }
});

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    // console.log("Doctors fetched:", doctors); // Debugging log
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// get single Doctor

export const getDoctor = async (req, res) => {
  try {
    const doctor = await adminUseCase.getDoctorById(req.params.id);
    console.log(doctor, "Single Doctor Fetched");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // console.log(users, "userrrrr");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  const { id } = req.params;
  console.log(id, "block-user id");
  try {
    await User.findByIdAndUpdate(id, { is_blocked: true }, { new: true });
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Unblock a user

export const unblockUser = async (req, res) => {
  const { id } = req.params;
  console.log((id, "un-block user id"));
  try {
    await User.findByIdAndUpdate(id, { is_blocked: false });
    res.status(200).json({ message: "User Unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a doctor
export const approveDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    await Doctor.findByIdAndUpdate(id, { isApproved: true });
    res.status(200).json({ message: "Doctor approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block a doctor
export const blockDoctor = async (req, res) => {
  const { id } = req.params;
  console.log(req.params, "paramsssss");
  console.log(id, "iddddddddd");
  try {
    await Doctor.findByIdAndUpdate(id, { is_blocked: true }, { new: true });
    res.status(200).json({ message: "Doctor blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock a doctor
export const unblockDoctor = async (req, res) => {
  const { id } = req.params;
  console.log(req.params, "paramsssss");
  console.log(id, "iddddddddd");
  try {
    await Doctor.findByIdAndUpdate(id, { is_blocked: false });
    res.status(200).json({ message: "Doctor unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// recent activities
export const recentActivity = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};
