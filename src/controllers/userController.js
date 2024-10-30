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
import otpService from "../service/otpService.js";
import BookingSlot from "../models/BookingSlotModel.js";

export const registerUser = async (req, res) => {
  try {
    const response = await userUseCase.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is Required. " });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const otp = otpService.generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();
    await otpService.sendOTP(email, otp);

    res.status(200).json({ message: "OTP has been resent to your email. " });
  } catch (error) {
    return res.status(404).json(error);
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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    console.log(response.user, ": response userrrr from controller");
    res.status(200).json(response.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
};

export const doctorsList = asyncHandler(async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate("department");
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
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
      return next(errorHandler(500, "Error hashing password"));
    }
  }

  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.trim().length === 0) {
      return next(
        errorHandler(400, "Username cannot be empty or contain only spaces")
      );
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

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res) => {
  console.log("DoctorId from getDoctor ==>", req.params._id);
  try {
    const doctor = await userUseCase.getDoctorById(req.params.id);
    // console.log(doctor, "Single Doctor Fetched");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get user-appointments
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId, " :   User Id");
    const appointments = await userUseCase.getAppointmentsByUserId(userId);
    // console.log(appointments, " : Appointmentsss");
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// get canceled user-appointments

export const canceledUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const canceledAppointment = await userUseCase.getCanceledAppointments(
      userId
    );
    res.status(200).json(canceledAppointment);
  } catch (error) {
    console.error("Error fetching canceled appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCompletedUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const completedAppointment = await userUseCase.getCompletedAppointments(
      userId
    );
    res.status(200).json(completedAppointment);
  } catch (error) {
    console.error("Error fetching completed appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rateDoctor = async (req, res) => {
  try {
    const { appointmentId, doctorId, rating } = req.body;

    // Check if appointment exists and is Completed
    const appointment = await BookingSlot.findById(appointmentId);
    if (!appointment || appointment.status !== "completed") {
      return res
        .status(404)
        .json({ message: "Appointment not found or not Completed" });
    }

    // Store the rating in the appointment if needed
    appointment.rating = rating;
    await appointment.save();

    //Update doctor's rating
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.totalRatings += rating;
    doctor.ratingCount += 1;
    doctor.averageRating = doctor.totalRatings / doctor.ratingCount;

    await doctor.save();

    res.status(200).json({ message: "Rating Submitted Successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  console.log("Params Id in UserRoute Get User ====> ", id);
  try {
    const user = await Doctor.findById(id);
    if (user) {
      const { password, ...rest } = user._doc;
      res.status(200).json(rest);
    } else {
      res.status(404).json("No such Doctor");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
