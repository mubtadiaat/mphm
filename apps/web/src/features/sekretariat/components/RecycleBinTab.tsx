"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, RefreshCcw, X } from "lucide-react";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useToast } from "@/components/shared/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

import { useRecycleBin, DeletedItem } from "../queries/useRecycleBin";

export function RecycleBinTab() {
  const { data: remoteData = [], isLoading, restoreItem, forceDeleteItem } = useRecycleBin();
  const data = remoteData;
  const { toast } = useToast();
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);

  const handleRestore = async (id: string) => {
    if (confirm("Kembalikan data ini ke sistem aktif?")) {
      try {
        await restoreItem(id);
        toast("Data berhasil dikembalikan", "success", "Sukses");
      } catch {
        toast("Gagal mengembalikan data", "error", "Gagal");
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Hapus permanen data ini SEKARANG? Tindakan ini tidak dapat dibatalkan!")) {
      try {
        await forceDeleteItem(id);
        toast("Data dihapus permanen", "success", "Terhapus");
      } catch {
        toast("Gagal menghapus data", "error", "Gagal");
      }
    }
  };

  const columns: ColumnDef<DeletedItem, unknown>[] = [
    { accessorKey: "type", header: "Tipe Data", meta: { align: "left" }, cell: info => <span className="font-bold text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{info.getValue() as string}</span> },
    { accessorKey: "name", header: "Nama / Identitas", meta: { align: "left" }, cell: info => <span className="font-medium">{info.getValue() as string}</span> },
    { accessorKey: "deletedAt", header: "Waktu Dihapus", meta: { align: "center" }, cell: info => <div className="text-center text-sm text-zinc-500">{info.getValue() as string}</div> },
    { accessorKey: "expiresAt", header: "Otomatis Terhapus Permanen", meta: { align: "center" }, cell: info => <div className="text-center text-sm font-medium text-rose-600 dark:text-rose-400">{info.getValue() as string}</div> },
    {
      id: "actions",
      header: "Aksi",
      meta: { align: "center" },
      cell: (info) => (
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => handleRestore(info.row.original.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 dark:border-emerald-900/50 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Restore</span>
          </button>
          <button 
            onClick={() => handlePermanentDelete(info.row.original.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:border-rose-900/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 mt-2">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDetailData(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                  Detail Sampah Data
                </h3>
                <button onClick={() => setDetailData(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Tipe Data</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{detailData.type || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama / Identitas</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{detailData.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Waktu Dihapus</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{detailData.deletedAt || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Sisa Waktu</td>
                      <td className="py-2.5 text-rose-600 dark:text-rose-400 text-left font-mono">{detailData.expiresAt || "-"}</td>
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
