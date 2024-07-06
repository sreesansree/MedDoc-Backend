import UserModel from "../../infrastructure/database/mongodb/models/userModel.js";

class UserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(user) {
    const newuser = new UserModel(user);
    console.log(newuser,'new user from UserRepositoryyyy');
    return await newuser.save();
  }
  async update(userId, updateData) {
    return await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  }
}

export default new UserRepository();
