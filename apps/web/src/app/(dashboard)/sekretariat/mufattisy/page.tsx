"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { MufattisyTab } from "@/features/sekretariat/components/MufattisyTab";

export default function MufattisyTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <MufattisyTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
