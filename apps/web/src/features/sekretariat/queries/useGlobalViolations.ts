import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface StudentViolation {
  id: string;
  name: string;
  stambuk: string;
  class: string;
  desc: string;
  category: string;
  severity: string;
  date: string;
  time?: string;
  location?: string;
  detailDescription?: string;
  status: string;
}

export function useGlobalViolations(academicYearId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<StudentViolation[]>({
    queryKey: ["global-violations", academicYearId],
    queryFn: async () => {
      const url = academicYearId
        ? `/api/disciplinary/violations?academicYearId=${academicYearId}`
        : "/api/disciplinary/violations";
      const res = await apiRequest<{ data: StudentViolation[] }>(url);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      studentId: string;
      violationTypeId: string;
      academicYearId: string;
      incidentDate: string;
      incidentTime?: string;
      location?: string;
      description?: string;
    }) => {
      const res = await apiRequest<{ data: StudentViolation }>("/api/disciplinary/violations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-violations"] });
    },
  });

  return {
    ...query,
    createViolation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
