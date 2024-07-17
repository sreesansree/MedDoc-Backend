import Admin from "../models/AdminModel.js";
import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import { generateToken } from "../utils/generateToken.js";

const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (admin && (await admin.matchPassword(password))) {
    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

export default { loginAdmin };
