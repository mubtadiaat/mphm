"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { SystemSettingsCockpit } from "@/components/shared/SystemSettingsCockpit";

export default function SystemSettingsCockpitPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <SystemSettingsCockpit selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
