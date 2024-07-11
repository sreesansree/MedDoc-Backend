import UserUseCase from "./UserUseCase.js";
class UserService {

  async register(userData) {
    return await UserUseCase.register(userData);
  }

  async verifyOtp(email, otp) {
    return await UserUseCase.verifyOtp(email, otp);
  }

  async login(email, password) {
    return await UserUseCase.login(email, password);
  }

  async google(email, name, googlePhotoUrl) {
    return await UserUseCase.google(email, name, googlePhotoUrl);
  }
  async signOut() {
    // No need to handle sign-out here, as it's managed in the controller
  }
}

export default new UserService();
