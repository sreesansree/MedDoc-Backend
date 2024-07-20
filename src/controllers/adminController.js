import adminUseCase from "../usecase/adminCase.js";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";
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
    console.log('Logging out admin');
    res.clearCookie("adminToken").status(200).json("Admin has been logout");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return errorHandler(400, error.message);
  }
});
