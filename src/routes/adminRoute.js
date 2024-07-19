import express from "express";

import { loginAdmin, logoutAdmin } from "../controllers/adminController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", protectAdmin, isAdmin, logoutAdmin);
export default router;
