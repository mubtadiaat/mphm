import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Candidate {
  studentId: string;
  nis: string;
  name: string;
  stambuk: string;
  averageScore: number;
  attendanceRate: number;
  recommendedStatus: "PROMOTED" | "RETAINED" | "GRADUATED";
  akhlaqPenentu: string;
}

export function useCandidates(classId?: string) {
  return useQuery<Candidate[]>({
    queryKey: ["promotion-candidates", classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await apiRequest<{ data: Candidate[] }>(`/api/promotion/candidates/${classId}`);
      return res.data || [];
    },
    enabled: !!classId,
  });
}
