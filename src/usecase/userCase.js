import User from "../models/UserModel.js";

import otpService from "../service/otpService.js";
import authService from "../service/authService.js";
import bcrypt from "bcrypt";

const registerUser = async ({ name, email, mobile, password }) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already Exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = otpService.generateOTP();
  const user = new User({
    name,
    email,
    mobile,
    password: hashedPassword,
    otp,
  });
  await user.save();
  await otpService.sendOTP(email, otp);

  return { message: "User registered, please veriify your email" };
};

const verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  console.log(otp, "OTP");
  console.log(user.otp, "userOTP");
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }
  user.isVerified = true;
  user.otp = null;
  await user.save();
  return { message: "User verified,you can now login" };
};

const loginUser = async ({ email, password }) => {
  const user = await authService.authenticateUser(email, password);
  const token = authService.generateToken(user);
  return { user, token };
};

 /*
   const google = async ({ email, name, googlePhotoUrl }) => {
  try {
    if (!name) {
      throw new Error("Name is required for Google OAuth login.");
    }

    const user = await User.findOne({ email }).maxTimeMS(5000);
    console.log(user, "User Check google");

    if (user) {
      const token = await authService.generateToken(user);
      return {
        message: "Login Success with Google OAuth",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        },
      };
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      console.log(generatePassword, "generated password in googleee");
      const hashedPassword = await bcrypt.hash(generatePassword, 10);
      const newUser = new User({
        name:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      newUser.isVerified = true;
      await newUser.save();
      const token = await authService.generateToken(newUser);

      return {
        message: "Google Login Successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
        },
      };
    }
  } catch (error) {
    console.error("Error in Google OAuth login:", error);
    throw new Error("An error occurred during Google OAuth login.");
  }
}; */

export default {
  registerUser,
  verifyOTP,
  loginUser,
  // google,
};
