import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface AttendanceRecordInput {
  studentId: string;
  status: "HADIR" | "SAKIT" | "IZIN" | "ALFA";
  notes?: string;
}

export interface ClassAttendancePayload {
  academicYearId: string;
  date: string;
  session: "HISSOH_ULA" | "HISSOH_TSANI";
  records: AttendanceRecordInput[];
}

export function useAttendance(classId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: ClassAttendancePayload) => {
      if (!classId) throw new Error("Class ID is required");
      
      const res = await apiRequest(`/api/mustahiq/attendance/${classId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res;
    },
    onSuccess: () => {
      // Invalidate related lists
      queryClient.invalidateQueries({ queryKey: ["mustahiq-my-class"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-dashboard-stats"] });
    },
  });

  return {
    saveAttendance: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
