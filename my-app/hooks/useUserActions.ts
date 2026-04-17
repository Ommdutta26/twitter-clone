import { userApi,useApiClient } from "@/utils/api";
import { useCallback } from "react";

export const useUserActions = () => {
  const api = useApiClient();

  const followUser = useCallback(async (targetUserId: string) => {
    try {
      const res = await userApi.followUser(api, targetUserId);
      return res.data; // { message: "...", ... }
    } catch (error: any) {
      console.error("Failed to follow/unfollow user:", error?.response?.data || error.message);
      throw error;
    }
  }, [api]);

  return { followUser };
};
