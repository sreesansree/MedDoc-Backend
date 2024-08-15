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
  getDoctorAppointments,
} from "../controllers/doctorController.js";
import { isDoctor } from "../middleware/roleMiddleware.js";
import { protectDoctor } from "../middleware/authMiddleware.js";
// import multer from "multer";
// const upload = multer({ dest: "uploads/" });
import { upload } from "../middleware/multer.js";
import {
  createBookingSlot,
  deleteBookingSlot,
  getDoctorsSlots,
  updateBookingSlot,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/register", upload.single("certificate"), registerDoctor);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginDoctor);
router.post("/logout",protectDoctor, logoutDoctor);
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
// update slot
router.put("/slots/:slotId", protectDoctor, isDoctor, updateBookingSlot);
// Delete Slot
router.delete("/slots/:slotId", protectDoctor, isDoctor, deleteBookingSlot);
// Get Doctor Appointments
router.get("/doctor-appointments",protectDoctor,getDoctorAppointments)


export default router;
