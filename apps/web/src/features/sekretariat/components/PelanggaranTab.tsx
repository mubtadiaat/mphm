"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { PillBadge } from "@/components/shared/PillBadge";
import { useViolationMaster, ViolationType } from "@/features/sekretariat/queries/useViolationMaster";
import { useToast } from "@/components/shared/ToastContext";

interface PelanggaranTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
  selectedYearId?: string;
}

export function PelanggaranTab({ onViewDetail, isReadOnly = false }: PelanggaranTabProps) {
  const { types, isLoadingTypes, categories, severities, createViolation, deleteViolation } = useViolationMaster();
  const [violationsData, setViolationsData] = useState<ViolationType[]>([]);
  const { toast } = useToast();

  // Sync with TanStack Query data
  useEffect(() => {
    if (types) {
      queueMicrotask(() => {
        setViolationsData(types);
      });
    }
  }, [types]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingViolation, setEditingViolation] = useState<ViolationType | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [severityId, setSeverityId] = useState("");
  const [points, setPoints] = useState(5);

  const resetForm = () => {
    setName("");
    setCategoryId(categories?.[0]?.id || "");
    setSeverityId(severities?.[0]?.id || "");
    setPoints(5);
  };

  const handleOpenAdd = () => {
    setEditingViolation(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (vio: ViolationType) => {
    setEditingViolation(vio);
    setName(vio.name);
    // Note: Edit requires category/severity IDs but we only have string names in the list.
    // For full CRUD, we'd fetch the exact item or match by name.
    const matchedCat = categories.find(c => c.name === vio.category);
    const matchedSev = severities.find(s => s.name === vio.severity);
    setCategoryId(matchedCat?.id || "");
    setSeverityId(matchedSev?.id || "");
    setPoints(vio.points);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jenis pelanggaran master ini?")) {
      try {
        await deleteViolation(id);
        toast("Master pelanggaran berhasil dihapus!", "success", "Data Dihapus");
      } catch (e) {
        toast("Gagal menghapus pelanggaran", "error", "Gagal");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !severityId) {
      toast("Harap lengkapi seluruh field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }
    try {
      await createViolation({
        categoryId,
        severityId,
        name,
        points
      });
      toast("Berhasil menyimpan data master pelanggaran", "success", "Berhasil");
      setShowModal(false);
    } catch (err) {
      toast("Gagal menyimpan data", "error", "Gagal");
    }
  };

  const columns: ColumnDef<ViolationType, unknown>[] = [
    {
      accessorKey: "name",
      header: "Pelanggaran",
      cell: (info) => <span className="font-bold text-zinc-900 dark:text-white leading-relaxed">{info.getValue() as string}</span>
    },
    {
      accessorKey: "category",
      header: "Kategori Kedisiplinan",
      cell: (info) => (
        <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-xs">
          {info.getValue() as string}
        </span>
      )
    },
    {
      accessorKey: "severity",
      header: "Tingkat Keparahan",
      cell: (info) => {
        const val = info.getValue() as string;
        let variant: "info" | "warning" | "danger" | "success" = "info";
        if (val === "Sedang") variant = "warning";
        else if (val === "Berat" || val === "Sangat Berat") variant = "danger";
        return <PillBadge label={val} variant={variant} />;
      }
    },
    {
      accessorKey: "points",
      header: "Poin Penalty",
      cell: (info) => (
        <span className="font-mono font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100/50 dark:border-rose-900/30 text-xs">
          {info.getValue() as number} Poin
        </span>
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
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 dark:border-rose-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-rose-650 dark:text-rose-455 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Tata Tertib & Kepatuhan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Master Pelanggaran & Kedisiplinan
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Definisikan jenis pelanggaran takzir resmi (7 Kategori Pesantren), poin sanksi, dan tingkat keparahan.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-rose-500/20"
          >
            <Plus className="w-4 h-4" /> Tambah Pelanggaran
          </button>
        )}
      </div>

      {/* Grid Table */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={violationsData as unknown as Record<string, unknown>[]}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoadingTypes}
        tableName="master_pelanggaran"
        onRowClick={(row) => onViewDetail(row as unknown as Record<string, unknown>)}
        importExportProps={{
          title: "Data Pelanggaran",
          headers: ["studentName", "type", "description", "points"],
          onImportSuccess: (rows) => console.log("Imported:", rows)
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
                    {editingViolation ? "Edit Jenis Pelanggaran" : "Tambah Pelanggaran Baru"}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {editingViolation ? "Ubah deskripsi aturan atau bobot poin takzir." : "Daftarkan pasal pelanggaran baru."}
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
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Deskripsi Pelanggaran *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Menggunakan barang orang lain tanpa izin"
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Kategori Kedisiplinan *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Tingkat Keparahan *</label>
                  <select
                    value={severityId}
                    onChange={(e) => setSeverityId(e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200"
                  >
                    <option value="">Pilih Tingkat...</option>
                    {severities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Bobot Poin Penalty</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-200 font-mono"
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
