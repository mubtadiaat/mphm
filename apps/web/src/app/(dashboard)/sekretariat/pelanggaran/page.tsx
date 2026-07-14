"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { PelanggaranTab } from "@/features/sekretariat/components/PelanggaranTab";

export default function PelanggaranTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <PelanggaranTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
