import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, Users, Briefcase, Search, BookOpen, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useToast } from "@/components/shared/ToastContext";

import { usePengurus, Pengurus } from "../queries/usePengurus";
import {
  PONDOK_PENGURUS_JABATAN_LIST,
  MADRASAH_PENGURUS_JABATAN_LIST,
  addPosisiToJabatan
} from "@/config/jobPositions.config";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { apiRequest } from "@/lib/api";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

const DEFAULT_PAGINATED_DATA = { data: [], total: 0 };

interface PengurusTabProps {
  onViewDetail: (data: Record<string, unknown>) => void;
  isReadOnly?: boolean;
}

export function PengurusTab({ onViewDetail, isReadOnly = false }: PengurusTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [pengurusData, setPengurusData] = useState<Pengurus[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  let isPondokWorkspace = false;
  try {
    const ws = useWorkspace();
    isPondokWorkspace = ws.activeWorkspace === "pondok";
  } catch {}

  const activePositionList = isPondokWorkspace ? PONDOK_PENGURUS_JABATAN_LIST : MADRASAH_PENGURUS_JABATAN_LIST;

  const { data: remoteData = DEFAULT_PAGINATED_DATA, isLoading, createPengurus, updatePengurus, deletePengurus } = usePengurus(searchQuery, pageIndex, pageSize);
  const { toast, confirm } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [showJabatanModal, setShowJabatanModal] = useState(false);
  const [showPondokPullModal, setShowPondokPullModal] = useState(false);
  const [editingData, setEditingData] = useState<Pengurus | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Pengurus | null>(null);
  const [isPulledFromPondok, setIsPulledFromPondok] = useState(false);

  // Pondok Search States
  const [pondokSearchQuery, setPondokSearchQuery] = useState("");
  const [pondokCandidates, setPondokCandidates] = useState<any[]>([]);
  const [isSearchingPondok, setIsSearchingPondok] = useState(false);
  const [hasSearchedPondok, setHasSearchedPondok] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [newJabatanName, setNewJabatanName] = useState("");

  const [pengurusTitles, setPengurusTitles] = useState<string[]>(() => {
    return activePositionList;
  });

  useEffect(() => {
    setPengurusTitles(activePositionList);
  }, [isPondokWorkspace, activePositionList]);

  useEffect(() => {
    if (remoteData) {
      setPengurusData(remoteData.data as Pengurus[]);
      setTotalCount(remoteData.total);
    }
  }, [remoteData.data, remoteData.total]);

  // Add Custom Jabatan
  const handleAddCustomJabatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJabatanName.trim()) {
      toast("Nama Jabatan tidak boleh kosong!", "warning");
      return;
    }
    const title = newJabatanName.trim();
    if (pengurusTitles.includes(title)) {
      toast("Jabatan ini sudah ada dalam daftar!", "warning");
      return;
    }

    const updated = [...pengurusTitles, title];
    setPengurusTitles(updated);
    await addPosisiToJabatan("Pengurus", title, isPondokWorkspace ? "PONDOK" : "MADRASAH");
    setNewJabatanName("");
    toast(`Jabatan "${title}" berhasil ditambahkan!`, "success");
  };

  // Delete Custom Jabatan
  const handleDeleteJabatan = (titleToDelete: string) => {
    const updated = pengurusTitles.filter(t => t !== titleToDelete);
    setPengurusTitles(updated);
    toast(`Jabatan "${titleToDelete}" dihapus dari opsi.`, "info");
  };

  const resetForm = () => {
    setName(""); setPhone(""); setRole("");
    setIsPulledFromPondok(false);
  };

  const handleOpenAdd = () => {
    if (!isPondokWorkspace) {
      setPondokSearchQuery("");
      setPondokCandidates([]);
      setHasSearchedPondok(false);
      setShowPondokPullModal(true);
    } else {
      setEditingData(null);
      resetForm();
      setShowModal(true);
    }
  };

  const handleSearchPondokPeople = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondokSearchQuery.trim()) return;
    setIsSearchingPondok(true);
    setHasSearchedPondok(true);
    try {
      const res = await apiRequest<{ data: any[] }>(`/api/admin/people?q=${encodeURIComponent(pondokSearchQuery)}&scope=pondok&limit=20`);
      if (res.data) {
        const cleanList = res.data.filter((item: any) => {
          const fn = (item.fullName || item.name || "").toLowerCase();
          return !fn.includes("super admin") && !fn.includes("master developer") && !fn.includes("sekretariat madrasah") && !fn.includes("system admin") && !fn.includes("develzy");
        });
        setPondokCandidates(cleanList);
      }
    } catch {
      setPondokCandidates([]);
    } finally {
      setIsSearchingPondok(false);
    }
  };

  const handlePullPondokPersonToPengurus = (candidate: any) => {
    setEditingData(null);
    resetForm();
    setIsPulledFromPondok(true);
    setName(candidate.fullName || candidate.name || "");
    setPhone(candidate.phoneNumber || candidate.phone || "");
    // Jabatan TIDAK disalin dari Pondok, operator WAJIB memilih Jabatan Madrasah
    setRole("");
    setShowPondokPullModal(false);
    setShowModal(true);
    toast(`✅ Identitas ${candidate.fullName} ditarik dari Pondok. Silakan pilih Jabatan Pengurus Madrasah!`, "info");
  };

  const handleOpenEdit = (item: Pengurus) => {
    setEditingData(item);
    setIsPulledFromPondok(false);
    setName(item.name); setPhone(item.phone || ""); setRole(item.role || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data Pengurus?",
      message: "Apakah Anda yakin ingin menghapus data Pengurus ini?",
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deletePengurus(id);
        toast("Data Pengurus berhasil dihapus", "success");
      } catch (_err) {
        toast("Gagal menghapus data Pengurus", "error");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast("Nama Lengkap wajib diisi", "warning");
    if (!phone.trim()) return toast("Nomor WhatsApp Aktif wajib diisi", "warning");
    if (!role.trim()) return toast("Jabatan Pengurus wajib dipilih!", "warning");

    const fullRole = role.trim();

    try {
      if (editingData) {
        if (!editingData.personId) {
          throw new Error("ID orang tidak ditemukan pada data ini.");
        }
        await updatePengurus({ personId: editingData.personId, name, phone, roleName: fullRole });
        toast("Data Pengurus berhasil diperbarui!", "success");
      } else {
        await createPengurus({ name, phone, roleName: fullRole });
        if (role && !pengurusTitles.includes(role)) {
          const updated = [...pengurusTitles, role];
          setPengurusTitles(updated);
          await addPosisiToJabatan("Pengurus", role, isPondokWorkspace ? "PONDOK" : "MADRASAH");
        }
        toast("Pengurus baru berhasil didaftarkan!", "success");
      }
      setShowModal(false);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data", "error");
    }
  };

  const columns: ColumnDef<Pengurus, unknown>[] = [
    { accessorKey: "name", header: "Nama Lengkap", cell: info => (
      <div className="flex items-center gap-3">
        <UserAvatar name={info.getValue() as string} avatarUrl={info.row.original.avatarUrl} size="md" />
        <span className="font-bold">{info.getValue() as string}</span>
      </div>
    ) },
    { accessorKey: "role", header: "Jabatan & Divisi", cell: info => (
      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs border border-blue-500/20">
        {info.getValue() as string}
      </span>
    ) },
    { accessorKey: "phone", header: "No. Telepon / WA", cell: info => <span className="font-mono text-xs font-semibold">{info.getValue() as string}</span> },
    { accessorKey: "status", header: "Status", cell: info => (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${info.getValue() === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
        {info.getValue() as string}
      </span>
    )},
    {
      id: "actions", header: "Aksi",
      cell: info => <TableActions onEdit={() => handleOpenEdit(info.row.original)} onDelete={() => handleDelete(info.row.original.id)} onDetail={() => onViewDetail(info.row.original as unknown as Record<string, unknown>)} isReadOnly={isReadOnly} />
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Manajemen SDM Pengurus Madrasah (MPHM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Pengurus &amp; Struktur Jabatan Madrasah
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Penarikan data Pengurus Pondok ke Madrasah hanya mengambil <strong>data identitas</strong>. Jabatan di Pondok tidak disinkronkan, sehingga Operator Madrasah menentukan <strong>Jabatan Pengurus Madrasah (11 Jabatan Resmi)</strong> secara mandiri.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-3 z-10 shrink-0">
            <button 
              onClick={() => setShowJabatanModal(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-md"
            >
              <BookOpen className="w-4 h-4" /> Kelola Jabatan ({pengurusTitles.length})
            </button>
            <button 
              onClick={handleOpenAdd} 
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{!isPondokWorkspace ? "Tarik Data dari Pondok P3HM" : "Tambah Pengurus"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-xs">
        <span className="text-base">✨</span>
        <span>
          <strong>Ketentuan Penarikan Data Pengurus:</strong> Penarikan data Pengurus Pondok hanya mengambil data identitas (Nama, NIK, HP, Alamat). Jabatan di Pondok dan Madrasah merupakan kewenangan masing-masing instansi dan tidak saling memengaruhi.
        </span>
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
        onRowClick={(row) => setViewingDetail(row as unknown as Pengurus)}
        tableName="pengurus"
        importExportProps={{
          title: "Data Pengurus dan Struktur Organisasi",
          headers: ["Nama Lengkap Pengurus", "Jabatan / Posisi", "NIK (16 Digit)", "No. HP / WhatsApp", "Alamat Lengkap"],
          onExportFetchAll: async () => {
            let url = `/api/admin/people?role=pengurus&limit=10000&offset=0`;
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest<{ data: Pengurus[] }>(url);
            return res?.data || [];
          },
          onImportSuccess: async (rows) => {
            let count = 0;
            for (const r of rows) {
              const nameVal = r["Nama Lengkap Pengurus"] || r["Nama Lengkap"] || r["nama"] || "";
              if (!nameVal.trim()) continue;
              const roleVal = r["Jabatan / Posisi"] || r["Jabatan"] || r["Posisi"] || r["roleName"] || r["role"] || "Pengurus";
              const phoneVal = r["No. HP / WhatsApp"] || r["phone"] || "";
              try {
                await createPengurus({
                  name: nameVal,
                  phone: phoneVal,
                  roleName: roleVal,
                  gender: "L",
                });
                await addPosisiToJabatan("Pengurus Harian", roleVal, "PONDOK");
                count++;
              } catch (err) {
                console.error("Import row failed:", err);
              }
            }
            if (count > 0) {
              toast(`Berhasil mengimpor ${count} data Pengurus!`, "success");
            }
          }
        }}
      />

      {/* Modal Kelola Daftar Jabatan */}
      <AnimatePresence>
        {showJabatanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                  <Briefcase className="w-5 h-5" />
                  <span>Manajemen Daftar Jabatan Pengurus</span>
                </div>
                <button onClick={() => setShowJabatanModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomJabatan} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah Jabatan Baru (e.g. Penasehat, Musyrifah...)"
                  value={newJabatanName}
                  onChange={(e) => setNewJabatanName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                />
                <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0">
                  + Tambah
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Jabatan Terdaftar Saat Ini:</span>
                <div className="flex flex-wrap gap-2">
                  {pengurusTitles.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <span>{t}</span>
                      <button type="button" onClick={() => handleDeleteJabatan(t)} className="text-zinc-400 hover:text-rose-500 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button type="button" onClick={() => setShowJabatanModal(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer">
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tarik Data Pondok (Untuk Madrasah) */}
      <AnimatePresence>
        {showPondokPullModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowPondokPullModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                  <Search className="w-4 h-4" />
                  <span>Penarikan Data Pengurus dari Database Pondok P3HM</span>
                </div>
                <button onClick={() => setShowPondokPullModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Sesuai prinsip sistem: <strong>Pondok Input — Madrasah Tarik</strong>. Silakan cari NIK, Username, atau Nama Pengurus/Santri di database Pondok untuk didaftarkan sebagai Pengurus Madrasah.
                </p>

                <form onSubmit={handleSearchPondokPeople} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik NIK / Username / Nama..."
                    value={pondokSearchQuery}
                    onChange={(e) => setPondokSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-hidden dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingPondok}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
                  >
                    {isSearchingPondok ? "Mencari..." : "Cari di Pondok"}
                  </button>
                </form>

                {/* Candidate Results */}
                <div className="max-h-60 overflow-y-auto space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {pondokCandidates.map((c) => (
                    <div key={c.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">{c.fullName || c.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{c.phoneNumber || "No HP: -"} • NIK: {c.nik || "-"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePullPondokPersonToPengurus(c)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer shrink-0 shadow-xs"
                      >
                        📥 Tarik Data
                      </button>
                    </div>
                  ))}

                  {hasSearchedPondok && pondokCandidates.length === 0 && !isSearchingPondok && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-center space-y-3">
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        ⚠️ Data yang dicari tidak ditemukan di Database Pondok Pesantren P3HM.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPondokPullModal(false);
                          setEditingData(null);
                          resetForm();
                          setShowModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
                      >
                        🔓 Buka Form Input Manual Baru
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Add/Edit Pengurus */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">{editingData ? "Edit Data Pengurus" : "Pendaftaran Pengurus Baru"}</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md cursor-pointer"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {isPulledFromPondok && (
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium shadow-xs">
                    🔒 <strong>Sinkronisasi Identitas P3HM:</strong> Data Identitas ditarik otomatis dari Pondok. Jabatan Pengurus Pondok <strong>TIDAK disalin</strong> karena merupakan kewenangan masing-masing instansi. Silakan pilih <strong>Jabatan Pengurus Madrasah</strong> di bawah ini.
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Lengkap Pengurus *</label>
                  <input
                    required
                    disabled={isPulledFromPondok}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama Lengkap beserta Gelar"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none disabled:bg-zinc-100 dark:disabled:bg-zinc-800/80 disabled:cursor-not-allowed disabled:text-zinc-600 dark:disabled:text-zinc-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">No. WhatsApp Aktif *</label>
                  <input
                    required
                    disabled={isPulledFromPondok}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+6281234567890"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-white outline-none disabled:bg-zinc-100 dark:disabled:bg-zinc-800/80 disabled:cursor-not-allowed disabled:text-zinc-600 dark:disabled:text-zinc-400"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase">
                      Jabatan Pengurus {isPondokWorkspace ? "Pondok (P3HM)" : "Madrasah (MPHM)"} *
                    </label>
                    <button type="button" onClick={() => setShowJabatanModal(true)} className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer">+ Kelola Jabatan</button>
                  </div>
                  <select
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blue-50/60 dark:bg-blue-950/40 border-2 border-blue-500 rounded-xl text-sm font-black text-blue-900 dark:text-blue-200 outline-none cursor-pointer"
                  >
                    <option value="">-- WAJIB PILIH JABATAN PENGURUS --</option>
                    {pengurusTitles.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Simpan Data Pengurus</button>
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-950">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Detail Pengurus
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md cursor-pointer"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">Nama Lengkap</td>
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-white">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">Jabatan</td>
                      <td className="py-2.5 font-extrabold text-blue-600 dark:text-blue-400">{viewingDetail.role || "Staf"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">No. HP / WA</td>
                      <td className="py-2.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">{viewingDetail.phone || "-"}</td>
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
