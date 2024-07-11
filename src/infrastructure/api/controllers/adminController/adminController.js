import AdminService from "../../../../domain/admin/AdminService.js";
import AdminModel from "../../../database/mongodb/models/adminModel.js";
import { createSecretToken } from "../../../../utils/secretToken.js";

class AdminController {
  async signup(req, res, next) {
    try {
      const { email, password, name, role, createdAt } = req.body;
      if (
        !email ||
        !password ||
        !name ||
        !role ||
        email === " " ||
        name === " "
      ) {
        return res.json({ message: "All fields are required" });
      }
      const existingAdmin = await AdminModel.findOne({ email });
      if (existingAdmin) {
        return res.json({ message: "Admin Already Exist" });
      }
      const admin = await AdminModel.create({
        email,
        password,
        name,
        role,
        createdAt,
      });
      const admintoken = createSecretToken(admin._id);
      res.cookie("admintoken", admintoken, {
        withCredential: true,
        httpOnly: false,
      });
      res
        .status(201)
        .json({ message: "admin Signed successfully", success: true, admin });
      next();
    } catch (error) {
      console.log(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AdminService.login(email, password);
      res
        .status(200)
        .cookie("admintoken", result.admintoken, {
          httpOnly: true,
          maxAge: 5 * 60 * 60 * 1000,
        })
        .json({ message: result.message, admin: result.admin });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
