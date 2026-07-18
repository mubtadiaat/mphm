import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface StudentScore {
  id: string;
  name: string;
  class: string;
  nis: string;
  stambuk: string;
  scores: Record<string, number>; 
}

export interface SubjectData {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface MatrixResponse {
  subjects: SubjectData[];
  students: StudentScore[];
}

export function useAssessmentMatrix(classId: string, kwartal: number) {
  return useQuery({
    queryKey: ["assessmentMatrix", classId, kwartal],
    queryFn: async () => {
      const res = await apiRequest<{ data: MatrixResponse }>(`/api/assessment/matrix/${classId}?kwartal=${kwartal}`);
      return res.data;
    },
    enabled: !!classId && !!kwartal,
  });
}

export function useSaveScoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, studentId, subjectId, kwartal, score }: { classId: string, studentId: string, subjectId: string, kwartal: number, score: number }) => {
      const res = await apiRequest<{ status: string }>(`/api/assessment/scores/${classId}`, {
        method: "POST",
        body: JSON.stringify({ studentId, subjectId, kwartal, score }),
      });
      return res;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific matrix query so that UI updates correctly on fresh fetch if needed.
      // But usually local state is already updated optimally before mutation
      queryClient.invalidateQueries({ queryKey: ["assessmentMatrix", variables.classId, variables.kwartal] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-dashboard-stats"] });
    }
  });
}
