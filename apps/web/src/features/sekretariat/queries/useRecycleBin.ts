import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface DeletedItem {
  id: string;
  type: string;
  name: string;
  deletedAt: string;
  expiresAt: string;
}

export function useRecycleBin() {
  const queryClient = useQueryClient();

  const query = useQuery<DeletedItem[]>({
    queryKey: ["sekretariat-recycle-bin"],
    queryFn: async () => {
      const res = await apiRequest<{ data: DeletedItem[] }>("/api/admin/recycle-bin");
      return res.data || [];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/recycle-bin/${id}/restore`, {
        method: "PUT",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-recycle-bin"] });
    },
  });

  const forceDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/recycle-bin/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-recycle-bin"] });
    },
  });

  return {
    ...query,
    restoreItem: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    forceDeleteItem: forceDeleteMutation.mutateAsync,
    isForceDeleting: forceDeleteMutation.isPending,
  };
}
