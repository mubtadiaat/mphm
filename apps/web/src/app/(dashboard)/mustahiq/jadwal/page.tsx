"use client";

import { Calendar, BookOpen, Clock, Users, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  curriculumCategory: string;
}

export default function MustahiqJadwalPage() {
  const { data: classRes } = useQuery({
    queryKey: ["mustahiq-my-class-schedule"],
    queryFn: async () => {
      const res = await apiRequest<{ data: any }>("/api/mustahiq/class/my-class");
      return res.data;
    },
  });

  const { data: subjectsRes, isLoading } = useQuery({
    queryKey: ["mustahiq-subjects-list"],
    queryFn: async () => {
      const res = await apiRequest<{ data: SubjectItem[] }>("/api/admin/subjects");
      return res.data || [];
    },
  });

  const subjectList = subjectsRes || [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Portal Mustahiq (Wali Kelas)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Jadwal Mengajar & Kurikulum Diniyyah
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Rincian alokasi jam mengajar, fan kitab, dan jadwal pembelajaran kelas pengampuan.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Memuat jadwal mengajar...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">Kelas Pengampuan Aktif</span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {classRes?.name || "Kelas Diniyyah Aktif"}
              </h2>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terkonfirmasi Aktif
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectList.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-500/20">
                    {sub.curriculumCategory || "DINIYYAH"}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{sub.code || "KITAB"}</span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">{sub.name}</h3>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> Jam Diniyyah</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Pengajian Rutin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
