"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, Home, Bed, User, Trash2, Edit, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { PillBadge } from "@/components/shared/PillBadge";
import { useRooms, Room } from "../queries/useRooms";
import { useGuru } from "../queries/useGuru";
import { useToast } from "@/components/shared/ToastContext";

interface RoomsTabProps {
  isReadOnly?: boolean;
}

export function RoomsTab({ isReadOnly = false }: RoomsTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");

  const { data: remoteData = { data: [], total: 0 }, isLoading, createRoom, updateRoom, deleteRoom } = useRooms(
    searchQuery,
    buildingFilter,
    pageIndex,
    pageSize
  );

  const { data: guruData = { data: [], total: 0 } } = useGuru(undefined, 0, 100);
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Room | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [capacity, setCapacity] = useState<number>(10);
  const [supervisorId, setSupervisorId] = useState<string>("");

  const resetForm = () => {
    setName("");
    setBuildingName("");
    setCapacity(10);
    setSupervisorId("");
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setBuildingName(room.buildingName);
    setCapacity(room.capacity);
    setSupervisorId(room.supervisorId || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kamar ini? Santri yang menghuni kamar ini akan dide-asosiasikan.")) {
      return;
    }

    try {
      await deleteRoom(id);
      toast("Kamar berhasil dihapus!", "success", "Data Dihapus");
    } catch (err: any) {
      toast(err.message || "Gagal menghapus kamar", "error", "Gagal");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !buildingName || !capacity) {
      toast("Harap lengkapi seluruh field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }

    try {
      const payload = {
        name,
        buildingName,
        capacity,
        supervisorId: supervisorId || null,
      };

      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, data: payload });
        toast("Data kamar berhasil diperbarui!", "success", "Data Diperbarui");
      } else {
        await createRoom(payload);
        toast("Kamar baru berhasil ditambahkan!", "success", "Data Ditambahkan");
      }
      setShowModal(false);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data kamar", "error", "Gagal");
    }
  };

  const columns: ColumnDef<Room, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Kamar",
      meta: { align: "left" },
      cell: (info) => (
        <div className="flex items-center justify-start gap-2 font-bold text-zinc-900 dark:text-white">
          <Bed className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{info.getValue() as string}</span>
        </div>
      )
    },
    {
      accessorKey: "buildingName",
      header: "Gedung",
      meta: { align: "left" },
      cell: (info) => <span className="font-medium text-zinc-700 dark:text-zinc-350">{info.getValue() as string}</span>
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas",
      meta: { align: "center" },
      cell: (info) => {
        const row = info.row.original;
        const filled = row.filledCapacity || 0;
        const cap = row.capacity || 0;
        const isFull = filled >= cap;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200">
              {filled} / {cap}
            </span>
            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-emerald-500"}`} 
                style={{ width: `${Math.min(100, (filled / cap) * 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "supervisorName",
      header: "Wali Kamar / Ust.",
      meta: { align: "left" },
      cell: (info) => (
        <div className="flex items-center justify-start gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{info.getValue() as string || <span className="text-xs text-zinc-400 italic">Belum ditunjuk</span>}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Aksi",
      meta: { align: "center" },
      cell: (info) => {
        const row = info.row.original;
        if (isReadOnly) {
          return <div className="text-center"><span className="text-xs text-zinc-400 italic">Terarsip</span></div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors"
              title="Edit Kamar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-lg cursor-pointer transition-colors"
              title="Hapus Kamar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>Manajemen Kamar & Asrama</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Kamar & Asrama
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Atur data kamar asrama santri, kapasitas hunian, dan Wali Kamar pembimbing.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer w-fit z-10 shrink-0 border border-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Tambah Kamar
          </button>
        )}
      </div>

      {/* Grid Table */}
      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={remoteData.data as unknown as Record<string, unknown>[]}
        pageCount={Math.ceil(remoteData.total / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => setViewingDetail(row as unknown as Room)}
        tableName="rooms"
        importExportProps={{
          title: "Data Kamar & Asrama Santri",
          headers: ["name", "buildingName", "capacity", "supervisorName"],
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Bed className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingRoom ? "Edit Kamar Asrama" : "Tambah Kamar Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[75vh]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Kamar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kamar Al-Ghazali 01"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Gedung *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gedung A / Blok Barat"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
                  />
                </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Kapasitas (Orang) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                      className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
                    />
                  </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase font-bold">Wali Kamar / Ust. Pembimbing</label>
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-white"
                  >
                    <option value="">-- Pilih Wali Kamar --</option>
                    {guruData.data.map((guru) => (
                      <option key={guru.id} value={guru.id}>
                        {guru.name} ({guru.teacherCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-500">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Kamar yang telah dibuat akan dapat dipilih langsung pada menu profil detail santri atau form pendaftaran/pemindahan santri.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    Simpan Data
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
                  <Bed className="w-5 h-5 text-blue-500" />
                  Detail Kamar Asrama
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama Kamar</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Gedung</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{viewingDetail.buildingName || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Kapasitas</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{(viewingDetail.filledCapacity || 0)} / {viewingDetail.capacity || 0}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Ust. Pembimbing</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">{viewingDetail.supervisorName || <span className="italic text-zinc-400">Belum ditunjuk</span>}</td>
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
