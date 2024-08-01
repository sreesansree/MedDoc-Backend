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
router.get("/:id", getDeparmentById);
router.post("/", addDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
