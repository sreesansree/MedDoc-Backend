import UserService from "../../../../domain/user/UserService.js";
import { errorHandler } from "../../../../utils/error.js";

class UserController {
  async register(req, res, next) {
    try {
      const result = await UserService.register(req.body);
      res.status(200).json(result);
    } catch (error) {
      // res.status(400).json({ error: error.message });
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      // console.log(req.body, "req.bodyyyyy");
      const result = await UserService.verifyOtp(email, otp);
      res.cookie("token", result.token, {
        httpOnly: true,
        maxAge: 5 * 60 * 60 * 1000, // 5 hours
      });

      res.status(200).json({ message: result.message });
    } catch (error) {
      // res.status(400).json({ error: error.message });
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      // console.log(result, "resultttt from loginnn");
      res.cookie("token", result.token, {
        httpOnly: true,
        maxAge: 5 * 60 * 60 * 1000, // 5 hours
      });
      res.status(200).json({ message: result.message });
    } catch (error) {
      // res.status(400).json({ error: error.message });
      next(error);
    }
  }
}
export default new UserController();
