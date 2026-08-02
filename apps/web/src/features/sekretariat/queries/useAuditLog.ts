import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

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
  const { activeWorkspace } = useWorkspace();
  const scope = activeWorkspace === "pondok" ? "pondok" : "madrasah";

  return useQuery<AuditLog[]>({
    queryKey: ["sekretariat-audit-logs", scope],
    queryFn: async () => {
      const res = await apiRequest<{ data: AuditLog[] }>(`/api/admin/audit-logs?scope=${scope}`);
      return res.data || [];
    },
  });
}
