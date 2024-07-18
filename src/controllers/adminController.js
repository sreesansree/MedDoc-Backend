import adminUseCase from "../usecase/adminCase.js";
import asyncHandler from "express-async-handler";

// Login admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminUseCase.loginAdmin(email, password);
  res.cookie("adminToken", admin.token, {
    httpOnly: true,
  });
  res.json(admin);
});

// Logout admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ message: "Logged out successfully" });
});
