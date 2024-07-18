import express from "express";

import { loginAdmin, logoutAdmin } from "../controllers/adminController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", protect, isAdmin, logoutAdmin);
export default router;
