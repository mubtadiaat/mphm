"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { ArsipTab } from "@/features/sekretariat/components/ArsipTab";

export default function ArsipTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <ArsipTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
