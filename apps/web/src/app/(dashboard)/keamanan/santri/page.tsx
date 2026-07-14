"use client";

import { SantriTab } from "@/features/sekretariat/components/SantriTab";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";

export default function KeamananSantriPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  
  return <SantriTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} onViewDetail={() => {}} />;
}
