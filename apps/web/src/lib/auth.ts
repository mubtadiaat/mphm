import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";

export interface UserSession {
  userId: string;
  accountId: string;
  personId: string;
  username: string;
  role: string;
  fullName: string;
  avatarUrl: string | null;
  email?: string | null;
  googleLinked?: boolean;
  assignedClassId: string | null;
  familyCardNumber: string | null;
  mustChangePassword?: boolean;
}

export function useAuth() {
  return useQuery<UserSession | null>({
    queryKey: ["auth-session"],
    queryFn: async () => {
      try {
        const response = await apiRequest<{ data: UserSession }>("/api/auth/me");
        return response.data;
      } catch (_err) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-session"], null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });
}
