import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface ChildAcademicData {
  grades: {
    subject: string;
    score: number;
    type: string;
  }[];
  attendanceRate: number;
  sakit: number;
  izin: number;
  alfa: number;
  violationsCount: number;
  predikatAkhlaq: string;
}

export function useChildAcademic(studentId?: string) {
  return useQuery<ChildAcademicData>({
    queryKey: ["child-academic", studentId],
    queryFn: async () => {
      if (!studentId) return { grades: [], attendanceRate: 100, sakit: 0, izin: 0, alfa: 0, violationsCount: 0, predikatAkhlaq: "Jayyid Awwal" };
      const res = await apiRequest<{ data: ChildAcademicData }>(`/api/guardian/children/${studentId}/academic`);
      return res.data;
    },
    enabled: !!studentId,
  });
}
