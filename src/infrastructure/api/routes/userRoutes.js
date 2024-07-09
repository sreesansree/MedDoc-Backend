import express from "express";
import UserController from "../controllers/userController/userController.js";
import userController from "../controllers/userController/userController.js";

const router = express.Router();
router.post("/register", UserController.register);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/login", UserController.login);
router.post("/google", UserController.google);
router.post("/signout", userController.signout);

export default router;
