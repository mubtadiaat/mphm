"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { RoomsTab } from "@/features/sekretariat/components/RoomsTab";

export default function RoomsTabPage() {
  const { isReadOnly } = useAcademicYear();
  return <RoomsTab isReadOnly={isReadOnly} />;
}
