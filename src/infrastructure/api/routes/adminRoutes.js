import express from "express";

import AdminController from "../../api/controllers/adminController/adminController.js";
import {verifyAdminToken} from '../../../utils/verifyToken.js'

const adminrouter = express.Router();

adminrouter.post("/login", AdminController.login);
adminrouter.post("/signup", AdminController.signup);
adminrouter.post("/",verifyAdminToken);

export default adminrouter;
