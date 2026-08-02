"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sliders, 
  Database, 
  Eye, 
  Search, 
  Lock, 
  Edit3, 
  Download, 
  Upload,
  Info,
  CheckCircle2
} from "lucide-react";
import { CustomRoleDefinition, MenuCapabilities, CapabilityPermission } from "@/lib/rbac";
import { useToast } from "@/components/shared/ToastContext";

// List of all system menus that can be assigned permissions
export const ALL_SYSTEM_MENUS = [
  { href: "/sekretariat/santri", label: "Data Santriwati / Siswi", icon: "👥", category: "DATABASE INDUK" },
  { href: "/sekretariat/rooms", label: "Data Asrama (Blok & Kamar)", icon: "🏡", category: "DATABASE INDUK" },
  { href: "/sekretariat/pengurus", label: "Data Pengurus Induk", icon: "👔", category: "DATABASE INDUK" },
  { href: "/sekretariat/wali-santri", label: "Data Wali Santri (Smart KK)", icon: "👨‍👩‍👧", category: "DATABASE INDUK" },
  { href: "/sekretariat/alumni", label: "Data Alumni Pondok", icon: "🎓", category: "DATABASE INDUK" },
  
  { href: "/sekretariat/pengajar", label: "Data Pengajar", icon: "👨‍🏫", category: "TENAGA PENGAJAR" },
  
  { href: "/sekretariat/kelas", label: "Rombel Kelas Diniyyah", icon: "🏫", category: "AKADEMIK & PENILAIAN" },
  { href: "/sekretariat/kurikulum", label: "Kurikulum & Mapel Diniyyah", icon: "📋", category: "AKADEMIK & PENILAIAN" },
  { href: "/sekretariat/penilaian", label: "Manajemen Nilai Kwartal", icon: "📝", category: "AKADEMIK & PENILAIAN" },
  { href: "/sekretariat/kenaikan-kelas", label: "Kenaikan Kelas", icon: "🎖️", category: "AKADEMIK & PENILAIAN" },
  
  { href: "/sekretariat/perizinan", label: "Perizinan Santri", icon: "🎫", category: "KEDISIPLINAN" },
  { href: "/sekretariat/pelanggaran", label: "Pelanggaran & Takzir", icon: "⚖️", category: "KEDISIPLINAN" },
  
  { href: "/sekretariat/sertifikat", label: "Sertifikat Santri", icon: "📜", category: "DOKUMEN" },
  { href: "/sekretariat/raport", label: "Raport Kwartal Diniyyah", icon: "📑", category: "DOKUMEN" },
  { href: "/sekretariat/ijazah", label: "Ijazah Kelulusan", icon: "🎓", category: "DOKUMEN" },
  { href: "/sekretariat/template-dokumen", label: "Template Dokumen", icon: "📄", category: "DOKUMEN" },
  
  { href: "/sekretariat/users", label: "Manajemen Akun (Users)", icon: "🔑", category: "SISTEM" },
  { href: "/sekretariat/audit-log", label: "Audit Log 24 Jam", icon: "🕒", category: "SISTEM" },
  { href: "/sekretariat/recycle-bin", label: "Recycle Bin", icon: "🗑️", category: "SISTEM" },
  { href: "/sekretariat/settings", label: "Konfigurasi Sistem", icon: "⚙️", category: "SISTEM" },
];

const DEFAULT_BUILTIN_ROLES: CustomRoleDefinition[] = [
  {
    id: "sek.pondok",
    name: "Sekretariat Pondok (P3HM)",
    code: "sek.pondok",
    description: "Pengelola penuh database pondok, asrama, perizinan, dan takzir santriwati.",
    institution: "PONDOK",
    accentColor: "emerald",
    enabledMenus: ALL_SYSTEM_MENUS.map(m => m.href),
    capabilities: ALL_SYSTEM_MENUS.reduce((acc, m) => {
      acc[m.href] = { permissionType: "CRUD", view: true, input: true, edit: true, delete: true, export: true, import: true };
      return acc;
    }, {} as Record<string, MenuCapabilities>)
  },
  {
    id: "sek.madrasah",
    name: "Sekretariat Madrasah (MPHM)",
    code: "sek.madrasah",
    description: "Pengelola kurikulum, rombel kelas, penilaian, raport kwartal, dan ijazah.",
    institution: "MADRASAH",
    accentColor: "blue",
    enabledMenus: ALL_SYSTEM_MENUS.map(m => m.href),
    capabilities: ALL_SYSTEM_MENUS.reduce((acc, m) => {
      acc[m.href] = { permissionType: "CRUD", view: true, input: true, edit: true, delete: true, export: true, import: true };
      return acc;
    }, {} as Record<string, MenuCapabilities>)
  },
  {
    id: "mustahiq",
    name: "Mustahiq (Wali Kelas)",
    code: "mustahiq",
    description: "Pengampu pengajaran kelas diniyyah, input nilai kwartal, dan presensi siswi.",
    institution: "MADRASAH",
    accentColor: "emerald",
    enabledMenus: ["/sekretariat/santri", "/sekretariat/kelas", "/sekretariat/penilaian", "/sekretariat/raport"],
    capabilities: {
      "/sekretariat/santri": { permissionType: "SEARCH_VIEW", view: true, input: false, edit: false, delete: false, export: false, import: false },
      "/sekretariat/kelas": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: false, import: false },
      "/sekretariat/penilaian": { permissionType: "CRUD", view: true, input: true, edit: true, delete: false, export: true, import: true },
      "/sekretariat/raport": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: true, import: false }
    }
  },
  {
    id: "wali_santri",
    name: "Wali Santri",
    code: "wali_santri",
    description: "Orang tua / wali santri yang memantau perkembangan nilai dan perizinan anak.",
    institution: "ALL",
    accentColor: "blue",
    enabledMenus: ["/sekretariat/santri", "/sekretariat/raport", "/sekretariat/perizinan"],
    capabilities: {
      "/sekretariat/santri": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: false, import: false },
      "/sekretariat/raport": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: true, import: false },
      "/sekretariat/perizinan": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: false, import: false }
    }
  }
];

export function CustomRoleMatrixManager() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<CustomRoleDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("sek.pondok");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New role form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleInst, setNewRoleInst] = useState<"PONDOK" | "MADRASAH" | "ALL">("MADRASAH");

  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);

  // Load custom roles & DB roles directly from PostgreSQL database via API
  useEffect(() => {
    async function loadRolesFromDb() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          const dbData = json.data || {};
          let customFromDb: CustomRoleDefinition[] = [];

          if (Array.isArray(dbData.system_custom_roles)) {
            customFromDb = dbData.system_custom_roles;
          }

          // Build dynamic roles for distinct DB roles & positions if not existing
          const dbRoles: string[] = Array.isArray(dbData.db_user_roles) ? dbData.db_user_roles : [];
          const extraDbRoles: CustomRoleDefinition[] = [];

          dbRoles.forEach((rName) => {
            const cleanId = String(rName).toLowerCase().trim().replace(/[^a-z0-9_.]/g, "_");
            const exists = DEFAULT_BUILTIN_ROLES.some(b => b.id === cleanId) || customFromDb.some(c => c.id === cleanId);
            
            if (!exists && cleanId) {
              const isKeamanan = cleanId.includes("keamanan");
              extraDbRoles.push({
                id: cleanId,
                name: `Pengurus (${rName})`,
                code: cleanId,
                description: isKeamanan 
                  ? "Akses Pengurus Keamanan: Pencarian 1 data santriwati & pencatatan poin pelanggaran."
                  : `Pengurus Jabatan ${rName} terdaftar di Database.`,
                institution: "PONDOK",
                accentColor: isKeamanan ? "orange" : "violet",
                enabledMenus: isKeamanan ? ["/sekretariat/santri", "/sekretariat/pelanggaran"] : ["/sekretariat/santri"],
                capabilities: {
                  "/sekretariat/santri": { permissionType: isKeamanan ? "SEARCH_VIEW" : "READ_ONLY", view: true, input: false, edit: false, delete: false, export: false, import: false },
                  "/sekretariat/pelanggaran": { permissionType: "CRUD", view: true, input: true, edit: true, delete: false, export: true, import: false }
                },
                createdAt: new Date().toISOString()
              });
            }
          });

          const merged = [...DEFAULT_BUILTIN_ROLES, ...customFromDb, ...extraDbRoles];
          setRoles(merged);
          setIsDbSynced(true);
          localStorage.setItem("mphm_custom_roles", JSON.stringify([...customFromDb, ...extraDbRoles]));
          return;
        }
      } catch (err) {
        console.error("Gagal memuat role dari database:", err);
      }

      // Fallback to localStorage if API fails
      const saved = localStorage.getItem("mphm_custom_roles");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRoles([...DEFAULT_BUILTIN_ROLES, ...parsed]);
        } catch {
          setRoles(DEFAULT_BUILTIN_ROLES);
        }
      } else {
        setRoles(DEFAULT_BUILTIN_ROLES);
      }
    }

    loadRolesFromDb();
  }, []);

  const saveRolesToStorage = async (updatedRoles: CustomRoleDefinition[]) => {
    setRoles(updatedRoles);
    const customOnly = updatedRoles.filter(r => !DEFAULT_BUILTIN_ROLES.some(b => b.id === r.id));
    localStorage.setItem("mphm_custom_roles", JSON.stringify(customOnly));

    // Save directly to PostgreSQL Database via API
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_custom_roles: customOnly }),
      });
      toast("✨ Peran & Matriks Otorisasi berhasil disimpan ke Database!", "success");
    } catch (err) {
      console.error("Gagal menyimpan role ke Database:", err);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  // Handle creating custom role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast("Nama dan Kode Role wajib diisi!", "error");
      return;
    }

    const cleanCode = newRoleCode.toLowerCase().replace(/[^a-z0-9_.]/g, "_");
    if (roles.some(r => r.code === cleanCode || r.id === cleanCode)) {
      toast("Kode role ini sudah digunakan!", "error");
      return;
    }

    const newRole: CustomRoleDefinition = {
      id: cleanCode,
      name: newRoleName.trim(),
      code: cleanCode,
      description: newRoleDesc.trim() || "Peran kustom dalam sistem.",
      institution: newRoleInst,
      accentColor: newRoleInst === "PONDOK" ? "emerald" : "blue",
      enabledMenus: ["/sekretariat/santri"],
      capabilities: {
        "/sekretariat/santri": { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: false, import: false }
      },
      createdAt: new Date().toISOString()
    };

    const updated = [...roles, newRole];
    saveRolesToStorage(updated);
    setSelectedRoleId(cleanCode);
    setShowCreateModal(false);
    setNewRoleName("");
    setNewRoleCode("");
    setNewRoleDesc("");
    toast(`Peran kustom "${newRole.name}" berhasil dibuat!`, "success");
  };

  // Delete custom role
  const handleDeleteRole = (roleId: string) => {
    if (DEFAULT_BUILTIN_ROLES.some(b => b.id === roleId)) {
      toast("Peran utama bawaan sistem tidak dapat dihapus!", "error");
      return;
    }
    const updated = roles.filter(r => r.id !== roleId);
    saveRolesToStorage(updated);
    setSelectedRoleId("sek.pondok");
    toast("Peran kustom berhasil dihapus", "success");
  };

  // Toggle menu enable/disable for selected role
  const handleToggleMenu = (menuHref: string) => {
    if (!selectedRole) return;
    const isEnabled = selectedRole.enabledMenus.includes(menuHref);
    let newMenus: string[];
    let newCaps = { ...selectedRole.capabilities };

    if (isEnabled) {
      newMenus = selectedRole.enabledMenus.filter(h => h !== menuHref);
      delete newCaps[menuHref];
    } else {
      newMenus = [...selectedRole.enabledMenus, menuHref];
      newCaps[menuHref] = { permissionType: "CRUD", view: true, input: true, edit: true, delete: true, export: true, import: true };
    }

    const updatedRoles = roles.map(r => r.id === selectedRole.id ? { ...r, enabledMenus: newMenus, capabilities: newCaps } : r);
    saveRolesToStorage(updatedRoles);
  };

  // Update permission type for specific menu item
  const handleSetPermissionType = (menuHref: string, type: CapabilityPermission) => {
    if (!selectedRole) return;
    let caps: MenuCapabilities;

    switch (type) {
      case "CRUD":
        caps = { permissionType: "CRUD", view: true, input: true, edit: true, delete: true, export: true, import: true };
        break;
      case "READ_ONLY":
        caps = { permissionType: "READ_ONLY", view: true, input: false, edit: false, delete: false, export: true, import: false };
        break;
      case "SEARCH_VIEW":
        caps = { permissionType: "SEARCH_VIEW", view: true, input: false, edit: false, delete: false, export: false, import: false };
        break;
      case "NO_ACCESS":
      default:
        caps = { permissionType: "NO_ACCESS", view: false, input: false, edit: false, delete: false, export: false, import: false };
        break;
    }

    let newEnabled = [...selectedRole.enabledMenus];
    if (type === "NO_ACCESS") {
      newEnabled = newEnabled.filter(h => h !== menuHref);
    } else if (!newEnabled.includes(menuHref)) {
      newEnabled.push(menuHref);
    }

    const newCapabilities = { ...selectedRole.capabilities, [menuHref]: caps };
    const updatedRoles = roles.map(r => r.id === selectedRole.id ? { ...r, enabledMenus: newEnabled, capabilities: newCapabilities } : r);
    saveRolesToStorage(updatedRoles);
  };

  // Toggle export or import
  const handleToggleExportImport = (menuHref: string, field: "export" | "import") => {
    if (!selectedRole) return;
    const existing = selectedRole.capabilities[menuHref] || { permissionType: "CRUD", view: true, input: true, edit: true, delete: true, export: true, import: true };
    const updatedCap = { ...existing, [field]: !existing[field] };

    const newCapabilities = { ...selectedRole.capabilities, [menuHref]: updatedCap };
    const updatedRoles = roles.map(r => r.id === selectedRole.id ? { ...r, capabilities: newCapabilities } : r);
    saveRolesToStorage(updatedRoles);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs tracking-wider uppercase mb-1">
              <Sliders className="w-4 h-4" />
              <span>SaaS Dynamic Role & Capability Matrix Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Manajemen Peran Dinamis & Hak Akses Granular
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Buat role kustom sesuai kebutuhan instansi, tentukan menu yang boleh diakses, serta atur mode otorisasi granular (CRUD Full, Read Only, Cari-View, atau Tanpa Akses).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" /> Buat Role Kustom Baru
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-2.5 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {roles.map((r) => {
          const isActive = r.id === selectedRoleId;
          const isBuiltIn = DEFAULT_BUILTIN_ROLES.some(b => b.id === r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoleId(r.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40"
              }`}
            >
              <span>{r.name}</span>
              {!isBuiltIn && (
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md">
                  KUSTOM
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Role Overview & Capability Matrix */}
      {selectedRole && (
        <div className="space-y-6">
          {/* Role Info Bar */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">{selectedRole.name}</h3>
                <span className="font-mono text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  ID: {selectedRole.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">
                  {selectedRole.institution}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{selectedRole.description}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Dynamic Navigation Style Toggle for this Role */}
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider px-2">Gaya Navigasi:</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = roles.map(r => r.id === selectedRole.id ? { ...r, navigationStyle: "sidebar" as const } : r);
                    saveRolesToStorage(updated);
                    toast(`Gaya navigasi untuk ${selectedRole.name} diubah ke SIDEBAR`, "info");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    (selectedRole.navigationStyle || "sidebar") === "sidebar"
                      ? "bg-emerald-500 text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Sidebar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = roles.map(r => r.id === selectedRole.id ? { ...r, navigationStyle: "bottom_nav" as const } : r);
                    saveRolesToStorage(updated);
                    toast(`Gaya navigasi untuk ${selectedRole.name} diubah ke BOTTOM NAV`, "info");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedRole.navigationStyle === "bottom_nav"
                      ? "bg-blue-500 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Bottom Nav
                </button>
              </div>

              {!DEFAULT_BUILTIN_ROLES.some(b => b.id === selectedRole.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteRole(selectedRole.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
              )}
            </div>
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Matriks Otorisasi Menu & Fitur
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">Tentukan tingkat izin per menu: CRUD, View Only, Cari-View, atau No Access.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-wider">
                    <th className="py-3.5 px-5">Menu / Modul Sistem</th>
                    <th className="py-3.5 px-4 text-center">Status Access</th>
                    <th className="py-3.5 px-4 text-center">Mode Otorisasi Granular</th>
                    <th className="py-3.5 px-4 text-center">Opsi Ekspor (PDF/Excel)</th>
                    <th className="py-3.5 px-4 text-center">Opsi Impor (Excel)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-medium">
                  {ALL_SYSTEM_MENUS.map((m) => {
                    const isEnabled = selectedRole.enabledMenus.includes(m.href);
                    const cap = selectedRole.capabilities[m.href] || { permissionType: isEnabled ? "CRUD" : "NO_ACCESS", view: isEnabled, input: isEnabled, edit: isEnabled, delete: isEnabled, export: isEnabled, import: isEnabled };
                    const currentType: CapabilityPermission = isEnabled ? (cap.permissionType || "CRUD") : "NO_ACCESS";

                    return (
                      <tr key={m.href} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-850/40 transition-colors ${!isEnabled ? "opacity-50 bg-zinc-50/50 dark:bg-zinc-950/20" : ""}`}>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <span className="text-base">{m.icon}</span>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-white block">{m.label}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">{m.href} • {m.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleMenu(m.href)}
                            className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                              isEnabled 
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            {isEnabled ? "AKTIF" : "NONAKTIF"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSetPermissionType(m.href, "CRUD")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                currentType === "CRUD"
                                  ? "bg-emerald-500 text-zinc-950 font-black shadow-xs"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                              title="Full CRUD: Tambah, Lihat, Edit, Hapus"
                            >
                              <Edit3 className="w-3 h-3" /> Full CRUD
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPermissionType(m.href, "READ_ONLY")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                currentType === "READ_ONLY"
                                  ? "bg-blue-500 text-white font-black shadow-xs"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                              title="Read Only: Hanya dapat melihat data"
                            >
                              <Eye className="w-3 h-3" /> View Only
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPermissionType(m.href, "SEARCH_VIEW")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                currentType === "SEARCH_VIEW"
                                  ? "bg-amber-500 text-zinc-950 font-black shadow-xs"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                              title="Cari & Lihat: Pencarian + Lihat saja"
                            >
                              <Search className="w-3 h-3" /> Cari-View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPermissionType(m.href, "NO_ACCESS")}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                currentType === "NO_ACCESS"
                                  ? "bg-rose-500 text-white font-black shadow-xs"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                              title="Tanpa Akses / Sembunyi"
                            >
                              <Lock className="w-3 h-3" /> Blok
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            disabled={!isEnabled}
                            onClick={() => handleToggleExportImport(m.href, "export")}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              cap.export && isEnabled
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                            }`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            disabled={!isEnabled}
                            onClick={() => handleToggleExportImport(m.href, "import")}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              cap.import && isEnabled
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                                : "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create New Custom Role */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">Buat Role Kustom Baru</h3>
                  <p className="text-xs text-zinc-500">Definisikan peran baru untuk pengguna sistem.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Nama Role</label>
                <input
                  type="text"
                  placeholder="Contoh: Bendahara Diniyyah / Pembina Asrama"
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);
                    if (!newRoleCode) setNewRoleCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_"));
                  }}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Kode Role (Unique ID)</label>
                <input
                  type="text"
                  placeholder="Contoh: bendahara_diniyyah"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Cakupan Instansi</label>
                <select
                  value={newRoleInst}
                  onChange={(e) => setNewRoleInst(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MADRASAH">Madrasah Diniyyah (MPHM)</option>
                  <option value="PONDOK">Pondok Pesantren (P3HM)</option>
                  <option value="ALL">Lintas Instansi (Pondok & Madrasah)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi tugas dan tanggung jawab peran ini..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan Role Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
