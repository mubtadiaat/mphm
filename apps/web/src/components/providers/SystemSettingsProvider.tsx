"use client";

import React, { createContext, useContext } from "react";
import { MaintenanceScreen } from "../shared/MaintenanceScreen";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../lib/auth";

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
          : "/api/settings"
      );
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return json.data || {};
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // 2. Use canonical User Session to check if Admin
  const { data: authSession } = useAuth();

  const settings = settingsData || {};
  const isMaintenanceMode = settings.systemMaintenance === "true" || settings.systemMaintenance === true;
  
  // Allow access if user is Sekretariat (Admin)
  const isSekretariat = authSession?.role === "Sekretariat";

  // We no longer block rendering with a full-screen "Loading System..." state
  // to allow the login/dashboard pages to mount instantly in the browser.

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
