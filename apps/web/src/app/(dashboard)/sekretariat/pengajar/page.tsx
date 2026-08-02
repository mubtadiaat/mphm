"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { PengajarTab } from "../../../../features/sekretariat/components/PengajarTab";

export default function PengajarTabPage() {
  const { isReadOnly } = useAcademicYear();
  return <PengajarTab isReadOnly={isReadOnly} onViewDetail={() => {}} />;
}
