import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import authService from "../service/authService.js";
import userUseCase, {
  completePasswordResetUseCase,
  initiatePasswordResetUseCase,
} from "../usecase/userCase.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { errorHandler } from "../utils/error.js";

export const registerUser = async (req, res) => {
  try {
    const response = await userUseCase.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const response = await userUseCase.verifyOTP(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await userUseCase.loginUser({ email, password });
    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json(response.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// export const google = async (req, res, next) => {
//   try {
//     const { email, name, googlePhotoUrl } = req.body;
//     const response = await userUseCase.google({ email, name, googlePhotoUrl });
//     res.cookie("token", response.token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 5 * 60 * 60 * 1000, // 5 hours
//     }).status(200).json(response);
//   } catch (error) {
//     console.error("Error in Google OAuth controller:", error);
//     res.status(400).json({ message: error.message });
//   }
// };
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = await authService.generateToken(user);
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
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
      const token = authService.generateToken(newUser);
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token").status(200).json("User has been logout");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  // req.logout((err) => {
  //   if (err) {
  //     return res.status(500).json({ message: "Logout failed" });
  //   }
  //   res.clearCookie("token"); // Clear the session cookie
  //   res.status(200).json({ message: "Logged out successfully" });
  // });
};

export const doctorsList =asyncHandler( async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('department');
    // console.log("Doctors fetched:", doctors); // Debugging log

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const initiatePasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // console.log(req.body, "req.bodyyyyyy");
  await initiatePasswordResetUseCase(email);
  res.status(200).json({
    message: "Password reset initiated. check your email for the link.",
  });
});

export const completePasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  // console.log(req.body, "req.bodyyyyy");
  await completePasswordResetUseCase(email, otp, password);
  res.status(200).json({ message: "Password reset Successful." });
});

// export const updateUserProfile = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const updatedUser = await UserProfilUpdateUseCase(UserId, req);
//     console.log(updatedUser, "updated doctor");
//     if (updatedUser) {
//       res.status(200).json(updatedUser);
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


export const updateUser = async (req, res, next) => {
  
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcrypt.hash(req.body.password, 10);
  }

  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 charactes")
      );
    }
    if (req.body.username.trim().length === 0) {
      return next(errorHandler(400, "Username cannot be empty or contain only spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
  }
}
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          name: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updateUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};