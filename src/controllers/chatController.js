import ChatModel from "../models/ChatModel.js";

// export const createChat = async (req, res) => {
//   const newChat = new ChatModel({
//     members: [req.body.senderId, req.body.receiverId],
//   });
//   try {
//     const result = await newChat.save();
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

export const createChat = async (req, res) => {
  const { senderId, receiverId, appointmentId } = req.body;
  try {
    // Check if a chat already exists for this appointment
    let chat = await ChatModel.findOne({
      members: { $all: [senderId, receiverId] },
      // appointmentId,
    });
    // If no existing chat, create a new one
    if (!chat) {
      const newChat = new ChatModel({
        members: [senderId, receiverId],
        // appointmentId,
        createdAt: Date.now(),
      });
      chat = await newChat.save();
    }
    res.status(200).json(chat);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create or retrieve chat", error });
  }
};

export const userChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await ChatModel.find({
      members: { $in: [userId] },
    });
    const currentTime = Date.now();

    const expiredChats = chats.filter((chat) => {
      const chatTime = new Date(chat.createdAt).getTime();
      return currentTime - chatTime > 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    });
    // If there are expired chats, return a flag to indicate expiration
    res.status(200).json({
      chats,
      expiredChats: expiredChats.length > 0,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const findChat = async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
