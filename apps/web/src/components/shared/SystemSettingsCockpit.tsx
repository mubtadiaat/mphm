"use client";

import { useState, useEffect } from "react";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ToastContext";
import { motion } from "framer-motion";
import { Users, Lock, Settings, CheckCircle2, Database, Sliders, MapPin, Calculator, Briefcase, Plus, X, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { PillBadge } from "@/components/shared/PillBadge";
import { apiRequest } from "@/lib/api";
import { MasterPelanggaranTab } from "@/features/sekretariat/components/MasterPelanggaranTab";
import { 
  DEFAULT_ROLE_CONFIGS, 
  RoleTypes, 
  RoleUIConfig, 
  DEFAULT_CAPABILITIES,
  MenuCapabilities
} from "@/lib/useRoleUIConfig";
import { MathFormulaBuilder } from "./MathFormulaBuilder";
import { StructuralJabatan, DEFAULT_STRUCTURAL_JABATAN } from "@/config/jobPositions.config";
import { CustomRoleMatrixManager } from "./CustomRoleMatrixManager";


const ROLE_DEFAULT_MENUS_MAP: Record<RoleTypes, Array<{ label: string; href: string }>> = {
  "sek.pondok": [
    { label: "Dashboard Pondok", href: "/sekretariat" },
    { label: "Data Santriwati", href: "/sekretariat/santri" },
    { label: "Wali Santri", href: "/sekretariat/wali-santri" },
    { label: "Data Asrama", href: "/sekretariat/rooms" },
    { label: "Data Pengurus", href: "/sekretariat/pengurus" },
    { label: "Alumni Pondok", href: "/sekretariat/alumni" },
    { label: "Perizinan", href: "/sekretariat/perizinan" },
    { label: "Pelanggaran", href: "/sekretariat/pelanggaran" },
    { label: "Manajemen Akun", href: "/sekretariat/users" },
    { label: "Audit Log", href: "/sekretariat/audit-log" }
  ],
  "sek.madrasah": [
    { label: "Dashboard Madrasah", href: "/sekretariat" },
    { label: "Data Siswi", href: "/sekretariat/santri" },
    { label: "Data Pengurus", href: "/sekretariat/pengurus" },
    { label: "Mustahiq (Wali Kelas)", href: "/sekretariat/mustahiq" },
    { label: "Munawwib (Guru Mapel)", href: "/sekretariat/munawwib" },
    { label: "Kelas & Rombel", href: "/sekretariat/kelas" },
    { label: "Kurikulum", href: "/sekretariat/kurikulum" },
    { label: "Penilaian", href: "/sekretariat/penilaian" },
    { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas" },
    { label: "Dokumen & Raport", href: "/sekretariat/raport" },
    { label: "Audit Log", href: "/sekretariat/audit-log" }
  ],
  mustahiq: [
    { label: "Dashboard", href: "/mustahiq" },
    { label: "Kelas & Santri", href: "/mustahiq/kelas" },
    { label: "Penilaian Kwartal", href: "/mustahiq/penilaian" },
    { label: "Rekap Absensi", href: "/mustahiq/absensi" },
    { label: "Catatan Akhlaq", href: "/mustahiq/akhlaq" },
    { label: "Rekomendasi Kenaikan", href: "/mustahiq/kenaikan-kelas" }
  ],
  wali_santri: [
    { label: "Dashboard", href: "/guardian" },
    { label: "Anak Saya", href: "/guardian/children" },
    { label: "Akademik", href: "/guardian/akademik" },
    { label: "Kedisiplinan", href: "/guardian/kedisiplinan" },
    { label: "Kehadiran", href: "/guardian/kehadiran" }
  ]
};

function FriendlyGuideCard({ title, description, steps }: { title: string; description: string; steps?: string[] }) {
  return (
    <div className="p-5 bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/20 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent border border-blue-200/60 dark:border-blue-800/40 rounded-2xl space-y-2 shadow-xs mb-6">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-sm">
        <span className="text-base">💡</span>
        <span>Petunjuk Penggunaan: {title}</span>
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
        {description}
      </p>
      {steps && steps.length > 0 && (
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1 list-disc list-inside">
          {steps.map((s, i) => (
            <li key={i} className="leading-snug">{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FriendlySwitch({ 
  label, 
  description, 
  value, 
  onChange, 
  activeBadge = "AKTIF", 
  inactiveBadge = "NON-AKTIF" 
}: { 
  label: string; 
  description?: string; 
  value: boolean; 
  onChange: (val: boolean) => void;
  activeBadge?: string;
  inactiveBadge?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="space-y-0.5 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">{label}</span>
          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
            value 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
              : "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20"
          }`}>
            {value ? activeBadge : inactiveBadge}
          </span>
        </div>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          value ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          value ? "translate-x-5" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}

export function SystemSettingsCockpit() {
  const { settings, refetchSettings } = useSystemSettings();
  const { toast } = useToast();
  
  const updateSettingsMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    mutationFn: async (payload: Record<string, any>) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      refetchSettings();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      toast("Pengaturan sistem berhasil diperbarui di server.", "success", "Berhasil");
    },
    onError: () => {
      toast("Gagal menyimpan pengaturan ke server. Silakan coba lagi.", "error", "Gagal");
    }
  });

  // Cockpit Settings States
  const [settingsTab, setSettingsTab] = useState("visibility");
  const [showMustahiqScores, setShowMustahiqScores] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showMustahiqScores");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [showMustahiqAttendance, setShowMustahiqAttendance] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showMustahiqAttendance");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [showGuardianScores, setShowGuardianScores] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showGuardianScores");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [showGuardianDiscipline, setShowGuardianDiscipline] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showGuardianDiscipline");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [showKeamananLookup, setShowKeamananLookup] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showKeamananLookup");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [allowMustahiqAkhlaqOverride, setAllowMustahiqAkhlaqOverride] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allowMustahiqAkhlaqOverride");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [allowGuardianPermits, setAllowGuardianPermits] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allowGuardianPermits");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [allowMufattisyApproval, setAllowMufattisyApproval] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allowMufattisyApproval");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [allowKeamananEscalation, setAllowKeamananEscalation] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allowKeamananEscalation");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [systemMaintenance, setSystemMaintenance] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("systemMaintenance");
      return saved !== null ? saved === "true" : false;
    }
    return false;
  });
  const [enforceHttps, setEnforceHttps] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("enforceHttps");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [ssoActive, setSsoActive] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ssoActive");
      return saved !== null ? saved === "true" : false;
    }
    return false;
  });
  const [cookieLifetime, setCookieLifetime] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cookieLifetime");
      return saved !== null ? Number(saved) : 30;
    }
    return 30;
  });
  const [regionApiSource, setRegionApiSource] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("region_api_source");
      return saved || "cahyadsn";
    }
    return "cahyadsn";
  });
  const [binderbyteApiKey, setBinderbyteApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("binderbyte_api_key");
      return saved || "8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d";
    }
    return "8e49f28e0f2f2cf56393c352613eec358e85fb7077ce6f7f453ebb826a7b1f6d";
  });
  
  const [whatsappContact, setWhatsappContact] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("whatsappContact") || "6281234567890";
    }
    return "6281234567890";
  });
  
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [selectedConfigRole, setSelectedConfigRole] = useState<RoleTypes>("mustahiq");
  const [roleConfigs, setRoleConfigs] = useState<Record<RoleTypes, RoleUIConfig>>(() => {
    const base = JSON.parse(JSON.stringify(DEFAULT_ROLE_CONFIGS)) as Record<RoleTypes, RoleUIConfig>;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system_role_ui_configs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          (Object.keys(base) as RoleTypes[]).forEach((r) => {
            if (parsed[r]) {
              base[r] = {
                ...base[r],
                ...parsed[r],
                welcomeBanner: parsed[r].welcomeBanner || base[r].welcomeBanner || "",
                navigationStyle: parsed[r].navigationStyle || base[r].navigationStyle || "sidebar",
                capabilities: { ...(base[r].capabilities || {}), ...(parsed[r].capabilities || {}) }
              };
            }
          });
        } catch (e) {
          console.error("Failed to load saved role configs, resetting to default", e);
        }
      }
    }
    return base;
  });

  // Structural Job Titles & Positions State (Pondok vs Madrasah)
  const [selectedInstitution, setSelectedInstitution] = useState<"MADRASAH" | "PONDOK">("MADRASAH");
  const [structuralJabatanList, setStructuralJabatanList] = useState<StructuralJabatan[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("structural_job_positions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load structural_job_positions", e);
        }
      }
    }
    return DEFAULT_STRUCTURAL_JABATAN;
  });
  const [newJabatanName, setNewJabatanName] = useState("");
  const [newPosisiInputs, setNewPosisiInputs] = useState<Record<string, string>>({});

  const handleAddJabatan = () => {
    if (!newJabatanName.trim()) return;
    const nameClean = newJabatanName.trim();
    const newId = `${selectedInstitution.toLowerCase()}-${Date.now()}`;
    const newItem: StructuralJabatan = {
      id: newId,
      institution: selectedInstitution,
      jabatan: nameClean,
      posisiList: [],
    };
    const nextList = [...structuralJabatanList, newItem];
    setStructuralJabatanList(nextList);
    setNewJabatanName("");
  };

  const handleRemoveJabatan = (id: string) => {
    setStructuralJabatanList((prev) => prev.filter((j) => j.id !== id));
  };

  const handleAddPosisi = (jabatanId: string) => {
    const val = (newPosisiInputs[jabatanId] || "").trim();
    if (!val) return;
    setStructuralJabatanList((prev) =>
      prev.map((j) => {
        if (j.id === jabatanId) {
          if (j.posisiList.includes(val)) return j;
          return { ...j, posisiList: [...j.posisiList, val] };
        }
        return j;
      })
    );
    setNewPosisiInputs((prev) => ({ ...prev, [jabatanId]: "" }));
  };

  const handleRemovePosisi = (jabatanId: string, posisiName: string) => {
    setStructuralJabatanList((prev) =>
      prev.map((j) => {
        if (j.id === jabatanId) {
          return { ...j, posisiList: j.posisiList.filter((p) => p !== posisiName) };
        }
        return j;
      })
    );
  };

  // Helper: parse boolean from DB
  const parseBool = (v: unknown) => v === "true" || v === true;

  // Sync DB settings to local state on mount
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      queueMicrotask(() => {
        if (settings.showMustahiqScores !== undefined) setShowMustahiqScores(parseBool(settings.showMustahiqScores));
        if (settings.showMustahiqAttendance !== undefined) setShowMustahiqAttendance(parseBool(settings.showMustahiqAttendance));
        if (settings.showGuardianScores !== undefined) setShowGuardianScores(parseBool(settings.showGuardianScores));
        if (settings.showGuardianDiscipline !== undefined) setShowGuardianDiscipline(parseBool(settings.showGuardianDiscipline));
        if (settings.showKeamananLookup !== undefined) setShowKeamananLookup(parseBool(settings.showKeamananLookup));
        
        if (settings.allowMustahiqAkhlaqOverride !== undefined) setAllowMustahiqAkhlaqOverride(parseBool(settings.allowMustahiqAkhlaqOverride));
        if (settings.allowGuardianPermits !== undefined) setAllowGuardianPermits(parseBool(settings.allowGuardianPermits));
        if (settings.allowMufattisyApproval !== undefined) setAllowMufattisyApproval(parseBool(settings.allowMufattisyApproval));
        if (settings.allowKeamananEscalation !== undefined) setAllowKeamananEscalation(parseBool(settings.allowKeamananEscalation));
        
        if (settings.systemMaintenance !== undefined) setSystemMaintenance(parseBool(settings.systemMaintenance));
        if (settings.enforceHttps !== undefined) setEnforceHttps(parseBool(settings.enforceHttps));
        if (settings.ssoActive !== undefined) setSsoActive(parseBool(settings.ssoActive));
        
        if (settings.cookieLifetime !== undefined) setCookieLifetime(Number(settings.cookieLifetime));
        if (settings.whatsappContact !== undefined) setWhatsappContact(String(settings.whatsappContact));
        if (settings.regionApiSource !== undefined) setRegionApiSource(String(settings.regionApiSource));
        if (settings.binderbyteApiKey !== undefined) setBinderbyteApiKey(String(settings.binderbyteApiKey));
        
        // Complex objects (already deserialized by API)
        if (settings.system_role_ui_configs && typeof settings.system_role_ui_configs === "object") {
          setRoleConfigs(settings.system_role_ui_configs);
          localStorage.setItem("system_role_ui_configs", JSON.stringify(settings.system_role_ui_configs));
        }
        if (Array.isArray(settings.structural_job_positions)) {
          setStructuralJabatanList(settings.structural_job_positions);
          localStorage.setItem("structural_job_positions", JSON.stringify(settings.structural_job_positions));
          window.dispatchEvent(new Event("structural_job_positions_changed"));
        }

        // Custom tables from DB → sync to localStorage
        if (Array.isArray(settings.custom_tables_registry)) {
          setCustomTablesList(settings.custom_tables_registry);
          localStorage.setItem("custom_tables_registry", JSON.stringify(settings.custom_tables_registry));
          window.dispatchEvent(new Event("custom_tables_changed"));
        }

        // Column visibility from DB → sync to localStorage
        if (settings.col_vis_santri && typeof settings.col_vis_santri === "object") {
          setSantriCols(settings.col_vis_santri);
          localStorage.setItem("col_vis_santri", JSON.stringify(settings.col_vis_santri));
        }
        if (settings.col_vis_kelas && typeof settings.col_vis_kelas === "object") {
          setKelasCols(settings.col_vis_kelas);
          localStorage.setItem("col_vis_kelas", JSON.stringify(settings.col_vis_kelas));
        }
        if (settings.col_vis_kurikulum && typeof settings.col_vis_kurikulum === "object") {
          setKurikulumCols(settings.col_vis_kurikulum);
          localStorage.setItem("col_vis_kurikulum", JSON.stringify(settings.col_vis_kurikulum));
        }
        if (settings.col_vis_pelanggaran && typeof settings.col_vis_pelanggaran === "object") {
          setPelanggaranCols(settings.col_vis_pelanggaran);
          localStorage.setItem("col_vis_pelanggaran", JSON.stringify(settings.col_vis_pelanggaran));
        }
        if (settings.col_vis_tahun_ajaran && typeof settings.col_vis_tahun_ajaran === "object") {
          setTahunAjaranCols(settings.col_vis_tahun_ajaran);
          localStorage.setItem("col_vis_tahun_ajaran", JSON.stringify(settings.col_vis_tahun_ajaran));
        }
        if (settings.col_vis_audit_log && typeof settings.col_vis_audit_log === "object") {
          setAuditLogCols(settings.col_vis_audit_log);
          localStorage.setItem("col_vis_audit_log", JSON.stringify(settings.col_vis_audit_log));
        }

        // Sync localStorage for simple values
        localStorage.setItem("showMustahiqScores", String(settings.showMustahiqScores ?? showMustahiqScores));
        localStorage.setItem("showMustahiqAttendance", String(settings.showMustahiqAttendance ?? showMustahiqAttendance));
        localStorage.setItem("showGuardianScores", String(settings.showGuardianScores ?? showGuardianScores));
        localStorage.setItem("showGuardianDiscipline", String(settings.showGuardianDiscipline ?? showGuardianDiscipline));
        localStorage.setItem("showKeamananLookup", String(settings.showKeamananLookup ?? showKeamananLookup));
        localStorage.setItem("systemMaintenance", String(settings.systemMaintenance ?? systemMaintenance));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);




  // Local storage column visibility states
  const [santriCols, setSantriCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_santri");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [kelasCols, setKelasCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_kelas");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [kurikulumCols, setKurikulumCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_kurikulum");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [pelanggaranCols, setPelanggaranCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_pelanggaran");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [tahunAjaranCols, setTahunAjaranCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_tahun_ajaran");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [auditLogCols, setAuditLogCols] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("col_vis_audit_log");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const handleToggleCol = (tableName: string, colKey: string, isCurrentlyChecked: boolean) => {
    const updater = (prev: Record<string, boolean>) => {
      const next = { ...prev, [colKey]: !isCurrentlyChecked };
      localStorage.setItem(`col_vis_${tableName}`, JSON.stringify(next));
      return next;
    };
    if (tableName === "santri") setSantriCols(updater);
    else if (tableName === "kelas") setKelasCols(updater);
    else if (tableName === "kurikulum") setKurikulumCols(updater);
    else if (tableName === "pelanggaran") setPelanggaranCols(updater);
    else if (tableName === "tahun_ajaran") setTahunAjaranCols(updater);
    else if (tableName === "audit_log") setAuditLogCols(updater);
  };

  interface CustomTableRegistryItem {
    key: string;
    name: string;
    fields: Array<{ name: string; label: string; type: "text" | "number" }>;
  }

  // Custom tables builder states
  const [customTablesList, setCustomTablesList] = useState<CustomTableRegistryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_tables_registry");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const getRoleMenus = (role: RoleTypes) => {
    const staticMenus = ROLE_DEFAULT_MENUS_MAP[role] || [];
    const dynamicMenus = customTablesList.map((table) => ({
      label: table.name,
      href: `/${role}/custom-${table.key}`
    }));
    return [...staticMenus, ...dynamicMenus];
  };

  const handleUpdateRoleConfig = <K extends keyof RoleUIConfig>(
    role: RoleTypes,
    key: K,
    value: RoleUIConfig[K]
  ) => {
    setRoleConfigs((prev) => {
      const baseRoleConfig = prev[role] || DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
      return {
        ...prev,
        [role]: {
          ...baseRoleConfig,
          [key]: value
        }
      };
    });
  };

  const handleToggleMenuVisibility = (role: RoleTypes, menuHref: string) => {
    const roleConfig = roleConfigs[role] || DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
    const currentEnabled = roleConfig.enabledMenus || [];
    let nextEnabled = [];
    if (currentEnabled.includes(menuHref)) {
      nextEnabled = currentEnabled.filter((m) => m !== menuHref);
    } else {
      nextEnabled = [...currentEnabled, menuHref];
    }
    handleUpdateRoleConfig(role, "enabledMenus", nextEnabled);
  };

  const handleUpdateMenuCapability = (
    role: RoleTypes,
    menuHref: string,
    action: keyof MenuCapabilities,
    value: boolean
  ) => {
    const roleConfig = roleConfigs[role] || DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
    const currentCaps = roleConfig.capabilities?.[menuHref] || { ...DEFAULT_CAPABILITIES };
    const updatedCap = {
      ...currentCaps,
      [action]: value
    };

    setRoleConfigs((prev) => {
      const baseRoleConfig = prev[role] || DEFAULT_ROLE_CONFIGS[role] || DEFAULT_ROLE_CONFIGS["sek.madrasah"];
      const updatedCaps = {
        ...(baseRoleConfig.capabilities || {}),
        [menuHref]: updatedCap
      };
      return {
        ...prev,
        [role]: {
          ...baseRoleConfig,
          capabilities: updatedCaps
        }
      };
    });
  };
  const [newTableName, setNewTableName] = useState("");
  const [newTableKey, setNewTableKey] = useState("");
  const [newTableFields, setNewTableFields] = useState<Array<{ name: string; label: string; type: "text" | "number" }>>([
    { name: "nama", label: "Nama Item", type: "text" }
  ]);

  const handleAddField = () => {
    setNewTableFields(prev => [...prev, { name: "", label: "", type: "text" }]);
  };

  const handleRemoveField = (index: number) => {
    setNewTableFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: "name" | "label" | "type", val: string) => {
    setNewTableFields(prev => prev.map((f, i) => {
      if (i === index) {
        return { ...f, [key]: val };
      }
      return f;
    }));
  };

  const handleSaveCustomTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName || !newTableKey) return;
    
    // Clean slug key
    const cleanedKey = newTableKey.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    const newTableDef = {
      name: newTableName,
      key: cleanedKey,
      fields: newTableFields.filter(f => f.name && f.label)
    };

    const nextList = [...customTablesList, newTableDef];
    setCustomTablesList(nextList);
    localStorage.setItem("custom_tables_registry", JSON.stringify(nextList));

    // Dispatch reload event for sidebar navigation
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("custom_tables_changed"));
    }

    // Reset Form
    setNewTableName("");
    setNewTableKey("");
    setNewTableFields([{ name: "nama", label: "Nama Item", type: "text" }]);

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleDeleteCustomTable = (key: string) => {
    const nextList = customTablesList.filter(t => t.key !== key);
    setCustomTablesList(nextList);
    localStorage.setItem("custom_tables_registry", JSON.stringify(nextList));

    // Clear dynamic table data too
    localStorage.removeItem(`custom_table_data_${key}`);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("custom_tables_changed"));
    }
  };
  const handleSaveSettings = () => {
    // Build comprehensive payload — ALL settings go to DB
    const payload: Record<string, unknown> = {
      // Tampilan & Modul
      showMustahiqScores,
      showMustahiqAttendance,
      showGuardianScores,
      showGuardianDiscipline,
      showKeamananLookup,
      // Hak Akses & Otorisasi
      allowMustahiqAkhlaqOverride,
      allowGuardianPermits,
      allowMufattisyApproval,
      allowKeamananEscalation,
      // Parameter & Keamanan
      systemMaintenance,
      enforceHttps,
      ssoActive,
      cookieLifetime,
      whatsappContact,
      // Manajemen Peran & UI (complex object)
      system_role_ui_configs: roleConfigs,
      // Integrasi API Wilayah
      regionApiSource,
      binderbyteApiKey,
      // Jabatan Struktural (Hirarki Posisi)
      structural_job_positions: structuralJabatanList,
      // Tabel Kustom (array of objects)
      custom_tables_registry: customTablesList,
      // Konfigurasi Kolom Tabel (objects)
      col_vis_santri: santriCols,
      col_vis_kelas: kelasCols,
      col_vis_kurikulum: kurikulumCols,
      col_vis_pelanggaran: pelanggaranCols,
      col_vis_tahun_ajaran: tahunAjaranCols,
      col_vis_audit_log: auditLogCols,
    };
    
    updateSettingsMutation.mutate(payload);

    // Mirror to localStorage for instant offline access
    if (typeof window !== "undefined") {
      localStorage.setItem("showMustahiqScores", String(showMustahiqScores));
      localStorage.setItem("showMustahiqAttendance", String(showMustahiqAttendance));
      localStorage.setItem("showGuardianScores", String(showGuardianScores));
      localStorage.setItem("showGuardianDiscipline", String(showGuardianDiscipline));
      localStorage.setItem("showKeamananLookup", String(showKeamananLookup));

      localStorage.setItem("allowMustahiqAkhlaqOverride", String(allowMustahiqAkhlaqOverride));
      localStorage.setItem("allowGuardianPermits", String(allowGuardianPermits));
      localStorage.setItem("allowMufattisyApproval", String(allowMufattisyApproval));
      localStorage.setItem("allowKeamananEscalation", String(allowKeamananEscalation));

      localStorage.setItem("systemMaintenance", String(systemMaintenance));
      localStorage.setItem("enforceHttps", String(enforceHttps));
      localStorage.setItem("ssoActive", String(ssoActive));
      localStorage.setItem("cookieLifetime", String(cookieLifetime));
      localStorage.setItem("whatsappContact", whatsappContact);

      localStorage.setItem("system_role_ui_configs", JSON.stringify(roleConfigs));
      localStorage.setItem("region_api_source", regionApiSource);
      localStorage.setItem("binderbyteApiKey", binderbyteApiKey);
      localStorage.setItem("structural_job_positions", JSON.stringify(structuralJabatanList));
      localStorage.setItem("custom_tables_registry", JSON.stringify(customTablesList));
      localStorage.setItem("col_vis_santri", JSON.stringify(santriCols));
      localStorage.setItem("col_vis_kelas", JSON.stringify(kelasCols));
      localStorage.setItem("col_vis_kurikulum", JSON.stringify(kurikulumCols));
      localStorage.setItem("col_vis_pelanggaran", JSON.stringify(pelanggaranCols));
      localStorage.setItem("col_vis_tahun_ajaran", JSON.stringify(tahunAjaranCols));
      localStorage.setItem("col_vis_audit_log", JSON.stringify(auditLogCols));

      window.dispatchEvent(new Event("role_configs_changed"));
      window.dispatchEvent(new Event("region_settings_changed"));
      window.dispatchEvent(new Event("structural_job_positions_changed"));
      window.dispatchEvent(new Event("job_titles_changed"));
      window.dispatchEvent(new Event("custom_tables_changed"));
      localStorage.setItem("col_vis_kelas", JSON.stringify(kelasCols));
      localStorage.setItem("col_vis_kurikulum", JSON.stringify(kurikulumCols));
      localStorage.setItem("col_vis_pelanggaran", JSON.stringify(pelanggaranCols));
      localStorage.setItem("col_vis_tahun_ajaran", JSON.stringify(tahunAjaranCols));
      localStorage.setItem("col_vis_audit_log", JSON.stringify(auditLogCols));

      window.dispatchEvent(new Event("role_configs_changed"));
      window.dispatchEvent(new Event("region_settings_changed"));
      window.dispatchEvent(new Event("job_titles_changed"));
      window.dispatchEvent(new Event("custom_tables_changed"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Pusat Konfigurasi Sistem (V4 Enterprise)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Konfigurasi & Parameter Sistem
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Kelola modul aktif, otorisasi peran, hirarki jabatan struktural, parameter keamanan, dan integrasi API wilayah.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 disabled:opacity-50"
        >
          {updateSettingsMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>Simpan Seluruh Konfigurasi</span>
        </button>
      </div>

      {settingsSaved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-2 text-sm font-semibold shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Konfigurasi sistem berhasil disimpan dan didistribusikan secara realtime.</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Internal Categorized Sidebar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          
          {/* Group 1: Modul & Otorisasi */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              A. MODUL & OTORISASI
            </span>
            <button
              onClick={() => setSettingsTab("visibility")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "visibility"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Tampilan & Modul Aktif</span>
            </button>
            <button
              onClick={() => setSettingsTab("permissions")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "permissions"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Hak Akses & Otorisasi</span>
            </button>
            <button
              onClick={() => setSettingsTab("security")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "security"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Parameter & Keamanan</span>
            </button>
          </div>

          {/* Group 2: Peran & Hirarki */}
          <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
            <span className="px-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              B. PERAN & HIRARKI
            </span>
            <button
              onClick={() => setSettingsTab("roles")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "roles"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Manajemen Peran & UI</span>
            </button>
            <button
              onClick={() => setSettingsTab("job_titles")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "job_titles"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Jabatan Struktural</span>
            </button>
            <button
              onClick={() => setSettingsTab("custom_tables")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "custom_tables"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Tabel Kustom & Menu</span>
            </button>
          </div>

          {/* Group 3: Aturan & Integrasi */}
          <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
            <span className="px-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              C. ATURAN & INTEGRASI
            </span>
            <button
              onClick={() => setSettingsTab("master_pelanggaran")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "master_pelanggaran"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Master Pelanggaran</span>
            </button>
            <button
              onClick={() => setSettingsTab("region_api")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "region_api"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Integrasi API Wilayah</span>
            </button>
            <button
              onClick={() => setSettingsTab("math_formula")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "math_formula"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Calculator className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Parameter Matematis</span>
            </button>
          </div>

          {/* Group 4: Pembersihan Data */}
          <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
            <span className="px-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              D. PEMELIHARAAN DATA
            </span>
            <button
              onClick={() => setSettingsTab("purge_data")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                settingsTab === "purge_data"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Cockpit Purge Data</span>
            </button>
          </div>

        </div>

        {/* Details 2x2 Grid Panel */}
        <div className="flex-1 w-full space-y-6">
          {settingsTab === "visibility" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Tampilan & Modul Aktif"
                description="Halaman ini digunakan untuk mengaktifkan atau menyembunyikan modul fitur bagi peran pengguna lain (Mustahiq, Wali Santri, Keamanan) serta mengatur kolom tabel apa saja yang ingin Anda tampilkan."
                steps={[
                  "Geser tombol ke posisi [AKTIF] untuk membuka modul pada portal pengguna.",
                  "Centang kolom tabel di bawah ini untuk menampilkan informasi penting pada tabel utama.",
                  "Jangan lupa klik tombol 'Simpan Seluruh Konfigurasi' di bagian atas layar setelah selesai!"
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Modul Pengajar (Mustahiq)
                  </h3>
                  <div className="space-y-3">
                    <FriendlySwitch 
                      label="Spreadsheet Penilaian Nilai"
                      description="Mengizinkan Ustadz Mustahiq mengisi & mengedit nilai kwartal santri."
                      value={showMustahiqScores}
                      onChange={setShowMustahiqScores}
                    />
                    <FriendlySwitch 
                      label="Absensi Kehadiran Santri"
                      description="Mengizinkan Mustahiq mencatat kehadiran harian siswi di kelas."
                      value={showMustahiqAttendance}
                      onChange={setShowMustahiqAttendance}
                    />
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Modul Portal Wali Santri
                  </h3>
                  <div className="space-y-3">
                    <FriendlySwitch 
                      label="Transkrip & Rapor Nilai"
                      description="Mengizinkan orang tua/wali melihat transkrip nilai kwartal anak."
                      value={showGuardianScores}
                      onChange={setShowGuardianScores}
                    />
                    <FriendlySwitch 
                      label="Catatan Kedisiplinan & Poin"
                      description="Mengizinkan orang tua melihat rekap takzir & poin kedisiplinan."
                      value={showGuardianDiscipline}
                      onChange={setShowGuardianDiscipline}
                    />
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Modul Pos Keamanan
                  </h3>
                  <div className="space-y-3">
                    <FriendlySwitch 
                      label="Pencarian & Lookup Santri"
                      description="Mengizinkan petugas keamanan mencari biodata & status santriwati di gerbang."
                      value={showKeamananLookup}
                      onChange={setShowKeamananLookup}
                    />
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    Modul Pengawas (Mufattisy)
                  </h3>
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white block">Dashboard Pengawasan Asrama</span>
                      <span className="text-xs text-zinc-500">Modul utama pengawasan ketertiban santriwati.</span>
                    </div>
                    <PillBadge label="WAJIB AKTIF" variant="success" />
                  </div>
                </div>
              </div>

              {/* Konfigurasi Kolom Tabel */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Pilihan Kolom Tabel Utama</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Centang atau hilangkan centang untuk memilih kolom yang akan muncul pada tabel data aplikasi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Table Santri */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Tabel Data Santriwati</span>
                    <div className="space-y-2">
                      {Object.entries({
                        name: "Nama Lengkap",
                        nik: "NIK (16 Digit)",
                        stambuk: "Nomor Stambuk",
                        class: "Kelas Aktif",
                        address: "Alamat Asal",
                        status: "Status Aktif"
                      }).map(([colKey, label]) => {
                        const isChecked = santriCols[colKey] !== false;
                        return (
                          <label key={colKey} className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-blue-600">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCol("santri", colKey, isChecked)}
                              className="rounded border-zinc-350 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Kelas */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Tabel Kelas / Rombel</span>
                    <div className="space-y-2">
                      {Object.entries({
                        name: "Nama Kelas",
                        mustahiq: "Wali Kelas (Mustahiq)",
                        mufattisy: "Pengawas (Mufattisy)",
                        capacity: "Kapasitas Kuota"
                      }).map(([colKey, label]) => {
                        const isChecked = kelasCols[colKey] !== false;
                        return (
                          <label key={colKey} className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-blue-600">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCol("kelas", colKey, isChecked)}
                              className="rounded border-zinc-350 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Kurikulum */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Tabel Mata Pelajaran</span>
                    <div className="space-y-2">
                      {Object.entries({
                        code: "Kode Mapel",
                        name: "Nama Pelajaran",
                        subjectType: "Jenis Pelajaran",
                        isActive: "Status Keaktifan"
                      }).map(([colKey, label]) => {
                        const isChecked = kurikulumCols[colKey] !== false;
                        return (
                          <label key={colKey} className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-blue-600">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCol("kurikulum", colKey, isChecked)}
                              className="rounded border-zinc-350 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "permissions" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Hak Akses & Otorisasi Fitur"
                description="Atur wewenang khusus bagi setiap peran pengurus dan orang tua santri untuk menjamin keamanan operasional."
                steps={[
                  "Pilih fitur yang ingin diizinkan atau dibatasi untuk setiap peran di bawah ini.",
                  "Klik tombol 'Simpan Seluruh Konfigurasi' di bagian atas layar untuk menerapkan perubahan ke seluruh sistem."
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Otoritas Ustadz Mustahiq</h3>
                  <FriendlySwitch 
                    label="Ubah / Override Predikat Akhlaq"
                    description="Memberikan wewenang kepada Mustahiq untuk memperbarui predikat akhlaq santri secara langsung."
                    value={allowMustahiqAkhlaqOverride}
                    onChange={setAllowMustahiqAkhlaqOverride}
                  />
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Otoritas Wali Santri</h3>
                  <FriendlySwitch 
                    label="Pengajuan Surat Izin Safar / Sakit"
                    description="Mengizinkan orang tua/wali santri mengajukan permohonan izin pulang atau sakit melalui portal wali."
                    value={allowGuardianPermits}
                    onChange={setAllowGuardianPermits}
                  />
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Otoritas Ustadz Mufattisy</h3>
                  <FriendlySwitch 
                    label="Persetujuan (Approval) Perizinan"
                    description="Memberikan wewenang kepada Mufattisy untuk menyetujui atau menolak permohonan izin santri."
                    value={allowMufattisyApproval}
                    onChange={setAllowMufattisyApproval}
                  />
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Otoritas Pos Keamanan</h3>
                  <FriendlySwitch 
                    label="Eskalasi Pelanggaran Santri"
                    description="Mengizinkan petugas pos keamanan melaporkan dan mengeskalasi insiden pelanggaran santri ke tingkat pengurus."
                    value={allowKeamananEscalation}
                    onChange={setAllowKeamananEscalation}
                  />
                </div>
              </div>
            </div>
          )}

          {settingsTab === "security" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Parameter & Sesi Keamanan"
                description="Kelola pengaturan dasar keamanan sistem, durasi otomatis keluar (logout), mode pemeliharaan, dan nomor kontak bantuan WhatsApp."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Mode Pemeliharaan (Maintenance)</h3>
                  <FriendlySwitch 
                    label="Mode Pemeliharaan Sistem"
                    description="Aktifkan HANYA jika Anda ingin menutup akses sementara bagi pengurus lain saat perbaikan data."
                    value={systemMaintenance}
                    onChange={setSystemMaintenance}
                    activeBadge="MAINTENANCE"
                    inactiveBadge="NORMAL"
                  />
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Durasi Otomatis Keluar (Session)</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                      Waktu Logout Otomatis Saat Tidak Bergerak
                    </label>
                    <p className="text-xs text-zinc-500">Sistem akan meminta login ulang jika pengguna diam tanpa aktivitas selama waktu ini.</p>
                    <select
                      value={cookieLifetime}
                      onChange={(e) => setCookieLifetime(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value={15}>⏱️ 15 Menit</option>
                      <option value={30}>⏱️ 30 Menit (Sangat Direkomendasikan)</option>
                      <option value={60}>⏱️ 60 Menit (1 Jam)</option>
                      <option value={120}>⏱️ 120 Menit (2 Jam)</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Enkripsi HTTPS</h3>
                  <FriendlySwitch 
                    label="Enforce Koneksi HTTPS Aman"
                    description="Wajibkan enkripsi SSL/HTTPS untuk mencegah penyadapan data pada jaringan publik."
                    value={enforceHttps}
                    onChange={setEnforceHttps}
                  />
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Single Sign-On (SSO)</h3>
                  <FriendlySwitch 
                    label="Fitur Login Terintegrasi SSO"
                    description="Mengizinkan pengurus login menggunakan akun Single Sign-On jaringan pesantren."
                    value={ssoActive}
                    onChange={setSsoActive}
                  />
                </div>

                {/* WhatsApp Contact Input */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 md:col-span-2">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Nomor WhatsApp Layanan Bantuan Sekretariat</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                      Nomor WhatsApp Bantuan (Format Awalan 62...)
                    </label>
                    <p className="text-xs text-zinc-500">Nomor ini akan dihubungi oleh pengurus atau orang tua santri ketika mengklik tombol bantuan pada layar login.</p>
                    <input 
                      type="text"
                      value={whatsappContact}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '' || val.startsWith('62')) {
                          setWhatsappContact(val);
                        } else if (val.startsWith('0')) {
                          setWhatsappContact('62' + val.substring(1));
                        } else {
                          setWhatsappContact('62' + val);
                        }
                      }}
                      placeholder="Contoh: 6281234567890"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "region_api" && (
            <div className="space-y-6 animate-fade-in">
              <FriendlyGuideCard 
                title="Integrasi API Wilayah Indonesia"
                description="Fitur ini berfungsi untuk menyediakan data pilihan otomatis Provinsi, Kabupaten, Kecamatan, dan Kelurahan saat pengisian alamat santriwati."
                steps={[
                  "Pilihan default 'Develzy/Wilayah Indonesia (Resmi Kemendagri By. DEVELZY) ®2025' sangat direkomendasikan karena resmi dan gratis.",
                  "Jika lokasi Anda tidak memiliki koneksi internet, Anda bisa memilih mode 'Database Luring (Offline Fallback)'."
                ]}
              />

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Penyedia Data Wilayah Indonesia</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    Konfigurasikan sumber data wilayah administratif yang digunakan untuk input alamat data induk santriwati.
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sumber Data Wilayah</label>
                    <select
                      value={regionApiSource}
                      onChange={(e) => setRegionApiSource(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200 w-full transition-colors font-bold"
                    >
                      <option value="cahyadsn">Develzy/Wilayah Indonesia (Resmi Kemendagri By. DEVELZY) ®2025</option>
                      <option value="emsifa">Emsifa API (Online - Gratis & Tanpa API Key)</option>
                      <option value="binderbyte">BinderByte API (Online - Memerlukan API Key)</option>
                      <option value="offline">Database Luring (Offline Fallback - Instan & Luring)</option>
                    </select>
                    <span className="text-[11px] text-zinc-500 italic block leading-relaxed">
                      * Develzy/Wilayah Indonesia (Resmi Kemendagri By. DEVELZY) ®2025 direkomendasikan karena bersifat resmi, gratis, dan mengikuti standarisasi kode wilayah Kemendagri terbaru.
                    </span>
                  </div>

                  {regionApiSource === "binderbyte" && (
                    <div className="flex flex-col gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/35 rounded-2xl">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">API Key BinderByte</label>
                        <input 
                          type="text"
                          value={binderbyteApiKey}
                          onChange={(e) => setBinderbyteApiKey(e.target.value)}
                          placeholder="Masukkan API Key BinderByte aktif..."
                          className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200 w-full font-mono transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-semibold">
                        Info: Kunci API default saat ini diambil dari BinderByte (berlaku batas kuota panggilan per hari). Silakan ganti dengan API Key milik Anda sendiri untuk keamanan penuh.
                      </p>
                    </div>
                  )}

                  {regionApiSource === "offline" && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-250 dark:border-zinc-750">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                        Mode Database Luring menggunakan data sampel tersimpan yang tertanam langsung di aplikasi. Mode ini menjamin pemuatan instan 1 ms dan tetap berfungsi penuh saat server atau peramban tidak terhubung ke internet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {settingsTab === "math_formula" && (
            <div className="space-y-6 animate-fade-in">
              <FriendlyGuideCard 
                title="Parameter Matematis & KKM"
                description="Atur pembobotan persentase nilai Kwartal 1, 2, 3, dan 4 serta batas Kriteria Ketuntasan Minimal (KKM) untuk kelulusan dan promosi kenaikan kelas."
              />
              <MathFormulaBuilder />
            </div>
          )}

          {settingsTab === "custom_tables" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Tabel Kustom & Menu Baru"
                description="Fitur ini memungkinkan Anda menambahkan modul tabel atau formulir data baru ke sidebar aplikasi tanpa memerlukan keahlian pemrograman."
                steps={[
                  "Ketik nama modul baru yang ingin ditambahkan (misal: Data Inventaris, Arsip Donasi).",
                  "Tambahkan kolom form input yang dibutuhkan (misal: Nama Donatur, Jumlah Donasi).",
                  "Klik 'Daftarkan Tabel & Menu' untuk memunculkan menu di sidebar secara otomatis!"
                ]}
              />

              {/* Form to create new table */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Buat Tabel Kustom & Menu Baru</h3>
                <p className="text-xs text-zinc-500">Mendaftarkan menu sidebar dinamis lengkap dengan form input dan grid database kustom.</p>
                
                <form onSubmit={handleSaveCustomTable} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Nama Modul / Tabel Baru *</label>
                      <p className="text-xs text-zinc-500 mb-1">Nama yang akan tampil di menu sidebar (misal: Arsip Donasi).</p>
                      <input 
                        type="text" 
                        required
                        value={newTableName} 
                        onChange={(e) => {
                          setNewTableName(e.target.value);
                          setNewTableKey(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, ""));
                        }}
                        placeholder="Misal: Arsip Donasi"
                        className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Slug Key (Bentuk URL)</label>
                      <input 
                        type="text" 
                        required
                        value={newTableKey} 
                        onChange={(e) => setNewTableKey(e.target.value)}
                        placeholder="Misal: donasi"
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Fields Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Konfigurasi Kolom Form Input</span>
                      <button
                        type="button"
                        onClick={handleAddField}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        + Tambah Kolom
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newTableFields.map((field, idx) => (
                        <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                          <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                            <input 
                              type="text"
                              required
                              value={field.label}
                              onChange={(e) => handleFieldChange(idx, "label", e.target.value)}
                              placeholder="Label Kolom (Misal: Donatur)"
                              className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none dark:text-zinc-200"
                            />
                          </div>
                          <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                            <input 
                              type="text"
                              required
                              value={field.name}
                              onChange={(e) => handleFieldChange(idx, "name", e.target.value)}
                              placeholder="Nama Kunci (Misal: donatur)"
                              className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none dark:text-zinc-200"
                            />
                          </div>
                          <div className="w-28 flex flex-col gap-1">
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(idx, "type", e.target.value)}
                              className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none dark:text-zinc-200"
                            >
                              <option value="text">Teks biasa</option>
                              <option value="number">Angka</option>
                            </select>
                          </div>
                          {newTableFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveField(idx)}
                              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-rose-500 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors cursor-pointer"
                    >
                      Daftarkan Tabel & Menu
                    </button>
                  </div>
                </form>
              </div>

              {/* Active dynamic menus list */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Daftar Tabel Kustom Terdaftar</h3>
                {customTablesList.length === 0 ? (
                  <p className="text-sm text-zinc-500">Belum ada tabel kustom dinamis yang dibuat.</p>
                ) : (
                  <div className="divide-y divide-zinc-150 dark:divide-zinc-800">
                    {customTablesList.map((table) => (
                      <div key={table.key} className="py-4 flex justify-between items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white text-sm">{table.name}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono rounded font-semibold">/sekretariat/custom-{table.key}</span>
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] rounded font-semibold">{table.fields.length} Kolom</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomTable(table.key)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Hapus Menu
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {settingsTab === "roles" && (
            <CustomRoleMatrixManager />
          )}
          {settingsTab === "job_titles" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Jabatan Struktural Pengurus (Telah Dipindahkan)"
                description="📌 PENTING: Pengaturan Jabatan & Posisi Pengurus kini dapat dikelola LANGSUNG di dalam Menu Data Pengurus (/sekretariat/pengurus) melalui tombol '+ Kelola Jabatan' di banner atas agar lebih cepat dan praktis."
                steps={[
                  "Anda dapat terus menggunakan formulir di bawah ini untuk pengaturan hirarki dasar.",
                  "Atau klik tombol 'Buka Menu Data Pengurus' untuk mengelola Jabatan langsung di halaman Pengurus."
                ]}
              />
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Akses Cepat: Pengaturan Jabatan Pengurus kini aktif di Menu Data Pengurus.
                </div>
                <a
                  href="/sekretariat/pengurus"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shrink-0"
                >
                  Buka Menu Data Pengurus &rarr;
                </a>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Manajemen Jabatan & Posisi Pengurus</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                      Kelola struktur Jabatan dan Posisi secara terpisah untuk Madrasah (MPHM) dan Pondok (P3HM).
                    </p>
                  </div>

                  {/* Filter Institusi */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedInstitution("MADRASAH")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedInstitution === "MADRASAH"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Madrasah (MPHM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInstitution("PONDOK")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedInstitution === "PONDOK"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Pondok (P3HM)
                    </button>
                  </div>
                </div>

                {/* Form Tambah Jabatan Baru */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Tambah Jabatan Baru ({selectedInstitution === "MADRASAH" ? "Madrasah" : "Pondok"})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newJabatanName}
                      onChange={(e) => setNewJabatanName(e.target.value)}
                      placeholder="Contoh: Dewan Harian, Mundzir, Mufattisy, Mustahiq, Penasihat..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddJabatan())}
                    />
                    <button
                      type="button"
                      onClick={handleAddJabatan}
                      disabled={!newJabatanName.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Jabatan
                    </button>
                  </div>
                </div>

                {/* Grid Kartu Jabatan & Posisi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structuralJabatanList.filter(j => j.institution === selectedInstitution).length === 0 ? (
                    <div className="col-span-2 p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs font-medium">
                      Belum ada Jabatan untuk {selectedInstitution === "MADRASAH" ? "Madrasah (MPHM)" : "Pondok (P3HM)"}. Silakan buat Jabatan baru di atas.
                    </div>
                  ) : (
                    structuralJabatanList
                      .filter(j => j.institution === selectedInstitution)
                      .map((j) => (
                        <div key={j.id} className="p-4 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
                              <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${selectedInstitution === "MADRASAH" ? "bg-blue-500" : "bg-emerald-500"}`} />
                                {j.jabatan}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveJabatan(j.id)}
                                className="text-zinc-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                title="Hapus Jabatan Ini"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Form Tambah Posisi */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newPosisiInputs[j.id] || ""}
                                onChange={(e) => setNewPosisiInputs(prev => ({ ...prev, [j.id]: e.target.value }))}
                                placeholder="Tambah posisi..."
                                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-hidden dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPosisi(j.id))}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddPosisi(j.id)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Posisi
                              </button>
                            </div>

                            {/* List Badge Posisi */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {j.posisiList.length === 0 ? (
                                <span className="text-[11px] text-zinc-400 italic">Belum ada posisi diisi.</span>
                              ) : (
                                j.posisiList.map((pos) => (
                                  <span
                                    key={pos}
                                    className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                                  >
                                    {pos}
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePosisi(j.id, pos)}
                                      className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {settingsTab === "master_pelanggaran" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Master Pelanggaran & Poin Takzir (Telah Dipindahkan)"
                description="📌 PENTING: Pengaturan Kategori & Poin Pelanggaran kini dapat dikelola LANGSUNG di dalam Menu Pelanggaran (/sekretariat/pelanggaran) melalui tombol 'Kelola Poin Pelanggaran' di banner atas."
                steps={[
                  "Anda dapat terus menggunakan tabel di bawah ini untuk melihat daftar master pelanggaran.",
                  "Atau klik tombol 'Buka Menu Catatan Pelanggaran' di bawah ini untuk mengelola poin secara fleksibel."
                ]}
              />
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Akses Cepat: Konfigurasi Poin Pelanggaran kini aktif di Menu Catatan Pelanggaran.
                </div>
                <a
                  href="/sekretariat/pelanggaran"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all shrink-0"
                >
                  Buka Menu Catatan Pelanggaran &rarr;
                </a>
              </div>
              <MasterPelanggaranTab />
            </div>
          )}

          {settingsTab === "purge_data" && (
            <div className="space-y-6">
              <FriendlyGuideCard 
                title="Cockpit Purge Data (Pembersihan Masal)"
                description="Peringatan Keamanan: Fitur ini digunakan khusus saat uji coba awal aplikasi selesai dan pengurus ingin membersihkan data sampel sebelum sistem dipakai secara resmi."
              />
              <PurgeAllDataTab />
            </div>
          )}



          {/* Save Button */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-150 cursor-pointer"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurgeAllDataTab() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("student");
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const CATEGORY_MAP: Record<string, { label: string; desc: string; icon: string }> = {
    class: {
      label: "DATA KELAS DINIYYAH / ROMBEL",
      desc: "Menghapus seluruh data Rombongan Belajar / Kelas Diniyyah MPHM beserta riwayat pendaftarannya.",
      icon: "🏫",
    },
    room: {
      label: "DATA KAMAR / ASRAMA",
      desc: "Menghapus seluruh data Master Kamar Asrama P3HM dan membebaskan penempatan santri.",
      icon: "🚪",
    },
    student: {
      label: "SANTRIWATI / SISWI (& WALI TERKAIT)",
      desc: "Menghapus seluruh data Induk Santriwati Asrama P3HM dan Siswi Diniyyah MPHM beserta profil Wali Santri terkait.",
      icon: "👩‍🎓",
    },
    wali: {
      label: "WALI SANTRI (ORANG TUA)",
      desc: "Menghapus seluruh data Wali Santri / Orang Tua murid beserta akun portalnya.",
      icon: "👨‍👩‍👧",
    },
    mustahiq: {
      label: "MUSTAHIQ (DEWAN PENGAJAR)",
      desc: "Menghapus seluruh data Ustadz Mustahiq dan Dewan Pengajar Diniyyah.",
      icon: "📚",
    },
    mufattisy: {
      label: "MUFATISH (DEWAN PENGAWAS)",
      desc: "Menghapus seluruh data Ustadz Mufattisy dan Dewan Pengawas Kedisiplinan.",
      icon: "🔍",
    },
    mundzir: {
      label: "MUNDZIR (PIMPINAN PESANTREN)",
      desc: "Menghapus seluruh data Mundzir dan Pimpinan Pesantren/Madrasah.",
      icon: "🏛️",
    },
    pengurus: {
      label: "PENGURUS STRUKTURAL",
      desc: "Menghapus seluruh data Pengurus Organisasi Pondok & Madrasah.",
      icon: "👔",
    },
    dewan_harian: {
      label: "DEWAN HARIAN",
      desc: "Menghapus seluruh data Pengurus Eksekutif Dewan Harian (Ketua, Sekretaris, Bendahara, dll).",
      icon: "⚡",
    },
    dewan_pleno: {
      label: "DEWAN PLENO",
      desc: "Menghapus seluruh data Pengurus Anggota Dewan Pleno Organisasi.",
      icon: "📊",
    },
    subject: {
      label: "MATA PELAJARAN & KURIKULUM",
      desc: "Menghapus seluruh data Master Mata Pelajaran, Struktur Kurikulum, dan Pemetaan Mapel.",
      icon: "📖",
    },
    violation: {
      label: "CATATAN PELANGGARAN SANTRI",
      desc: "Menghapus seluruh riwayat rekapitulasi takzir dan pelanggaran kedisiplinan santri.",
      icon: "⚠️",
    },
    certificate: {
      label: "SERTIFIKAT & IJAZAH SANTRI",
      desc: "Menghapus seluruh arsip dokumen Sertifikat Akademik & Ijazah Kelulusan.",
      icon: "📜",
    },
    khidmah: {
      label: "DATA KHIDMAH ALUMNI",
      desc: "Menghapus seluruh data tugas penugasan Khidmah Alumni Pondok.",
      icon: "🤝",
    },
    all: {
      label: "HAPUS SEMUA DATA MASTER & OPERASIONAL (TOTAL RESET)",
      desc: "⚠️ SANGAT BAHAYA: Menghapus seluruh data santri, wali, kelas, kamar, nilai, pengurus, dan data operasional sistem secara total.",
      icon: "🚨",
    },
  };

  const handleExecutePurge = async () => {
    if (confirmationInput !== "HAPUS SEMUA DATA") {
      toast("Teks konfirmasi harus diisi persis 'HAPUS SEMUA DATA'", "error", "Gagal");
      return;
    }

    setIsPurging(true);
    try {
      const res = await apiRequest<{ status: string; message: string; deletedCount: number }>("/api/admin/purge", {
        method: "POST",
        body: JSON.stringify({
          category: selectedCategory,
          confirmationText: confirmationInput,
        }),
      });

      toast(res.message || "Data berhasil dibersihkan dari sistem.", "success", "Berhasil Purge");
      setConfirmationInput("");
      setShowConfirmModal(false);
      window.dispatchEvent(new Event("role_configs_changed"));
    } catch (err: any) {
      console.error("Purge error:", err);
      toast(err?.message || "Gagal menghapus data dari sistem.", "error", "Gagal");
    } finally {
      setIsPurging(false);
    }
  };

  const currentCatInfo = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP.student;

  return (
    <div className="space-y-6">
      {/* Danger Banner */}
      <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white">
                Zona Bahaya (Danger Zone)
              </span>
            </div>
            <h2 className="text-xl font-black text-rose-900 dark:text-rose-200 tracking-tight">
              Hapus All Data (Batch Selective Purge)
            </h2>
            <p className="text-xs text-rose-700 dark:text-rose-300 max-w-2xl leading-relaxed">
              Fitur ini memungkinkan administrator untuk menghapus seluruh data secara massal dan selektif berdasarkan kategori dropdown di bawah ini. Pastikan Anda telah melakukan backup data sebelum mengeksekusi pembersihan.
            </p>
          </div>
        </div>
      </div>

      {/* Main Purge Configuration Card */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            1. Pilih Kategori Data yang Ingin Dihapus Seluruhnya *
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-base font-extrabold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all cursor-pointer"
            >
              <option value="class">DATA KELAS DINIYYAH / ROMBEL</option>
              <option value="room">DATA KAMAR / ASRAMA</option>
              <option value="student">SANTRIWATI / SISWI (& WALI TERKAIT)</option>
              <option value="wali">WALI SANTRI (ORANG TUA)</option>
              <option value="mustahiq">MUSTAHIQ (DEWAN PENGAJAR)</option>
              <option value="mufattisy">MUFATISH (DEWAN PENGAWAS)</option>
              <option value="mundzir">MUNDZIR (PIMPINAN PESANTREN)</option>
              <option value="pengurus">PENGURUS STRUKTURAL</option>
              <option value="dewan_harian">DEWAN HARIAN</option>
              <option value="dewan_pleno">DEWAN PLENO</option>
              <option value="subject">MATA PELAJARAN & KURIKULUM</option>
              <option value="violation">CATATAN PELANGGARAN SANTRI</option>
              <option value="certificate">SERTIFIKAT & IJAZAH SANTRI</option>
              <option value="khidmah">DATA KHIDMAH ALUMNI</option>
              <option value="all">⚠️ HAPUS SEMUA DATA MASTER & OPERASIONAL (TOTAL RESET)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Preview */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl flex items-center gap-4">
          <span className="text-3xl">{currentCatInfo.icon}</span>
          <div>
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
              Target Pembersihan: <span className="text-rose-600 dark:text-rose-400">{currentCatInfo.label}</span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {currentCatInfo.desc}
            </p>
          </div>
        </div>

        {/* Double Safety Input Confirmation */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <label className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            2. Ketik Teks Konfirmasi Keamanan *
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ketik kata <span className="font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">HAPUS SEMUA DATA</span> pada kotak di bawah ini untuk membuka kunci tombol eksekusi:
          </p>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder="Ketik 'HAPUS SEMUA DATA' di sini..."
            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-zinc-400 placeholder:font-normal"
          />
        </div>

        {/* Execution Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={confirmationInput !== "HAPUS SEMUA DATA" || isPurging}
            onClick={() => setShowConfirmModal(true)}
            className={`px-6 py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 flex items-center gap-2.5 shadow-md ${
              confirmationInput === "HAPUS SEMUA DATA" && !isPurging
                ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer hover:shadow-rose-600/25 active:scale-98"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <Trash2 className="w-5 h-5" />
            <span>HAPUS SELURUH DATA {currentCatInfo.label}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  Konfirmasi Akhir Pembersihan Massal
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                  Tindakan Tidak Dapat Dibatalkan!
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Apakah Anda benar-benar yakin ingin menghapus <strong>SELURUH DATA {currentCatInfo.label}</strong> dari database sistem?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleExecutePurge}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isPurging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
