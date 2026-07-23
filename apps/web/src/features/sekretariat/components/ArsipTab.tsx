"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Archive, FolderOpen, X } from "lucide-react";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAcademicYears } from "@/features/sekretariat/queries/useAcademicYears";
import { useArsipSiswa, useArsipKelas, useArsipNilai, useArsipPelanggaran } from "../queries/useArsip";
import { useToast } from "@/components/shared/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Data diambil dari API melalui custom hooks di useArsip.ts

export function ArsipTab() {
  const { data: years = [] } = useAcademicYears();
  const { toast } = useToast();
  
  const closedYears = years.filter((y) => !y.isActive || y.isClosed);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"siswa" | "kelas" | "nilai" | "pelanggaran">("siswa");
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const { data: siswaData, isLoading: siswaLoading } = useArsipSiswa(selectedYearId);
  const { data: kelasData, isLoading: kelasLoading } = useArsipKelas(selectedYearId);
  const { data: nilaiData, isLoading: nilaiLoading } = useArsipNilai(selectedYearId);
  const { data: pelanggaranData, isLoading: pelanggaranLoading } = useArsipPelanggaran(selectedYearId);

  useEffect(() => {
    if (closedYears.length > 0 && !selectedYearId) {
      // Auto select the first closed/inactive year asynchronously to avoid cascading renders
      const timer = setTimeout(() => {
        setSelectedYearId(closedYears[0].id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [closedYears, selectedYearId]);

  const selectedYearObj = years.find((y) => y.id === selectedYearId);

  const handleYearChange = (id: string) => {
    setSelectedYearId(id);
    toast(`Berhasil memuat arsip tahun akademik ${years.find(y => y.id === id)?.name}`, "success", "Arsip Dimuat");
  };

  // 1. Columns definitions
  const studentCols: ColumnDef<Record<string, unknown>, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Lengkap",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{String(info.getValue())}</span>
    },
    {
      accessorKey: "stambuk",
      header: "Nomor Stambuk",
      cell: (info) => <span className="font-mono text-zinc-600 dark:text-zinc-400 font-semibold">{String(info.getValue())}</span>
    },
    {
      accessorKey: "class",
      header: "Kelas (Histori)",
      cell: (info) => <span className="font-semibold text-zinc-700 dark:text-zinc-300">{String(info.getValue())}</span>
    },
    {
      accessorKey: "status",
      header: "Status Akhir",
      cell: (info) => {
        const val = String(info.getValue());
        return (
          <PillBadge
            label={val}
            variant={val === "GRADUATED" || val === "PROMOTED" ? "success" : val === "BOYONG" ? "info" : "danger"}
          />
        );
      }
    }
  ];

  const classCols: ColumnDef<Record<string, unknown>, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Rombel",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{String(info.getValue())}</span>
    },
    {
      accessorKey: "mustahiq",
      header: "Wali Kelas",
      cell: (info) => <span className="font-medium text-zinc-750 dark:text-zinc-300">{String(info.getValue())}</span>
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas Rombel",
      cell: (info) => <span className="font-semibold">{String(info.getValue())} Siswi</span>
    },
    {
      accessorKey: "studentCount",
      header: "Jumlah Siswi",
      cell: (info) => <span className="font-semibold text-blue-600 dark:text-blue-400">{String(info.getValue())} Terdaftar</span>
    }
  ];

  const scoreCols: ColumnDef<Record<string, unknown>, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Lengkap",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{String(info.getValue())}</span>
    },
    {
      accessorKey: "tauhid",
      header: "Tauhid",
      cell: (info) => <span className="font-semibold">{String(info.getValue())}</span>
    },
    {
      accessorKey: "fiqih",
      header: "Fiqih",
      cell: (info) => <span className="font-semibold">{String(info.getValue())}</span>
    },
    {
      accessorKey: "arab",
      header: "Bahasa Arab",
      cell: (info) => <span className="font-semibold">{String(info.getValue())}</span>
    },
    {
      accessorKey: "quran",
      header: "Al-Qur'an",
      cell: (info) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{String(info.getValue())}</span>
    }
  ];

  const violationCols: ColumnDef<Record<string, unknown>, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Santri",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{String(info.getValue())}</span>
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: (info) => <span className="font-semibold">{String(info.getValue())}</span>
    },
    {
      accessorKey: "severity",
      header: "Tingkat Keparahan",
      cell: (info) => {
        const val = String(info.getValue());
        return (
          <PillBadge
            label={val}
            variant={val === "Ringan" ? "info" : val === "Sedang" ? "warning" : "danger"}
          />
        );
      }
    },
    {
      accessorKey: "date",
      header: "Tanggal Insiden",
      cell: (info) => <span className="font-mono text-xs">{String(info.getValue())}</span>
    },
    {
      accessorKey: "desc",
      header: "Keterangan",
      cell: (info) => <span className="text-zinc-555 dark:text-zinc-400 text-xs italic">{String(info.getValue())}</span>
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-zinc-550/15 via-slate-500/5 to-transparent border border-zinc-500/20 dark:border-zinc-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-zinc-650 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Archive className="w-4 h-4" />
            <span>Database Arsip Abadi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Arsip Akademik Pesantren
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Tinjau seluruh riwayat santri, kelas, nilai kwartal, dan catatan pelanggaran dari tahun-tahun ajaran masa lampau.
          </p>
        </div>

        {/* Year Selector Dropdown */}
        <div className="flex flex-col gap-1.5 z-10 shrink-0 w-full sm:w-64">
          <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tahun Akademik Arsip</label>
          <select
            value={selectedYearId}
            onChange={(e) => handleYearChange(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-zinc-100 font-semibold cursor-pointer"
          >
            {closedYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.isActive ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("siswa")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "siswa" ? "border-blue-650 text-blue-650 dark:text-blue-400" : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-800"}`}
        >
          Santriwati Terdaftar
        </button>
        <button
          onClick={() => setActiveTab("kelas")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "kelas" ? "border-blue-650 text-blue-650 dark:text-blue-400" : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-800"}`}
        >
          Kelas & Rombel
        </button>
        <button
          onClick={() => setActiveTab("nilai")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "nilai" ? "border-blue-650 text-blue-650 dark:text-blue-400" : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-800"}`}
        >
          Penilaian Kwartal
        </button>
        <button
          onClick={() => setActiveTab("pelanggaran")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "pelanggaran" ? "border-blue-650 text-blue-650 dark:text-blue-400" : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-800"}`}
        >
          Catatan Pelanggaran
        </button>
      </div>

      {/* Archive Grid Content */}
      <div className="space-y-4">
        {selectedYearObj ? (
          <div>
            {activeTab === "siswa" && (
              <UniversalDataGrid
                columns={studentCols}
                data={siswaData || []}
                loading={siswaLoading}
                pageCount={1}
                pageIndex={0}
                pageSize={10}
                onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
                tableName="arsip_santri"
                importExportProps={{
                  title: `Arsip Historis Santriwati Terdaftar - Tahun Akademik ${selectedYearObj.name}`,
                  headers: ["Nama Lengkap Santriwati", "Nomor Stambuk", "Kelas (Riwayat Historis)", "Status Keaktifan Akhir"],
                  disableImport: true
                }}
              />
            )}
            {activeTab === "kelas" && (
              <UniversalDataGrid
                columns={classCols}
                data={kelasData || []}
                loading={kelasLoading}
                pageCount={1}
                pageIndex={0}
                pageSize={10}
                onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
                tableName="arsip_kelas"
                importExportProps={{
                  title: `Arsip Rombongan Belajar dan Kelas Diniyyah - Tahun Akademik ${selectedYearObj.name}`,
                  headers: ["Nama Rombongan Belajar", "Nama Mustahiq Wali Kelas", "Kapasitas Rombel", "Jumlah Siswi Active"],
                  disableImport: true
                }}
              />
            )}
            {activeTab === "nilai" && (
              <UniversalDataGrid
                columns={scoreCols}
                data={nilaiData || []}
                loading={nilaiLoading}
                pageCount={1}
                pageIndex={0}
                pageSize={10}
                onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
                tableName="arsip_nilai"
                importExportProps={{
                  title: `Arsip Nilai Kwartal Diniyyah - Tahun Akademik ${selectedYearObj.name}`,
                  headers: ["Nama Lengkap Santriwati", "Nilai Aqidah/Tauhid", "Nilai Fiqih", "Nilai Shorof/Nahwu", "Nilai Akhlaq"],
                  disableImport: true
                }}
              />
            )}
            {activeTab === "pelanggaran" && (
              <UniversalDataGrid
                columns={violationCols}
                data={pelanggaranData || []}
                loading={pelanggaranLoading}
                pageCount={1}
                pageIndex={0}
                pageSize={10}
                onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
                tableName="arsip_pelanggaran"
                importExportProps={{
                  title: `Arsip Pelanggaran dan Takzir Santriwati - Tahun Akademik ${selectedYearObj.name}`,
                  headers: ["Nama Lengkap Santriwati", "Kategori Kedisiplinan", "Tingkat Keparahan", "Tanggal Pelanggaran", "Keterangan Takzir"],
                  disableImport: true
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Tidak Ada Data Arsip</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Silakan pilih Tahun Akademik lampau pada dropdown di atas untuk memuat riwayat data.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDetailData(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Archive className="w-5 h-5 text-indigo-500" />
                  Detail Arsip Data
                </h3>
                <button onClick={() => setDetailData(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(detailData).filter(([key]) => !key.toLowerCase().includes("id") && key !== "avatarUrl").map(([key, val]) => (
                      <tr key={key} className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                        <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 capitalize w-1/3 text-left">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                        <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">
                          {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "-")}
                        </td>
                      </tr>
                    ))}
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
