"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { SantriTab } from "@/features/sekretariat/components/SantriTab";

export default function MufattisySantriPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  
  return <SantriTab selectedYearId={selectedYearId} isReadOnly={true} onViewDetail={() => {}} />;
}
