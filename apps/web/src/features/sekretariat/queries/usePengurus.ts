import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

export interface Pengurus {
  id: string;
  personId?: string;
  name: string;
  phone: string;
  role: string;
  supervisedLevel?: string | null;
  status: "ACTIVE" | "INACTIVE";
  gender?: string;
  avatarUrl?: string | null;
}

export function usePengurus(query?: string, pageIndex = 0, pageSize = 10, customScope?: string) {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const scope = customScope || (activeWorkspace === "pondok" ? "pondok" : "madrasah");

  const queryReq = useQuery<{ data: Pengurus[]; total: number }>({
    queryKey: ["sekretariat-pengurus", query, pageIndex, pageSize, scope],
    queryFn: async () => {
      let url = `/api/admin/people?role=pengurus&limit=${pageSize}&offset=${pageIndex * pageSize}&scope=${scope}`;
      if (query) url += `&q=${query}`;
      const res = await apiRequest<{ data: Pengurus[]; total: number }>(url);
      return res || { data: [], total: 0 };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; phone?: string; roleName: string; supervisedLevel?: string; gender?: "L" | "P" }) => {
      const personRes = await apiRequest<{ data: { person: { id: string }; id?: string } }>("/api/admin/people", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.name,
          phoneNumber: data.phone || null,
          gender: data.gender || "L",
          role: "pengurus",
          scope,
          institution: scope === "pondok" ? "PONDOK" : "MADRASAH",
        }),
      });
      const personId = personRes.data?.person?.id || (personRes.data as any)?.id;
      if (!personId) {
        throw new Error("Gagal mengambil ID person yang baru dibuat.");
      }
      await apiRequest(`/api/admin/people/${personId}/assign-role`, {
        method: "POST",
        body: JSON.stringify({
          role: "pengurus",
          roleName: data.roleName,
          supervisedLevel: data.supervisedLevel || null,
          institution: scope === "pondok" ? "PONDOK" : "MADRASAH",
        }),
      });
      return personRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("onboarding_status_changed"));
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { personId: string; name: string; phone?: string; roleName?: string; supervisedLevel?: string | null }) => {
      return await apiRequest(`/api/admin/people/${data.personId}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: data.name,
          phoneNumber: data.phone || null,
          ...(data.roleName ? { roleName: data.roleName } : {}),
          ...(data.supervisedLevel !== undefined ? { supervisedLevel: data.supervisedLevel } : {}),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("onboarding_status_changed"));
      }
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
      queryClient.invalidateQueries({ queryKey: ["sekretariat-pengurus"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("onboarding_status_changed"));
      }
    },
  });

  return {
    ...queryReq,
    createPengurus: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePengurus: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePengurus: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
