import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface AcademicClass {
  id: string;
  name: string;
  mustahiq: string;
  mufattisy: string;
  capacity: number;
}

export function useClasses(academicYearId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<AcademicClass[]>({
    queryKey: ["sekretariat-classes", academicYearId],
    queryFn: async () => {
      const url = academicYearId
        ? `/api/admin/classes?academicYearId=${academicYearId}`
        : "/api/admin/classes";
      const res = await apiRequest<{ data: AcademicClass[] }>(url);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newClass: Omit<AcademicClass, "id">) => {
      const res = await apiRequest<{ data: AcademicClass }>("/api/admin/classes", {
        method: "POST",
        body: JSON.stringify(newClass),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sekretariat-classes"] });
    },
  });

  return {
    ...query,
    createClass: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
