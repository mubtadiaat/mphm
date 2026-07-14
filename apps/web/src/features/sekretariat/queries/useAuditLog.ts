import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface AuditLog {
  id: string;
  userId: string;
  role: string;
  module: string;
  action: string;
  beforeData: string | null;
  afterData: string | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export function useAuditLog() {
  return useQuery<AuditLog[]>({
    queryKey: ["sekretariat-audit-logs"],
    queryFn: async () => {
      const res = await apiRequest<{ data: AuditLog[] }>("/api/admin/audit-logs");
      return res.data || [];
    },
  });
}
