import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user =
        (await User.findById(decoded.id).select("-password")) ||
        (await Doctor.findById(decoded.id).select("-password")) ||
        (await Admin.findById(decoded.id).select("-password"));

      next();
    } catch (error) {
      return errorHandler(401, "Not authorized,token failed!!");
    }
  }
  if (!token) {
    return errorHandler(401, "Not authorized, no token");
  }
});
