import bcrypt from "bcrypt";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import { generateToken } from "../utils/generateToken.js";
import { errorHandler } from "../utils/error.js";

const loginAdmin = async (email, password) => {
  if (!email || !password || email === " " || password === " ") {
    return errorHandler(400, "All fields are required");
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return errorHandler(400, "Admin not found");
  }
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return errorHandler(400, "Invalid Password");
    // throw new Error("Invalid password");
  }

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id),
  };
};

export default { loginAdmin };
