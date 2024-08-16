/* import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js'
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';

class AuthService {
  generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async authenticateUser(email, password) {
    let user = await User.findOne({ email });
    if (user) {
      // Add your password checking logic here (e.g., bcrypt.compare)
      return user; // Return user if valid
    }

    let admin = await Admin.findOne({ email });
    if (admin) {
      // Add your password checking logic here
      return admin; // Return admin if valid
    }

    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      // Add your password checking logic here
      return doctor; // Return doctor if valid
    }

    return null; // No user found
  }
}

export default new AuthService();
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  // console.log(user)
  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isVerified) {
      throw new Error("User not verified");
    }
    if (user.is_blocked) {
      throw new Error("Your account got blocked by the admin");
    }
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      role: user.role,
      token: generateToken(user),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

const authenticateAdmin = async (email, password) => {
  // const admin = await Admin.findOne({ email });
  const admin = await Admin.findOne({ email });
  console.log(admin);
  if (admin && (await bcrypt.compare(password, admin.password))) {
    return {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      profilePicture: admin.profilePicture,
      role: admin.role,
      adminToken: generateToken(admin),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};
const authenticateDoctor = async (email, password) => {
  const doctor = await Doctor.findOne({ email });
  console.log(doctor);
  if (doctor && (await bcrypt.compare(password, doctor.password))) {
    return {
      id: doctor._id,
      email: doctor.email,
      name: doctor.name,
      profilePicture: doctor.profilePicture,
      role: doctor.role,
      doctorToken: generateToken(doctor),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default {
  authenticateUser,
  generateToken,
  authenticateAdmin,
  authenticateDoctor,
};
