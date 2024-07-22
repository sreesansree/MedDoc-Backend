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
} from "../controllers/adminController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", protectAdmin, isAdmin, logoutAdmin);

router.get("/doctors", protectAdmin, getDoctors);
router.get("/users", protectAdmin, getUsers);
router.post("/block-user/:id", protectAdmin, blockUser);
router.post("/unblock-user/:id", protectAdmin, unblockUser);
router.post("/approve-doctor/:id", protectAdmin, approveDoctor);
router.post("/block-doctor/:id", protectAdmin, blockDoctor);
router.post("/unblock-doctor/:id", protectAdmin, unblockDoctor);
export default router;
