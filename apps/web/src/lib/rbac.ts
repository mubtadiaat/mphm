/**
 * Centralized Role-Based Access Control (RBAC) & Workspace Security Module
 * Sistem Informasi Pesantren (P3HM) & Sistem Informasi Akademik (MPHM)
 */

export type RoleTypes =
  | "sek.pondok"
  | "sek.madrasah"
  | "mufattisy"
  | "mundzir"
  | "mustahiq"
  | "keamanan"
  | "wali_santri";

export type WorkspaceType = "pondok" | "madrasah";

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
  enabledMenus: string[];
  capabilities: Record<string, MenuCapabilities>;
}

export interface OnboardingStatus {
  hasMundzir: boolean;
  hasMufattisy: boolean;
  hasMustahiq: boolean;
  hasMusyrifah: boolean;
  hasClasses: boolean;
  hasSubjects: boolean;
  hasSantri: boolean;
  hasRooms: boolean;
  hasViolationTypes: boolean;
}

export interface ReadinessStep {
  label: string;
  ready: boolean;
  href: string;
}

export const DEFAULT_CAPABILITIES: MenuCapabilities = {
  view: true,
  input: true,
  edit: true,
  delete: true,
  export: true,
  import: true,
};

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
      "/sekretariat/settings",
    ],
    capabilities: {},
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
      "/sekretariat/dewan-pleno",
      "/sekretariat/kurikulum",
      "/sekretariat/penilaian",
      "/sekretariat/kenaikan-kelas",
      "/sekretariat/sertifikat",
      "/sekretariat/raport",
      "/sekretariat/ijazah",
      "/sekretariat/template-dokumen",
      "/sekretariat/users",
      "/sekretariat/audit-log",
      "/sekretariat/recycle-bin",
      "/sekretariat/settings",
    ],
    capabilities: {},
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
      "/mufattisy/perizinan",
    ],
    capabilities: {},
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
      "/pimpinan/perizinan",
    ],
    capabilities: {},
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
      "/mustahiq/kenaikan-kelas",
    ],
    capabilities: {},
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
      "/keamanan/santri",
      "/keamanan/perizinan",
    ],
    capabilities: {},
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
      "/guardian/kehadiran",
    ],
    capabilities: {},
  },
};

/**
 * Check if a route/menu is locked due to unfulfilled onboarding data dependencies
 */
export function isMenuLocked(
  href: string,
  role: RoleTypes,
  workspace: WorkspaceType,
  status: OnboardingStatus
): boolean {
  const isSekretariatRole = role === "sek.pondok" || role === "sek.madrasah";
  if (!isSekretariatRole) return false;

  const isPondok = role === "sek.pondok" || workspace === "pondok";

  if (isPondok) {
    if (href === "/sekretariat/rooms" && !status.hasMusyrifah) return true;
    if (href === "/sekretariat/pelanggaran" && !status.hasRooms) return true;
    if (href === "/sekretariat/santri" && (!status.hasRooms || !status.hasViolationTypes)) return true;
    if ((href === "/sekretariat/perizinan" || href === "/sekretariat/khidmah") && !status.hasSantri) return true;
  } else {
    if (href === "/sekretariat/mufattisy" && !status.hasMundzir) return true;
    if (href === "/sekretariat/mustahiq" && (!status.hasMundzir || !status.hasMufattisy)) return true;
    if (href === "/sekretariat/kelas" && !status.hasMustahiq) return true;
    if (href === "/sekretariat/kurikulum" && !status.hasClasses) return true;
    if (href === "/sekretariat/santri" && !status.hasSubjects) return true;
    if ((href === "/sekretariat/penilaian" || href === "/sekretariat/raport") && !status.hasSantri) return true;
  }
  return false;
}

/**
 * Get human-readable warning message when a user clicks a locked menu
 */
export function getPrerequisiteWarning(
  href: string,
  role: RoleTypes,
  workspace: WorkspaceType,
  status: OnboardingStatus
): string | null {
  const isPondok = role === "sek.pondok" || workspace === "pondok";

  if (isPondok) {
    if (href === "/sekretariat/rooms" && !status.hasMusyrifah) {
      return "Harap daftarkan Data Musyrifah (Pembina Kamar) terlebih dahulu!";
    }
    if (href === "/sekretariat/pelanggaran" && !status.hasRooms) {
      return "Harap buat Data Kamar Asrama terlebih dahulu!";
    }
    if (href === "/sekretariat/santri" && (!status.hasRooms || !status.hasViolationTypes)) {
      return "Harap buat Data Kamar & Master Pelanggaran terlebih dahulu!";
    }
    if ((href === "/sekretariat/perizinan" || href === "/sekretariat/khidmah") && !status.hasSantri) {
      return "Harap daftarkan Santriwati Asrama terlebih dahulu!";
    }
  } else {
    if (href === "/sekretariat/mufattisy" && !status.hasMundzir) {
      return "Harap daftarkan Data Mundzir (Pimpinan) terlebih dahulu!";
    }
    if (href === "/sekretariat/mustahiq" && (!status.hasMundzir || !status.hasMufattisy)) {
      return "Harap daftarkan Data Mufattisy (Pengawas) terlebih dahulu!";
    }
    if (href === "/sekretariat/kelas" && !status.hasMustahiq) {
      return "Harap daftarkan Data Mustahiq (Wali Kelas) terlebih dahulu!";
    }
    if (href === "/sekretariat/kurikulum" && !status.hasClasses) {
      return "Harap buat Rombel Kelas Diniyyah terlebih dahulu!";
    }
    if (href === "/sekretariat/santri" && !status.hasSubjects) {
      return "Harap isi Mata Pelajaran Diniyyah terlebih dahulu!";
    }
    if ((href === "/sekretariat/penilaian" || href === "/sekretariat/raport") && !status.hasSantri) {
      return "Harap daftarkan / tarik data Siswi Diniyyah terlebih dahulu!";
    }
  }
  return null;
}

/**
 * Get workspace readiness wizard steps tailored per institution
 */
export function getWorkspaceReadinessSteps(
  workspace: WorkspaceType,
  status: OnboardingStatus
): ReadinessStep[] {
  if (workspace === "pondok") {
    return [
      { label: "Tahun Ajaran Aktif", ready: true, href: "/sekretariat/settings" },
      { label: "Data Musyrifah (Pembina)", ready: status.hasMusyrifah, href: "/sekretariat/pengurus" },
      { label: "Data Asrama (Blok & Kamar)", ready: status.hasRooms, href: "/sekretariat/rooms" },
      { label: "Master Pelanggaran", ready: status.hasViolationTypes, href: "/sekretariat/pelanggaran" },
      { label: "Data Induk Santriwati", ready: status.hasSantri, href: "/sekretariat/santri" },
    ];
  } else {
    return [
      { label: "Tahun Ajaran Aktif", ready: true, href: "/sekretariat/settings" },
      { label: "Data Mundzir (Pimpinan)", ready: status.hasMundzir, href: "/sekretariat/mundzir" },
      { label: "Data Mufattisy (Pengawas)", ready: status.hasMufattisy, href: "/sekretariat/mufattisy" },
      { label: "Data Mustahiq (Wali Kelas)", ready: status.hasMustahiq, href: "/sekretariat/mustahiq" },
      { label: "Rombel Kelas Diniyyah", ready: status.hasClasses, href: "/sekretariat/kelas" },
      { label: "Kurikulum & Mapel", ready: status.hasSubjects, href: "/sekretariat/kurikulum" },
      { label: "Data Siswi Diniyyah", ready: status.hasSantri, href: "/sekretariat/santri" },
    ];
  }
}

/**
 * Check if a route is enabled for a given role/workspace
 */
export function isRouteAllowedForRole(
  href: string,
  role: RoleTypes,
  workspace: WorkspaceType
): boolean {
  const isPondok = role === "sek.pondok" || workspace === "pondok";

  // Restricted routes per workspace
  if (isPondok) {
    const madrasahOnlyRoutes = [
      "/sekretariat/mundzir",
      "/sekretariat/mufattisy",
      "/sekretariat/mustahiq",
      "/sekretariat/kelas",
      "/sekretariat/kurikulum",
      "/sekretariat/penilaian",
      "/sekretariat/kenaikan-kelas",
      "/sekretariat/raport",
      "/sekretariat/ijazah",
      "/sekretariat/sertifikat",
      "/sekretariat/pengurus-madrasah",
      "/sekretariat/dewan-pleno",
    ];
    if (madrasahOnlyRoutes.includes(href)) return false;
  } else {
    const pondokOnlyRoutes = [
      "/sekretariat/rooms",
      "/sekretariat/wali-santri",
      "/sekretariat/alumni",
      "/sekretariat/perizinan",
    ];
    if (pondokOnlyRoutes.includes(href)) return false;
  }
  return true;
}

/**
 * Check capability for specific actions (view, input, edit, delete, export, import)
 */
export function canDoRoleAction(
  role: RoleTypes,
  menuHref: string,
  action: keyof MenuCapabilities,
  customCapabilities?: Record<string, MenuCapabilities>
): boolean {
  if (role === "sek.pondok" || role === "sek.madrasah") return true;
  const normalizedPath = menuHref.replace(/\/$/, "");
  const activeCaps = customCapabilities?.[normalizedPath] || DEFAULT_CAPABILITIES;
  return !!activeCaps[action];
}
