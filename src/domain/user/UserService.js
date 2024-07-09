import UserUseCase from './UserUseCase.js'

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

    async google(email, name, googlePhotoUrl){
        return await UserUseCase.google(email, name, googlePhotoUrl)
    }
}

export default new UserService();
