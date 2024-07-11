import AdminModel from "../../infrastructure/database/mongodb/models/adminModel.js";

class AdminRepository {
  async findByEmail(email) {
    return await AdminModel.findOne({ email });
  }

  async findById(id) {
    return await AdminModel.findById(id);
  }
}

export default new AdminRepository()
