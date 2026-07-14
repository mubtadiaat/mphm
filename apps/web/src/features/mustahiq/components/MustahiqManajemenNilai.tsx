"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { ManajemenNilaiTab } from "@/features/sekretariat/components/ManajemenNilaiTab";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export function MustahiqManajemenNilai() {
  const { selectedYearId, isReadOnly } = useAcademicYear();

  const { data: myClass, isLoading } = useQuery({
    queryKey: ["mustahiq-my-class"],
    queryFn: async () => {
      const res = await apiRequest<{ data: any }>("/api/mustahiq/class/my-class");
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat data kelas Anda...</div>;
  }

  if (!myClass) {
    return (
      <div className="p-8 text-center text-rose-500">
        Anda belum ditugaskan ke kelas manapun pada tahun ajaran aktif ini.
      </div>
    );
  }

  // Pass fixedClass so ManajemenNilaiTab hides the class selector
  return (
    <ManajemenNilaiTab 
      selectedYearId={selectedYearId} 
      isReadOnly={isReadOnly} 
      fixedClass={myClass.class.fullName} 
    />
  );
}
