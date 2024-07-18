import express from "express";

import { loginAdmin } from "../controllers/adminController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);

export default router;
