"use client";

import React, { createContext, useContext } from "react";
import { MaintenanceScreen } from "../shared/MaintenanceScreen";
import { useQuery } from "@tanstack/react-query";

interface SystemSettingsContextType {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  settings: Record<string, any>;
  isLoading: boolean;
  refetchSettings: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType>({
  settings: {},
  isLoading: true,
  refetchSettings: () => {},
});

export const useSystemSettings = () => useContext(SystemSettingsContext);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  // 1. Fetch Global Settings
  const { data: settingsData, isLoading: isLoadingSettings, refetch } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/settings` 
          : "https://api.m.p3hm.my.id/api/settings"
      );
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return json.data || {};
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // 2. Fetch User Session to check if Admin
  const { data: authSession } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.m.p3hm.my.id";
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const settings = settingsData || {};
  const isMaintenanceMode = settings.systemMaintenance === "true" || settings.systemMaintenance === true;
  
  // Allow access if user is Sekretariat (Admin)
  const isSekretariat = authSession?.role === "Sekretariat";

  // If loading settings, we can just show a generic loading or wait
  if (isLoadingSettings) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading System...</div>;
  }

  // Enforce Maintenance Mode
  if (isMaintenanceMode && !isSekretariat) {
    return <MaintenanceScreen />;
  }

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading: isLoadingSettings, refetchSettings: refetch }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}
