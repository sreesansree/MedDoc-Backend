import express from "express";
import {
  registerDoctor,
  verifyOTP,
  loginDoctor,
  logoutDoctor,
  google,
} from "../controllers/doctorController.js";
import { isDoctor } from "../middleware/roleMiddleware.js";
import { protectDoctor } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerDoctor);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginDoctor);
router.post("/logout", logoutDoctor);
router.post("/google", google);

export default router;
