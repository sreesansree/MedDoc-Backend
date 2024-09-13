import express from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/messageController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/", upload.single("file"), sendMessage);
router.get("/:chatId", getMessages);
router.delete('/:messageId',deleteMessage)
export default router;
