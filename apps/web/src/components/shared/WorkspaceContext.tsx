"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export type WorkspaceType = "madrasah" | "pondok";

interface WorkspaceContextType {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;
  isWorkspaceLocked: boolean; // True jika role sudah terkunci ke satu instansi
  institution: "PONDOK" | "MADRASAH" | "ALL"; // Instansi resmi dari session JWT
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuth();
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceType>("madrasah");

  // Workspace lock: role terkunci tidak bisa ganti workspace secara manual
  const isWorkspaceLocked =
    user?.role === "sek.pondok" ||
    user?.role === "sek.madrasah" ||
    (typeof user?.institution === "string" && user.institution !== "ALL");

  // Ambil institution dari session JWT (bukan hanya dari role)
  const institution: "PONDOK" | "MADRASAH" | "ALL" =
    (user?.institution as "PONDOK" | "MADRASAH" | "ALL") || "MADRASAH";

  useEffect(() => {
    // Prioritas 1: Gunakan institution dari JWT session (paling otoritatif)
    if (user?.institution === "PONDOK") {
      setActiveWorkspaceState("pondok");
      return;
    }
    if (user?.institution === "MADRASAH") {
      setActiveWorkspaceState("madrasah");
      return;
    }

    // Prioritas 2: Deteksi dari role (untuk kompatibilitas mundur)
    if (user?.role === "sek.pondok") {
      setActiveWorkspaceState("pondok");
      return;
    }
    if (user?.role === "sek.madrasah") {
      setActiveWorkspaceState("madrasah");
      return;
    }

    // Prioritas 3: Preferensi tersimpan di localStorage (hanya jika workspace tidak terkunci)
    if (!isWorkspaceLocked) {
      const saved = localStorage.getItem("mphm_active_workspace");
      if (saved === "madrasah" || saved === "pondok") {
        setActiveWorkspaceState(saved);
      }
    }
  }, [user?.role, user?.institution]);

  const setActiveWorkspace = (workspace: WorkspaceType) => {
    // Jika workspace terkunci, tolak perubahan manual
    if (isWorkspaceLocked) {
      console.warn(
        "[WorkspaceContext] Workspace terkunci berdasarkan role/instansi pengguna. Perubahan manual ditolak."
      );
      return;
    }
    setActiveWorkspaceState(workspace);
    localStorage.setItem("mphm_active_workspace", workspace);
    window.dispatchEvent(new CustomEvent("workspace_changed", { detail: workspace }));
  };

  return (
    <WorkspaceContext.Provider
      value={{ activeWorkspace, setActiveWorkspace, isWorkspaceLocked, institution }}
    >
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
