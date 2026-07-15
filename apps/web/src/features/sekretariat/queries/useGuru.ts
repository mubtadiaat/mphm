import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Guru {
  id: string;
  name: string;
  teacherCode: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  gender: string;
  avatarUrl?: string | null;
}

export function useGuru(query?: string, pageIndex = 0, pageSize = 10) {
  const queryClient = useQueryClient();

  const queryReq = useQuery<{ data: Guru[]; total: number }>({
    queryKey: ["sekretariat-guru", query, pageIndex, pageSize],
    queryFn: async () => {
      let url = `/api/admin/people?role=teacher&limit=${pageSize}&offset=${pageIndex * pageSize}`;
      if (query) url += `&q=${query}`;
      const res = await apiRequest<{ data: Guru[]; total: number }>(url);
      return res || { data: [], total: 0 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Assuming id is the person_id, we soft delete the profile
      const res = await apiRequest<{ status: string }>(`/api/admin/people/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-guru"] });
    },
  });

  return {
    ...queryReq,
    deleteGuru: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
