// import bcypt from "bcrypt";
// import jwt from "jsonwebtoken";

import AdminUseCase from "./AdminUseCase.js";

class AdminService {
 

  async login(email, password) {
    return await AdminUseCase.login(email, password);
  }
}

export default new AdminService();
