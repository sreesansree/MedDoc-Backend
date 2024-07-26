import express from "express";

import {
  addDepartment,
  getDepartments,
  getDeparmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getDepartments);
router.post("/", addDepartment);
router.get("/:id", getDeparmentById);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
