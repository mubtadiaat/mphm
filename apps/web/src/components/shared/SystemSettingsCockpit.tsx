"use client";

import { useState, useEffect } from "react";
import { useSystemSettings } from "@/components/providers/SystemSettingsProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ToastContext";
import { motion } from "framer-motion";
import { Users, Lock, Settings, CheckCircle2, Database, Sliders, MapPin, Calculator, Briefcase, Plus, X, AlertCircle } from "lucide-react";
import { PillBadge } from "@/components/shared/PillBadge";
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
    { label: "Kelas & Rombel", href: "/sekretariat/kelas" },
    { label: "Kurikulum", href: "/sekretariat/kurikulum" },
    { label: "Penilaian", href: "/sekretariat/penilaian" },
    { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas" },
    { label: "Dokumen & Raport", href: "/sekretariat/raport" },
    { label: "Audit Log", href: "/sekretariat/audit-log" }
  ],
  mufattisy: [
    { label: "Dashboard", href: "/mufattisy" },
    { label: "Data Santri", href: "/mufattisy/santri" },
    { label: "Akademik", href: "/mufattisy/akademik" },
    { label: "Kedisiplinan", href: "/mufattisy/kedisiplinan" },
    { label: "Kenaikan Kelas", href: "/mufattisy/kenaikan-kelas" },
    { label: "Perizinan", href: "/mufattisy/perizinan" }
  ],
  mundzir: [
    { label: "Dashboard", href: "/pimpinan" },
    { label: "Santri & Kelas", href: "/pimpinan/santri" },
    { label: "Kehadiran", href: "/pimpinan/kehadiran" },
    { label: "Kedisiplinan", href: "/pimpinan/kedisiplinan" },
    { label: "Perizinan", href: "/pimpinan/perizinan" }
  ],
  mustahiq: [
    { label: "Dashboard", href: "/mustahiq" },
    { label: "Kelas & Santri", href: "/mustahiq/kelas" },
    { label: "Penilaian Kwartal", href: "/mustahiq/penilaian" },
    { label: "Rekap Absensi", href: "/mustahiq/absensi" },
    { label: "Catatan Akhlaq", href: "/mustahiq/akhlaq" },
    { label: "Rekomendasi Kenaikan", href: "/mustahiq/kenaikan-kelas" }
  ],
  keamanan: [
    { label: "Dashboard", href: "/keamanan" },
    { label: "Jurnal Pelanggaran", href: "/keamanan/jurnal" },
    { label: "Pencarian Santri", href: "/keamanan/santri" }
  ],
  wali_santri: [
    { label: "Dashboard", href: "/guardian" },
    { label: "Anak Saya", href: "/guardian/children" },
    { label: "Akademik", href: "/guardian/akademik" },
    { label: "Kedisiplinan", href: "/guardian/kedisiplinan" },
    { label: "Kehadiran", href: "/guardian/kehadiran" }
  ]
};

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
    setRoleConfigs((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: value
      }
    }));
  };

  const handleToggleMenuVisibility = (role: RoleTypes, menuHref: string) => {
    const currentEnabled = roleConfigs[role].enabledMenus;
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
    const currentCaps = roleConfigs[role].capabilities[menuHref] || { ...DEFAULT_CAPABILITIES };
    const nextCaps = {
      ...currentCaps,
      [action]: value
    };

    setRoleConfigs((prev) => {
      const updatedCaps = {
        ...prev[role].capabilities,
        [menuHref]: nextCaps
      };
      return {
        ...prev,
        [role]: {
          ...prev[role],
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
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Konfigurasi Utama</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Konfigurasi & Parameter Sistem
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola tampilan modul aktif, kolom tabel data induk, hak akses otorisasi, parameter keamanan, dan integrasi API wilayah.
          </p>
        </div>
      </div>

      {settingsSaved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-2 text-sm font-semibold shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Konfigurasi sistem berhasil disimpan dan didistribusikan secara realtime.</span>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Internal Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <button
            onClick={() => setSettingsTab("visibility")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "visibility"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tampilan & Modul</span>
          </button>
          <button
            onClick={() => setSettingsTab("permissions")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "permissions"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Hak Akses & Otorisasi</span>
          </button>
          <button
            onClick={() => setSettingsTab("security")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "security"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Parameter & Keamanan</span>
          </button>
          <button
            onClick={() => setSettingsTab("custom_tables")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "custom_tables"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Tabel Kustom & Menu</span>
          </button>
          <button
            onClick={() => setSettingsTab("roles")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "roles"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Manajemen Peran & UI</span>
          </button>
          <button
            onClick={() => setSettingsTab("job_titles")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "job_titles"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jabatan Struktural</span>
          </button>
          <button
            onClick={() => setSettingsTab("master_pelanggaran")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "master_pelanggaran"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Master Pelanggaran</span>
          </button>
          <button
            onClick={() => setSettingsTab("region_api")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "region_api"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Integrasi API Wilayah</span>
          </button>
          <button
            onClick={() => setSettingsTab("math_formula")}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
              settingsTab === "math_formula"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent"
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>Parameter Matematis</span>
          </button>
        </div>

        {/* Details 2x2 Grid Panel */}
        <div className="flex-1 w-full space-y-6">
          {settingsTab === "visibility" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Modul Mustahiq</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Spreadsheet Penilaian</span>
                    <button
                      onClick={() => setShowMustahiqScores(!showMustahiqScores)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showMustahiqScores ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showMustahiqScores ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Absensi Kehadiran Santri</span>
                    <button
                      onClick={() => setShowMustahiqAttendance(!showMustahiqAttendance)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showMustahiqAttendance ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showMustahiqAttendance ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Modul Wali Santri</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Transkrip & Rapor Nilai</span>
                    <button
                      onClick={() => setShowGuardianScores(!showGuardianScores)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showGuardianScores ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showGuardianScores ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Modul Kedisiplinan & Poin</span>
                    <button
                      onClick={() => setShowGuardianDiscipline(!showGuardianDiscipline)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showGuardianDiscipline ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showGuardianDiscipline ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Modul Pos Keamanan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Pencarian & Lookup Cepat</span>
                    <button
                      onClick={() => setShowKeamananLookup(!showKeamananLookup)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showKeamananLookup ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showKeamananLookup ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Modul Mufattisy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-750 dark:text-zinc-400 font-medium">Dashboard Pengawasan Asrama</span>
                    <PillBadge label="WAJIB AKTIF" variant="success" />
                  </div>
                </div>
              </div>
            </div>

            {/* Konfigurasi Kolom Tabel */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Konfigurasi Kolom Tabel</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Pilih kolom mana saja yang ingin ditampilkan secara default pada masing-masing modul tabel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Table Santri */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel Data Induk Santri</span>
                  <div className="space-y-2">
                    {Object.entries({
                      name: "Nama Lengkap",
                      nik: "NIK",
                      stambuk: "Nomor Stambuk",
                      class: "Kelas Aktif",
                      address: "Alamat",
                      status: "Status"
                    }).map(([colKey, label]) => {
                      const isChecked = santriCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("santri", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Table Kelas */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel Data Kelas Rombel</span>
                  <div className="space-y-2">
                    {Object.entries({
                      name: "Nama Kelas",
                      mustahiq: "Wali Kelas (Mustahiq)",
                      mufattisy: "Pengawas (Mufattisy)",
                      capacity: "Kapasitas"
                    }).map(([colKey, label]) => {
                      const isChecked = kelasCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("kelas", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Table Kurikulum */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel Kurikulum/Mapel</span>
                  <div className="space-y-2">
                    {Object.entries({
                      code: "Kode Mapel",
                      name: "Nama Pelajaran",
                      subjectType: "Jenis Pelajaran",
                      isActive: "Status Keaktifan"
                    }).map(([colKey, label]) => {
                      const isChecked = kurikulumCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("kurikulum", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Table Pelanggaran */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel Pelanggaran Master</span>
                  <div className="space-y-2">
                    {Object.entries({
                      name: "Nama Pelanggaran",
                      category: "Kategori",
                      severity: "Tingkat Keparahan",
                      points: "Poin Penalty"
                    }).map(([colKey, label]) => {
                      const isChecked = pelanggaranCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("pelanggaran", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Table Tahun Ajaran */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel Tahun Akademik</span>
                  <div className="space-y-2">
                    {Object.entries({
                      name: "Tahun Akademik",
                      startDate: "Tanggal Mulai",
                      endDate: "Tanggal Berakhir",
                      isActive: "Status Aktif"
                    }).map(([colKey, label]) => {
                      const isChecked = tahunAjaranCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("tahun_ajaran", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Table Audit Log */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tabel forensic Audit Log</span>
                  <div className="space-y-2">
                    {Object.entries({
                      timestamp: "Waktu Kejadian",
                      userId: "Pelaku Aksi",
                      role: "Role",
                      module: "Modul Sistem",
                      action: "HTTP Method"
                    }).map(([colKey, label]) => {
                      const isChecked = auditLogCols[colKey] !== false;
                      return (
                        <label key={colKey} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCol("audit_log", colKey, isChecked)}
                            className="rounded border-zinc-350 dark:border-zinc-650 text-blue-600 focus:ring-blue-500"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Otoritas Mustahiq</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Override Predikat Akhlaq</span>
                    <button
                      onClick={() => setAllowMustahiqAkhlaqOverride(!allowMustahiqAkhlaqOverride)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${allowMustahiqAkhlaqOverride ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${allowMustahiqAkhlaqOverride ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Otoritas Wali Santri</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Pengajuan Izin Safar/Sakit</span>
                    <button
                      onClick={() => setAllowGuardianPermits(!allowGuardianPermits)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${allowGuardianPermits ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${allowGuardianPermits ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Otoritas Mufattisy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Persetujuan/Approval Izin</span>
                    <button
                      onClick={() => setAllowMufattisyApproval(!allowMufattisyApproval)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${allowMufattisyApproval ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${allowMufattisyApproval ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Otoritas Pos Keamanan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Eskalasi Pelanggaran Santri</span>
                    <button
                      onClick={() => setAllowKeamananEscalation(!allowKeamananEscalation)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${allowKeamananEscalation ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${allowKeamananEscalation ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "security" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Status Pemeliharaan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Maintenance Mode</span>
                    <button
                      onClick={() => setSystemMaintenance(!systemMaintenance)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${systemMaintenance ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${systemMaintenance ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Rotasi Session Cookie</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-750 dark:text-zinc-400 font-medium">Session Lifetime Duration</span>
                    <select
                      value={cookieLifetime}
                      onChange={(e) => setCookieLifetime(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200"
                    >
                      <option value={15}>15 Menit</option>
                      <option value={30}>30 Menit (Default)</option>
                      <option value={60}>60 Menit</option>
                      <option value={120}>120 Menit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Keamanan Jaringan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Strict HTTPS Enforcement</span>
                    <button
                      onClick={() => setEnforceHttps(!enforceHttps)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enforceHttps ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${enforceHttps ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Single Sign-On</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">Aktifkan Login SSO</span>
                    <button
                      onClick={() => setSsoActive(!ssoActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${ssoActive ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-750"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${ssoActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Contact Input */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 md:col-span-2">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Kontak Utama (WhatsApp Sekretariat)</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                      Nomor WhatsApp (Gunakan Awalan 62)
                    </label>
                    <p className="text-xs text-zinc-500">Nomor ini akan dihubungi langsung oleh civitas akademik yang membutuhkan bantuan.</p>
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
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "region_api" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Integrasi API Wilayah Indonesia</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    Konfigurasikan sumber data wilayah administratif (Provinsi, Kabupaten, Kecamatan, Kelurahan) yang digunakan untuk input alamat data induk.
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sumber Data Wilayah</label>
                    <select
                      value={regionApiSource}
                      onChange={(e) => setRegionApiSource(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-205 w-full transition-colors"
                    >
                      <option value="cahyadsn">cahyadsn/wilayah (wilayah.id) (Online - Gratis & Kemendagri Resmi)</option>
                      <option value="emsifa">Emsifa API (Online - Gratis & Tanpa API Key)</option>
                      <option value="binderbyte">BinderByte API (Online - Memerlukan API Key)</option>
                      <option value="offline">Database Luring (Offline Fallback - Instan & Luring)</option>
                    </select>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic block leading-relaxed">
                      * cahyadsn/wilayah (wilayah.id) direkomendasikan karena bersifat resmi, gratis, dan mengikuti standarisasi kode wilayah Kemendagri terbaru.
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
                        Info: Kunci API default saat ini diambil dari Postman BinderByte (berlaku batas kuota panggilan per hari). Silakan ganti dengan API Key milik Anda sendiri untuk keamanan penuh.
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
              <MathFormulaBuilder />
            </div>
          )}

          {settingsTab === "custom_tables" && (
            <div className="space-y-6">
              {/* Form to create new table */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Buat Tabel Kustom & Menu Baru</h3>
                <p className="text-xs text-zinc-500">Mendaftarkan menu sidebar dinamis lengkap dengan form input dan grid database kustom.</p>
                
                <form onSubmit={handleSaveCustomTable} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Batas Maksimal Percobaan Login</label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Akun akan terkunci sementara jika gagal login melebihi batas ini.</p>
                      <input 
                        type="text" 
                        required
                        value={newTableName} 
                        onChange={(e) => {
                          setNewTableName(e.target.value);
                          // Auto slug suggestion
                          setNewTableKey(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, ""));
                        }}
                        placeholder="Misal: Arsip Donasi"
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
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
            <div className="space-y-6">
              {/* Role selector tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-850">
                {(["sek.pondok", "sek.madrasah", "mustahiq", "keamanan", "wali_santri", "mufattisy", "mundzir"] as const).map((r) => {
                  const isActive = selectedConfigRole === r;
                  let label: string = r;
                  if (r === "sek.pondok") label = "Sekretariat Pondok";
                  else if (r === "sek.madrasah") label = "Sekretariat Madrasah";
                  else if (r === "mustahiq") label = "Mustahiq";
                  else if (r === "keamanan") label = "Keamanan";
                  else if (r === "wali_santri") label = "Wali Santri";
                  else if (r === "mufattisy") label = "Mufattisy";
                  else if (r === "mundzir") label = "Pimpinan/Mundzir";

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedConfigRole(r)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700/80"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Configurations Form for the selected role */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    Konfigurasi Peran: <span className="capitalize text-blue-600 dark:text-blue-400">{selectedConfigRole.replace("_", " ")}</span>
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    Sesuaikan tata letak, warna aksen UI, banner dasbor, dan matriks hak akses tindakan menu secara dinamis.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Layout & Theme */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Welcome Banner Text</label>
                      <input
                        type="text"
                        value={roleConfigs[selectedConfigRole].welcomeBanner}
                        onChange={(e) => handleUpdateRoleConfig(selectedConfigRole, "welcomeBanner", e.target.value)}
                        placeholder="Masukkan pesan selamat datang..."
                        className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200 w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gaya Navigasi</label>
                        <select
                          value={roleConfigs[selectedConfigRole].navigationStyle}
                          onChange={(e) => handleUpdateRoleConfig(selectedConfigRole, "navigationStyle", e.target.value as "sidebar" | "bottom_nav")}
                          className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200"
                        >
                          <option value="sidebar">Sidebar Utama</option>
                          <option value="bottom_nav">Bottom Navigasi</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Grid Dasbor</label>
                        <select
                          value={roleConfigs[selectedConfigRole].gridLayout}
                          onChange={(e) => handleUpdateRoleConfig(selectedConfigRole, "gridLayout", e.target.value as "1-1" | "2-2" | "3-3")}
                          className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none dark:text-zinc-200"
                        >
                          <option value="1-1">1 Baris (1-1)</option>
                          <option value="2-2">2 Kolom (2-2)</option>
                          <option value="3-3">3 Kolom (3-3)</option>
                        </select>
                      </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tema Warna Aksen</label>
                      <div className="flex gap-3 items-center">
                        {(["blue", "emerald", "rose", "violet", "orange"] as const).map((color) => {
                          const isSelected = roleConfigs[selectedConfigRole].accentColor === color;
                          const colorBgs = {
                            blue: "bg-blue-500",
                            emerald: "bg-emerald-500",
                            rose: "bg-rose-500",
                            violet: "bg-violet-500",
                            orange: "bg-orange-500"
                          };
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleUpdateRoleConfig(selectedConfigRole, "accentColor", color)}
                              className={`w-7 h-7 rounded-full ${colorBgs[color]} relative transition-all cursor-pointer hover:scale-110 ${
                                isSelected ? "ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-950 scale-105 shadow-sm" : ""
                              }`}
                              title={color}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Menu Visibility Checklist */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Visibilitas Menu Utama</label>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-2xl max-h-[220px] overflow-y-auto space-y-2">
                      {getRoleMenus(selectedConfigRole).map((menu) => {
                        const isVisible = roleConfigs[selectedConfigRole].enabledMenus.includes(menu.href);
                        return (
                          <label key={menu.href} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => handleToggleMenuVisibility(selectedConfigRole, menu.href)}
                              className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span>{menu.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Menu Permissions Grid */}
                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Matriks Hak Akses & Tindakan</h4>
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-3">Nama Menu</th>
                          <th className="p-3 text-center">Bisa Lihat</th>
                          <th className="p-3 text-center">Bisa Input/Tambah</th>
                          <th className="p-3 text-center">Bisa Ubah/Edit</th>
                          <th className="p-3 text-center">Bisa Hapus</th>
                          <th className="p-3 text-center">Bisa Ekspor</th>
                          <th className="p-3 text-center">Bisa Impor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {getRoleMenus(selectedConfigRole).map((menu) => {
                          const menuCaps = roleConfigs[selectedConfigRole].capabilities[menu.href] || { ...DEFAULT_CAPABILITIES };
                          const isMenuVisible = roleConfigs[selectedConfigRole].enabledMenus.includes(menu.href);

                          return (
                            <tr 
                              key={menu.href} 
                              className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 ${!isMenuVisible ? "opacity-40" : ""}`}
                            >
                              <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">
                                {menu.label}
                                <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{menu.href}</span>
                              </td>
                              {(["view", "input", "edit", "delete", "export", "import"] as const).map((action) => {
                                const isChecked = !!menuCaps[action];
                                return (
                                  <td key={action} className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      disabled={!isMenuVisible}
                                      checked={isChecked}
                                      onChange={(e) => handleUpdateMenuCapability(selectedConfigRole, menu.href, action, e.target.checked)}
                                      className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {settingsTab === "job_titles" && (
            <div className="space-y-6">
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
            <MasterPelanggaranTab />
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
