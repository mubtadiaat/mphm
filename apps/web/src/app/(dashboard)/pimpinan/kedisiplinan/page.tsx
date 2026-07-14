"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { PelanggaranTab } from "@/features/sekretariat/components/PelanggaranTab";

export default function PimpinanKedisiplinanPage() {
  const { selectedYearId } = useAcademicYear();
  
  return <PelanggaranTab selectedYearId={selectedYearId} isReadOnly={true} onViewDetail={() => {}} />;
}
