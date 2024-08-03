import express from "express";
import {
  registerDoctor,
  verifyOTP,
  loginDoctor,
  logoutDoctor,
  google,
  initiatePasswordReset,
  completePasswordReset,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import { isDoctor } from "../middleware/roleMiddleware.js";
import { protectDoctor } from "../middleware/authMiddleware.js";
// import multer from "multer";
// const upload = multer({ dest: "uploads/" });
import { upload } from "../middleware/multer.js";
import {
  createBookingSlot,
  getDoctorsSlots,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/register", registerDoctor);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginDoctor);
router.post("/logout", logoutDoctor);
router.post("/google", google);
router.post("/forget-password", initiatePasswordReset);
router.post("/reset-password", completePasswordReset);

router.put(
  "/profile/:id",
  protectDoctor,
  isDoctor,
  upload.single("certificate"),
  updateDoctorProfile
);

// new booking slot
router.post("/slots", protectDoctor, isDoctor, createBookingSlot);

// get all booking slot for a doctor
router.get("/slots/:id", protectDoctor, isDoctor, getDoctorsSlots);

export default router;
