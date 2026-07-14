import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

export function useAcademicYears() {
  const queryClient = useQueryClient();

  const query = useQuery<AcademicYear[]>({
    queryKey: ["sekretariat-academic-years"],
    queryFn: async () => {
      const res = await apiRequest<{ data: AcademicYear[] }>("/api/academic/years");
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newYear: Omit<AcademicYear, "id" | "isActive" | "isClosed">) => {
      const res = await apiRequest<{ data: AcademicYear }>("/api/academic/years", {
        method: "POST",
        body: JSON.stringify(newYear),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-academic-years"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ data: AcademicYear }>(`/api/academic/years/${id}/activate`, {
        method: "PUT",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-academic-years"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Omit<AcademicYear, "id" | "isActive" | "isClosed">) => {
      const res = await apiRequest<{ data: AcademicYear }>(`/api/academic/years/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-academic-years"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ data: AcademicYear }>(`/api/academic/years/${id}/deactivate`, {
        method: "PUT",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-academic-years"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/academic/years/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-academic-years"] });
    },
  });

  return {
    ...query,
    createYear: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateYear: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    activateYear: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    deactivateYear: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
    deleteYear: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
