"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { SantriTab } from "@/features/sekretariat/components/SantriTab";

export default function SantriTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <SantriTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
