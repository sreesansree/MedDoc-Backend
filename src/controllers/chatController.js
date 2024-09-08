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
      appointmentId,
    });
    // If no existing chat, create a new one
    if (!chat) {
      const newChat = new ChatModel({
        members: [senderId, receiverId],
        appointmentId,
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
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] },
    });
    // console.log(chat,'Chatsssss')
    res.status(200).json(chat);
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
