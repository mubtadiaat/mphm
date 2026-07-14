"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { KelasTab } from "@/features/sekretariat/components/KelasTab";

export default function KelasTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <KelasTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
