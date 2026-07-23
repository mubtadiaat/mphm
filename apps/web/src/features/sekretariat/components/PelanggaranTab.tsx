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
  const [viewingDetail, setViewingDetail] = useState<ViolationType | null>(null);

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
      } catch {
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
    } catch {
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
        onRowClick={(row) => setViewingDetail(row as unknown as ViolationType)}
        importExportProps={{
          title: "Master Data Aturan Pelanggaran dan Takzir",
          headers: ["Nama Aturan Pelanggaran", "Kategori Kedisiplinan", "Tingkat Keparahan", "Poin Takzir"],
          onImportSuccess: async (rows) => {
            let count = 0;
            for (const r of rows) {
              const nameVal = r["Nama Aturan Pelanggaran"] || r["name"] || "";
              if (!nameVal.trim()) continue;
              const pointsVal = parseInt(r["Poin Takzir"] || r["points"] || "5") || 5;
              try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                await fetch(`${apiUrl}/api/admin/violations/types`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: nameVal,
                    points: pointsVal,
                    categoryId: categories[0]?.id || "",
                    severityId: severities[0]?.id || "",
                  }),
                });
                count++;
              } catch (err) {
                console.error("Import row failed:", err);
              }
            }
            if (count > 0) {
              toast(`Berhasil mengimpor ${count} Aturan Pelanggaran!`, "success", "Import Berhasil");
            }
          }
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

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewingDetail(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Detail Aturan Pelanggaran
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama Pelanggaran</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Kategori</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-semibold">{viewingDetail.category || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Tingkat Keparahan</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">
                        <PillBadge label={viewingDetail.severity || "-"} variant="danger" />
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Poin Penalty</td>
                      <td className="py-2.5 text-rose-600 dark:text-rose-400 text-left font-mono font-bold">{viewingDetail.points ?? 0} Poin</td>
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
