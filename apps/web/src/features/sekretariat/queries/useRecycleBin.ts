import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface DeletedItem {
  id: string;
  entityType?: string;
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
      queryClient.invalidateQueries({ queryKey: ["sekretariat-santri"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-guru"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
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

  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest<{ status: string; message: string }>("/api/admin/recycle-bin", {
        method: "DELETE",
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-recycle-bin"] });
    },
  });

  const restoreAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest<{ status: string; message: string }>("/api/admin/recycle-bin", {
        method: "POST",
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-recycle-bin"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-santri"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-guru"] });
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
    },
  });

  return {
    ...query,
    restoreItem: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    forceDeleteItem: forceDeleteMutation.mutateAsync,
    isForceDeleting: forceDeleteMutation.isPending,
    emptyTrash: emptyTrashMutation.mutateAsync,
    isEmptyingTrash: emptyTrashMutation.isPending,
    restoreAllTrash: restoreAllMutation.mutateAsync,
    isRestoringAll: restoreAllMutation.isPending,
  };
}
