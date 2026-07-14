"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAcademicYears, AcademicYear } from "@/features/sekretariat/queries/useAcademicYears";

interface AcademicYearContextType {
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  years: AcademicYear[];
  isReadOnly: boolean;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { data: years = [] } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState<string>("");

  useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      const active = years.find((y: AcademicYear) => y.isActive);
      const targetId = active ? active.id : years[0].id;
      queueMicrotask(() => setSelectedYearId(targetId));
    }
  }, [years, selectedYearId]);

  const selectedYearObj = years.find((y) => y.id === selectedYearId);
  const isReadOnly = selectedYearObj ? !selectedYearObj.isActive : false;

  return (
    <AcademicYearContext.Provider value={{ selectedYearId, setSelectedYearId, years, isReadOnly }}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
}
