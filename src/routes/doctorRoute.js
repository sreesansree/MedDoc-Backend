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
  // getDoctor,
  getUser,
  resendOtp,
  cancelAppointment,
  canceledDoctorAppointments,
  completeConsultation,
  completedDoctorAppointments,
  sendRescheduleRequest,
} from "../controllers/doctorController.js";
import { isDoctor } from "../middleware/roleMiddleware.js";
import { protectDoctor } from "../middleware/authMiddleware.js";
// import multer from "multer";
// const upload = multer({ dest: "uploads/" });
import { upload } from "../middleware/multer.js";
import {
  createBookingSlot,
  deleteBookingSlot,
  getAppointment,
  getDoctorsSlots,
  updateBookingSlot,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/register", upload.single("certificate"), registerDoctor);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginDoctor);
router.post("/logout", protectDoctor, logoutDoctor);
router.post("/google", google);
router.post("/forget-password", initiatePasswordReset);
router.post("/reset-password", completePasswordReset);
router.post("/resend-otp", resendOtp);
router.put(
  "/profile/:id",
  protectDoctor,
  isDoctor,
  upload.single("certificate"),
  updateDoctorProfile
);
// get Doctor
// router.get("/:id", getDoctor);

// get User
router.get("/user/:id", getUser);

// new booking slot
router.post("/slots", protectDoctor, isDoctor, createBookingSlot);
// get all booking slot for a doctor
router.get("/slots/:id", protectDoctor, isDoctor, getDoctorsSlots);
// update slot
router.put("/slots/:slotId", protectDoctor, isDoctor, updateBookingSlot);
// Delete Slot
router.delete("/slots/:slotId", protectDoctor, isDoctor, deleteBookingSlot);
// Get Doctor Appointments
router.get("/doctor-appointments", protectDoctor, getDoctorAppointments);
// Route to get Single Appointment
router.get("/doctor-appointments/:id", getAppointment);
// Route to Cancel Appointment
router.post(
  "/doctor-appointments/:id/cancel",
  // protectDoctor,
  cancelAppointment
);
// Route to get Canceled Appointment
router.get(
  "/doctor-canceled-appointments",
  protectDoctor,
  canceledDoctorAppointments
);
// Route to complete the consultation
router.post(
  "/doctor-appointments/:id/complete",
  protectDoctor,
  completeConsultation
);
// Route to get Completed Consultation
router.get(
  "/doctor-completed-appointments",
  protectDoctor,
  completedDoctorAppointments
);
//Route for doctor to send reshedule request
router.post("/reshedule/:appointmentId", protectDoctor, sendRescheduleRequest);

export default router;
