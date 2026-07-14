import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface StudentScoreInput {
  id: string;
  studentId: string;
  subjectId: string;
  kwartal: number;
  score: number;
}

export function useScores(classId?: string, kwartal?: number) {
  const queryClient = useQueryClient();

  const query = useQuery<StudentScoreInput[]>({
    queryKey: ["mustahiq-scores", classId, kwartal],
    queryFn: async () => {
      if (!classId) return [];
      try {
        const res = await apiRequest<{ data: StudentScoreInput[] }>(
          `/api/assessment/scores/${classId}?kwartal=${kwartal || 1}`
        );
        return res.data;
      } catch (e) {
        return [];
      }
    },
    enabled: !!classId,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { studentId: string; subjectId: string; kwartal: number; score: number }) => {
      if (!classId) throw new Error("Class ID is required");
      
      const res = await apiRequest<{ data: StudentScoreInput }>(`/api/assessment/scores/${classId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mustahiq-scores", classId, kwartal] });
    },
  });

  return {
    ...query,
    saveScore: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
