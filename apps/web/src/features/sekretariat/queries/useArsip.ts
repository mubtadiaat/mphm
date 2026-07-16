import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/api";

export function useArsipSiswa(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["arsip", "siswa", academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await apiRequest<{ data: Record<string, unknown>[] }>(`/api/admin/arsip/siswa?academicYearId=${academicYearId}`);
      return res.data || [];
    },
    enabled: !!academicYearId,
  });
}

export function useArsipKelas(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["arsip", "kelas", academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await apiRequest<{ data: Record<string, unknown>[] }>(`/api/admin/arsip/kelas?academicYearId=${academicYearId}`);
      return res.data || [];
    },
    enabled: !!academicYearId,
  });
}

export function useArsipNilai(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["arsip", "nilai", academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await apiRequest<{ data: Record<string, unknown>[] }>(`/api/admin/arsip/nilai?academicYearId=${academicYearId}`);
      return res.data || [];
    },
    enabled: !!academicYearId,
  });
}

export function useArsipPelanggaran(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["arsip", "pelanggaran", academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await apiRequest<{ data: Record<string, unknown>[] }>(`/api/admin/arsip/pelanggaran?academicYearId=${academicYearId}`);
      return res.data || [];
    },
    enabled: !!academicYearId,
  });
}
