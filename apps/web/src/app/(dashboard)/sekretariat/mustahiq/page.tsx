"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { MustahiqTab } from "@/features/sekretariat/components/MustahiqTab";

export default function MustahiqTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <MustahiqTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
