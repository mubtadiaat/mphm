"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { ManajemenNilaiTab } from "@/features/sekretariat/components/ManajemenNilaiTab";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface MyClassResponse {
  id: string;
  name: string;
  fullName: string;
  class?: {
    id: string;
    fullName: string;
  };
}

export function MustahiqManajemenNilai() {
  const { selectedYearId, isReadOnly } = useAcademicYear();

  const { data: myClass, isLoading } = useQuery({
    queryKey: ["mustahiq-my-class"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MyClassResponse }>("/api/mustahiq/class/my-class");
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse font-semibold">Memuat data kelas Anda...</div>;
  }

  if (!myClass) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Anda belum ditugaskan ke kelas manapun pada tahun ajaran aktif ini.
      </div>
    );
  }

  const activeClassId = myClass.id || myClass.class?.id;
  const activeClassName = myClass.fullName || myClass.name || myClass.class?.fullName;

  return (
    <ManajemenNilaiTab 
      selectedYearId={selectedYearId} 
      isReadOnly={isReadOnly} 
      fixedClass={activeClassName}
      fixedClassId={activeClassId}
    />
  );
}
