import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Subject {
  id: string;
  code: string;
  name: string;
  subjectType: "MAPEL" | "NON_MAPEL";
  isActive: boolean;
}

export function useSubjects() {
  const queryClient = useQueryClient();

  const query = useQuery<Subject[]>({
    queryKey: ["sekretariat-subjects"],
    queryFn: async () => {
      const res = await apiRequest<{ data: Subject[] }>("/api/admin/subjects");
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSubject: Omit<Subject, "id" | "isActive">) => {
      const res = await apiRequest<{ data: Subject }>("/api/admin/subjects", {
        method: "POST",
        body: JSON.stringify(newSubject),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-subjects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subject> }) => {
      const res = await apiRequest<{ data: Subject }>(`/api/admin/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-subjects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ status: string }>(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });
      return res.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-subjects"] });
    },
  });

  return {
    ...query,
    createSubject: createMutation.mutateAsync,
    updateSubject: updateMutation.mutateAsync,
    deleteSubject: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
