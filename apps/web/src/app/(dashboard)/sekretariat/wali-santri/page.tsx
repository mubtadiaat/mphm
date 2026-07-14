"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { WaliSantriTab } from "@/features/sekretariat/components/WaliSantriTab";

export default function WaliSantriTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <WaliSantriTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} onViewDetail={() => {}} />;
}
