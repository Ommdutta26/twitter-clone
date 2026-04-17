import { useState } from "react";
import { useApiClient, messageApi } from "@/utils/api";

export const useMessages = () => {
  const api = useApiClient();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch messages between current user and other user
  const fetchMessages = async (receiverId: string) => {
    try {
      setLoading(true);
      const res = await messageApi.getMessages(api, receiverId);
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send a message to another user
  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const res = await messageApi.sendMessage(api, { receiverId, content });

      // Optionally: update local message state with new message
      setMessages((prev) => [...prev, res.data.data]); // 'data' contains the message
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    setMessages, // optional, for resetting manually
  };
};
