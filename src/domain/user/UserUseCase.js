import bcrypt from "bcrypt";
import UserRepository from "./UserRepository.js";
import User from "./UserEnitity.js";
import { generateToken } from "../../utils/jwt.js";
import { sendOtpEmail } from "../../utils/nodemailer.js";
import { errorHandler } from "../../utils/error.js";

class UserUseCase {
  // User Registration Use Case
  async register(userData) {
    const { name, email, password, mobile } = userData;
    if (
      !name ||
      !email ||
      !mobile ||
      !password ||
      name === " " ||
      email === " " ||
      password === " " ||
      mobile === " "
    ) {
      return errorHandler(400, "All fields are required");
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      // throw new Error("User already exists");
      return errorHandler(400, "User already exists!!!!");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user with OTP but not verified
    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      otp,
      isVerified: false,
    });

    await UserRepository.create(user);

    // Send OTP email
    await sendOtpEmail(email, otp);

    return { message: "OTP sent to your email" };
  }

  // OTP Verification Use Case
  async verifyOtp(email, otp) {
    // Check if both email and otp are present in the request body
    if (!email && !otp) {
      // return errorHandler(400, "All fields are required");
      // return res.status(400).json({ error: "Email and OTP are required." });
      return errorHandler(400, "Email and OTP are required ");
    }
    if (email && !otp) {
      return errorHandler(400, "OTP required ");
    }
    if (!email && otp) {
      return errorHandler(400, "Email required ");
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // throw new Error("User not found");
      return errorHandler(400, "User not found");
    }

    if (user.otp !== otp) {
      return errorHandler(400, "Invalid OTP");
    } else {
      user.isVerified = true;
      await user.save();
      user.otp = null; // Clear OTP after successful verification
      const token = generateToken(user, "user");
      return { message: "User successfully verified", token };
    }
  }

  // User Login Use Case
  async login(email, password) {
    if (!email || !password || email === " " || password === " ") {
      return errorHandler(400, "All fields are required");
    }
    const user = await UserRepository.findByEmail(email);

    if (!user || !user.isVerified) {
      // throw new Error("User not found or not verified");
      return errorHandler(400, "User not fount or not verified");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // throw new Error("Invalid password");
      return errorHandler(400, "Invalid password");
    }

    const token = generateToken(user, "user");

    return { message: "Login successful", token };
  }
}

export default new UserUseCase();
