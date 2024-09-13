import MessageModel from "../models/MessageModel.js";

export const sendMessage = async (req, res) => {
  const { chatId, senderId, text, file, fileType, replyTo } = req.body;

  const newMessage = new MessageModel({
    chatId,
    senderId,
    text: text || "",
    file: file || "", // Store Firebase file URL
    fileType: fileType || "", // Store file type (image, video, audio)
    replyTo,
  });

  try {
    const result = await newMessage.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await MessageModel.find({ chatId }).populate('replyTo').exec();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await MessageModel.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete message" });
  }
};
