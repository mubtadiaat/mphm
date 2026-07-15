import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Guardian {
  familyCardNumber: string;
  guardianName: string;
  phone: string;
  relation: string;
  nik: string;
  childrenCount: number;
}

export function useGuardians(query?: string, pageIndex = 0, pageSize = 10) {
  return useQuery<{ data: Guardian[]; total: number }>({
    queryKey: ["sekretariat-guardians", query, pageIndex, pageSize],
    queryFn: async () => {
      let url = `/api/admin/people?role=guardian&limit=${pageSize}&offset=${pageIndex * pageSize}`;
      if (query) url += `&q=${query}`;
      const res = await apiRequest<{ data: Guardian[]; total: number }>(url);
      return res || { data: [], total: 0 };
    },
  });
}
