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
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  authorize,
  isUser,
  roleMiddleware,
} from "../middleware/roleMiddleware.js";
import {
  bookSlotWithPayment,
  verifyPayment,
} from "../controllers/slotController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protect, isUser, logoutUser);
router.post("/google", google);
router.get("/doctors-list", protect, doctorsList);
router.post("/forget-password", initiatePasswordReset);
router.post("/reset-password", completePasswordReset);
router.put("/update/:userId", protect, updateUser);

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
router.get("/user-appointments", protect,getUserAppointments);

export default router;
