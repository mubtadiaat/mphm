import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface UserAccount {
  id: string;
  username: string;
  role: string;
  status: string;
  isActive: boolean;
  isOnline: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  personId: string;
  personName: string;
  fullName?: string;
  personPhone?: string;
  avatarUrl: string | null;
  gender: string;
}

export function useUsers(query?: string) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<UserAccount[]>({
    queryKey: ["sekretariat-users", query],
    queryFn: async () => {
      const url = query ? `/api/admin/users?query=${query}` : "/api/admin/users";
      const res = await apiRequest<{ data: UserAccount[] }>(url);
      return res.data || [];
    },
  });

  const dormanUsersQuery = useQuery<UserAccount[]>({
    queryKey: ["sekretariat-users-dorman", query],
    queryFn: async () => {
      const url = query ? `/api/admin/users?status=dorman&query=${query}` : "/api/admin/users?status=dorman";
      const res = await apiRequest<{ data: UserAccount[] }>(url);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await apiRequest<{ data: UserAccount }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest<{ data: UserAccount }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "ACTIVE", deletedAt: null }),
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  const forceDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/users/${id}?force=true`, {
        method: "DELETE",
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await apiRequest(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-users-dorman"] });
    },
  });

  return {
    ...usersQuery,
    dormanUsers: dormanUsersQuery.data || [],
    isLoadingDorman: dormanUsersQuery.isLoading,
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    restoreUser: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    forceDeleteUser: forceDeleteMutation.mutateAsync,
    isForceDeleting: forceDeleteMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
  };
}
