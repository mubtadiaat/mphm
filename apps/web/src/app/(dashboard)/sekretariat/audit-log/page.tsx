"use client";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { AuditLogTab } from "@/features/sekretariat/components/AuditLogTab";

export default function AuditLogTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  return <AuditLogTab selectedYearId={selectedYearId} isReadOnly={isReadOnly} />;
}
