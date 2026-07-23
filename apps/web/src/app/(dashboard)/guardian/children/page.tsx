"use client";

import { Users, Search, CheckCircle2, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface ChildItem {
  id: string;
  name: string;
  nis: string;
  stambuk: string;
  gender: string;
  className: string;
}

export default function GuardianChildrenPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ["guardian-children-list"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ChildItem[] }>("/api/guardian/children");
      return res.data || [];
    },
  });

  const childrenList = childrenRes || [];
  const filteredChildren = childrenList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.stambuk || "").toLowerCase().includes(q) ||
      (c.nis || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-600 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Putra & Putri Terdaftar
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Informasi lengkap identitas, status akademik, dan kelas diniyyah anak yang berada di lingkungan pondok.
          </p>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama anak, stambuk, atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Children Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat data santri...</p>
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-semibold text-zinc-500">Tidak ada data santriwati yang cocok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChildren.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" /> Santriwati Aktif
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                    {c.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    Stambuk: <strong className="text-blue-600 dark:text-blue-400">{c.stambuk}</strong> | NIS: {c.nis}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                  <span className="text-zinc-400 font-medium block">Kelas Diniyyah</span>
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> {c.className}
                  </span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                  <span className="text-zinc-400 font-medium block">Status Domisili</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-500" /> Mukim Pondok
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
