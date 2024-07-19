import adminUseCase from "../usecase/adminCase.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";
// Login admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminUseCase.loginAdmin(email, password);
  res.cookie("adminToken", admin.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });
  res.json(admin);
});

// Logout admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("adminToken").status(200).json("Admin has been logout");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return errorHandler(400, error.message);
  }
});
