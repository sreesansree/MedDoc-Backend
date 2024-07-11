// import bcypt from "bcrypt";
// import jwt from "jsonwebtoken";

import AdminUseCase from "./AdminUseCase.js"

class AdminService {
  // constructor(adminRepository) {
  //   this.adminRepository = this.adminRepository;
  // }

  // async login(email, password) {
  //   const admin = await this.adminRepository.findByEmail(email);
  //   if (admin && (await bcypt.compare(password, admin.password))) {
  //     const admin_token = jwt.sign(
  //       { id: admin.id, role: admin.role },
  //       process.env.JWT_SECRET
  //     );
  //     return { admin_token, role: admin.role };
  //   }
  //   throw new Error("Invalid email or password");
  // }
  async login(email, password) {
    return await AdminUseCase.login(email, password);
  }
}

export default new AdminService();
