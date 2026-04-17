import { useApiClient,userApi } from "@/utils/api";

export const useAllUser = () => {
  const api = useApiClient();

  const fetchAllUsersExceptLogged = async () => {
    try {
      const response = await userApi.fetchAllUsersExceptLogged(api);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  };

  return { fetchAllUsersExceptLogged };
}