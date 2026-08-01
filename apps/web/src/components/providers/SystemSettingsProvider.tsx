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
    staleTime: 5 * 1000, // 5 seconds cache for fast reactivity
    refetchInterval: 15 * 1000, // Background poll every 15s
  });

  // 2. Use canonical User Session to check if Admin or Developer or Sekretariat
  const { data: authSession } = useAuth();

  const settings = settingsData || {};
  
  // Calculate Maintenance Mode accurately
  const isServerMaintenanceOn = settings.systemMaintenance === "true" || settings.systemMaintenance === true;
  const isLocalMaintenanceOff = typeof window !== "undefined" && (
    localStorage.getItem("systemMaintenance") === "false" || 
    localStorage.getItem("dev_maintenance") === "false"
  );
  
  // Maintenance mode is ON only if server says true AND local override hasn't disabled it
  const isMaintenanceMode = isServerMaintenanceOn && !isLocalMaintenanceOff;
  
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  
  const isDeveloperRoute = pathname.startsWith("/developer");
  const userRole = (authSession?.role || "").toLowerCase();
  
  const isDeveloperUser =
    userRole === "developer" ||
    userRole === "develzy" ||
    userRole === "superadmin" ||
    authSession?.username === "develzy";

  const isSekretariat =
    userRole.includes("sek") ||
    userRole.includes("admin") ||
    userRole === "mustahiq" ||
    userRole === "pengurus" ||
    isDeveloperUser;

  // Enforce Maintenance Mode:
  // DEVELOPER ROUTES (/developer), DEVELOPER USERS, AND ALL SEKRETARIAT/ADMIN ROLES ARE EXEMPT FROM MAINTENANCE MODE!
  if (isMaintenanceMode && !isSekretariat && !isDeveloperRoute && pathname !== "/") {
    return <MaintenanceScreen />;
  }

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading: isLoadingSettings, refetchSettings: refetch }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}
