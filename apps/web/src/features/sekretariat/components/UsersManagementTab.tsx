"use client";

import { useState, useEffect } from "react";
import { Users, Trash2, KeyRound, Search, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw } from "lucide-react";
import { useUsers, UserAccount } from "../queries/useUsers";
import { useToast } from "@/components/shared/ToastContext";

interface PersonWithoutAccount {
  id: string;
  fullName: string;
  gender: string;
  suggestedRole: string;
}

export function UsersManagementTab() {
  const [activeTab, setActiveTab] = useState<"all" | "generate" | "trash">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // Users from API
  const { data: users = [], isLoading, createUser, isCreating, resetPassword, isResetting } = useUsers(searchQuery || undefined);

  // People without accounts (for Generate tab)
  const [peopleWithoutAccounts, setPeopleWithoutAccounts] = useState<PersonWithoutAccount[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [generatedCredentials, setGeneratedCredentials] = useState<Array<{ name: string; username: string; password: string; role: string }>>([]);

  const { toast } = useToast();

  // Reset password modal
  const [resetModal, setResetModal] = useState<{ userId: string; username: string } | null>(null);
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

  const handleGenerateAccounts = async () => {
    const toGenerate = peopleWithoutAccounts.filter((p) => selectedPeople.includes(p.id));
    const results: Array<{ name: string; username: string; password: string; role: string }> = [];

    for (const person of toGenerate) {
      const username = person.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
      const password = "mphm" + Math.random().toString(36).slice(2, 8);
      try {
        await createUser({
          personId: person.id,
          username,
          password,
          role: person.suggestedRole || "Mustahiq",
        });
        results.push({ name: person.fullName, username, password, role: person.suggestedRole || "Mustahiq" });
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

  // Reset page when pageSize changes
  useEffect(() => {
    setPageIndex(0);
  }, [pageSize, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10 flex-1">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Akses & Otorisasi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Pusat Pengelolaan Akun (Users)
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Atur seluruh kredensial akun sistem (Mustahiq, Mufattisy, Mundzir) dan validasi registrasi mandiri Wali Santri. Akun dorman {`>`} 1 tahun otomatis masuk ke Keranjang Sampah.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "all" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Users className="w-4 h-4" /> Daftar Akun (Monitoring)
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "generate" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Generate Akun Instansi
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "trash" ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-sm" : "text-zinc-500 hover:text-rose-600"
          }`}
        >
          <Trash2 className="w-4 h-4" /> Keranjang Sampah (1+ Tahun)
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        {/* ===== TAB: DAFTAR AKUN ===== */}
        {activeTab === "all" && (
          <div className="flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari username, nama, atau role..."
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
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-500">Memuat data pengguna...</td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-500">Tidak ada pengguna ditemukan.</td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 text-left font-medium">{user?.username}</td>
                        <td className="px-4 py-3 text-left">{user?.personName || user?.fullName || user?.username || "-"}</td>
                        <td className="px-4 py-3 text-left">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-semibold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            (user.status === "ACTIVE" || user.isActive) 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {(user.status === "ACTIVE" || user.isActive) ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setResetModal({ userId: user.id, username: user.username })}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
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
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Generator Kredensial Akun Instansi</h3>
                <p className="text-sm text-zinc-500 mt-1">Pilih orang yang belum memiliki akun untuk dibuatkan kredensial login.</p>
              </div>
              <button
                onClick={fetchPeopleWithoutAccounts}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Generated Credentials Result */}
            {generatedCredentials.length > 0 && (
              <div className="p-4 m-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{generatedCredentials.length} Akun Berhasil Di-Generate</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-zinc-500 border-b border-emerald-200 dark:border-emerald-800">
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Username</th>
                        <th className="px-3 py-2">Password</th>
                        <th className="px-3 py-2">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900">
                      {generatedCredentials.map((cred, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium">{cred.name}</td>
                          <td className="px-3 py-2 font-mono text-blue-600 dark:text-blue-400">{cred.username}</td>
                          <td className="px-3 py-2 font-mono text-rose-600 dark:text-rose-400">{cred.password}</td>
                          <td className="px-3 py-2">{cred.role}</td>
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
                        className="w-4 h-4 rounded border-zinc-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Nama Lengkap</th>
                    <th className="px-4 py-3 text-left">Gender</th>
                    <th className="px-4 py-3 text-left">Role yang Disarankan</th>
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
                        Semua personel sudah memiliki akun. Tidak ada yang perlu di-generate.
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
                            className="w-4 h-4 rounded border-zinc-300"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{person.fullName}</td>
                        <td className="px-4 py-3">{person.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-xs font-semibold">
                            {person.suggestedRole}
                          </span>
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
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {isCreating ? "Memproses..." : `Generate ${selectedPeople.length} Akun`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: KERANJANG SAMPAH ===== */}
        {activeTab === "trash" && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-zinc-500">
            <Trash2 className="w-12 h-12 opacity-20" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-2">Keranjang Sampah</h3>
            <p className="text-sm max-w-sm mx-auto">
              Daftar akun yang dorman (tidak pernah login &gt; 1 tahun) yang telah dipindahkan otomatis oleh sistem.
            </p>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setResetModal(null)}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4">
              Reset Password: {resetModal.username}
            </h3>
            <input
              type="text"
              placeholder="Password baru..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setResetModal(null); setNewPassword(""); }}
                className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || isResetting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm cursor-pointer"
              >
                {isResetting ? "Menyimpan..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
