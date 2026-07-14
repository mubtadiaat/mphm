"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { KhidmahTab } from "@/features/sekretariat/components/KhidmahTab";

export default function KhidmahPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <KhidmahTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
