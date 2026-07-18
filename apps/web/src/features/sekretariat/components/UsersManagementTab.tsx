"use client";

import { useState } from "react";
import { Users, Trash2, KeyRound } from "lucide-react";
import { useUsers } from "../queries/useUsers";

export function UsersManagementTab() {
  const [activeTab, setActiveTab] = useState<"all" | "generate" | "validate" | "trash">("all");

  const { data: users = [], isLoading } = useUsers();

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

      {/* Tab Content Placeholder */}
      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        {activeTab === "all" && (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl text-left">Username</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 rounded-tr-xl text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-500">Memuat data pengguna...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-500">Tidak ada pengguna.</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 font-medium">{user.username}</td>
                        <td className="px-4 py-3">{user.fullName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-semibold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                            {user.isActive ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors">
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
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

        {activeTab !== "all" && (          <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-zinc-500">
            {activeTab === "generate" && <KeyRound className="w-12 h-12 opacity-20" />}
            {activeTab === "trash" && <Trash2 className="w-12 h-12 opacity-20" />}
            
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-2">
              Modul {activeTab === "generate" ? "Generator Kredensial" : "Keranjang Sampah"}
            </h3>
            <p className="text-sm max-w-sm mx-auto">
              {activeTab === "generate" ? "Formulir cepat untuk mencetak akun Mustahiq, Mufattisy, dan Mundzir baru secara massal." : ""}
              {activeTab === "trash" ? "Daftar akun yang dorman (tidak pernah login > 1 tahun) yang telah dipindahkan otomatis oleh sistem." : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
