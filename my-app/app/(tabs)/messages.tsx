import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useAllUser } from "@/hooks/useAllUser";
import { useMessages } from "@/hooks/useAllMessages";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const { fetchAllUsersExceptLogged } = useAllUser();
  const { messages, fetchMessages, sendMessage } = useMessages();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchAllUsersExceptLogged();
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    loadUsers();
  }, []);

  const openConversation = async (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
    await fetchMessages(user.clerkId);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedUser(null);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      await sendMessage(selectedUser.clerkId, newMessage.trim());
      setNewMessage("");
    }
  };

  const filteredUsers = allUsers.map((user) => {
    const conversation = messages
      .filter(
        (msg) =>
          (msg.senderId === user.clerkId || msg.receiverId === user.clerkId)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const lastMessage = conversation[0] || null;
    return {
      ...user,
      lastMessage: lastMessage?.content || null,
      lastMessageTime: lastMessage?.createdAt || null,
    };
  }).filter((user) =>
    user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for people"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* User List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.clerkId}
            className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
            onPress={() => openConversation(user)}
          >
            <Image
              source={{ uri: user.profilePicture || "https://placehold.co/100x100" }}
              className="size-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </Text>
                {user.lastMessageTime && (
                  <Text className="text-xs text-gray-400">
                    {dayjs(user.lastMessageTime).calendar(null, {
                      sameDay: "[Today] h:mm A",
                      lastDay: "[Yesterday]",
                      lastWeek: "MMM D",
                      sameElse: "MMM D",
                    })}
                  </Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                className="text-sm text-gray-500"
              >
                {user.lastMessage || "No messages yet"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap a user to message
        </Text>
      </View>

      {/* Chat Modal */}
      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedUser && (
          <SafeAreaView className="flex-1">
            {/* Chat Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedUser.profilePicture || "https://placehold.co/100x100" }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Text>
                <Text className="text-gray-500 text-sm">@{selectedUser.username}</Text>
              </View>
            </View>

            {/* Messages */}
            <ScrollView className="flex-1 px-4 py-4">
              <Text className="text-center text-gray-400 text-sm mb-4">
                This is the beginning of your conversation with {selectedUser.firstName}
              </Text>

              {messages
                .filter(
                  (msg) =>
                    msg.senderId === selectedUser.clerkId ||
                    msg.receiverId === selectedUser.clerkId
                )
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg) => (
                  <View
                    key={msg._id}
                    className={`flex-row mb-3 ${msg.senderId === selectedUser.clerkId ? "" : "justify-end"}`}
                  >
                    {msg.senderId === selectedUser.clerkId && (
                      <Image
                        source={{ uri: selectedUser.profilePicture }}
                        className="size-8 rounded-full mr-2"
                      />
                    )}
                    <View className={`flex-1 ${msg.senderId === selectedUser.clerkId ? "" : "items-end"}`}>
                      <View
                        className={`rounded-2xl px-4 py-3 max-w-xs ${
                          msg.senderId === selectedUser.clerkId ? "bg-gray-100" : "bg-blue-500"
                        }`}
                      >
                        <Text
                          className={msg.senderId === selectedUser.clerkId ? "text-gray-900" : "text-white"}
                        >
                          {msg.content}
                        </Text>
                        <Text className="text-[10px] text-right text-gray-400 mt-1">
                          {dayjs(msg.createdAt).format("h:mm A")}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </ScrollView>

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={handleSendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMessage.trim() ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!newMessage.trim()}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;
