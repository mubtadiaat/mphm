"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, ShieldAlert, Calendar, MapPin, AlertCircle, Settings2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { PillBadge } from "@/components/shared/PillBadge";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { useGlobalViolations, StudentViolation } from "@/features/sekretariat/queries/useGlobalViolations";
import { useViolationMaster } from "@/features/sekretariat/queries/useViolationMaster";
import { useSantri } from "@/features/sekretariat/queries/useSantri";
import { useToast } from "@/components/shared/ToastContext";

interface PelanggaranTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function PelanggaranTab({ onViewDetail, isReadOnly = false, selectedYearId }: PelanggaranTabProps) {
  const { data: violations = [], isLoading, createViolation } = useGlobalViolations(selectedYearId);
  const { types: initialTypes = [] } = useViolationMaster();
  const { data: santriResult } = useSantri(selectedYearId, 0, 1000);
  const santriList = santriResult?.data || [];

  const { toast } = useToast();

  // Dynamic Violation Master Points State
  const [customMasterTypes, setCustomMasterTypes] = useState<any[]>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("mphm_custom_violation_master") : null;
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "v1", name: "Terlambat Shalat Jamaah", category: "RINGAN", points: 5, severity: "LOW" },
      { id: "v2", name: "Keluar Komplek Tanpa Izin", category: "SEDANG", points: 20, severity: "MEDIUM" },
      { id: "v3", name: "Membawa Alat Elektronik Terlarang", category: "BERAT", points: 50, severity: "HIGH" },
      { id: "v4", name: "Pelanggaran Berat & Kabur", category: "TAKZIR", points: 100, severity: "CRITICAL" }
    ];
  });

  // Combine initial & custom
  const allViolationMaster = [...initialTypes, ...customMasterTypes.filter(c => !initialTypes.some(i => i.id === c.id))];

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedViolationTypeId, setSelectedViolationTypeId] = useState("");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [incidentTime, setIncidentTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Master Violation Form
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterCategory, setNewMasterCategory] = useState<"RINGAN" | "SEDANG" | "BERAT" | "TAKZIR">("RINGAN");
  const [newMasterPoints, setNewMasterPoints] = useState(5);

  // Add Master Violation Type
  const handleAddMasterType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) {
      toast("Nama Pelanggaran wajib diisi", "warning");
      return;
    }
    const newMaster = {
      id: `v_custom_${Date.now()}`,
      name: newMasterName.trim(),
      category: newMasterCategory,
      points: newMasterPoints,
      severity: newMasterCategory === "TAKZIR" ? "CRITICAL" : newMasterCategory === "BERAT" ? "HIGH" : newMasterCategory === "SEDANG" ? "MEDIUM" : "LOW"
    };

    const updated = [...customMasterTypes, newMaster];
    setCustomMasterTypes(updated);
    localStorage.setItem("mphm_custom_violation_master", JSON.stringify(updated));
    setNewMasterName("");
    setNewMasterPoints(5);
    toast(`Kategori & Poin Pelanggaran "${newMaster.name}" (${newMaster.points} Poin) berhasil disimpan!`, "success");
  };

  const handleDeleteMasterType = (id: string) => {
    const updated = customMasterTypes.filter(m => m.id !== id);
    setCustomMasterTypes(updated);
    localStorage.setItem("mphm_custom_violation_master", JSON.stringify(updated));
    toast("Aturan poin pelanggaran dihapus", "info");
  };

  const resetForm = () => {
    setSelectedStudentId("");
    setSelectedViolationTypeId("");
    setIncidentDate(new Date().toISOString().split("T")[0]);
    setIncidentTime("");
    setLocation("");
    setDescription("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedViolationTypeId || !incidentDate) {
      toast("Harap lengkapi santriwati, jenis pelanggaran, dan tanggal kejadian (*)", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await createViolation({
        studentId: selectedStudentId,
        violationTypeId: selectedViolationTypeId,
        academicYearId: selectedYearId || "",
        incidentDate,
        incidentTime: incidentTime || undefined,
        location: location || undefined,
        description: description || undefined,
      });
      toast("Catatan pelanggaran & Poin Takzir santriwati berhasil direkam!", "success");
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal merekam pelanggaran santriwati";
      toast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<StudentViolation, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Santriwati & Stambuk",
      cell: (info) => (
        <IdentityCell
          name={info.getValue() as string}
          subInfo={`Stambuk: ${info.row.original.stambuk} • Kelas: ${info.row.original.class || "-"}`}
          stambuk={info.row.original.stambuk}
        />
      ),
    },
    {
      accessorKey: "desc",
      header: "Jenis Pelanggaran & Poin Takzir",
      cell: (info) => (
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            {info.getValue() as string}
          </span>
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            Kategori: {info.row.original.category} • Poin: +{(info.row.original as any).points || 10}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Waktu & Lokasi Kejadian",
      cell: (info) => (
        <div className="flex flex-col text-left">
          <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400" />
            {info.getValue() as string} {info.row.original.time ? `• ${info.row.original.time}` : ""}
          </span>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400" />
            {info.row.original.location || "Lingkungan Pondok"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Takzir",
      cell: (info) => (
        <PillBadge
          label={info.getValue() as string === "APPROVED" ? "TERCATAT TAKZIR" : (info.getValue() as string)}
          variant={info.getValue() === "APPROVED" ? "danger" : "warning"}
        />
      ),
    },
    {
      id: "actions",
      header: "Aksi Management",
      cell: (info) => (
        <TableActions
          onMutasi={() => {
            if (onViewDetail) onViewDetail(info.row.original as unknown as Record<string, unknown>);
          }}
          isReadOnly={isReadOnly}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-rose-950/60 via-red-900/30 to-zinc-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>KEDISIPLINAN & POIN TAKZIR SANTRIWATI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Catatan Pelanggaran & Konfigurasi Poin
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl">
            Kelola bobot poin pelanggaran (Ringan, Sedang, Berat, Takzir) serta pencatatan kedisiplinan santriwati secara langsung di halaman ini.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-3 z-10 shrink-0">
            <button
              onClick={() => setShowMasterModal(true)}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Settings2 className="w-4 h-4" /> Kelola Poin Pelanggaran
            </button>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/30"
            >
              <Plus className="w-4 h-4" /> Catat Pelanggaran
            </button>
          </div>
        )}
      </div>

      {/* Universal Data Grid */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={violations as unknown as Record<string, unknown>[]}
        pageCount={1}
        pageIndex={0}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={isLoading}
        tableName="laporan_pelanggaran_santri"
      />

      {/* Modal Master Poin Pelanggaran */}
      <AnimatePresence>
        {showMasterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                  <Settings2 className="w-5 h-5" />
                  <span>Konfigurasi Master Kategori & Poin Pelanggaran</span>
                </div>
                <button onClick={() => setShowMasterModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMasterType} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Jenis Pelanggaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Merusak Fasilitas Asrama, Terlambat Berjamaah..."
                    value={newMasterName}
                    onChange={(e) => setNewMasterName(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Kategori</label>
                    <select
                      value={newMasterCategory}
                      onChange={(e) => setNewMasterCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none"
                    >
                      <option value="RINGAN">RINGAN</option>
                      <option value="SEDANG">SEDANG</option>
                      <option value="BERAT">BERAT</option>
                      <option value="TAKZIR">TAKZIR UTAMA</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Bobot Poin</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newMasterPoints}
                      onChange={(e) => setNewMasterPoints(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md">
                  + Simpan Master Poin Baru
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Daftar Poin Terdaftar:</span>
                <div className="space-y-1.5">
                  {allViolationMaster.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">{m.name}</span>
                        <span className="text-[10px] text-rose-500 font-bold">{m.category} • {m.points} Poin</span>
                      </div>
                      {m.id.startsWith("v_custom_") && (
                        <button type="button" onClick={() => handleDeleteMasterType(m.id)} className="text-zinc-400 hover:text-rose-500 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Form Catat Pelanggaran */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col">
              <div className="p-5 border-b flex justify-between items-center bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span>Perekaman Pelanggaran & Poin Takzir</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-xl text-zinc-500 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Santriwati Pelanggar (*)</label>
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none" required>
                    <option value="">-- Pilih Santriwati (Nama / Stambuk) --</option>
                    {santriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Stambuk: {s.stambuk} • Kelas: {s.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Jenis Pelanggaran & Poin (*)</label>
                    <button type="button" onClick={() => setShowMasterModal(true)} className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer">+ Tambah Kategori Poin</button>
                  </div>
                  <select value={selectedViolationTypeId} onChange={(e) => setSelectedViolationTypeId(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none" required>
                    <option value="">-- Pilih Jenis Pelanggaran --</option>
                    {allViolationMaster.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category} • Poin: +{v.points})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tanggal Kejadian (*)</label>
                    <input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Waktu Kejadian (Opsional)</label>
                    <input type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Lokasi Kejadian</label>
                  <input type="text" placeholder="Contoh: Asrama Aisyah, Gerbang Barat" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
                    {isSubmitting ? "Menyimpan..." : "Simpan Catatan Pelanggaran"}
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
