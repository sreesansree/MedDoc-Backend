import express from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  logoutUser,
  google,
  doctorsList,
  initiatePasswordReset,
  completePasswordReset,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.post("/google", google);
router.post("/doctors-list", protect, doctorsList);
router.post("/forget-password", initiatePasswordReset);
router.post("/reset-password", completePasswordReset);

export default router;
