import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Pengurus {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  gender?: string;
  avatarUrl?: string | null;
}

export function usePengurus(query?: string) {
  const queryClient = useQueryClient();

  const queryReq = useQuery<Pengurus[]>({
    queryKey: ["sekretariat-pengurus", query],
    queryFn: async () => {
      const url = query ? `/api/admin/people?role=pengurus&q=${query}` : "/api/admin/people?role=pengurus";
      const res = await apiRequest<{ data: Pengurus[] }>(url);
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Assuming id is the person_id, we can soft delete the membership
      const res = await apiRequest<{ status: string }>(`/api/admin/people/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
    },
  });

  return {
    ...queryReq,
    deletePengurus: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
