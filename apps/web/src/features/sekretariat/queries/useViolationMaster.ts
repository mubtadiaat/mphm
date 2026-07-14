import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface ViolationCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ViolationSeverity {
  id: string;
  name: string;
  level: number;
  badgeColor: string;
  description: string | null;
  isActive: boolean;
}

export interface ViolationType {
  id: string;
  name: string;
  category: string;
  severity: string;
  points: number;
  isActive: boolean;
}

export interface CreateViolationTypePayload {
  categoryId: string;
  severityId: string;
  name: string;
  description?: string;
  points?: number;
}

export function useViolationMaster() {
  const queryClient = useQueryClient();

  // Queries
  const categoriesQuery = useQuery<ViolationCategory[]>({
    queryKey: ["sekretariat-violation-categories"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ViolationCategory[] }>("/api/admin/violations/categories");
      return res.data || [];
    },
  });

  const severitiesQuery = useQuery<ViolationSeverity[]>({
    queryKey: ["sekretariat-violation-severities"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ViolationSeverity[] }>("/api/admin/violations/severities");
      return res.data || [];
    },
  });

  const typesQuery = useQuery<ViolationType[]>({
    queryKey: ["sekretariat-violations"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ViolationType[] }>("/api/admin/violations/types");
      return res.data || [];
    },
  });

  // Mutations
  const createCategory = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest<{ data: ViolationCategory }>("/api/admin/violations/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-violation-categories"] });
    },
  });

  const createSeverity = useMutation({
    mutationFn: async (data: { name: string; level: number; badgeColor: string; description?: string }) => {
      const res = await apiRequest<{ data: ViolationSeverity }>("/api/admin/violations/severities", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-violation-severities"] });
    },
  });

  const createType = useMutation({
    mutationFn: async (newViolation: CreateViolationTypePayload) => {
      const res = await apiRequest<{ data: ViolationType }>("/api/admin/violations/types", {
        method: "POST",
        body: JSON.stringify(newViolation),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-violations"] });
    },
  });

  const deleteType = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/violations/types/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-violations"] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    createCategory: createCategory.mutateAsync,
    isCreatingCategory: createCategory.isPending,

    severities: severitiesQuery.data || [],
    isLoadingSeverities: severitiesQuery.isLoading,
    createSeverity: createSeverity.mutateAsync,
    isCreatingSeverity: createSeverity.isPending,

    types: typesQuery.data || [],
    isLoadingTypes: typesQuery.isLoading,
    createViolation: createType.mutateAsync,
    isCreatingViolation: createType.isPending,
    deleteViolation: deleteType.mutateAsync,
    isDeletingViolation: deleteType.isPending,
  };
}
