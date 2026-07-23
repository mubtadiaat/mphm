"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { SantriTab } from "@/features/sekretariat/components/SantriTab";

export default function SantriTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  const { activeWorkspace } = useWorkspace();

  return (
    <SantriTab 
      selectedYearId={selectedYearId} 
      isReadOnly={isReadOnly} 
      workspace={activeWorkspace} 
    />
  );
}
