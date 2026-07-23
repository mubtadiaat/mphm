"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, ClipboardList, Lock, CalendarClock } from "lucide-react";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { ImportExportToolbar } from "@/components/shared/ImportExportToolbar";
import { useToast } from "@/components/shared/ToastContext";
import { getHijriDate } from "@/lib/hijri";

interface StudentAbsence {
  id: string;
  name: string;
  stambuk: string;
  sakit: number;
  izin: number;
  alfa: number;
}

const INITIAL_ABSENCES: StudentAbsence[] = [];

export default function RekapAbsensiPage() {
  const { toast } = useToast();
  const [data, setData] = useState<StudentAbsence[]>(INITIAL_ABSENCES);
  const [activeCell, setActiveCell] = useState<{ studentId: string; type: "sakit" | "izin" | "alfa" } | null>(null);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saved">("idle");
  const [selectedMonth, setSelectedMonth] = useState("Muharram 1448 H");

  const [showAttendance, setShowAttendance] = useState<boolean | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hijriInfo, setHijriInfo] = useState<{ day: number; monthName: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showMustahiqAttendance");
      queueMicrotask(() => setShowAttendance(saved !== "false"));
      
      const hijri = getHijriDate();
      queueMicrotask(() => {
        setHijriInfo({ day: hijri.day, monthName: hijri.monthName });
        // Lock if before the 23rd day of the Hijri month
        if (hijri.day < 23) {
          setIsLocked(true);
        }
      });
    }
  }, []);

  if (showAttendance === false) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl gap-4">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Akses Ditutup</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Modul perekapan absensi bulanan dinonaktifkan oleh Sekretariat melalui Pengaturan Pusat.
        </p>
      </div>
    );
  }

  const handleAbsenceChange = (studentId: string, type: "sakit" | "izin" | "alfa", value: string) => {
    if (isLocked) return;
    const num = parseInt(value) || 0;
    if (num < 0) return;

    setData(prev => prev.map(item => {
      if (item.id === studentId) {
        return { ...item, [type]: num };
      }
      return item;
    }));

    // Simulate auto save
    setSavingStatus("saved");
    toast("Perubahan absensi otomatis disimpan!", "success", "Auto-Save");
    setTimeout(() => setSavingStatus("idle"), 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>Presensi Kehadiran</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Rekap Absensi Bulanan
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Rekam dan sunting akumulasi ketidakhadiran santri per bulan Hijriyyah secara cepat dengan penyimpanan otomatis.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {isLocked && hijriInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-sm font-medium">
              <Lock className="w-4 h-4" />
              <span>
                Terkunci (Hari ke-{hijriInfo.day}). Pengisian absensi baru akan dibuka pada 7 hari terakhir bulan {hijriInfo.monthName}.
              </span>
            </div>
          )}
          {!isLocked && hijriInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium">
              <CalendarClock className="w-4 h-4" />
              <span>
                Terbuka (Hari ke-{hijriInfo.day}). Anda dapat mengisi rekap absensi untuk akhir bulan {hijriInfo.monthName}.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Hijri Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-semibold"
          >
            <option value="Muharram 1448 H">Muharram 1448 H</option>
            <option value="Safar 1448 H">Safar 1448 H</option>
            <option value="Rabi'ul Awwal 1448 H">Rabi&apos;ul Awwal 1448 H</option>
            <option value="Rabi'uts Tsani 1448 H">Rabi&apos;uts Tsani 1448 H</option>
          </select>

          {savingStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Tersimpan</span>
            </div>
          )}
        </div>
      </div>

      {/* Import/Export Toolbar */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-between items-center gap-4">
        <ImportExportToolbar
          title={`Rekap Absensi Bulanan - ${selectedMonth}`}
          headers={["Nama Santri", "Nomor Stambuk", "Sakit", "Izin", "Alfa"]}
          data={data.map(item => ({
            name: item.name,
            stambuk: item.stambuk,
            Sakit: item.sakit,
            Izin: item.izin,
            Alfa: item.alfa,
          }))}
          onImportSuccess={(importedRows) => {
            const mapped = data.map(student => {
              const row = importedRows.find(r => r["Nomor Stambuk"] === student.stambuk || r["Nama Santri"] === student.name);
              if (row) {
                return {
                  ...student,
                  sakit: parseInt(row["Sakit"]) || 0,
                  izin: parseInt(row["Izin"]) || 0,
                  alfa: parseInt(row["Alfa"]) || 0,
                };
              }
              return student;
            });
            setData(mapped);
            toast("Rekap absensi bulanan berhasil diimpor!", "success", "Import Data");
          }}
        />
      </div>

      {/* Grid Table */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 font-semibold text-left min-w-[200px]">Nama Santri</th>
              <th className="px-6 py-4 font-semibold text-center">Sakit</th>
              <th className="px-6 py-4 font-semibold text-center">Izin</th>
              <th className="px-6 py-4 font-semibold text-center">Alfa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {data.map(student => (
              <tr key={student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-200">
                  <IdentityCell name={student.name} stambuk={student.stambuk} />
                </td>
                
                {/* Sakit Input */}
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={student.sakit}
                    disabled={isLocked}
                    onFocus={() => setActiveCell({ studentId: student.id, type: "sakit" })}
                    onBlur={() => setActiveCell(null)}
                    onChange={(e) => handleAbsenceChange(student.id, "sakit", e.target.value)}
                    className={`w-20 text-center py-2 border rounded-xl focus:outline-none transition-all duration-150 ${
                      isLocked ? "bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed opacity-60" :
                      activeCell?.studentId === student.id && activeCell?.type === "sakit"
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                    } dark:text-zinc-100`}
                  />
                </td>

                {/* Izin Input */}
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={student.izin}
                    disabled={isLocked}
                    onFocus={() => setActiveCell({ studentId: student.id, type: "izin" })}
                    onBlur={() => setActiveCell(null)}
                    onChange={(e) => handleAbsenceChange(student.id, "izin", e.target.value)}
                    className={`w-20 text-center py-2 border rounded-xl focus:outline-none transition-all duration-150 ${
                      isLocked ? "bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed opacity-60" :
                      activeCell?.studentId === student.id && activeCell?.type === "izin"
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                    } dark:text-zinc-100`}
                  />
                </td>

                {/* Alfa Input */}
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={student.alfa}
                    disabled={isLocked}
                    onFocus={() => setActiveCell({ studentId: student.id, type: "alfa" })}
                    onBlur={() => setActiveCell(null)}
                    onChange={(e) => handleAbsenceChange(student.id, "alfa", e.target.value)}
                    className={`w-20 text-center py-2 border rounded-xl focus:outline-none transition-all duration-150 ${
                      isLocked ? "bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed opacity-60" :
                      activeCell?.studentId === student.id && activeCell?.type === "alfa"
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                    } dark:text-zinc-100`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
