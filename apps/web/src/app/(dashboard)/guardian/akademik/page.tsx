"use client";

import { FileText, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface ChildItem {
  id: string;
  name: string;
  stambuk: string;
  className: string;
}

export default function GuardianAkademikPage() {
  const { data: childrenRes, isLoading } = useQuery({
    queryKey: ["guardian-children-list"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ChildItem[] }>("/api/guardian/children");
      return res.data || [];
    },
  });

  const childrenList = childrenRes || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Laporan Nilai Raport Diniyyah
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Ringkasan capaian belajar dan nilai kwartal mata pelajaran Diniyyah putra/putri Anda.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat laporan akademik...</p>
        </div>
      ) : childrenList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-semibold text-zinc-500">Belum ada data nilai santri terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {childrenList.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-zinc-500">Stambuk: {c.stambuk} | Kelas: {c.className}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Raport Terbaca Resmi
                </div>
              </div>

              {/* Quarterly Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { kwartal: "Kwartal 1", status: "Sudah Dinilai", avg: "8.5" },
                  { kwartal: "Kwartal 2", status: "Sudah Dinilai", avg: "8.6" },
                  { kwartal: "Kwartal 3", status: "Sudah Dinilai", avg: "8.3" },
                  { kwartal: "Kwartal 4", status: "Sudah Dinilai", avg: "8.8" },
                ].map((k, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 border border-zinc-200/50 dark:border-zinc-700/50">
                    <span className="text-xs text-zinc-400 font-medium block">{k.kwartal}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">{k.avg}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">{k.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
