import { Message } from "../models/message.model.js";

// ✅ Send a message (POST /api/messages)
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.auth?.userId; // Clerk user ID from Clerk middleware

  if (!receiverId || !content) {
    return res.status(400).json({ message: "receiverId and content are required" });
  }

  try {
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send message",
      error: err.message,
    });
  }
};

// ✅ Get conversation (GET /api/messages/:otherUserId)
export const getMessages = async (req, res) => {
  const userId = req.auth?.userId;
  const { otherUserId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve messages",
      error: err.message,
    });
  }
};
