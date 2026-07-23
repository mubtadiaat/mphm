"use client";

import { useState, useEffect } from "react";
import { RoleTypes } from "../config/navigation.config";
export type { RoleTypes };

export interface MenuCapabilities {
  view: boolean;
  input: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

export interface RoleUIConfig {
  role: RoleTypes;
  navigationStyle: "sidebar" | "bottom_nav";
  gridLayout: "1-1" | "2-2" | "3-3";
  accentColor: "blue" | "emerald" | "rose" | "violet" | "orange";
  welcomeBanner: string;
  enabledMenus: string[]; // List of enabled menu hrefs/slugs
  capabilities: Record<string, MenuCapabilities>; // Key: menu href
}

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

// Default configs for all official roles
export const DEFAULT_ROLE_CONFIGS: Record<RoleTypes, RoleUIConfig> = {
  "sek.pondok": {
    role: "sek.pondok",
    navigationStyle: "sidebar",
    gridLayout: "2-2",
    accentColor: "emerald",
    welcomeBanner: "Selamat datang di Portal Sekretariat Pondok Pesantren [P3HM]",
    enabledMenus: [
      "/sekretariat",
      "/sekretariat/santri",
      "/sekretariat/wali-santri",
      "/sekretariat/rooms",
      "/sekretariat/pengurus",
      "/sekretariat/alumni",
      "/sekretariat/perizinan",
      "/sekretariat/pelanggaran",
      "/sekretariat/users",
      "/sekretariat/audit-log",
      "/sekretariat/recycle-bin",
      "/sekretariat/settings"
    ],
    capabilities: {}
  },
  "sek.madrasah": {
    role: "sek.madrasah",
    navigationStyle: "sidebar",
    gridLayout: "2-2",
    accentColor: "blue",
    welcomeBanner: "Selamat datang di Portal Sekretariat Madrasah Diniyyah [MPHM]",
    enabledMenus: [
      "/sekretariat",
      "/sekretariat/santri",
      "/sekretariat/kelas",
      "/sekretariat/pengurus-madrasah",
      "/sekretariat/mundzir",
      "/sekretariat/mufattisy",
      "/sekretariat/mustahiq",
      "/sekretariat/kurikulum",
      "/sekretariat/penilaian",
      "/sekretariat/kenaikan-kelas",
      "/sekretariat/sertifikat",
      "/sekretariat/raport",
      "/sekretariat/ijazah",
      "/sekretariat/users",
      "/sekretariat/audit-log",
      "/sekretariat/recycle-bin",
      "/sekretariat/settings"
    ],
    capabilities: {}
  },
  mufattisy: {
    role: "mufattisy",
    navigationStyle: "bottom_nav",
    gridLayout: "2-2",
    accentColor: "blue",
    welcomeBanner: "Selamat datang di Portal Pengawasan Mufattisy",
    enabledMenus: [
      "/mufattisy",
      "/mufattisy/santri",
      "/mufattisy/akademik",
      "/mufattisy/kedisiplinan",
      "/mufattisy/kenaikan-kelas",
      "/mufattisy/perizinan"
    ],
    capabilities: {}
  },
  mundzir: {
    role: "mundzir",
    navigationStyle: "bottom_nav",
    gridLayout: "2-2",
    accentColor: "emerald",
    welcomeBanner: "Selamat datang di Portal Pimpinan/Mundzir",
    enabledMenus: [
      "/pimpinan",
      "/pimpinan/santri",
      "/pimpinan/kehadiran",
      "/pimpinan/kedisiplinan",
      "/pimpinan/perizinan"
    ],
    capabilities: {}
  },
  mustahiq: {
    role: "mustahiq",
    navigationStyle: "bottom_nav",
    gridLayout: "2-2",
    accentColor: "emerald",
    welcomeBanner: "Selamat datang di Portal Pengajaran Mustahiq",
    enabledMenus: [
      "/mustahiq",
      "/mustahiq/kelas",
      "/mustahiq/penilaian",
      "/mustahiq/absensi",
      "/mustahiq/akhlaq",
      "/mustahiq/kenaikan-kelas"
    ],
    capabilities: {}
  },
  keamanan: {
    role: "keamanan",
    navigationStyle: "bottom_nav",
    gridLayout: "1-1",
    accentColor: "rose",
    welcomeBanner: "Selamat datang di Portal Ketertiban Keamanan",
    enabledMenus: [
      "/keamanan",
      "/keamanan/jurnal",
      "/keamanan/santri"
    ],
    capabilities: {}
  },
  wali_santri: {
    role: "wali_santri",
    navigationStyle: "bottom_nav",
    gridLayout: "1-1",
    accentColor: "blue",
    welcomeBanner: "Selamat datang di Portal Wali Santri",
    enabledMenus: [
      "/guardian",
      "/guardian/children",
      "/guardian/akademik",
      "/guardian/kedisiplinan",
      "/guardian/kehadiran"
    ],
    capabilities: {}
  }
};

// Initial capability defaults for all menus
export const DEFAULT_CAPABILITIES: MenuCapabilities = {
  view: true,
  input: true,
  edit: true,
  delete: true,
  export: true,
  import: true
};

export function useRoleUIConfig(role: RoleTypes) {
  const [config, setConfig] = useState<RoleUIConfig>(DEFAULT_ROLE_CONFIGS[role]);

  useEffect(() => {
    const loadConfig = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("system_role_ui_configs");
        if (saved) {
          try {
            const allConfigs: Record<RoleTypes, RoleUIConfig> = JSON.parse(saved);
            if (allConfigs[role]) {
              // Merge capabilities with default keys to avoid undefined structure
              const roleConfig = allConfigs[role];
              const capabilities = { ...roleConfig.capabilities };
              
              setConfig({
                ...roleConfig,
                capabilities
              });
              return;
            }
          } catch (e) {
            console.error("Failed to parse role configs registry", e);
          }
        }
        // Fallback to default config
        setConfig(DEFAULT_ROLE_CONFIGS[role]);
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
   */
  const canDoAction = (menuHref: string, action: keyof MenuCapabilities): boolean => {
    // Sekretariat roles have full admin access to everything
    if (role === "sek.pondok" || role === "sek.madrasah") return true;

    // Normalizing paths (strip trailing slashes, keep root clear)
    const normalizedPath = menuHref.replace(/\/$/, "");

    // Check menu level permissions
    const caps = config.capabilities[normalizedPath] || DEFAULT_CAPABILITIES;
    return !!caps[action];
  };

  return {
    config,
    accentColorClasses: ACCENT_COLOR_MAP[config.accentColor] || ACCENT_COLOR_MAP.blue,
    canDoAction
  };
}
