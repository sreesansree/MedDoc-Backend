import UserModel from "../../infrastructure/database/mongodb/models/userModel.js";

class UserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(user) {
    try {
      const newuser = new UserModel(user);
      console.log(newuser, "new user from UserRepositoryyyy");
      await newuser.save();
      return newuser;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  }
  async update(userId, updateData) {
    return await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  }
}

export default new UserRepository();
