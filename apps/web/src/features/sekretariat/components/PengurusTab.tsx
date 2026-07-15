"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useToast } from "@/components/shared/ToastContext";

import { usePengurus, Pengurus } from "../queries/usePengurus";

export function PengurusTab({ onViewDetail, isReadOnly = false }: { onViewDetail: (data: Record<string, unknown>) => void, isReadOnly?: boolean }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [pengurusData, setPengurusData] = useState<Pengurus[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const { data: remoteData = { data: [], total: 0 }, isLoading, deletePengurus } = usePengurus(searchQuery, pageIndex, pageSize);
  const { toast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState<Pengurus | null>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Staf Keamanan");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [pengurusTitles, setPengurusTitles] = useState<string[]>([
    "Kepala Keamanan", "Staf Keamanan", "Staf IT & Sistem", "Staf Kebersihan / Operasional"
  ]);

  useEffect(() => {
    if (remoteData) {
      queueMicrotask(() => {
        setPengurusData(remoteData.data as any[]);
        setTotalCount(remoteData.total);
      });
    }
  }, [remoteData]);

  useEffect(() => {
    const saved = localStorage.getItem("job_titles_pengurus");
    if (saved) {
      setPengurusTitles(JSON.parse(saved));
    }
    
    const handleJobTitlesChanged = () => {
      const updated = localStorage.getItem("job_titles_pengurus");
      if (updated) {
        setPengurusTitles(JSON.parse(updated));
      }
    };
    window.addEventListener("job_titles_changed", handleJobTitlesChanged);
    return () => window.removeEventListener("job_titles_changed", handleJobTitlesChanged);
  }, []);



  const resetForm = () => {
    setName(""); setPhone(""); setRole("Staf Keamanan"); setStatus("ACTIVE");
  };

  const handleOpenAdd = () => {
    setEditingData(null); resetForm(); setShowModal(true);
  };

  const handleOpenEdit = (item: Pengurus) => {
    setEditingData(item);
    setName(item.name); setPhone(item.phone); setRole(item.role); setStatus(item.status);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus data Pengurus ini?")) {
      try {
        await deletePengurus(id);
        toast("Data dihapus", "success", "Sukses");
      } catch (err) {
        toast("Gagal menghapus data", "error", "Gagal");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast("Lengkapi form", "warning", "Peringatan");
    // API creation is not fully implemented in usePengurus yet
    toast("Fitur simpan sedang dalam pengembangan untuk pengurus", "info", "Info");
    setShowModal(false);
  };

  const columns: ColumnDef<Pengurus, unknown>[] = [
    { accessorKey: "name", header: "Nama Lengkap", cell: info => <span className="font-bold">{info.getValue() as string}</span> },
    { accessorKey: "role", header: "Jabatan & Divisi", cell: info => <span className="text-sm font-medium">{info.getValue() as string}</span> },
    { accessorKey: "phone", header: "No. Telepon", cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span> },
    { accessorKey: "status", header: "Status", cell: info => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${info.getValue() === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {info.getValue() as string}
      </span>
    )},
    {
      id: "actions", header: "Aksi",
      cell: info => <TableActions onEdit={() => handleOpenEdit(info.row.original)} onDelete={() => handleDelete(info.row.original.id)} onDetail={() => onViewDetail(info.row.original as unknown as Record<string, unknown>)} isReadOnly={false} />
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen SDM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Pengurus
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola master data Pengurus Keamanan, IT, dan Divisi Lainnya.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="z-10 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-95">
          <Plus className="w-4 h-4" /> Tambah Pengurus
        </button>
      </div>

      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={pengurusData as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => onViewDetail(row)}
        tableName="pengurus"
        importExportProps={{
          title: "Data Pengurus",
          headers: ["name", "nik", "phone", "address"],
          onImportSuccess: (rows) => console.log("Imported:", rows)
        }}
      />

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between">
                <h3 className="font-bold">{editingData ? "Edit Data Pengurus" : "Tambah Pengurus Baru"}</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:bg-zinc-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Nama Lengkap</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">No. HP</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Divisi / Jabatan</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700">
                    <option value="" disabled>Pilih Divisi / Jabatan</option>
                    {pengurusTitles.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-semibold">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
