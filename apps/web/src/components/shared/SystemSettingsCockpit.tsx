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

const ROLE_DEFAULT_MENUS_MAP: Record<RoleTypes, Array<{ label: string; href: string }>> = {
  sekretariat: [
    { label: "Dashboard", href: "/sekretariat" },
    { label: "Siswa & Wali (Data Induk)", href: "/sekretariat/siswa" },
    { label: "Kelas & Rombel", href: "/sekretariat/kelas" },
    { label: "Manajemen Nilai", href: "/sekretariat/penilaian" },
    { label: "Kurikulum Builder", href: "/sekretariat/kurikulum" },
    { label: "Pelanggaran", href: "/sekretariat/pelanggaran" },
    { label: "Tahun Ajaran", href: "/sekretariat/tahun-ajaran" },
    { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas" },
    { label: "Audit Log", href: "/sekretariat/audit-log" },
    { label: "Arsip Akademik", href: "/sekretariat/arsip" },
    { label: "Konfigurasi Sistem", href: "/sekretariat/settings" }
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
    mutationFn: async (payload: any) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.m.p3hm.my.id";
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

  // Sync DB settings to local state on mount
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      if (settings.showMustahiqScores !== undefined) setShowMustahiqScores(settings.showMustahiqScores === "true" || settings.showMustahiqScores === true);
      if (settings.showMustahiqAttendance !== undefined) setShowMustahiqAttendance(settings.showMustahiqAttendance === "true" || settings.showMustahiqAttendance === true);
      if (settings.showGuardianScores !== undefined) setShowGuardianScores(settings.showGuardianScores === "true" || settings.showGuardianScores === true);
      if (settings.showGuardianDiscipline !== undefined) setShowGuardianDiscipline(settings.showGuardianDiscipline === "true" || settings.showGuardianDiscipline === true);
      if (settings.showKeamananLookup !== undefined) setShowKeamananLookup(settings.showKeamananLookup === "true" || settings.showKeamananLookup === true);
      
      if (settings.allowMustahiqAkhlaqOverride !== undefined) setAllowMustahiqAkhlaqOverride(settings.allowMustahiqAkhlaqOverride === "true" || settings.allowMustahiqAkhlaqOverride === true);
      if (settings.allowGuardianPermits !== undefined) setAllowGuardianPermits(settings.allowGuardianPermits === "true" || settings.allowGuardianPermits === true);
      if (settings.allowMufattisyApproval !== undefined) setAllowMufattisyApproval(settings.allowMufattisyApproval === "true" || settings.allowMufattisyApproval === true);
      if (settings.allowKeamananEscalation !== undefined) setAllowKeamananEscalation(settings.allowKeamananEscalation === "true" || settings.allowKeamananEscalation === true);
      
      if (settings.systemMaintenance !== undefined) setSystemMaintenance(settings.systemMaintenance === "true" || settings.systemMaintenance === true);
      if (settings.enforceHttps !== undefined) setEnforceHttps(settings.enforceHttps === "true" || settings.enforceHttps === true);
      if (settings.ssoActive !== undefined) setSsoActive(settings.ssoActive === "true" || settings.ssoActive === true);
      
      if (settings.cookieLifetime !== undefined) setCookieLifetime(Number(settings.cookieLifetime));
      if (settings.whatsappContact !== undefined) setWhatsappContact(settings.whatsappContact);
      if (settings.regionApiSource !== undefined) setRegionApiSource(settings.regionApiSource);
      if (settings.binderbyteApiKey !== undefined) setBinderbyteApiKey(settings.binderbyteApiKey);
      
      if (settings.system_role_ui_configs) setRoleConfigs(settings.system_role_ui_configs);
      if (settings.job_titles_mundzir) setMundzirTitles(settings.job_titles_mundzir);
      if (settings.job_titles_pengurus) setPengurusTitles(settings.job_titles_pengurus);
    }
  }, [settings]);


  // Job Titles State
  const [mundzirTitles, setMundzirTitles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("job_titles_mundzir");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [pengurusTitles, setPengurusTitles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("job_titles_pengurus");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newMundzirTitle, setNewMundzirTitle] = useState("");
  const [newPengurusTitle, setNewPengurusTitle] = useState("");

  const handleAddMundzirTitle = () => {
    if (newMundzirTitle.trim() && !mundzirTitles.includes(newMundzirTitle.trim())) {
      setMundzirTitles([...mundzirTitles, newMundzirTitle.trim()]);
      setNewMundzirTitle("");
    }
  };
  const handleRemoveMundzirTitle = (title: string) => {
    setMundzirTitles(mundzirTitles.filter(t => t !== title));
  };

  const handleAddPengurusTitle = () => {
    if (newPengurusTitle.trim() && !pengurusTitles.includes(newPengurusTitle.trim())) {
      setPengurusTitles([...pengurusTitles, newPengurusTitle.trim()]);
      setNewPengurusTitle("");
    }
  };
  const handleRemovePengurusTitle = (title: string) => {
    setPengurusTitles(pengurusTitles.filter(t => t !== title));
  };


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

  const [selectedConfigRole, setSelectedConfigRole] = useState<RoleTypes>("mustahiq");
  const [roleConfigs, setRoleConfigs] = useState<Record<RoleTypes, RoleUIConfig>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("system_role_ui_configs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load saved role configs, resetting to default", e);
        }
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_ROLE_CONFIGS));
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
    const payload = {
      showMustahiqScores,
      showMustahiqAttendance,
      showGuardianScores,
      showGuardianDiscipline,
      showKeamananLookup,
      allowMustahiqAkhlaqOverride,
      allowGuardianPermits,
      allowMufattisyApproval,
      allowKeamananEscalation,
      systemMaintenance,
      enforceHttps,
      ssoActive,
      cookieLifetime,
      whatsappContact,
      system_role_ui_configs: roleConfigs,
      regionApiSource,
      binderbyteApiKey,
      job_titles_mundzir: mundzirTitles,
      job_titles_pengurus: pengurusTitles
    };
    
    updateSettingsMutation.mutate(payload);

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
      localStorage.setItem("binderbyte_api_key", binderbyteApiKey);
      localStorage.setItem("job_titles_mundzir", JSON.stringify(mundzirTitles));
      localStorage.setItem("job_titles_pengurus", JSON.stringify(pengurusTitles));
      window.dispatchEvent(new Event("role_configs_changed"));
      window.dispatchEvent(new Event("region_settings_changed"));
      window.dispatchEvent(new Event("job_titles_changed"));
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
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span>Manajemen Jabatan</span>
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
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Menu / Tabel</label>
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
                {(["sekretariat", "mustahiq", "keamanan", "wali_santri", "mufattisy", "mundzir"] as const).map((r) => {
                  const isActive = selectedConfigRole === r;
                  let label: string = r;
                  if (r === "sekretariat") label = "Sekretariat";
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
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Manajemen Jabatan Pengurus</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    Kelola daftar jabatan yang akan muncul pada menu dropdown saat menambah atau mengubah data pengurus dan pimpinan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jabatan Pimpinan/Mundzir */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Jabatan Pimpinan (Mundzir)</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newMundzirTitle}
                        onChange={(e) => setNewMundzirTitle(e.target.value)}
                        placeholder="Contoh: Mundzir Utama"
                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMundzirTitle()}
                      />
                      <button 
                        onClick={handleAddMundzirTitle}
                        disabled={!newMundzirTitle.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50 dark:bg-zinc-900/50 max-h-60 overflow-y-auto">
                      {mundzirTitles.length === 0 ? (
                        <li className="text-center text-xs text-zinc-500 py-4">Belum ada jabatan pimpinan</li>
                      ) : mundzirTitles.map(title => (
                        <li key={title} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700/50 shadow-xs">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
                          <button onClick={() => handleRemoveMundzirTitle(title)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Jabatan Divisi/Staf */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Jabatan Divisi / Staf Pengurus</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newPengurusTitle}
                        onChange={(e) => setNewPengurusTitle(e.target.value)}
                        placeholder="Contoh: Kepala Keamanan"
                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPengurusTitle()}
                      />
                      <button 
                        onClick={handleAddPengurusTitle}
                        disabled={!newPengurusTitle.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50 dark:bg-zinc-900/50 max-h-60 overflow-y-auto">
                      {pengurusTitles.length === 0 ? (
                        <li className="text-center text-xs text-zinc-500 py-4">Belum ada jabatan divisi</li>
                      ) : pengurusTitles.map(title => (
                        <li key={title} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700/50 shadow-xs">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
                          <button onClick={() => handleRemovePengurusTitle(title)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
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
