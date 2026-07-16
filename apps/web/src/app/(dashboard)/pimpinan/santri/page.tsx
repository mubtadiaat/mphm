"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { SantriTab } from "@/features/sekretariat/components/SantriTab";

export default function PimpinanSantriPage() {
  const { selectedYearId } = useAcademicYear();
  
  return <SantriTab selectedYearId={selectedYearId} isReadOnly={true} onViewDetail={() => {}} />;
}
