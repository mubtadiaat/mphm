import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Guru {
  id: string;
  personId?: string;
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

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; phone?: string; gender?: "L" | "P" }) => {
      const personRes = await apiRequest<{ data: { person: { id: string }; id?: string } }>("/api/admin/people", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.name,
          phoneNumber: data.phone || null,
          gender: data.gender || "L",
        }),
      });
      const personId = personRes.data?.person?.id || (personRes.data as any)?.id;
      if (!personId) {
        throw new Error("Gagal mengambil ID person yang baru dibuat.");
      }
      const teacherCode = `UST-${Math.floor(100 + Math.random() * 900)}`;
      await apiRequest(`/api/admin/people/${personId}/assign-role`, {
        method: "POST",
        body: JSON.stringify({
          role: "teacher",
          teacherCode,
        }),
      });
      return personRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-guru"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { personId: string; name: string; phone?: string }) => {
      return await apiRequest(`/api/admin/people/${data.personId}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: data.name,
          phoneNumber: data.phone || null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-guru"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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
    createGuru: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateGuru: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteGuru: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
