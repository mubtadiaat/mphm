"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { PillBadge } from "@/components/shared/PillBadge";
import { useSubjects, Subject } from "@/features/sekretariat/queries/useSubjects";
import { useToast } from "@/components/shared/ToastContext";

interface KurikulumTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function KurikulumTab({ onViewDetail, isReadOnly = false }: KurikulumTabProps) {
  const { data: remoteData = [], isLoading, createSubject, updateSubject, deleteSubject, isCreating, isUpdating } = useSubjects();
  const { toast } = useToast();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form States
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [subjectType, setSubjectType] = useState<"MAPEL" | "NON_MAPEL">("NON_MAPEL");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode("");
    setName("");
    setSubjectType("NON_MAPEL");
    setIsActive(true);
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setCode(sub.code);
    setName(sub.name);
    setSubjectType(sub.subjectType);
    setIsActive(sub.isActive);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini dari kurikulum?")) {
      try {
        await deleteSubject(id);
        toast("Mata pelajaran berhasil dihapus!", "success", "Data Dihapus");
      } catch (err) {
        toast("Gagal menghapus mata pelajaran", "error", "Error");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast("Harap lengkapi seluruh field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject({ id: editingSubject.id, data: { code, name, subjectType, isActive } });
        toast("Data pelajaran berhasil diperbarui!", "success", "Perubahan Disimpan");
      } else {
        await createSubject({ code, name, subjectType });
        toast("Mata pelajaran baru berhasil ditambahkan!", "success", "Data Ditambahkan");
      }
      setShowModal(false);
    } catch (err) {
      toast("Terjadi kesalahan saat menyimpan data", "error", "Error");
    }
  };

  const columns: ColumnDef<Subject, unknown>[] = [
    {
      accessorKey: "code",
      header: "Kode Mapel",
      cell: (info) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 px-2 py-0.5 rounded border border-blue-100/50 dark:border-blue-800/30">
          {info.getValue() as string}
        </span>
      )
    },
    {
      accessorKey: "name",
      header: "Nama Pelajaran",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
    },
    {
      accessorKey: "subjectType",
      header: "Tipe Pelajaran",
      cell: (info) => {
        const val = info.getValue() as string;
        const isSacred = val === "MAPEL";
        return (
          <PillBadge
            label={isSacred ? "MAPEL" : "NON_MAPEL"}
            variant={isSacred ? "gold" : "info"}
          />
        );
      }
    },
    {
      accessorKey: "isActive",
      header: "Status Kurikulum",
      cell: (info) => (
        <PillBadge
          label={info.getValue() ? "AKTIF" : "NONAKTIF"}
          variant={info.getValue() ? "success" : "danger"}
        />
      )
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (info) => {
        const row = info.row.original;
        return (
          <TableActions
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDelete(row.id)}
            onDetail={() => onViewDetail(row as unknown as Record<string, unknown>)}
            isReadOnly={isReadOnly}
          />
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 dark:border-cyan-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-cyan-650 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kurikulum & Rencana Studi</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Kurikulum Builder
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Manajemen silabus, materi, dan bobot pelajaran akademik.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Tambah Pelajaran
          </button>
        )}
      </div>

      {/* Grid Table */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={remoteData as unknown as Record<string, unknown>[]}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoading}
        onRowClick={(row) => onViewDetail(row as unknown as Record<string, unknown>)}
        tableName="kurikulum"
        importExportProps={{
          title: "Kurikulum Builder & Silabus",
          headers: ["Kode Mapel", "Nama Pelajaran", "Tipe Pelajaran", "Status"],
        }}
      />

      {/* Add / Edit Modal */}
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
                    {editingSubject ? "Edit Mata Pelajaran" : "Tambah Pelajaran Baru"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {editingSubject ? "Ubah skema dan kode identifikasi silabus." : "Daftarkan silabus mata pelajaran baru."}
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
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Kode Mata Pelajaran *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: MP-FQH-01"
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nama Pelajaran *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Fiqih (Fath al-Qarib)"
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tipe Pelajaran *</label>
                  <select
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value as "MAPEL" | "NON_MAPEL")}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MAPEL">MAPEL</option>
                    <option value="NON_MAPEL">NON-MAPEL</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                    Mata pelajaran aktif dalam kurikulum tahun ajaran berjalan
                  </label>
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
                    Simpan Perubahan
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
