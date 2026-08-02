"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Trash2, 
  KeyRound, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  Edit2, 
  X,
  Plus,
  ShieldCheck,
  Building2,
  BookOpen,
  UserCheck,
  Sparkles,
  Lock,
  Download,
  Upload,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUsers, UserAccount } from "../queries/useUsers";
import { useToast } from "@/components/shared/ToastContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useWorkspace } from "@/components/shared/WorkspaceContext";
import { ALL_SYSTEM_MENUS } from "@/components/shared/CustomRoleMatrixManager";
import { DEFAULT_ROLE_CONFIGS, CapabilityPermission, CustomRoleDefinition } from "@/lib/rbac";

interface PersonWithoutAccount {
  id: string;
  fullName: string;
  gender: string;
  suggestedRole: string;
  jabatan?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
}

export function UsersManagementTab() {
  const { activeWorkspace } = useWorkspace();
  const isPondok = activeWorkspace === "pondok";

  const [activeTab, setActiveTab] = useState<"daftar" | "guardian" | "trash">("daftar");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // System Settings WA contact number
  const [systemWa, setSystemWa] = useState("6281234567890");

  // Load custom role definitions & system settings
  const [roleConfigs, setRoleConfigs] = useState<Record<string, any>>({});
  const [customRoleList, setCustomRoleList] = useState<CustomRoleDefinition[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.system_whatsapp_contact) {
          setSystemWa(d.data.system_whatsapp_contact);
        }
        if (Array.isArray(d.data?.system_custom_roles)) {
          setCustomRoleList(d.data.system_custom_roles);
        }
      })
      .catch(() => {});
  }, []);

  // Available Roles based on Workspace
  const availableRoleOptions = isPondok
    ? [
        { value: "sek.pondok", label: "Sekretariat Pondok (P3HM)" },
        { value: "pengurus", label: "Pengurus Pondok (P3HM)" },
        { value: "keamanan", label: "Pengurus Keamanan" },
        { value: "mufattish", label: "Mufattish (Pengawas)" },
        { value: "mundzir", label: "Mundzir / Pimpinan" },
        ...customRoleList.filter(r => r.institution !== "MADRASAH").map(r => ({ value: r.code, label: r.name }))
      ]
    : [
        { value: "sek.madrasah", label: "Sekretariat Madrasah (MPHM)" },
        { value: "mustahiq", label: "Mustahiq (Wali Kelas Diniyyah)" },
        { value: "munawwib", label: "Munawwib (Guru Mapel)" },
        { value: "pengurus", label: "Pengurus Madrasah (MPHM)" },
        ...customRoleList.filter(r => r.institution !== "PONDOK").map(r => ({ value: r.code, label: r.name }))
      ];

  // Users from API
  const {
    data: users = [],
    dormanUsers = [],
    isLoadingDorman,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
    restoreUser,
    forceDeleteUser,
    resetPassword,
  } = useUsers(searchQuery || undefined);

  // Form Penarikan Akun State
  const [pullSource, setPullSource] = useState<"mustahiq" | "pengurus">(isPondok ? "pengurus" : "mustahiq");
  const [peopleWithoutAccounts, setPeopleWithoutAccounts] = useState<PersonWithoutAccount[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>(isPondok ? "sek.pondok" : "mustahiq");

  // Form Input Manual State (If pulled data is empty / user wants manual creation)
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [manualFullName, setManualFullName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualGender, setManualGender] = useState("L");
  const [manualUsername, setManualUsername] = useState("");
  const [manualPassword, setManualPassword] = useState("mphm123");

  const { toast, confirm } = useToast();

  // Edit user state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  // Reset password modal
  const [resetModal, setResetModal] = useState<{ userId: string; username: string; personPhone?: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch people without accounts when active tab is "daftar"
  useEffect(() => {
    if (activeTab === "daftar") {
      fetchPeopleWithoutAccounts();
    }
  }, [activeTab, pullSource, activeWorkspace]);

  const fetchPeopleWithoutAccounts = async () => {
    setLoadingPeople(true);
    try {
      const res = await fetch(`/api/admin/people?role=without_account&source=${pullSource}&scope=${activeWorkspace}&limit=100`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setPeopleWithoutAccounts(json.data);
      } else {
        setPeopleWithoutAccounts([]);
      }
    } catch {
      setPeopleWithoutAccounts([]);
    } finally {
      setLoadingPeople(false);
    }
  };

  // Selected Person details
  const selectedPerson = peopleWithoutAccounts.find((p) => p.id === selectedPersonId);

  // Auto set suggested username & role when person is selected
  useEffect(() => {
    if (selectedPerson) {
      const cleanUsername = selectedPerson.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
      setManualUsername(cleanUsername);
      if (selectedPerson.suggestedRole) {
        setSelectedRole(selectedPerson.suggestedRole);
      }
    }
  }, [selectedPersonId]);

  // Handle Account Creation (Tarik or Manual)
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetPersonId = selectedPersonId;
    let targetUsername = manualUsername.trim();
    let targetPassword = manualPassword.trim() || "mphm123";
    let targetRole = selectedRole;
    let targetFullName = selectedPerson ? selectedPerson.fullName : manualFullName.trim();
    let targetPhone = selectedPerson ? selectedPerson.phoneNumber : manualPhone.trim();

    if (!isManualInput && !selectedPersonId) {
      toast("Pilih data orang yang ditarik atau beralih ke Input Manual!", "error", "Gagal");
      return;
    }

    if (isManualInput && (!targetFullName || !targetUsername)) {
      toast("Nama Lengkap dan Username wajib diisi!", "error", "Gagal");
      return;
    }

    try {
      await createUser({
        personId: isManualInput ? undefined : targetPersonId,
        fullName: targetFullName,
        phone: targetPhone,
        gender: manualGender,
        username: targetUsername,
        password: targetPassword,
        role: targetRole,
      });

      toast(`Akun "${targetUsername}" (${targetRole}) berhasil dibuat!`, "success", "Berhasil");

      // Reset form
      setSelectedPersonId("");
      setManualFullName("");
      setManualPhone("");
      setManualUsername("");
      setManualPassword("mphm123");
      setIsManualInput(false);
      fetchPeopleWithoutAccounts();
    } catch (err: any) {
      toast(err?.message || "Gagal membuat akun baru.", "error", "Gagal");
    }
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setEditUsername(u.username || "");
    setEditFullName(u.personName || u.fullName || u.username || "");
    setEditPhone(u.personPhone || "");
    setEditRole(u.role || "mustahiq");
    setEditStatus(u.status || (u.isActive ? "ACTIVE" : "INACTIVE"));
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser({
        id: editingUser.id,
        data: {
          username: editUsername,
          fullName: editFullName,
          phone: editPhone,
          role: editRole,
          status: editStatus,
        },
      });
      toast(`Akun ${editUsername} berhasil diperbarui!`, "success", "Berhasil");
      setEditingUser(null);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal memperbarui data akun.", "error", "Gagal");
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword) return;
    try {
      await resetPassword({ id: resetModal.userId, newPassword });
      toast(`Password akun ${resetModal.username} berhasil di-reset.`, "success", "Berhasil");
      setResetModal(null);
      setNewPassword("");
    } catch {
      toast("Gagal reset password. Silakan coba lagi.", "error", "Gagal");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Akun Pengguna?",
      message: `Apakah Anda yakin ingin menghapus akun "${username}"? Akun ini akan dipindahkan ke Keranjang Sampah.`,
      confirmText: "Ya, Hapus Akun",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deleteUser(userId);
        toast(`Akun ${username} telah berhasil dihapus.`, "success", "Berhasil");
      } catch {
        toast("Gagal menghapus akun pengguna.", "error", "Gagal");
      }
    }
  };

  const sendWhatsAppCredentials = (name: string, username: string, password: string = "mphm123", phone?: string) => {
    const targetPhone = (phone || "").replace(/[^0-9]/g, "") || systemWa.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nBerikut kredensial login akun resmi Anda:\n\nNama Akun: ${name}\nUsername: ${username}\nPassword Default: ${password}\n\nCatatan: Harap mengganti password saat pertama kali masuk demi keamanan data.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${targetPhone}?text=${message}`, "_blank");
  };

  // 100% Strict Workspace User Filtering
  const workspaceUsers = users.filter((u: any) => {
    const r = (u.role || "").toLowerCase();
    if (isPondok) {
      // Pondok workspace: ONLY show Pondok users (sek.pondok, pengurus P3HM, keamanan pondok)
      return r.includes("pondok") || r.includes("p3hm") || r.includes("keamanan") || r.includes("mufat") || r.includes("mundzir") || r.includes("pimpinan");
    } else {
      // Madrasah workspace: ONLY show Madrasah users (sek.madrasah, mustahiq, munawwib, pengurus MPHM)
      return r.includes("madrasah") || r.includes("mphm") || r.includes("mustahiq") || r.includes("munawwib") || r.includes("pengajar");
    }
  });

  // Filtered users for active tab
  const activeTabUsers = workspaceUsers.filter((u: any) => {
    if (activeTab === "guardian") {
      const r = (u.role || "").toLowerCase();
      return r.includes("wali") || r.includes("guardian");
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      (u.fullName || u.personName || "").toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(activeTabUsers.length / pageSize));
  const paginatedUsers = activeTabUsers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [pageSize, searchQuery, activeTab, activeWorkspace]);

  // Determine Capabilities Info Table for the Selected Role
  const getCapabilitiesForRole = (roleCode: string) => {
    const cleanCode = roleCode.toLowerCase();

    // Check custom role
    const customMatch = customRoleList.find((c) => c.code === cleanCode || c.id === cleanCode);
    if (customMatch && customMatch.capabilities) {
      return customMatch.capabilities;
    }

    // Check built-in role
    if (cleanCode.includes("pondok")) return DEFAULT_ROLE_CONFIGS["sek.pondok"].capabilities;
    if (cleanCode.includes("madrasah")) return DEFAULT_ROLE_CONFIGS["sek.madrasah"].capabilities;
    if (cleanCode.includes("mustahiq")) return DEFAULT_ROLE_CONFIGS["mustahiq"].capabilities;
    if (cleanCode.includes("wali")) return DEFAULT_ROLE_CONFIGS["wali_santri"].capabilities;

    // Default for pengurus / jabatan
    if (cleanCode.includes("keamanan")) {
      return {
        "/sekretariat/santri": { permissionType: "SEARCH_VIEW", view: true, input: false, edit: false, delete: false, export: false, import: false },
        "/sekretariat/pelanggaran": { permissionType: "CRUD", view: true, input: true, edit: true, delete: false, export: true, import: false },
      };
    }

    return {};
  };

  const selectedCapabilities = getCapabilitiesForRole(selectedRole);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Banner Ultra-Premium (Emerald untuk Pondok, Blue untuk Madrasah) */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between gap-6 shadow-md text-white border ${
        isPondok
          ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 border-emerald-500/30"
          : "bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 border-blue-500/30"
      }`}>
        <div className="flex flex-col gap-1.5 z-10 flex-1">
          <div className="flex items-center gap-2 text-white/80 text-xs font-extrabold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Akun &amp; Otorisasi Instansi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Pusat Pengelolaan Akun — {isPondok ? "Pondok P3HM" : "Madrasah MPHM"}</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
            Atur kredensial &amp; otorisasi akun {isPondok ? "Pengurus & Sekretariat Pondok P3HM" : "Mustahiq, Munawwib, Pengurus & Sekretariat Madrasah MPHM"}. Akun tidak aktif &gt;6 bulan otomatis masuk Keranjang Sampah Dorman.
          </p>
        </div>

        <div className="z-10 flex items-center shrink-0">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-3">
            <Phone className="w-6 h-6 text-emerald-300" />
            <div>
              <div className="text-[11px] text-white/80 font-bold uppercase">WA Bantuan Sistem</div>
              <div className="text-sm font-mono font-black text-white">+{systemWa}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3 Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveTab("daftar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "daftar" 
              ? isPondok ? "bg-emerald-600 text-white shadow-sm font-extrabold" : "bg-blue-600 text-white shadow-sm font-extrabold"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Users className="w-4 h-4" /> <span>Daftar Akun &amp; Penarikan</span>
        </button>

        <button
          onClick={() => setActiveTab("guardian")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "guardian" ? "bg-emerald-600 text-white shadow-sm font-extrabold" : "text-zinc-500 hover:text-emerald-600"
          }`}
        >
          <UserCheck className="w-4 h-4" /> <span>Wali Santri (Yang Sudah Mendaftar)</span>
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "trash" ? "bg-rose-600 text-white shadow-sm font-extrabold" : "text-zinc-500 hover:text-rose-600"
          }`}
        >
          <Trash2 className="w-4 h-4" /> <span>Keranjang Sampah Dorman (&gt;6 Bulan)</span>
        </button>
      </div>

      {/* ===== TAB 1: DAFTAR AKUN & PENARIKAN ===== */}
      {activeTab === "daftar" && (
        <div className="space-y-6">
          {/* SECTION A: FORM PENARIKAN & PEMBUATAN AKUN */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPondok ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                }`}>
                  {isPondok ? "🏛️ WORKSPACE PONDOK P3HM" : "🏫 WORKSPACE MADRASAH MPHM"}
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">
                  Form Penarikan / Pembuatan Akun Baru
                </h3>
                <p className="text-xs text-zinc-500">
                  Tarik data person dari database instansi untuk diterbitkan akunnya, atau gunakan input manual jika data belum ada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    isManualInput
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  {isManualInput ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isManualInput ? "Gunakan Form Tarik Data" : "Atau Buat Akun Manual"}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-6">
              {!isManualInput ? (
                /* FORM TARIK DATA */
                <div className="space-y-4">
                  {/* Pilihan Sumber Penarikan */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">Sumber Data:</span>
                    {!isPondok ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPullSource("mustahiq")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            pullSource === "mustahiq"
                              ? "bg-blue-600 text-white shadow-xs font-black"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          📖 Data Mustahiq
                        </button>
                        <button
                          type="button"
                          onClick={() => setPullSource("pengurus")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            pullSource === "pengurus"
                              ? "bg-blue-600 text-white shadow-xs font-black"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          👔 Data Pengurus Madrasah
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPullSource("pengurus")}
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs"
                      >
                        🏛️ Data Pengurus Pondok (P3HM)
                      </button>
                    )}
                  </div>

                  {/* Dropdown Pilih Person */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Pilih Person (Belum Punya Akun):
                      </label>
                      {loadingPeople ? (
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-500 animate-pulse">
                          Memuat data person dari database...
                        </div>
                      ) : peopleWithoutAccounts.length === 0 ? (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-medium">
                          Seluruh data person pada kategori ini sudah memiliki akun. Gunakan tombol <strong>&quot;Atau Buat Akun Manual&quot;</strong> di atas.
                        </div>
                      ) : (
                        <select
                          value={selectedPersonId}
                          onChange={(e) => setSelectedPersonId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                        >
                          <option value="">-- Pilih Orang Yang Ditarik --</option>
                          {peopleWithoutAccounts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName} ({p.jabatan || p.suggestedRole})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Role Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Role Akses Yang Diberikan:
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                      >
                        {availableRoleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Person Details Banner */}
                  {selectedPerson && (
                    <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-blue-900 dark:text-blue-200 block text-sm">
                          {selectedPerson.fullName}
                        </span>
                        <span className="text-blue-700 dark:text-blue-300 font-mono">
                          Jabatan: {selectedPerson.jabatan || selectedPerson.suggestedRole} • WA: {selectedPerson.phoneNumber || "-"}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-[11px]">
                        Siap Diterbitkan
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* FORM INPUT MANUAL AKUN */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap Person:</label>
                    <input
                      type="text"
                      required
                      value={manualFullName}
                      onChange={(e) => setManualFullName(e.target.value)}
                      placeholder="Contoh: Ahmad Subhan"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No. WhatsApp / HP:</label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Username Akun:</label>
                    <input
                      type="text"
                      required
                      value={manualUsername}
                      onChange={(e) => setManualUsername(e.target.value)}
                      placeholder="username_baru"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Password Initial:</label>
                    <input
                      type="text"
                      required
                      value={manualPassword}
                      onChange={(e) => setManualPassword(e.target.value)}
                      placeholder="mphm123"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Role Akses:</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold dark:text-white"
                    >
                      {availableRoleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TABEL INFORMASI TERKAIT ROLE TERSEBUT BISA APA SAJA */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Tabel Hak Akses &amp; Otorisasi Role &quot;{selectedRole}&quot;:</span>
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono">Diambil dari Konfigurasi Sistem</span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/40">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-black">
                      <tr>
                        <th className="py-2.5 px-4">Menu / Modul Sistem</th>
                        <th className="py-2.5 px-3 text-center">Status Akses</th>
                        <th className="py-2.5 px-3 text-center">Mode Otorisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                      {ALL_SYSTEM_MENUS.map((m) => {
                        const cap = (selectedCapabilities as Record<string, any>)[m.href];
                        const isAccess = cap ? cap.permissionType !== "NO_ACCESS" : (selectedRole.includes("sek") || selectedRole.includes("admin"));
                        const permType = cap?.permissionType || (isAccess ? "CRUD" : "NO_ACCESS");

                        return (
                          <tr key={m.href} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-850">
                            <td className="py-2 px-4 flex items-center gap-2">
                              <span>{m.icon}</span>
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{m.label}</span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isAccess 
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                              }`}>
                                {isAccess ? "AKTIF ✅" : "TIDAK AKTIF ❌"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                                permType === "CRUD" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" :
                                permType === "READ_ONLY" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                                permType === "SEARCH_VIEW" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" :
                                "bg-zinc-200 text-zinc-500"
                              }`}>
                                {permType === "CRUD" ? "Full CRUD" : permType === "READ_ONLY" ? "View Only" : permType === "SEARCH_VIEW" ? "Cari-View 1 Data" : "Tanpa Akses"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-6 py-3 rounded-2xl font-black text-xs text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                    isPondok ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Terbitkan &amp; Buat Akun Baru</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION B: TABEL DAFTAR AKUN MONITORING */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari username, nama person, atau role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="text-xs text-zinc-500 font-mono font-bold">
                Total Akun {isPondok ? "Pondok" : "Madrasah"}: {activeTabUsers.length} Terdaftar
              </div>
            </div>

            {/* User List Table */}
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Nama Person &amp; Kontak WA</th>
                    <th className="py-3 px-4">Role Akses</th>
                    <th className="py-3 px-4 text-center">Status Akun</th>
                    <th className="py-3 px-4 text-center">Aktivitas</th>
                    <th className="py-3 px-4 text-center">Aksi Operasional Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        Memuat daftar akun {isPondok ? "Pondok" : "Madrasah"}...
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        Tidak ada data akun yang ditemukan pada workspace {isPondok ? "Pondok" : "Madrasah"}.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {u.username}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={u.personName || u.fullName || u.username} avatarUrl={u.avatarUrl} size="sm" />
                            <div>
                              <span className="font-extrabold text-zinc-900 dark:text-white block">
                                {u.personName || u.fullName || u.username}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                📞 {u.personPhone || "-"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            u.role?.includes("sek") ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                            u.role?.includes("mustahiq") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            u.role?.includes("wali") ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600">
                            Aktif
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => sendWhatsAppCredentials(u.personName || u.username, u.username, "mphm123", u.personPhone)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                              title="Kirim WA Kredensial"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                              title="Edit Akun"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResetModal({ userId: u.id, username: u.username, personPhone: u.personPhone })}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                              title="Hapus ke Sampah"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 2: WALI SANTRI (YANG SUDAH MENDAFTAR) ===== */}
      {activeTab === "guardian" && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                <span>Akun Wali Santri (Yang Sudah Mendaftar)</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Daftar akun Wali Santri / Orang Tua murid yang terhubung dan aktif di e-Mubtadiaat Wali.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-wider">
                  <th className="py-3 px-4">Username Wali</th>
                  <th className="py-3 px-4">Nama Orang Tua / Wali</th>
                  <th className="py-3 px-4">Kontak WA / HP</th>
                  <th className="py-3 px-4 text-center">Status Verifikasi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                {activeTabUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      Belum ada data Wali Santri yang mendaftar.
                    </td>
                  </tr>
                ) : (
                  activeTabUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">{u.username}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{u.personName || u.fullName}</td>
                      <td className="py-3 px-4 font-mono">{u.personPhone || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600">
                          TERVERIFIKASI ✅
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setResetModal({ userId: u.id, username: u.username, personPhone: u.personPhone })}
                          className="px-3 py-1 bg-amber-500/10 text-amber-600 font-bold rounded-lg text-xs"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB 3: KERANJANG SAMPAH DORMAN (>6 BULAN) ===== */}
      {activeTab === "trash" && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>
              <strong>Peringatan Keamanan:</strong> Akun yang tidak melakukan aktivitas selama &gt;6 bulan otomatis dinonaktifkan demi menjaga keamanan data santriwati.
            </span>
          </div>

          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-wider">
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Nama Person</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4 text-center">Status Dorman</th>
                  <th className="py-3 px-4 text-center">Aksi Pemulihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                {dormanUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      Keranjang sampah dorman kosong. Tidak ada akun yang tidak aktif &gt;6 bulan.
                    </td>
                  </tr>
                ) : (
                  dormanUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{u.username}</td>
                      <td className="py-3 px-4 font-bold">{u.personName || u.fullName}</td>
                      <td className="py-3 px-4 font-bold">{u.role}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-600">
                          DINONAKTIFKAN (&gt;6 Bln)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            await restoreUser(u.id);
                            toast(`Akun ${u.username} berhasil dipulihkan!`, "success");
                          }}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                        >
                          Pulihkan Akun
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Edit Data Akun</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Person</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Role Akses</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                >
                  {availableRoleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-zinc-200 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Reset Password Akun ({resetModal.username})</h3>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Password Baru:</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setResetModal(null)} className="px-3 py-1.5 rounded-xl bg-zinc-200 text-xs font-bold">
                Batal
              </button>
              <button onClick={handleResetPassword} className="px-4 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
