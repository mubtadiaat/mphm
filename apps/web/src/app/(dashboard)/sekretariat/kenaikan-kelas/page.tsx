"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { KenaikanKelasTab } from "@/features/sekretariat/components/KenaikanKelasTab";

export default function KenaikanKelasTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <KenaikanKelasTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
