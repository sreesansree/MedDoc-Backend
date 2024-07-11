import AdminRepository from "./AdminRepository.js";

// import Admin from "./AdminEntity.js";
import bcrypt from "bcrypt";
import { generateAdminToken, generateToken } from "../../utils/jwt.js";
import { errorHandler } from "../../utils/error.js";

class AdminUseCase {
  async login(email, password) {
    if (!email || !password || email === " " || password === " ") {
      return errorHandler(400, "All fields are required");
    }
    const admin = await AdminRepository.findByEmail(email);
    if (!admin) {
      return errorHandler(400, "Admin not found");
    }
    const isMatch = await bcrypt.compare(password, admin.password);

    // const isMatch = (await password) === admin.password;
    if (!isMatch) {
      return errorHandler(400, "Invalid Password");
    }
    // if (admin && isMatch) {
    //   generateAdminToken(res, admin._id);
    //   res.status(201)
    // }
    const admintoken = generateToken(admin, "admin");
    return {
      message: "Admin Login Successful",
      admintoken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    };
  }
}

export default new AdminUseCase();
