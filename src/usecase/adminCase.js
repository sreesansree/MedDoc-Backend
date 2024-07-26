import bcrypt from "bcrypt";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import { generateToken } from "../utils/authUtils.js";
import { errorHandler } from "../utils/error.js";
import authService from "../service/authService.js";

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
  console.log(admin, "admin");
  const adminToken = admin.adminToken;
  // const adminToken = generateToken(admin);
  return { admin, adminToken };
};

const getDoctorById = async (id) => {
  return await Doctor.findById(id);
};

const approveDoctor = async (id) => {
  return await Doctor.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );
};

export default { loginAdmin, getDoctorById, approveDoctor };
