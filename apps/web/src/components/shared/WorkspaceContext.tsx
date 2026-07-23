"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export type WorkspaceType = "madrasah" | "pondok";

interface WorkspaceContextType {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuth();
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceType>("madrasah");

  useEffect(() => {
    if (user?.role === "sek.pondok") {
      setActiveWorkspaceState("pondok");
    } else if (user?.role === "sek.madrasah") {
      setActiveWorkspaceState("madrasah");
    } else {
      const saved = localStorage.getItem("mphm_active_workspace");
      if (saved === "madrasah" || saved === "pondok") {
        setActiveWorkspaceState(saved);
      }
    }
  }, [user?.role]);

  const setActiveWorkspace = (workspace: WorkspaceType) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem("mphm_active_workspace", workspace);
    // Dispatch a custom event in case other components outside context need to know
    window.dispatchEvent(new CustomEvent("workspace_changed", { detail: workspace }));
  };

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
