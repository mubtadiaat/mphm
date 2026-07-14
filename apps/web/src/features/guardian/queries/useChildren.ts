import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface Child {
  studentId: string;
  nis: string;
  fullName: string;
  gender: string;
  avatarUrl: string | null;
  class?: string;
  mustahiq?: string;
}

export function useChildren() {
  return useQuery<Child[]>({
    queryKey: ["guardian-children"],
    queryFn: async () => {
      const res = await apiRequest<{ data: Child[] }>("/api/guardian/children");
      return res.data || [];
    },
  });
}
