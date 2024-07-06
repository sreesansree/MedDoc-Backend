import UserService from "../../../../domain/user/UserService.js";

class UserController {
  
  async register(req, res) {
    try {
      const result = await UserService.register(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      // console.log(req.body, "req.bodyyyyy");
      const result = await UserService.verifyOtp(email, otp);
      console.log(result, "resultttt");
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      // console.log(result,'resultttt');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
export default new UserController();
