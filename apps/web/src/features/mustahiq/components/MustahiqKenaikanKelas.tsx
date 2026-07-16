"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { KenaikanKelasTab } from "@/features/sekretariat/components/KenaikanKelasTab";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface MyClassBrief {
  class: {
    id: string;
  };
}

export function MustahiqKenaikanKelas() {
  const { selectedYearId, isReadOnly } = useAcademicYear();

  const { data: myClass, isLoading } = useQuery({
    queryKey: ["mustahiq-my-class"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MyClassBrief }>("/api/mustahiq/class/my-class");
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

  // Pass fixedClassId so KenaikanKelasTab hides the class selector
  return (
    <KenaikanKelasTab 
      selectedYearId={selectedYearId} 
      isReadOnly={isReadOnly} 
      fixedClassId={myClass.class.id} 
    />
  );
}
