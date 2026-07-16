"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, CheckCircle2, Calendar, CalendarDays, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAcademicYears, AcademicYear } from "@/features/sekretariat/queries/useAcademicYears";
import { useToast } from "@/components/shared/ToastContext";
import { getHijriDate } from "@/lib/hijri";

interface TahunAjaranTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function TahunAjaranTab({ onViewDetail, isReadOnly = false }: TahunAjaranTabProps) {
  const { data: remoteData, activateYear, createYear, updateYear, isLoading } = useAcademicYears();
  const [yearsData, setYearsData] = useState<AcademicYear[]>([]);
  const { toast } = useToast();

  const hijri = getHijriDate();
  // Sync with TanStack Query data
  useEffect(() => {
    if (remoteData) {
      queueMicrotask(() => {
        setYearsData(remoteData);
      });
    }
  }, [remoteData]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenAdd = () => {
    setEditingYear(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setName(year.name);
    setStartDate(year.startDate);
    setEndDate(year.endDate);
    setShowModal(true);
  };

  const handleActivate = async (id: string) => {
    try {
      await activateYear(id);
      toast("Tahun akademik berhasil diaktifkan!", "success", "Tahun Ajaran Aktif");
    } catch (_err) {
      toast("Gagal mengaktifkan tahun akademik", "error", "Gagal");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast("Harap lengkapi seluruh field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }

    try {
      if (editingYear) {
        await updateYear({ id: editingYear.id, name, startDate, endDate });
        toast("Tahun akademik berhasil diubah!", "success", "Data Diperbarui");
      } else {
        await createYear({ name, startDate, endDate });
        toast("Tahun akademik baru berhasil dibuat!", "success", "Data Ditambahkan");
      }
      setShowModal(false);
    } catch (_err) {
      toast(editingYear ? "Gagal mengubah data" : "Gagal membuat tahun akademik baru", "error", "Gagal");
    }
  };

  const columns: ColumnDef<AcademicYear, unknown>[] = [
    {
      accessorKey: "name",
      header: "Tahun Akademik",
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
        </div>
      )
    },
    {
      accessorKey: "startDate",
      header: "Tanggal Mulai",
      cell: (info) => <div className="text-center font-mono text-zinc-650 dark:text-zinc-400 font-semibold">{info.getValue() as string}</div>
    },
    {
      accessorKey: "endDate",
      header: "Tanggal Berakhir",
      cell: (info) => <div className="text-center font-mono text-zinc-655 dark:text-zinc-400 font-semibold">{info.getValue() as string}</div>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: (info) => (
        <div className="flex justify-center">
          <PillBadge
            label={info.getValue() ? "AKTIF" : "DRAFT"}
            variant={info.getValue() ? "success" : "info"}
          />
        </div>
      )
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (info) => {
        const row = info.row.original;
        if (isReadOnly) {
          return <div className="text-center"><span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium italic">Terarsip</span></div>;
        }
        
        return (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Edit
            </button>
            
            {row.isActive ? (
              <span className="px-3 py-1.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-default">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sedang Aktif
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivate(row.id);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
              >
                Aktifkan
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent border border-violet-500/20 dark:border-violet-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-violet-650 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Rotasi Kalender Pendidikan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Administrasi Tahun Ajaran
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Buat dan rotasi tahun ajaran baru, serta kunci transaksional akademik masa lampau.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">


          {!isReadOnly && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-violet-500/20"
            >
              <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
            </button>
          )}
        </div>
      </div>

      {/* Hijri Calendar Active/Transition Banners */}
      {hijri.month === 9 && !isReadOnly ? (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-amber-800 dark:text-amber-300 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-3 items-start z-10">
            <AlertCircle className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Masa Transisi & Finalisasi Akademik (Bulan Suci Ramadhan {hijri.year} H)</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Tahun ajaran saat ini telah berakhir. Seluruh data nilai kwartal dan kedisiplinan harus segera difinalisasi.
                Proses kenaikan kelas/kelulusan dapat dijalankan untuk mengarsipkan data sebelum bulan Syawal.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 z-10" />
          <div className="z-10">
            <h4 className="font-extrabold text-sm">Kalender Akademik Aktif (Bulan Syawal - Sya&apos;ban / Terpantau: {hijri.monthName} {hijri.year} H)</h4>
            <p className="text-xs text-zinc-655 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Sistem mendeteksi kalender operasional berjalan normal. Rollover otomatis akan dipicu saat memasuki bulan Ramadhan berikutnya.
            </p>
          </div>
        </div>
      )}

      {/* Grid Table */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={yearsData as unknown as Record<string, unknown>[]}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoading}
        onRowClick={(row) => onViewDetail?.(row as unknown as Record<string, unknown>)}
        tableName="tahun_ajaran"
        importExportProps={{
          title: "Tahun Ajaran & Akademik",
          headers: ["Tahun Akademik", "Tanggal Mulai", "Tanggal Berakhir", "Status Aktif"],
        }}
      />

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingYear ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {editingYear ? "Ubah detail tahun akademik yang dipilih." : "Definisikan kalender akademik dan periode operasional baru."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Tahun Akademik *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: 1447/1448 H (2026/2027)"
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tanggal Mulai Efektif *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tanggal Berakhir Efektif *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-colors cursor-pointer"
                  >
                    {editingYear ? "Simpan Perubahan" : "Daftarkan Tahun"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
