"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Plus, 
  X, 
  Home, 
  Bed, 
  User, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Building2, 
  Search,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { useRooms, Room } from "../queries/useRooms";
import { usePengurus } from "../queries/usePengurus";
import { useToast } from "@/components/shared/ToastContext";
import { determineBuildingName } from "@/lib/determineBuilding";

interface RoomsTabProps {
  isReadOnly?: boolean;
}

export function RoomsTab({ isReadOnly = false }: RoomsTabProps) {
  // Sub-Tab State: "blok" | "kamar" | "musyrifah"
  const [activeSubTab, setActiveSubTab] = useState<"blok" | "kamar" | "musyrifah">("blok");

  // Table & Filter States
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [gridSearchQuery, setGridSearchQuery] = useState("");

  // Queries
  const { data: remoteData = { data: [], total: 0 }, isLoading, createRoom, updateRoom, deleteRoom } = useRooms(
    searchQuery,
    buildingFilter,
    pageIndex,
    pageSize
  );

  // All Rooms Query for Blok / Komplek Grid view
  const { data: allRoomsData = { data: [], total: 0 } } = useRooms("", "", 0, 300);
  const allRooms = allRoomsData.data || [];

  // Fetch Pengurus for Musyrifah / Pembina Kamar Selection
  const { data: pengurusResult = { data: [], total: 0 } } = usePengurus("", 0, 500);
  const pengurusList = pengurusResult.data || [];

  const { toast, confirm } = useToast();

  // Modals State
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Room | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [buildingName, setBuildingName] = useState<string>("Blok A");
  const [capacity, setCapacity] = useState<number>(20);
  const [supervisorId, setSupervisorId] = useState<string>("");

  const resetForm = () => {
    setName("");
    setBuildingName("Blok A");
    setCapacity(20);
    setSupervisorId("");
  };

  const handleOpenAdd = (presetBuilding?: string) => {
    setEditingRoom(null);
    resetForm();
    if (presetBuilding) {
      setBuildingName(presetBuilding);
    } else if (allBlockNames.length > 0) {
      setBuildingName(allBlockNames[0]);
    }
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setBuildingName(room.buildingName || "Blok A");
    setCapacity(room.capacity || 20);
    setSupervisorId(room.supervisorId || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Kamar Asrama?",
      message: "Apakah Anda yakin ingin menghapus kamar ini? Santri yang menghuni kamar ini akan dide-asosiasikan.",
      confirmText: "Ya, Hapus Kamar",
      cancelText: "Batal",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      await deleteRoom(id);
      toast("Kamar berhasil dihapus!", "success");
    } catch (err: any) {
      toast(err.message || "Gagal menghapus kamar", "error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !buildingName.trim() || !capacity) {
      toast("Harap lengkapi seluruh field bertanda bintang (*)", "warning");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        buildingName: buildingName.trim(),
        capacity,
        supervisorId: supervisorId || null,
      };

      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, data: payload });
        toast("Data kamar & Pembina berhasil diperbarui!", "success");
      } else {
        await createRoom(payload);
        toast("Kamar baru & Penugasan Pembina berhasil disimpan!", "success");
      }
      setShowModal(false);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data kamar", "error");
    }
  };

  // Extract unique Block / Komplek names dynamically from database
  const rawBlockNames = Array.from(
    new Set(allRooms.map((r) => r.buildingName?.trim()).filter(Boolean))
  );
  const allBlockNames = rawBlockNames.length > 0 ? rawBlockNames : ["Blok A", "Blok B"];

  // Filter all rooms by grid search query
  const filteredAllRooms = allRooms.filter((r) => {
    if (!gridSearchQuery) return true;
    const q = gridSearchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.supervisorName || "").toLowerCase().includes(q) ||
      (r.buildingName || "").toLowerCase().includes(q)
    );
  });

  // Calculate Overall Asrama Statistics
  const totalRoomsCount = allRooms.length;
  const totalCapacitySum = allRooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const filledCapacitySum = allRooms.reduce((acc, r) => acc + (r.filledCapacity || 0), 0);
  const assignedSupervisorsCount = allRooms.filter(r => r.supervisorId || r.supervisorName).length;

  // Columns definition for Master Table in "Kamar" Sub-tab
  const columns: ColumnDef<Room, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Kamar",
      cell: (info) => (
        <div className="flex items-center justify-start gap-2 font-bold text-zinc-900 dark:text-white">
          <Bed className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{info.getValue() as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "buildingName",
      header: "Blok (Komplek)",
      cell: (info) => (
        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas Hunian",
      cell: (info) => {
        const row = info.row.original;
        const filled = row.filledCapacity || 0;
        const cap = row.capacity || 0;
        const isFull = filled >= cap;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
              {filled} / {cap} Santriwati
            </span>
            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, cap > 0 ? (filled / cap) * 100 : 0)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "supervisorName",
      header: "Musyrifah / Pembina Kamar",
      cell: (info) => (
        <div className="flex items-center justify-start gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
          <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-bold">
            {(info.getValue() as string) || (
              <span className="text-xs text-zinc-400 font-normal italic">Belum ditunjuk</span>
            )}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (info) => {
        const row = info.row.original;
        if (isReadOnly) return <span className="text-xs text-zinc-400 italic">Terarsip</span>;

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors"
              title="Edit Kamar & Pembina"
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
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>Manajemen Keasramaan & Musyrifah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Asrama, Kamar & Pembina (Musyrifah)
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Kelola pemetaan Komplek Asrama, penugasan Pembina Kamar (Musyrifah) langsung dari Data Pengurus Induk, dan kapasitas hunian santriwati.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-black shadow-lg transition-all cursor-pointer w-fit z-10 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Kamar Baru
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("blok")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeSubTab === "blok"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Blok / Komplek</span>
          </button>

          <button
            onClick={() => setActiveSubTab("kamar")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeSubTab === "kamar"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Master Table Kamar</span>
          </button>

          <button
            onClick={() => setActiveSubTab("musyrifah")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeSubTab === "musyrifah"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Plotting Musyrifah / Pembina</span>
          </button>
        </div>

        {activeSubTab === "blok" && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari kamar atau Pembina..."
              value={gridSearchQuery}
              onChange={(e) => setGridSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* SUB-TAB 1: BLOK / KOMPLEK GRID VIEW */}
      {activeSubTab === "blok" && (
        <div className="flex flex-col gap-8">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Total Komplek Asrama</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{allBlockNames.length} Blok</p>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Total Kamar</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalRoomsCount} Kamar</p>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Santriwati Mukim</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{filledCapacitySum} Santriwati</p>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Pembina Terplot</span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{assignedSupervisorsCount} Pembina</p>
            </div>
          </div>

          {/* DYNAMIC BLOCK GRID CARDS */}
          {allBlockNames.map((blockName) => {
            const blockRooms = filteredAllRooms.filter(
              (r) => (r.buildingName || "Blok Utama").trim().toLowerCase() === blockName.trim().toLowerCase()
            );

            const totalRooms = blockRooms.length;
            const totalCapacity = blockRooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
            const filledCapacity = blockRooms.reduce((acc, r) => acc + (r.filledCapacity || 0), 0);

            return (
              <div
                key={blockName}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white">{blockName}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                          {totalRooms} Kamar
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Kapasitas Terisi: <strong>{filledCapacity}</strong> / {totalCapacity} Tempat
                      </p>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleOpenAdd(blockName)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Kamar di {blockName}
                    </button>
                  )}
                </div>

                {blockRooms.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-semibold text-zinc-400">Belum ada kamar terdaftar di {blockName}.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {blockRooms.map((room) => {
                      const filled = room.filledCapacity || 0;
                      const cap = room.capacity || 20;
                      const isFull = filled >= cap;

                      return (
                        <div
                          key={room.id}
                          onClick={() => setViewingDetail(room)}
                          className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-black text-base text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                <Bed className="w-4 h-4 text-blue-500" />
                                <span>{room.name}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${isFull ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                                {isFull ? "Penuh" : "Tersedia"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                              <User className="w-3.5 h-3.5 text-blue-500" />
                              <span className="truncate font-bold">
                                {room.supervisorName || <span className="italic font-normal text-zinc-400">Belum ada Pembina</span>}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold">
                              <span className="text-zinc-400">Hunian:</span>
                              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{filled} / {cap}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: DAFTAR KAMAR MASTER TABLE */}
      {activeSubTab === "kamar" && (
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
          tableName="kamar_asrama"
        />
      )}

      {/* SUB-TAB 3: PLOTTING MUSYRIFAH & PEMBINA KAMAR */}
      {activeSubTab === "musyrifah" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-xs">
            <h3 className="font-black text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Penugasan Pembina Kamar (Musyrifah) dari Data Pengurus
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Seluruh Pengurus Induk yang ditugaskan mengampu Blok / Kamar secara otomatis menjadi Penanggung Jawab / Musyrifah Kamar tersebut.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {allRooms.map((r) => (
                <div key={r.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-blue-500" /> {r.name} ({r.buildingName})
                    </span>
                    <button onClick={() => handleOpenEdit(r)} className="px-2.5 py-1 bg-blue-500/10 text-blue-600 text-xs font-extrabold rounded-lg hover:bg-blue-500/20 cursor-pointer">
                      Ubah Pembina
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {r.supervisorName || <span className="italic text-zinc-400 font-normal">Belum ditunjuk</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal with Pengurus Integration */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Bed className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    {editingRoom ? "Edit Kamar & Penugasan Musyrifah" : "Tambah Kamar Baru & Penugasan"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md cursor-pointer"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[75vh]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Kamar Asrama *</label>
                  <input type="text" required placeholder="Contoh: Kamar A-02, Kamar E-01" value={name} onChange={(e) => { setName(e.target.value); if (e.target.value.trim() && !editingRoom) setBuildingName(determineBuildingName(e.target.value, buildingName)); }} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Blok (Komplek) *</label>
                  <input type="text" required list="block-names-list" placeholder="Contoh: Blok A, Blok B" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-extrabold text-zinc-900 dark:text-white focus:outline-none" />
                  <datalist id="block-names-list">
                    {allBlockNames.map((bName) => (
                      <option key={bName} value={bName} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Kapasitas Maksimal (Santriwati) *</label>
                  <input type="number" required min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none" />
                </div>

                {/* Supervisor Selection from PENGURUS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Pembina Kamar / Musyrifah (Diambil dari Data Pengurus)</label>
                  <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer">
                    <option value="">-- Pilih Pengurus Penanggung Jawab Kamar --</option>
                    {pengurusList.map((p) => (
                      <option key={p.personId || p.id} value={p.personId || p.id}>
                        {p.name} ({p.role || "Pengurus"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-400">
                    Memilih pengurus dari database induk Pengurus P3HM Lirboyo.
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-3 border-t border-zinc-150 dark:border-zinc-800 pt-5">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer">Simpan Data Kamar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
