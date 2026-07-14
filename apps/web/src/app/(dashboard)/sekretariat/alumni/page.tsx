"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { AlumniTab } from "@/features/sekretariat/components/AlumniTab";

export default function AlumniPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <AlumniTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
