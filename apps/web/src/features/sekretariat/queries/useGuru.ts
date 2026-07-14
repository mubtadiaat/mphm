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

export function useGuru(query?: string) {
  const queryClient = useQueryClient();

  const queryReq = useQuery<Guru[]>({
    queryKey: ["sekretariat-guru", query],
    queryFn: async () => {
      const url = query ? `/api/admin/people?role=teacher&q=${query}` : "/api/admin/people?role=teacher";
      const res = await apiRequest<{ data: Guru[] }>(url);
      return res.data || [];
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
