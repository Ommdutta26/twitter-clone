import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUserActions } from '@/hooks/useUserActions';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
    const { followUser } = useUserActions();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const[followed,setFollowed] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch user data from backend

    const handleFollow = async () => {
    try {
      const res = await followUser(id);
      console.log('Follow response:', res);
      setFollowed(res?.isFollowing);
       // Toggle followed state
    } catch (error) {
      console.error('Error following user:', error.message);    
    }
    }
  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`http://192.168.122.236:5000/api/users/single/${id}`);
          setCurrentUser(res.data.user);
          console.log('Current user:', res.data.user);
          setFollowed(res?.data?.user?.isFollowing)
        } catch (error) {
          console.log('Error fetching user profile:', error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  // Call these hooks unconditionally (outside if blocks)
  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // No user found
  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{userPosts.length} Posts</Text>
        </View>
        <SignOutButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        <Image
          source={{
            uri:
              currentUser.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
  <View className="flex-row justify-between items-end -mt-16 mb-4">
    <Image
      source={{ uri: currentUser.profilePicture }}
      className="w-32 h-32 rounded-full border-4 border-white"
    />

    {/* Conditionally show Edit or Follow button */}
    
      <TouchableOpacity
        onPress={handleFollow}
        className={`px-6 py-2 rounded-full ${
          followed ? 'bg-white border border-blue-500' : 'bg-blue-500'
        }`}
      >
        <Text
          className={`font-semibold text-center ${
            followed? 'text-blue-500' : 'text-white'
          }`}
        >
          {followed? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
  </View>

  <View className="mb-4">
    <View className="flex-row items-center mb-1">
      <Text className="text-xl font-bold text-gray-900 mr-1">
        {currentUser.firstName} {currentUser.lastName}
      </Text>
      <Feather name="check-circle" size={20} color="#1DA1F2" />
    </View>

    <Text className="text-gray-500 mb-2">@{currentUser.username}</Text>
    <Text className="text-gray-900 mb-3">{currentUser.bio}</Text>

    <View className="flex-row items-center mb-2">
      <Feather name="map-pin" size={16} color="#657786" />
      <Text className="text-gray-500 ml-2">{currentUser.location}</Text>
    </View>

    <View className="flex-row items-center mb-3">
      <Feather name="calendar" size={16} color="#657786" />
      <Text className="text-gray-500 ml-2">
        Joined {currentUser.createdAt ? format(new Date(currentUser.createdAt), "MMMM yyyy") : "N/A"}
      </Text>
    </View>

    <View className="flex-row">
      <TouchableOpacity className="mr-6">
        <Text className="text-gray-900">
          <Text className="font-bold">{currentUser.following?.length}</Text>
          <Text className="text-gray-500"> Following</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text className="text-gray-900">
          <Text className="font-bold">{currentUser.followers?.length}</Text>
          <Text className="text-gray-500"> Followers</Text>
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</View>


        <PostsList username={currentUser?.username} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  );
}
