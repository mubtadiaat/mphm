"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { UsersManagementTab } from "@/features/sekretariat/components/UsersManagementTab";

export default function UsersManagementTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <UsersManagementTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
