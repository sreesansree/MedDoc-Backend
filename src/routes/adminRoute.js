import express from "express";

import {
  loginAdmin,
  logoutAdmin,
  getDoctors,
  getUsers,
  blockUser,
  blockDoctor,
  approveDoctor,
  unblockUser,
  unblockDoctor,
  recentActivity,
  getDoctor,
  rejectDoctor,
  initiateAdminPasswordReset,
  completeAdminPasswordReset,
  getPendingSlots,
  getAppointments,
} from "../controllers/adminController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import departmentRoutes from "./department.route.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", protectAdmin, isAdmin, logoutAdmin);

router.post("/forget-password", initiateAdminPasswordReset);
router.post("/reset-password", completeAdminPasswordReset);

// Users
router.get("/users", protectAdmin, getUsers);
router.post("/block-user/:id", protectAdmin, blockUser);
router.post("/unblock-user/:id", protectAdmin, unblockUser);

// Activity
router.get("/activities", protectAdmin, recentActivity);

// Doctors
router.get("/doctors", protectAdmin, getDoctors);
router.get("/doctors/:id", protectAdmin, getDoctor);
router.post("/approve-doctor/:id", protectAdmin, approveDoctor);
router.post("/reject-doctor/:id", protectAdmin, rejectDoctor);

router.post("/block-doctor/:id", protectAdmin, blockDoctor);
router.post("/unblock-doctor/:id", protectAdmin, unblockDoctor);

// Departments
router.use("/departments", departmentRoutes);

//Get Pending Slots
router.get("/upcoming-slots", protectAdmin, getPendingSlots);

// Get Appointments
router.get('/all-appointments',protectAdmin,getAppointments)

export default router;
