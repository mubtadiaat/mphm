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

  // 2. Use canonical User Session to check if Admin or Developer
  const { data: authSession } = useAuth();

  const settings = settingsData || {};
  const isMaintenanceMode = settings.systemMaintenance === "true" || settings.systemMaintenance === true;
  
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  
  const isDeveloperRoute = pathname.startsWith("/developer");
  const isDeveloperUser =
    authSession?.role === "developer" ||
    authSession?.role === "develzy" ||
    authSession?.role === "superadmin" ||
    authSession?.username === "develzy";

  const isSekretariat =
    authSession?.role === "sek.pondok" ||
    authSession?.role === "sek.madrasah" ||
    isDeveloperUser;

  // Enforce Maintenance Mode:
  // DEVELOPER ROUTES (/developer) & DEVELOPER ACCOUNTS (develzy) ARE 100% EXEMPT FROM MAINTENANCE MODE!
  if (isMaintenanceMode && !isSekretariat && !isDeveloperRoute && pathname !== "/") {
    return <MaintenanceScreen />;
  }

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading: isLoadingSettings, refetchSettings: refetch }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}
