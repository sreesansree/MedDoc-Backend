import AdminService from "../../../../domain/admin/AdminService.js";

class AdminController {
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
