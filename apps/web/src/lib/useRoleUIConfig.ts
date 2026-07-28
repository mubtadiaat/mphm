"use client";

import { useState, useEffect } from "react";
import {
  RoleTypes,
  MenuCapabilities,
  RoleUIConfig,
  DEFAULT_CAPABILITIES,
  DEFAULT_ROLE_CONFIGS,
  canDoRoleAction,
} from "./rbac";

export type { RoleTypes, MenuCapabilities, RoleUIConfig };

// Accent tailwind class mappings
export const ACCENT_COLOR_MAP = {
  blue: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    ring: "focus:ring-blue-500/20",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
  },
  emerald: {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    ring: "focus:ring-emerald-500/20",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
  },
  rose: {
    primary: "bg-rose-600 hover:bg-rose-700 text-white",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    ring: "focus:ring-rose-500/20",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
  },
  violet: {
    primary: "bg-violet-600 hover:bg-violet-700 text-white",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    ring: "focus:ring-violet-500/20",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"
  },
  orange: {
    primary: "bg-orange-600 hover:bg-orange-700 text-white",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    ring: "focus:ring-orange-500/20",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
  }
};

export { DEFAULT_ROLE_CONFIGS, DEFAULT_CAPABILITIES };

export function useRoleUIConfig(role: RoleTypes) {
  const defaultConfig = DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
  const [config, setConfig] = useState<RoleUIConfig>(defaultConfig);

  useEffect(() => {
    const loadConfig = () => {
      const fallback = DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("system_role_ui_configs");
        if (saved) {
          try {
            const allConfigs: Record<RoleTypes, RoleUIConfig> = JSON.parse(saved);
            const roleConfig = allConfigs?.[role];
            if (roleConfig) {
              const capabilities = { ...(roleConfig.capabilities || {}) };
              setConfig({
                ...fallback,
                ...roleConfig,
                welcomeBanner: roleConfig.welcomeBanner || fallback.welcomeBanner || "",
                navigationStyle: roleConfig.navigationStyle || fallback.navigationStyle || "sidebar",
                accentColor: roleConfig.accentColor || fallback.accentColor || "blue",
                enabledMenus: roleConfig.enabledMenus || fallback.enabledMenus || [],
                capabilities
              });
              return;
            }
          } catch (e) {
            console.error("Failed to parse role configs registry", e);
          }
        }
        setConfig(fallback);
      }
    };

    loadConfig();

    if (typeof window !== "undefined") {
      window.addEventListener("role_configs_changed", loadConfig);
      return () => {
        window.removeEventListener("role_configs_changed", loadConfig);
      };
    }
  }, [role]);

  /**
   * Helper to check if a specific action is permitted for the given path
   * Delegates to centralized canDoRoleAction from rbac.ts
   */
  const canDoAction = (menuHref: string, action: keyof MenuCapabilities): boolean => {
    return canDoRoleAction(role, menuHref, action, config?.capabilities);
  };

  const safeConfig = config || DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];

  return {
    config: safeConfig,
    accentColorClasses: ACCENT_COLOR_MAP[safeConfig.accentColor] || ACCENT_COLOR_MAP.blue,
    canDoAction
  };
}
