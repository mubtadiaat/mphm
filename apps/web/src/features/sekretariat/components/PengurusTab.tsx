"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, Users, Briefcase, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useToast } from "@/components/shared/ToastContext";

import { usePengurus, Pengurus } from "../queries/usePengurus";
import { getPositionsForJabatan, addPosisiToJabatan } from "@/config/jobPositions.config";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { apiRequest } from "@/lib/api";

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

  const { data: remoteData = DEFAULT_PAGINATED_DATA, isLoading, createPengurus, updatePengurus, deletePengurus } = usePengurus(searchQuery, pageIndex, pageSize);
  const { toast, confirm } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [showJabatanModal, setShowJabatanModal] = useState(false);
  const [editingData, setEditingData] = useState<Pengurus | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Pengurus | null>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [newJabatanName, setNewJabatanName] = useState("");

  const [pengurusTitles, setPengurusTitles] = useState<string[]>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("mphm_custom_pengurus_jabatan") : null;
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const defaults = getPositionsForJabatan("Pengurus Harian", "PONDOK");
    return defaults.length > 0 ? defaults : ["Ketua Pengurus", "Penasehat", "Pembina Kamar (Musyrifah)", "Sekretaris", "Bendahara", "Keamanan", "Pendidikan"];
  });

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
    localStorage.setItem("mphm_custom_pengurus_jabatan", JSON.stringify(updated));
    await addPosisiToJabatan("Pengurus Harian", title, "PONDOK");
    setNewJabatanName("");
    toast(`Jabatan "${title}" berhasil ditambahkan!`, "success");
  };

  // Delete Custom Jabatan
  const handleDeleteJabatan = (titleToDelete: string) => {
    const updated = pengurusTitles.filter(t => t !== titleToDelete);
    setPengurusTitles(updated);
    localStorage.setItem("mphm_custom_pengurus_jabatan", JSON.stringify(updated));
    toast(`Jabatan "${titleToDelete}" dihapus dari opsi.`, "info");
  };

  const resetForm = () => {
    setName(""); setPhone(""); setRole("");
  };

  const handleOpenAdd = () => {
    setEditingData(null); resetForm(); setShowModal(true);
  };

  const handleOpenEdit = (item: Pengurus) => {
    setEditingData(item);
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

  const formatFullRole = (pos: string, defaultJabatan: string) => {
    if (!pos || !pos.trim()) return defaultJabatan;
    const p = pos.trim();
    if (p.toLowerCase().includes("pengurus") || p.toLowerCase().includes("harian") || p.toLowerCase().includes("pleno") || p.toLowerCase().includes("penasihat") || p.toLowerCase().includes("musyrifah")) return p;
    return `${defaultJabatan} ${p}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast("Nama Lengkap wajib diisi", "warning");
    if (!phone.trim()) return toast("Nomor WhatsApp Aktif wajib diisi", "warning");

    const fullRole = formatFullRole(role, "Pengurus");

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
          localStorage.setItem("mphm_custom_pengurus_jabatan", JSON.stringify(updated));
          await addPosisiToJabatan("Pengurus Harian", role, "PONDOK");
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
            <Users className="w-4 h-4" />
            <span>Manajemen SDM Pengurus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Pengurus & Manajemen Jabatan
          </h1>
          <p className="text-blue-100/90 text-sm max-w-xl">
            Single Source of Truth Data Pengurus Induk (P3HM Lirboyo) serta pembuatan struktur Jabatan Instansi secara dinamis.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-3 z-10 shrink-0">
            <button 
              onClick={() => setShowJabatanModal(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-md"
            >
              <Briefcase className="w-4 h-4" /> Kelola Jabatan ({pengurusTitles.length})
            </button>
            <button 
              onClick={handleOpenAdd} 
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-black shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Pengurus
            </button>
          </div>
        )}
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nama Lengkap Pengurus *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nama Lengkap beserta Gelar" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">No. WhatsApp Aktif *</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+6281234567890" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Jabatan / Posisi Pengurus *</label>
                    <button type="button" onClick={() => setShowJabatanModal(true)} className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer">+ Tambah Jabatan Baru</button>
                  </div>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer">
                    <option value="">-- Pilih Jabatan Pengurus --</option>
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
