import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
  {
    chatId: {
      // type: String,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    file: {
      type: String,
    },
    fileType: {
      type: String, // Add the fileType field to store file type (e.g., image/jpeg)
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;
