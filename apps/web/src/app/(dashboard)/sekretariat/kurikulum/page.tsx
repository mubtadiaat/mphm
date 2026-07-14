"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { KurikulumTab } from "@/features/sekretariat/components/KurikulumTab";

export default function KurikulumTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <KurikulumTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
