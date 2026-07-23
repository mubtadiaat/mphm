"use client";

import { useState } from "react";
import { Search, ShieldAlert, User, Home, BookOpen, Phone, MapPin, UserCheck, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSantri, Santri } from "@/features/sekretariat/queries/useSantri";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useRouter } from "next/navigation";

export default function KeamananSantriPage() {
  const { selectedYearId } = useAcademicYear();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Load students dataset for search lookup
  const { data: santriRes, isLoading } = useSantri(selectedYearId, 0, 500, searchQuery, "aktif");
  const studentList: Santri[] = santriRes?.data || [];

  // Strictly filter for matching student
  const filteredStudents = searchQuery.trim()
    ? studentList.filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.stambuk || "").toLowerCase().includes(q) ||
          (s.nis || "").toLowerCase().includes(q)
        );
      })
    : [];

  // Pick exactly 1 selected student for view
  const targetStudent: Santri | null = filteredStudents.length > 0 ? filteredStudents[0] : null;

  return (
    <div className="flex flex-col gap-6 mt-4 max-w-4xl mx-auto pb-12">
      {/* Banner Header Keamanan */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-rose-600 via-rose-700 to-amber-700 border border-rose-500/30 rounded-2xl text-white shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Mode Keamanan & Pengawasan (Single Lookup)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pencarian Data Santri
          </h1>
          <p className="text-rose-100/90 text-sm max-w-xl leading-relaxed">
            Pencarian khusus petugas keamanan. Cari berdasarkan Nama Lengkap, Nomor Stambuk, atau NIS untuk menampilkan detail 1 data santri.
          </p>
        </div>
      </div>

      {/* Input Pencarian Utama */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
        <input
          type="text"
          placeholder="Ketik Nama Lengkap, Nomor Stambuk, atau NIS Santri..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-rose-500/30 dark:border-rose-500/20 rounded-2xl text-base font-medium shadow-md focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all text-zinc-900 dark:text-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Suggestion list if multiple match */}
      {searchQuery.trim() && filteredStudents.length > 1 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
            Ditemukan {filteredStudents.length} santri. Pilih salah satu untuk menampilkan detail:
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSearchQuery(s.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  targetStudent?.id === s.id
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {s.name} ({s.stambuk})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content View */}
      {!searchQuery.trim() ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Masukkan Kata Kunci Pencarian</h3>
            <p className="text-sm text-zinc-500">
              Ketikkan nama santriwati atau stambuk pada kolom pencarian di atas untuk menampilkan detail 1 anak yang dicari.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading */
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">Mencari data santri...</p>
        </div>
      ) : !targetStudent ? (
        /* Not Found */
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs flex flex-col items-center gap-3">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Data Santri Tidak Ditemukan</h3>
          <p className="text-sm text-zinc-500 max-w-md">
            Tidak ada data santriwati yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Silakan periksa kembali nama atau nomor stambuk.
          </p>
        </div>
      ) : (
        /* SINGLE STUDENT CARD RESULT */
        <div className="bg-white dark:bg-zinc-900 border-2 border-rose-500/30 rounded-2xl overflow-hidden shadow-lg space-y-6 p-6 sm:p-8">
          {/* Header Badge & Profile Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-rose-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {targetStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" /> Santriwati Aktif
                  </span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                  {targetStudent.name}
                </h2>
                <p className="text-sm font-mono text-zinc-500">
                  Stambuk: <strong className="text-rose-600 dark:text-rose-400">{targetStudent.stambuk}</strong> | NIS: {targetStudent.nis || "-"}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => router.push(`/keamanan/jurnal?studentId=${targetStudent.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-4 h-4" /> Catat Pelanggaran <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Data Akademik & Diniyyah */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Akademik & Kelas Diniyyah</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-1.5">
                  <span className="text-zinc-500">Kelas Rombel:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{targetStudent.class || (targetStudent as any).className || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-1.5">
                  <span className="text-zinc-500">Mustahiq (Wali Kelas):</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetStudent.mustahiq || (targetStudent as any).mustahiqName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tahun Angkatan:</span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{targetStudent.enrollmentYear || "2026"}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Data Asrama & Pengasuhan */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Home className="w-4 h-4" />
                <span>Domisili Asrama Pondok</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-1.5">
                  <span className="text-zinc-500">Kamar & Blok:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{(targetStudent as any).roomName || (targetStudent as any).room || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status Tempat Tinggal:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mukim di Pondok</span>
                </div>
              </div>
            </div>

            {/* Box 3: Data Wali Santri */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <UserCheck className="w-4 h-4" />
                <span>Informasi Wali & Kontak Darurat</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-zinc-400 block">Nama Orang Tua / Wali:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{targetStudent.guardianName || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">No. WhatsApp Wali:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {targetStudent.guardianPhone || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-zinc-400 block">Alamat Domisili Asal:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {targetStudent.address || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
