import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String, // Clerk user ID
      required: true,
    },
    receiverId: {
      type: String, // Clerk user ID
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt fields
);

export const Message = mongoose.model("Message", messageSchema);
