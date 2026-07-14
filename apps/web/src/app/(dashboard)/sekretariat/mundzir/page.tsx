"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { MundzirTab } from "@/features/sekretariat/components/MundzirTab";

export default function MundzirTabPage() {
  const { isReadOnly } = useAcademicYear();
  return <MundzirTab isReadOnly={isReadOnly} onViewDetail={() => {}} />;
}
