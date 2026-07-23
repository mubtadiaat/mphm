"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Users, Layers, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentInfo {
  studentId: string;
  fullName: string;
  nis: string;
  nisn?: string;
}

interface MyClassDetail {
  class: {
    id: string;
    fullName: string;
    institutionLevel: string;
    capacity: number;
  };
  students: StudentInfo[];
}

export function MustahiqKelasDetail() {
  const [viewingDetail, setViewingDetail] = useState<StudentInfo | null>(null);

  const { data: myClass, isLoading, isError } = useQuery({
    queryKey: ["mustahiq-my-class"],
    queryFn: async () => {
      const res = await apiRequest<{ data: MyClassDetail }>("/api/mustahiq/class/my-class");
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat data kelas Anda...</div>;
  }

  if (isError || !myClass) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center gap-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-900/30 text-rose-600">
        <AlertCircle className="w-12 h-12 opacity-50" />
        <h3 className="font-bold text-lg">Kelas Tidak Ditemukan</h3>
        <p className="text-sm opacity-80 max-w-sm">Anda belum ditugaskan ke kelas manapun pada tahun ajaran aktif ini. Hubungi Sekretariat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Kelas Yang Diampu</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {myClass?.class?.fullName || "Kelas Diniyyah"}
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Tingkat: {myClass?.class?.institutionLevel || "-"} | Kapasitas: {myClass?.class?.capacity || 0} Santri
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            Daftar Santri Kelas Ini
          </h3>
          <span className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-600">
            Total: {myClass.students?.length || 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama Santri</th>
                <th className="px-4 py-3 text-left">NIS</th>
                <th className="px-4 py-3 text-left">NISN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {myClass.students?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-500">Belum ada santri terdaftar di kelas ini.</td>
                </tr>
              ) : (
                myClass.students.map((student: StudentInfo, i: number) => (
                  <tr 
                    key={student.studentId} 
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                    onClick={() => setViewingDetail(student)}
                  >
                    <td className="px-4 py-3 text-left text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-3 text-left font-medium">{student.fullName}</td>
                    <td className="px-4 py-3 text-left">{student.nis || '-'}</td>
                    <td className="px-4 py-3 text-left">{student.nisn || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewingDetail(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Detail Santri Kelas
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama Lengkap</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{viewingDetail.fullName || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">NIS</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{viewingDetail.nis || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">NISN</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{viewingDetail.nisn || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
