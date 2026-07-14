"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { ManajemenNilaiTab } from "@/features/sekretariat/components/ManajemenNilaiTab";

export default function ManajemenNilaiTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <ManajemenNilaiTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
