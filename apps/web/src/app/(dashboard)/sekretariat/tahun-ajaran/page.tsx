"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { TahunAjaranTab } from "@/features/sekretariat/components/TahunAjaranTab";

export default function TahunAjaranTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <TahunAjaranTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
