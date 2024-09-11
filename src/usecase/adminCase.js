import bcrypt from "bcrypt";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import { generateToken, hashPassword } from "../utils/authUtils.js";
import { errorHandler } from "../utils/error.js";
import authService from "../service/authService.js";
import Department from "../models/Department.js";
import AdminModel from "../models/AdminModel.js";
import otpService from "../service/otpService.js";

/* const loginAdmin = async (email, password) => {
  if (!email || !password || email === " " || password === " ") {
    return errorHandler(400, "All fields are required");
  }
  const admin = await Admin.findOne({ email });
  console.log(admin);
  if (!admin) {
    return errorHandler(400, "Admin not found");
  }
  console.log(password, "passworddddddd");
  console.log(admin.password, "adminpassword");
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return errorHandler(400, "Invalid Password");
    // throw new Error("Invalid password");
  }

  if (admin && isMatch) {
    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    };
  } else {
    return errorHandler(400, "Something went wrong");
  }
}; */

const loginAdmin = async (email, password) => {
  const admin = await authService.authenticateAdmin(email, password);
  // console.log(admin, "admin");
  const adminToken = admin.adminToken;
  // const adminToken = generateToken(admin);
  return { admin, adminToken };
};

// forgotPassword
const initiateAdminPasswordResetUseCase = async (email) => {
  const admin = await AdminModel.findOne({ email });
  if (!admin) {
    throw new Error("No Admin Found with this email");
  }
  const resetToken = otpService.generateOTP();
  admin.otp = resetToken;
  admin.otpExpires = Date.now() + 3600000;
  await admin.save();
  await otpService.sendOTP(email, resetToken);
};

const completeAdminPasswordResetUseCase = async (
  email,
  enteredOtp,
  newPassword
) => {
  const admin = await AdminModel.findOne({ email });
  if (
    !admin ||
    !otpService.validateOtp(admin.otp, admin.otpExpires, enteredOtp)
  ) {
    throw new Error("Invalid OTP or has Expired");
  }
  admin.password = await hashPassword(newPassword);
  admin.otp = undefined;
  admin.otpExpires = undefined;
  await admin.save();
};

// Add a new department
const addDepartmentUseCase = async ({ name, description }) => {
  const newDepartment = new Department({ name, description });
  await newDepartment.save();
  return newDepartment;
};

// Get all Department
const getAllDepartmentUseCase = async () => {
  return await Department.find();
};

// Get a Department by ID
const getDepartmentByIdUseCase = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new Error("Department not found");
  }
  return department;
};

// Update a department by ID
const updateDepartmentUseCase = async (id, updateData) => {
  const department = await Department.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return department;
};

//Delete a department by ID
const deleteDepartmentUseCase = async (id) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) {
    throw new Error("Department not found");
  }
  return department;
};

// Get Doctor
const getDoctorById = async (id) => {
  return await Doctor.findById(id).populate("department");
};

// Approve Doctor
const approveDoctor = async (id) => {
  return await Doctor.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );
};

export default {
  loginAdmin,
  getDoctorById,
  approveDoctor,
  addDepartmentUseCase,
  getAllDepartmentUseCase,
  getDepartmentByIdUseCase,
  updateDepartmentUseCase,
  deleteDepartmentUseCase,
  initiateAdminPasswordResetUseCase,
  completeAdminPasswordResetUseCase,
};
