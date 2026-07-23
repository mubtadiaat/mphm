import { useState } from "react";
import { Layers, ArrowLeft, Users, AlertCircle, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataKelasGrid } from "./DataKelasGrid";
import { useClassDetails } from "../queries/useClasses";

interface KelasTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function KelasTab({ isReadOnly = false, selectedYearId }: KelasTabProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<any | null>(null);

  // Fetch class details if a class is selected
  const { data: detailData, isLoading: detailLoading } = useClassDetails(selectedClassId || "");

  if (selectedClassId) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 mt-4">
        {/* Back Button and Premium Banner */}
        <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 dark:border-teal-500/10 rounded-2xl flex flex-col gap-6 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={() => setSelectedClassId(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-bold w-fit z-10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Kelas</span>
          </button>

          <div className="flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-2 text-teal-650 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Detail Rombongan Belajar (Rombel)</span>
            </div>
            {detailLoading ? (
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white animate-pulse">
                Memuat data kelas...
              </h1>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {detailData?.class?.name}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl mt-1">
                  Mustahiq (Wali Kelas): <span className="font-bold text-zinc-900 dark:text-white">{detailData?.class?.mustahiq}</span> | Pengawas (Mufattisy): <span className="font-bold text-zinc-900 dark:text-white">{detailData?.class?.mufattisy}</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Enrolled Students Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              Daftar Santri Terdaftar
            </h3>
            <span className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-600">
              Total: {detailLoading ? "..." : (detailData?.students?.length || 0)}
            </span>
          </div>

          {detailLoading ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat daftar santri...</div>
          ) : !detailData?.students || detailData.students.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3 text-zinc-500">
              <AlertCircle className="w-10 h-10 opacity-35 text-amber-500" />
              <p className="text-sm font-semibold">Belum ada santri terdaftar di kelas ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 text-left">No</th>
                    <th className="px-5 py-3 text-left">Nama Santri</th>
                    <th className="px-5 py-3 text-left">NIS</th>
                    <th className="px-5 py-3 text-left">NISN</th>
                    <th className="px-5 py-3 text-left">Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {detailData.students.map((student, i) => (
                    <tr 
                      key={student.studentId} 
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => setViewingDetail(student)}
                    >
                      <td className="px-5 py-3.5 text-left text-zinc-500 font-mono">{i + 1}</td>
                      <td className="px-5 py-3.5 text-left font-bold text-zinc-900 dark:text-white">{student.fullName}</td>
                      <td className="px-5 py-3.5 text-left font-mono text-xs">{student.nis || "-"}</td>
                      <td className="px-5 py-3.5 text-left font-mono text-xs">{student.nisn || "-"}</td>
                      <td className="px-5 py-3.5 text-left">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.gender === "L" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"}`}>
                          Perempuan
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {viewingDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewingDetail(null)} />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                  <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-500" />
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
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                        <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Jenis Kelamin</td>
                        <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">Perempuan</td>
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 dark:border-teal-500/10 rounded-2xl flex flex-col justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-teal-650 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Manajemen Pendidikan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Kelas & Rombel
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Administrasi pembagian kelas rombongan belajar (rombel) yang terintegrasi.
          </p>
        </div>
      </div>

      {/* Render DataKelasGrid directly */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <DataKelasGrid 
          onViewDetail={(cls) => setSelectedClassId(String(cls.id))} 
          isReadOnly={isReadOnly} 
          selectedYearId={selectedYearId} 
        />
      </div>
    </div>
  );
}
