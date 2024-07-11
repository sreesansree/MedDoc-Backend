import express from "express";

import AdminController from "../../api/controllers/adminController/adminController.js";

const adminrouter = express.Router();

adminrouter.post("/login", AdminController.login);

export default adminrouter;
