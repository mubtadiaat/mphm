"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, ShieldAlert, Calendar, Clock, MapPin, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { PillBadge } from "@/components/shared/PillBadge";
import { IdentityCell } from "@/components/shared/IdentityCell";
import { useGlobalViolations, StudentViolation } from "@/features/sekretariat/queries/useGlobalViolations";
import { useViolationMaster } from "@/features/sekretariat/queries/useViolationMaster";
import { useSantri, Santri } from "@/features/sekretariat/queries/useSantri";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";

interface PelanggaranTabProps {
  onViewDetail?: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function PelanggaranTab({ onViewDetail, isReadOnly = false, selectedYearId }: PelanggaranTabProps) {
  const { data: violations = [], isLoading, createViolation } = useGlobalViolations(selectedYearId);
  const { types: violationTypes = [] } = useViolationMaster();
  const { data: santriResult } = useSantri(selectedYearId, 0, 1000);
  const santriList = santriResult?.data || [];

  const { toast, confirm } = useToast();

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedViolationTypeId, setSelectedViolationTypeId] = useState("");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [incidentTime, setIncidentTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast("Catatan pelanggaran santriwati berhasil direkam!", "success");
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
      header: "Jenis Pelanggaran & Poin",
      cell: (info) => (
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            {info.getValue() as string}
          </span>
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            Kategori: {info.row.original.category} • Severity: {info.row.original.severity}
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
          onMutasi={onViewDetail ? () => onViewDetail(info.row.original as unknown as Record<string, unknown>) : undefined}
          isReadOnly={isReadOnly}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-red-900/20 to-zinc-900 border border-rose-500/20 dark:border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col gap-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 backdrop-blur-md w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>KEDISIPLINAN & TA'ZIR SANTRIWATI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Catatan Pelanggaran & Poin Takzir Santri
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Rekam medis kedisiplinan, catatan pelanggaran, dan akumulasi poin takzir santriwati terintegrasi langsung dengan database PostgreSQL.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            type="button"
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pelanggaran Santri</span>
          </button>
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

      {/* Modal Form Catat Pelanggaran */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col"
            >
              <div className="p-5 border-b flex justify-between items-center bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <span>Perekaman Pelanggaran & Poin Takzir</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Pilih santriwati dan jenis pelanggaran yang dilakukan.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Select Santriwati */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                    Santriwati Pelanggar (*)
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                    required
                  >
                    <option value="">-- Pilih Santriwati (Nama / Stambuk) --</option>
                    {santriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Stambuk: {s.stambuk} • Kelas: {s.class})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Jenis Pelanggaran */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                    Jenis Pelanggaran & Poin (*)
                  </label>
                  <select
                    value={selectedViolationTypeId}
                    onChange={(e) => setSelectedViolationTypeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                    required
                  >
                    <option value="">-- Pilih Jenis Pelanggaran --</option>
                    {violationTypes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category} • Poin: {v.points})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tanggal Incident */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                      Tanggal Kejadian (*)
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  {/* Jam Incident */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                      Waktu Kejadian (Opsional)
                    </label>
                    <input
                      type="time"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Lokasi */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                    Lokasi Kejadian (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Asrama Aisyah, Aula Utama, Gerbang Barat"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                  />
                </div>

                {/* Deskripsi Kronologi */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                    Kronologi & Keterangan Tambahan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan kejadian atau barang bukti jika ada..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
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
