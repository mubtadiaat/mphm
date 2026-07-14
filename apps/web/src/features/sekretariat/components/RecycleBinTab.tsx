"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, RefreshCcw } from "lucide-react";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useToast } from "@/components/shared/ToastContext";

import { useRecycleBin, DeletedItem } from "../queries/useRecycleBin";

export function RecycleBinTab() {
  const { data: remoteData = [], isLoading, restoreItem, forceDeleteItem } = useRecycleBin();
  const data = remoteData;
  const { toast } = useToast();

  const handleRestore = async (id: string) => {
    if (confirm("Kembalikan data ini ke sistem aktif?")) {
      try {
        await restoreItem(id);
        toast("Data berhasil dikembalikan", "success", "Sukses");
      } catch (e) {
        toast("Gagal mengembalikan data", "error", "Gagal");
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Hapus permanen data ini SEKARANG? Tindakan ini tidak dapat dibatalkan!")) {
      try {
        await forceDeleteItem(id);
        toast("Data dihapus permanen", "success", "Terhapus");
      } catch (e) {
        toast("Gagal menghapus data", "error", "Gagal");
      }
    }
  };

  const columns: ColumnDef<DeletedItem, unknown>[] = [
    { accessorKey: "type", header: "Tipe Data", cell: info => <span className="font-bold text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{info.getValue() as string}</span> },
    { accessorKey: "name", header: "Nama / Identitas", cell: info => <span className="font-medium">{info.getValue() as string}</span> },
    { accessorKey: "deletedAt", header: "Waktu Dihapus", cell: info => <span className="text-sm text-zinc-500">{info.getValue() as string}</span> },
    { accessorKey: "expiresAt", header: "Otomatis Terhapus Permanen", cell: info => <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{info.getValue() as string}</span> },
    {
      id: "actions",
      header: "Aksi",
      cell: (info) => (
        <div className="flex gap-2">
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
    <div className="h-full flex flex-col p-4">
      <UniversalDataGrid
        columns={columns}
        data={data}
        pageCount={1}
        pageIndex={0}
        pageSize={10}
        loading={isLoading}
        tableName="Data Recycling Bin"
      />
    </div>
  );
}
