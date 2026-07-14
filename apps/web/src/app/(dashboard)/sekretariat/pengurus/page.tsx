"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { PengurusTab } from "@/features/sekretariat/components/PengurusTab";

export default function PengurusTabPage() {
  const { isReadOnly } = useAcademicYear();
  return <PengurusTab isReadOnly={isReadOnly} onViewDetail={() => {}} />;
}
