import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface DashboardStats {
  totalStudents: number;
  averageGpa: number;
  attendanceRate: number;
  activeViolations: number;
  performances: {
    level: string;
    score: number;
    active: number;
  }[];
}

export function useDashboardStats(academicYearId?: string) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", academicYearId],
    queryFn: async () => {
      const url = academicYearId
        ? `/api/admin/dashboard/stats?academicYearId=${academicYearId}`
        : "/api/admin/dashboard/stats";
      const res = await apiRequest<{ data: DashboardStats }>(url);
      return res.data;
    },
  });
}
