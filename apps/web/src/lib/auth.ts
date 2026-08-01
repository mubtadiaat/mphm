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
  supervisedLevel?: string | null;
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
      const session = queryClient.getQueryData<UserSession>(["auth-session"]);
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";

      await apiRequest("/api/auth/logout", { method: "POST" });

      return { session, pathname };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth-session"], null);
      if (typeof window !== "undefined") {
        const role = String(data?.session?.role || "").trim().toLowerCase();
        const path = String(data?.pathname || "").trim().toLowerCase();

        let targetLogin = "/";

        if (
          role.includes("sek") ||
          role.includes("admin") ||
          path.startsWith("/sekretariat")
        ) {
          targetLogin = "/loginsekr";
        } else if (
          role.includes("wali") ||
          role.includes("guardian") ||
          path.startsWith("/guardian")
        ) {
          targetLogin = "/loginguardiant";
        } else if (
          role.includes("mustahiq") ||
          role.includes("keamanan") ||
          path.startsWith("/mustahiq") ||
          path.startsWith("/keamanan")
        ) {
          targetLogin = "/loginStaff";
        }

        window.location.href = targetLogin;
      }
    },
  });
}
