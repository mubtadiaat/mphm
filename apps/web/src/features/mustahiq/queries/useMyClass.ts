import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export interface ClassInfo {
  id: string;
  fullName: string;
  capacity: number;
  institutionLevel: string;
  classLevel: string;
  section: string;
}

export interface StudentInClass {
  studentId: string;
  nis: string;
  fullName: string;
  avatarUrl: string | null;
  gender: string;
}

export interface MyClassData {
  classInfo: ClassInfo;
  students: StudentInClass[];
}

export function useMyClass() {
  return useQuery<MyClassData>({
    queryKey: ["mustahiq-my-class"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MyClassData }>("/api/mustahiq/class/my-class");
      return res.data;
    },
  });
}
