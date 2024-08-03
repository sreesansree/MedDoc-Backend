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
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  authorize,
  isUser,
  roleMiddleware,
} from "../middleware/roleMiddleware.js";
import { bookSlot } from "../controllers/slotController.js";

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

router.patch("/slots/:slotId", bookSlot);

export default router;
