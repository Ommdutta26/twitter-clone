import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE_URL = "http://192.168.122.236:5000/api";
// ! 🔥 localhost api would not work on your actual physical device
// const API_BASE_URL = "http://localhost:5001/api";

// this will basically create an authenticated api, pass the token into our headers
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
  fetchAllUsersExceptLogged: (api: AxiosInstance) => api.get("/users/all"),
  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};


export const messageApi = {
  // Send a message
  sendMessage: (
    api: AxiosInstance,
    data: { receiverId: string; content: string }
  ) => api.post("/messages", data),

  // Get messages from a conversation
  getMessages: (api: AxiosInstance, conversationId: string) =>
    api.get(`/messages/${conversationId}`),

  // Optionally, get all messages with a user (if conversationId is unknown)
  getUserMessages: (api: AxiosInstance, userId: string) =>
    api.get(`/messages/user/${userId}`),
};
