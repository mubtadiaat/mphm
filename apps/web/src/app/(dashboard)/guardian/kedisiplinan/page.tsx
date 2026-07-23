"use client";

import { ShieldAlert, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface ChildItem {
  id: string;
  name: string;
  stambuk: string;
  className: string;
}

export default function GuardianKedisiplinanPage() {
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
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-rose-600 via-amber-600 to-indigo-600 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Portal Smart Wali Santri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Catatan & Ketertiban Kedisiplinan
          </h1>
          <p className="text-rose-100/90 text-sm max-w-xl">
            Laporan kepatuhan tata tertib pondok dan catatan kedisiplinan santri secara transparan.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat catatan kedisiplinan...</p>
        </div>
      ) : childrenList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-semibold text-zinc-500">Belum ada data santri terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {childrenList.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-lg flex items-center justify-center">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-zinc-500">Stambuk: {c.stambuk} | Kelas: {c.className}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Catatan Kedisiplinan Baik
                </div>
              </div>

              {/* Discipline Record Card */}
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col items-center justify-center text-center gap-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Tidak Ada Catatan Pelanggaran Pelanggaran</h4>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Alhamdulillah, santriwati senantiasa taat pada aturan madrasah dan tata tertib pondok pesantren.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
