import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Santri {
  id: string;
  name: string;
  stambuk: string;
  nik: string;
  class: string;
  mustahiq: string;
  mufattisy: string;
  address: string;
  status: string; // ACTIVE, GRADUATED, DROPPED, BOYONG, KHIDMAH
  gender: "L" | "P";
  birthPlace?: string;
  birthDate?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  nis: string;
  nisn?: string;
  enrollmentYear: number;
  graduationYear?: number;
  guardianName: string;
  guardianNik?: string;
  guardianPhone: string;
  guardianRelation: "AYAH" | "IBU" | "WALI";
  familyCardNumber: string;
  khidmahPlacement?: string;
}

export function useSantri(academicYearId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Santri[]>({
    queryKey: ["sekretariat-santri", academicYearId],
    queryFn: async () => {
      const url = academicYearId
        ? `/api/admin/people?role=student&academicYearId=${academicYearId}`
        : "/api/admin/people?role=student";
      const res = await apiRequest<{ data: Santri[] }>(url);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSantri: Omit<Santri, "id">) => {
      const res = await apiRequest<{ data: Santri }>("/api/admin/people", {
        method: "POST",
        body: JSON.stringify(newSantri),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-santri"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Santri, "id">> }) => {
      const res = await apiRequest<{ data: Santri }>(`/api/admin/people/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-santri"] });
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
      queryClient.invalidateQueries({ queryKey: ["sekretariat-santri"] });
    },
  });

  return {
    ...query,
    createSantri: createMutation.mutateAsync,
    updateSantri: updateMutation.mutateAsync,
    deleteSantri: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
