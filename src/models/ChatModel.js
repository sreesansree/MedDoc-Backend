import mongoose from "mongoose";

const ChatSchema = mongoose.Schema(
  {
    members: {
      type: Array,
    },
    appointmentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;
