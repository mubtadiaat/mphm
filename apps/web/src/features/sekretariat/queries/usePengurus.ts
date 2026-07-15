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

export function usePengurus(query?: string, pageIndex = 0, pageSize = 10) {
  const queryClient = useQueryClient();

  const queryReq = useQuery<{ data: Pengurus[]; total: number }>({
    queryKey: ["sekretariat-pengurus", query, pageIndex, pageSize],
    queryFn: async () => {
      let url = `/api/admin/people?role=pengurus&limit=${pageSize}&offset=${pageIndex * pageSize}`;
      if (query) url += `&q=${query}`;
      const res = await apiRequest<{ data: Pengurus[]; total: number }>(url);
      return res || { data: [], total: 0 };
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
