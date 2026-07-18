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

export function useSantri(
  academicYearId?: string,
  pageIndex: number = 0,
  pageSize: number = 10,
  searchQuery: string = "",
  statusTab: string = "aktif",
  classFilter?: string
) {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Santri[]; total: number }>({
    queryKey: ["sekretariat-santri", academicYearId, pageIndex, pageSize, searchQuery, statusTab, classFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        role: "student",
        limit: pageSize.toString(),
        offset: (pageIndex * pageSize).toString(),
      });
      
      if (academicYearId) queryParams.append("academicYearId", academicYearId);
      if (searchQuery) queryParams.append("q", searchQuery);
      if (statusTab) queryParams.append("status", statusTab);
      if (classFilter) queryParams.append("classFilter", classFilter);

      const url = `/api/admin/people?${queryParams.toString()}`;
      const res = await apiRequest<{ data: Santri[]; total: number }>(url);
      return {
        data: res.data || [],
        total: res.total || 0,
      };
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
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-dashboard-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-dashboard-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-dashboard-stats"] });
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
