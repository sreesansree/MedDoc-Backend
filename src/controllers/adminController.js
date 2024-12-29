import adminUseCase from "../usecase/adminCase.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import Activity from "../models/ActivityModel.js";
import sendEmail from "../utils/sendEmail.js";
import BookingSlot from "../models/BookingSlotModel.js";
import moment from "moment";
// Login admin

export const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await adminUseCase.loginAdmin(email, password);

    res.cookie("adminToken", response.adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json(response.admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Forget password

export const initiateAdminPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await adminUseCase.initiateAdminPasswordResetUseCase(email);
  res.status(200).json({
    message: "Password reset initiated. check your email for the link.",
  });
});

// Password Reset

export const completeAdminPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  await adminUseCase.completeAdminPasswordResetUseCase(email, otp, password);
  res.status(200).json({ message: "Password reset Successful." });
});

// Logout admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    // console.log("Logging out admin");
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
    // console.log(doctor, "Single Doctor Fetched");
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

// Get all pendings slots

export const getPendingSlots = async (req, res) => {
  try {
    const slots = await BookingSlot.find({ status: "upcoming" });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All appointments

export const getAppointments = async (req, res) => {
  try {
    const appointments = await BookingSlot.find({});
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  const { id } = req.params;
  // console.log(id, "block-user id");
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
  // console.log((id, "un-block user id"));
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
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    doctor.isApproved = true;
    doctor.status = "approved"; // Update status
    await doctor.save();

    await Activity.create({
      type: "doctor_approved",
      description: "Doctor approved",
      name: doctor.name, // The name of the doctor
      doctorId: doctor._id, // Reference the doctor ID
    });

    // Send approval email
    const subject = "MedDoc - Doctor Application Approved";
    const message = `Dear ${doctor.name},\n\nCongratulations! Your application has been approved.\n\nBest regards,\nMedDoc Team`;
    await sendEmail(doctor.email, subject, message);

    res.status(200).json({ message: "Doctor approved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const { rejectionReason } = req.body;
    // console.log(rejectionReason, "rejectionReason..........");
    // console.log(req.body, "body contenttttttt");
    if (!rejectionReason) {
      return res.status(400).json({ message: "Reason is required." });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    doctor.status = "rejected";
    doctor.rejectionReason = rejectionReason; // Add rejection rejectionReason
    await doctor.save();

    const subject = "MedDoc Doctor Application Status";
    const message = `Dear Doctor,\n\nWe regret to inform you that your application has been rejected. Reason: ${rejectionReason}\n\nBest regards,\nMedDoc Team`;

    // Send rejection email
    await sendEmail(doctor.email, subject, message);
    res.status(200).json({ message: "Doctor rejected successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// // Helper function to send rejection email
// const sendRejectionEmail = async (email, rejectionReason) => {
//   const subject = "MedDoc Doctor Application Status";
//   const message = `Dear Doctor,\n\nWe regret to inform you that your application has been rejected. Reason: ${rejectionReason}\n\nBest regards,\nMedDoc Team`;
//   await sendEmail(email, subject, message);
// };

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
  // console.log(req.params, "paramsssss");
  // console.log(id, "iddddddddd");
  try {
    await Doctor.findByIdAndUpdate(id, { is_blocked: false });
    res.status(200).json({ message: "Doctor unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Helper function to get badge color based on activity type
const getBadgeColor = (type) => {
  switch (type) {
    case "user_registered":
      return "success";
    case "appointment_booked":
      return "info";
    case "doctor_approved":
      return "warning";
    default:
      return "info";
  }
};

// recent activities
export const recentActivity = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .populate("userId doctorId");

    // console.log("activity : ", activities);
    // Add formatted fields to each activity
    const formattedActivities = activities.map((activity) => ({
      ...activity,
      timeAgo: moment(activity.createdAt).fromNow(), // e.g., '5 minutes ago'
      badgeColor: getBadgeColor(activity.type),
    }));
    console.log("formattedActivities : ", formattedActivities);

    res.status(200).json(formattedActivities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};

// Add department
export const addDepartment = async (req, res) => {
  const { name, description } = req.body;

  // Inline validation
  // if (!name || !description) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }
  try {
    if (!name || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newDepartment = await adminUseCase.addDepartmentUseCase({
      name,
      description,
    });
    res.status(200).json(newDepartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get department
export const getDepartments = async (req, res) => {
  try {
    const department = await adminUseCase.getAllDepartmentUseCase();
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Department By ID
export const getDeparmentById = async (req, res) => {
  try {
    const department = await adminUseCase.getDepartmentByIdUseCase(
      req.params.id
    );
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const department = await adminUseCase.updateDepartmentUseCase(
      req.params.id,
      req.body
    );

    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Department

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await adminUseCase.deleteDepartmentUseCase(id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
