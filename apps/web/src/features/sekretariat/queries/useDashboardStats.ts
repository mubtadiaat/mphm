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
  // Pondok specific
  totalRooms?: number;
  totalKhidmah?: number;
  roomDistributions?: {
    roomName: string;
    buildingName: string;
    studentCount: number;
  }[];
}

export function useDashboardStats(academicYearId?: string, workspace: "madrasah" | "pondok" = "madrasah") {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", academicYearId, workspace],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (academicYearId) params.append("academicYearId", academicYearId);
      params.append("workspace", workspace);
      
      const url = `/api/admin/dashboard/stats?${params.toString()}`;
      const res = await apiRequest<{ data: DashboardStats }>(url);
      return res.data;
    },
  });
}
