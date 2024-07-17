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

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isVerified) {
      throw new Error("User not verified");
    }
    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default {
  authenticateUser,
  generateToken,
};
