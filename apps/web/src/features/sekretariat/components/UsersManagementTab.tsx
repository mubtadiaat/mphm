"use client";

import { useState, useEffect } from "react";
import { Users, Trash2, KeyRound, Search, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, Phone, MessageSquare, AlertCircle } from "lucide-react";
import { useUsers, UserAccount } from "../queries/useUsers";
import { useToast } from "@/components/shared/ToastContext";

interface PersonWithoutAccount {
  id: string;
  fullName: string;
  gender: string;
  suggestedRole: string;
  phoneNumber?: string;
}

export function UsersManagementTab() {
  const [activeTab, setActiveTab] = useState<"all" | "generate" | "trash">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // System Settings WA contact number
  const [systemWa, setSystemWa] = useState("6281234567890");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.system_whatsapp_contact) {
          setSystemWa(d.data.system_whatsapp_contact);
        }
      })
      .catch(() => {});
  }, []);

  // Available Roles
  const AVAILABLE_ROLES = [
    "Pengurus Pondok (Penasihat)",
    "Pengurus Pondok (Dewan Harian)",
    "Pengurus Pondok (Dewan Pleno)",
    "Pengurus Madrasah (Penasihat)",
    "Pengurus Madrasah (Dewan Harian)",
    "Pengurus Madrasah (Dewan Pleno)",
    "Mustahiq",
    "Mufattisy",
    "Mundzir",
    "Keamanan",
    "Sekretariat",
    "Wali Santri",
  ];

  // Users from API
  const { data: users = [], isLoading, createUser, isCreating, deleteUser, isDeleting, resetPassword, isResetting } = useUsers(searchQuery || undefined);

  // People without accounts (for Generate tab)
  const [peopleWithoutAccounts, setPeopleWithoutAccounts] = useState<PersonWithoutAccount[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [customRoles, setCustomRoles] = useState<Record<string, string>>({});
  const [generatedCredentials, setGeneratedCredentials] = useState<Array<{ name: string; username: string; password: string; role: string; phone?: string }>>([]);

  const { toast } = useToast();

  // Reset password modal
  const [resetModal, setResetModal] = useState<{ userId: string; username: string; personPhone?: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch people without accounts when Generate tab is opened
  useEffect(() => {
    if (activeTab === "generate") {
      fetchPeopleWithoutAccounts();
    }
  }, [activeTab]);

  const fetchPeopleWithoutAccounts = async () => {
    setLoadingPeople(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/admin/people?role=without_account&limit=100`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
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

  const handleToggleSelect = (personId: string) => {
    setSelectedPeople((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPeople.length === peopleWithoutAccounts.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(peopleWithoutAccounts.map((p) => p.id));
    }
  };

  const handleRoleChange = (personId: string, role: string) => {
    setCustomRoles((prev) => ({ ...prev, [personId]: role }));
  };

  const handleGenerateAccounts = async () => {
    const toGenerate = peopleWithoutAccounts.filter((p) => selectedPeople.includes(p.id));
    const results: Array<{ name: string; username: string; password: string; role: string; phone?: string }> = [];

    for (const person of toGenerate) {
      const username = person.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
      const password = "mphm" + Math.random().toString(36).slice(2, 8);
      const targetRole = customRoles[person.id] || person.suggestedRole || "Mustahiq";

      try {
        await createUser({
          personId: person.id,
          username,
          password,
          role: targetRole,
        });
        results.push({
          name: person.fullName,
          username,
          password,
          role: targetRole,
          phone: person.phoneNumber,
        });
      } catch {
        // Skip failed ones
      }
    }

    setGeneratedCredentials(results);
    setSelectedPeople([]);
    if (results.length > 0) {
      toast(`${results.length} akun berhasil di-generate!`, "success", "Berhasil");
      fetchPeopleWithoutAccounts();
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
    if (confirm(`Apakah Anda yakin ingin menghapus akun "${username}"? Akun ini akan dipindahkan ke Keranjang Sampah.`)) {
      try {
        await deleteUser(userId);
        toast(`Akun ${username} telah berhasil dihapus.`, "success", "Berhasil");
      } catch {
        toast("Gagal menghapus akun pengguna.", "error", "Gagal");
      }
    }
  };

  const sendWhatsAppCredentials = (name: string, username: string, password: string = "mphm123 / default", phone?: string) => {
    const targetPhone = (phone || "").replace(/[^0-9]/g, "") || systemWa.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nBerikut kredensial login akun MPHM Enterprise Anda:\n\nNama Akun: ${name}\nUsername: ${username}\nPassword Default: ${password}\n\nCatatan: Harap mengganti password saat pertama kali masuk, dan harap diingat.\nJika memiliki kendala silahkan hubungi kami.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${targetPhone}?text=${message}`, "_blank");
  };

  // Filtered + paginated users
  const filteredUsers = users.filter((u: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      (u.fullName || u.personName || "").toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [pageSize, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-800 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 z-10 flex-1">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Akses & Otorisasi Pengguna</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Pusat Pengelolaan Akun (Users)
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl leading-relaxed">
            Atur kredensial akun Pengurus (Penasihat, Harian, Pleno), Mustahiq, Mufattisy, Mundzir, dan Wali Santri. Akun yang tidak digunakan {`>`} 6 Bulan akan otomatis dinonaktifkan.
          </p>
        </div>

        {/* WhatsApp Support Counter Badge */}
        <div className="z-10 flex items-center shrink-0">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-3">
            <Phone className="w-6 h-6 text-emerald-300" />
            <div>
              <div className="text-xs text-blue-100 font-semibold">WA Bantuan Sistem</div>
              <div className="text-sm font-mono font-bold text-white">+{systemWa}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "all" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Users className="w-4 h-4" /> Daftar Akun (Monitoring)
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "generate" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Generate Akun Instansi
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "trash" ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-sm" : "text-zinc-500 hover:text-rose-600"
          }`}
        >
          <Trash2 className="w-4 h-4" /> Keranjang Sampah Dorman (&gt;6 Bulan)
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {/* ===== TAB: DAFTAR AKUN ===== */}
        {activeTab === "all" && (
          <div className="flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari username, nama person, atau role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Nama Person & Kontak WA</th>
                    <th className="px-4 py-3 text-left">Role Akses</th>
                    <th className="px-4 py-3 text-left">Status Akun</th>
                    <th className="px-4 py-3 text-left">Aktivitas</th>
                    <th className="px-4 py-3 text-right">Aksi Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500">Memuat data pengguna...</td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500">Tidak ada pengguna ditemukan.</td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 text-left font-mono font-medium text-blue-600 dark:text-blue-400">
                          {user?.username}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {user?.personName || user?.fullName || user?.username || "-"}
                          </div>
                          {user?.personPhone && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {user.personPhone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-xs font-semibold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            (user.status === "ACTIVE" || user.isActive)
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {(user.status === "ACTIVE" || user.isActive) ? 'Aktif' : 'Non-Aktif (>6 bln)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          {user.isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              <span className="w-2 h-2 rounded-full bg-zinc-400" /> Offline
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Tombol WA Kirim Kredensial */}
                            <button
                              onClick={() => sendWhatsAppCredentials(user?.personName || user?.username, user.username, "mphm123", user.personPhone)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Kirim Kredensial via WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {/* Tombol Reset Password */}
                            <button
                              onClick={() => setResetModal({ userId: user.id, username: user.username, personPhone: user.personPhone })}
                              className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Reset Password Akun"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Tombol Hapus Akun (Soft Delete) */}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={isDeleting}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
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

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span>Tampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>baris</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Halaman <strong className="text-zinc-900 dark:text-zinc-200">{pageIndex + 1}</strong> dari{" "}
                  <strong className="text-zinc-900 dark:text-zinc-200">{totalPages}</strong>
                </span>

                <button
                  onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                  disabled={pageIndex >= totalPages - 1}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: GENERATE AKUN ===== */}
        {activeTab === "generate" && (
          <div className="flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Generator Kredensial Akun Instansi & Pengurus</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Pilih Pengurus (Penasihat, Harian, Pleno), Mustahiq, atau Mufattisy yang belum memiliki akun untuk diterbitkan login massal.
                </p>
              </div>
              <button
                onClick={fetchPeopleWithoutAccounts}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer w-fit"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Data
              </button>
            </div>

            {/* Generated Credentials Result */}
            {generatedCredentials.length > 0 && (
              <div className="p-5 m-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{generatedCredentials.length} Akun Berhasil Di-Generate!</span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Klik ikon WA untuk langsung mengirim kredensial</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-zinc-500 border-b border-emerald-200 dark:border-emerald-800">
                        <th className="px-3 py-2">Nama Akun</th>
                        <th className="px-3 py-2">Username</th>
                        <th className="px-3 py-2">Password Default</th>
                        <th className="px-3 py-2">Role Diterbitkan</th>
                        <th className="px-3 py-2 text-right">Aksi WA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900">
                      {generatedCredentials.map((cred, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium">{cred.name}</td>
                          <td className="px-3 py-2 font-mono text-blue-600 dark:text-blue-400">{cred.username}</td>
                          <td className="px-3 py-2 font-mono text-rose-600 dark:text-rose-400">{cred.password}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded text-xs font-semibold">
                              {cred.role}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => sendWhatsAppCredentials(cred.name, cred.username, cred.password, cred.phone)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Kirim WA
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* People without accounts list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPeople.length === peopleWithoutAccounts.length && peopleWithoutAccounts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Nama Lengkap Person</th>
                    <th className="px-4 py-3 text-left">Gender</th>
                    <th className="px-4 py-3 text-left">Pilih Role Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loadingPeople ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-zinc-500">Memuat data personel...</td>
                    </tr>
                  ) : peopleWithoutAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-zinc-500">
                        Semua pengurus & pengajar sudah memiliki akun. Tidak ada yang perlu di-generate.
                      </td>
                    </tr>
                  ) : (
                    peopleWithoutAccounts.map((person) => (
                      <tr key={person.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPeople.includes(person.id)}
                            onChange={() => handleToggleSelect(person.id)}
                            className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                          {person.fullName}
                          {person.phoneNumber && (
                            <span className="block text-xs font-mono text-zinc-400">WA: {person.phoneNumber}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{person.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
                        <td className="px-4 py-3">
                          <select
                            value={customRoles[person.id] || person.suggestedRole || "Mustahiq"}
                            onChange={(e) => handleRoleChange(person.id, e.target.value)}
                            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                          >
                            {AVAILABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Generate Button */}
            {selectedPeople.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={handleGenerateAccounts}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {isCreating ? "Memproses..." : `Generate ${selectedPeople.length} Akun Sekarang`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: KERANJANG SAMPAH DORMAN ===== */}
        {activeTab === "trash" && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-4 text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Keranjang Sampah Dorman (&gt;6 Bulan)</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Akun yang tidak pernah login lebih dari 6 Bulan otomatis dinonaktifkan oleh sistem. Saat pengguna mencoba masuk, sistem akan menolak login dan menampilkan kontak WhatsApp Sekretariat (<strong>+{systemWa}</strong>) untuk konfirmasi aktivasi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setResetModal(null)}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Reset Password: <span className="text-blue-600 dark:text-blue-400 font-mono">{resetModal.username}</span>
            </h3>
            <p className="text-xs text-zinc-500">Masukkan kata sandi baru untuk akun pengguna ini.</p>
            <input
              type="text"
              placeholder="Password baru (contoh: mphm123)..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setResetModal(null); setNewPassword(""); }}
                className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || isResetting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
              >
                {isResetting ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
