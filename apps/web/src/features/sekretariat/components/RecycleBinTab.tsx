"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, RefreshCcw, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useToast } from "@/components/shared/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

import { useRecycleBin, DeletedItem } from "../queries/useRecycleBin";

export function RecycleBinTab() {
  const {
    data: remoteData = [],
    isLoading,
    restoreItem,
    forceDeleteItem,
    emptyTrash,
    isEmptyingTrash,
    restoreAllTrash,
    isRestoringAll,
  } = useRecycleBin();
  const data = remoteData;
  const { toast, confirm } = useToast();
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const handleRestore = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Pulihkan Data ini?",
      message: "Apakah Anda yakin ingin mengembalikan data ini ke sistem aktif?",
      confirmText: "Ya, Pulihkan Data",
      cancelText: "Batal",
      type: "info",
    });

    if (isConfirmed) {
      try {
        await restoreItem(id);
        toast("Data berhasil dikembalikan ke sistem aktif", "success", "Sukses Restore");
      } catch {
        toast("Gagal mengembalikan data", "error", "Gagal");
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Permanen Data?",
      message: "Hapus permanen data ini SEKARANG? Data tidak akan bisa dikembalikan lagi!",
      confirmText: "Ya, Hapus Permanen",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await forceDeleteItem(id);
        toast("Data telah dihapus permanen dari sistem", "success", "Terhapus Permanen");
      } catch {
        toast("Gagal menghapus data", "error", "Gagal");
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (data.length === 0) {
      toast("Keranjang sampah sudah kosong.", "info", "Informasi");
      return;
    }

    const isConfirmed = await confirm({
      title: "KOSONGKAN KERANJANG SAMPAH SEKARANG?",
      message: `Hapus PERMANEN SELURUH DATA (${data.length} item) di keranjang sampah? Tindakan ini TIDAK DAPAT DIBATALKAN!`,
      confirmText: "Ya, Hapus Permanen Semua Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        const res = await emptyTrash();
        toast(res.message || "Keranjang sampah berhasil dikosongkan permanen", "success", "Berhasil Kosongkan");
      } catch {
        toast("Gagal mengosongkan keranjang sampah", "error", "Gagal");
      }
    }
  };

  const handleRestoreAll = async () => {
    if (data.length === 0) {
      toast("Keranjang sampah kosong, tidak ada data untuk dipulihkan.", "info", "Informasi");
      return;
    }

    const isConfirmed = await confirm({
      title: "Pulihkan Seluruh Data Sampah?",
      message: `Kembalikan SELURUH DATA (${data.length} item) dari keranjang sampah ke sistem aktif?`,
      confirmText: "Ya, Pulihkan Semua Data",
      cancelText: "Batal",
      type: "info",
    });

    if (isConfirmed) {
      try {
        const res = await restoreAllTrash();
        toast(res.message || "Seluruh data di keranjang sampah berhasil dipulihkan", "success", "Berhasil Restore Semua");
      } catch {
        toast("Gagal memulihkan seluruh data", "error", "Gagal");
      }
    }
  };

  const columns: ColumnDef<DeletedItem, unknown>[] = [
    {
      accessorKey: "type",
      header: "Tipe Data",
      meta: { align: "left" },
      cell: (info) => {
        const val = (info.getValue() as string) || "DOKUMEN";
        let colorClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50";
        if (val.includes("SANTRI") || val.includes("SISWI")) {
          colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50";
        } else if (val.includes("MUSTAHIQ")) {
          colorClasses = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50";
        } else if (val.includes("MUNAWWIB")) {
          colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50";
        } else if (val.includes("PENGURUS")) {
          colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-2xs ${colorClasses}`}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Nama / Identitas Data",
      meta: { align: "left" },
      cell: (info) => (
        <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "deletedAt",
      header: "Waktu Dihapus",
      meta: { align: "center" },
      cell: (info) => (
        <div className="text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Otomatis Terhapus Permanen",
      meta: { align: "center" },
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{info.getValue() as string}</span>
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi Terbuka",
      meta: { align: "center" },
      cell: (info) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleRestore(info.row.original.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Restore</span>
          </button>
          <button
            onClick={() => handlePermanentDelete(info.row.original.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4 p-4 mt-2">
      {/* Top Action Header Banner */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              Recycling Bin & Dorman Data
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Semua data yang dihapus dari sistem akan diisolasi di sini selama masa retensi 48 jam sebelum otomatis dihapus permanen.
          </p>
        </div>

        {/* Global Batch Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={data.length === 0 || isRestoringAll}
            onClick={handleRestoreAll}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs ${
              data.length > 0 && !isRestoringAll
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Pulihkan Semua Data ({data.length})</span>
          </button>

          <button
            type="button"
            disabled={data.length === 0 || isEmptyingTrash}
            onClick={handleEmptyTrash}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs ${
              data.length > 0 && !isEmptyingTrash
                ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-98"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Kosongkan Keranjang Sampah</span>
          </button>
        </div>
      </div>

      <UniversalDataGrid
        columns={columns}
        data={data}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoading}
        onRowClick={(row) => setDetailData(row as unknown as Record<string, any>)}
        tableName="Data Recycling Bin"
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setDetailData(null)}
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh] border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                  Detail Data Terisolasi
                </h3>
                <button
                  onClick={() => setDetailData(null)}
                  className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">
                        Tipe Data
                      </td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">
                        {detailData.type || "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">
                        Nama / Identitas
                      </td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">
                        {detailData.name || "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">
                        Waktu Dihapus
                      </td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">
                        {detailData.deletedAt || "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">
                        Sisa Waktu Retensi
                      </td>
                      <td className="py-2.5 text-rose-600 dark:text-rose-400 text-left font-mono font-bold">
                        {detailData.expiresAt || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const id = detailData.id;
                      setDetailData(null);
                      handleRestore(id);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan Data Ini</span>
                  </button>
                  <button
                    onClick={() => {
                      const id = detailData.id;
                      setDetailData(null);
                      handlePermanentDelete(id);
                    }}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
