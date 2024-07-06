import express from "express";
import UserController from "../controllers/userController/userController.js";

const router = express.Router();
router.post("/register", UserController.register);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/login", UserController.login);

export default router;
