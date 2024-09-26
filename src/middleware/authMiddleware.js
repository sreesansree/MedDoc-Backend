import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  // console.log(req.cookies.token, "token");
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      // console.log(token, " : =========> token");
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded, "==========> Decoded");
      // console.log(decoded.id, "==========> Decoded ID");

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        throw new Error("User not found");
      }
      // console.log(req.user, "==========> req.user");

      next();
    } catch (error) {
      return errorHandler(401, "Not authorized,token failed!!");
    }
  }
  if (!token) {
    return errorHandler(401, "Not authorized, no token");
  }
});

export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies.adminToken) {
    try {
      token = req.cookies.adminToken;
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Admin.findById(decoded.id).select("-password");
      if (!req.user) {
        throw new Error("Admin not found");
      }
      next();
    } catch (error) {
      return errorHandler(401, "Not authorized,token failed!!");
    }
  }
  if (!token) {
    return errorHandler(401, "Not authorized, no token");
  }
});

export const protectDoctor = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies.doctorToken) {
    try {
      
      token = req.cookies.doctorToken;
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
 
      req.user = await Doctor.findById(decoded.id).select("-password");
      if (!req.user) {
        throw new Error("Doctor not found");
      }
      next();
    } catch (error) {
      return errorHandler(401, "Not authorized,token failed!!");
    }
  }
  if (!token) {
    return errorHandler(401, "Not authorized, no token");
  }
});
