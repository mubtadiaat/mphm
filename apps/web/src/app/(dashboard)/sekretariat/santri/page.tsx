"use client";

import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { SantriTab } from "@/features/sekretariat/components/SantriTab";
import { SiswiTab } from "@/features/sekretariat/components/SiswiTab";

export default function SantriTabPage() {
  const { selectedYearId, isReadOnly } = useAcademicYear();
  const { activeWorkspace } = useWorkspace();

  if (activeWorkspace === "madrasah") {
    return (
      <SiswiTab 
        selectedYearId={selectedYearId} 
        isReadOnly={isReadOnly} 
      />
    );
  }

  return (
    <SantriTab 
      selectedYearId={selectedYearId} 
      isReadOnly={isReadOnly} 
      workspace="pondok" 
    />
  );
}
