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
  updateUser,
  getDoctor,
  getUserAppointments,
  resendOtp,
  canceledUserAppointments,
  getCompletedUserAppointments,
  rateDoctor,
  changePassword,
  // getUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  authorize,
  isUser,
  roleMiddleware,
} from "../middleware/roleMiddleware.js";
import {
  bookSlotWithPayment,
  cancelAppointment,
  getAppointment,
  getAvailableRescheduledSlots,
  selectNewSlot,
  // getCanceledAppointmentsUser,
  verifyPayment,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOtp);

router.post("/login", loginUser);
router.post("/logout", protect, isUser, logoutUser);
router.post("/google", google);

// router.get("/:id", getUser);

router.get("/doctors", doctorsList);
router.post("/forget-password", initiatePasswordReset);
router.post("/reset-password", completePasswordReset);
router.put("/update/:userId", protect, updateUser);
router.put("/change-password/:userId", protect, changePassword);
// Book a Slot
// router.patch("/book-slot/:slotId", protect, authorize("user"), bookSlot);
// router.patch("/slots/:id", protect, isUser, bookSlot);

//Get single Doctor
router.get("/doctor/:id", protect, getDoctor);

// Route to book a slot with payment
router.post("/book-slot/:slotId", bookSlotWithPayment);
// Route to verify payment
router.post("/verify-payment", protect, verifyPayment);
// Route to Get Appointments
router.get("/user-appointments", protect, getUserAppointments);
// Route to get Single appointment
router.get("/user-appointments/:id", protect, getAppointment);
// Route to Cancel Appointment
router.post("/user-appointments/:id/cancel", protect, cancelAppointment);
// Route to get Canceled Appointments
router.get("/user-canceled-appointments", protect, canceledUserAppointments);
// Route to get Completed Appointments
router.get(
  "/user-completed-appointments",
  protect,
  getCompletedUserAppointments
);
//Route to rate-doctor
router.post("/rate-doctor", protect, rateDoctor);
// Get rescheduled slots
router.get(
  "/reschedule-slots/:appointmentId",
  protect,
  getAvailableRescheduledSlots
);
//Route for user to select a new slot
router.put("/select-slot/:appointmentId", protect, selectNewSlot);

export default router;
