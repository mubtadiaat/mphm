"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useToast } from "@/components/shared/ToastContext";

import { useGuru, Guru } from "../queries/useGuru";
import { addPosisiToJabatan } from "@/config/jobPositions.config";
import { UserAvatar } from "@/components/shared/UserAvatar";

const DEFAULT_PAGINATED_DATA = { data: [], total: 0 };

export function MustahiqTab({ onViewDetail, isReadOnly = false }: { onViewDetail: (data: Record<string, unknown>) => void, isReadOnly?: boolean }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const { data: remoteData = DEFAULT_PAGINATED_DATA, isLoading, createGuru, updateGuru, deleteGuru } = useGuru(searchQuery, pageIndex, pageSize);
  const { toast, confirm } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState<Guru | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Guru | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jenjang, setJenjang] = useState("Ibtida'iyyah");
  const [tingkat, setTingkat] = useState("I");
  const [lokal, setLokal] = useState("A");

  useEffect(() => {
    if (remoteData) {
      setTeachers(remoteData.data as Guru[]);
      setTotalCount(remoteData.total);
    }
  }, [remoteData.data, remoteData.total]);

  const resetForm = () => {
    setName(""); setPhone(""); setJenjang("Ibtida'iyyah"); setTingkat("I"); setLokal("A");
  };

  const handleOpenAdd = () => {
    setEditingData(null); resetForm(); setShowModal(true);
  };

  const handleOpenEdit = (item: Guru) => {
    setEditingData(item);
    setName(item.name);
    setPhone(item.phone || "");
    setJenjang(item.jenjang && item.jenjang !== "-" ? item.jenjang : "Ibtida'iyyah");
    setTingkat(item.tingkat && item.tingkat !== "-" ? item.tingkat : "I");
    setLokal(item.lokal && item.lokal !== "-" ? item.lokal : "A");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data Mustahiq?",
      message: "Apakah Anda yakin ingin menghapus data Mustahiq ini?",
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deleteGuru(id);
        toast("Data Mustahiq berhasil dihapus", "success", "Sukses");
      } catch (_err) {
        toast("Gagal menghapus data Mustahiq", "error", "Gagal");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast("Lengkapi nama Mustahiq", "warning", "Peringatan");
    const fullRole = `Mustahiq ${jenjang} ${tingkat} ${lokal}`.trim();

    try {
      if (editingData) {
        if (!editingData.personId) throw new Error("ID person tidak ditemukan pada data ini.");
        await updateGuru({
          personId: editingData.personId,
          name,
          phone,
          roleName: fullRole,
        });
        toast("Data Mustahiq berhasil diperbarui!", "success", "Sukses");
      } else {
        await createGuru({
          name,
          phone,
          roleName: fullRole,
          gender: "L",
        });
        await addPosisiToJabatan("Mustahiq", `${jenjang} ${tingkat} ${lokal}`, "MADRASAH");
        toast("Mustahiq baru berhasil didaftarkan!", "success", "Sukses");
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data", "error", "Gagal");
    }
  };

  const columns: ColumnDef<Guru, unknown>[] = [
    { accessorKey: "name", header: "Nama Lengkap Mustahiq", cell: info => (
      <div className="flex items-center gap-3">
        <UserAvatar name={info.getValue() as string} avatarUrl={info.row.original.avatarUrl} size="md" />
        <span className="font-bold">{info.getValue() as string}</span>
      </div>
    ) },
    { accessorKey: "jenjang", header: "Jenjang", cell: info => <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 rounded-md">{(info.getValue() as string) || "-"}</span> },
    { accessorKey: "tingkatLokal", header: "Tingkat | Lokal", cell: info => <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{(info.getValue() as string) || "-"}</span> },
    { accessorKey: "phone", header: "No. HP / WA", cell: info => <span className="font-mono text-xs">{info.getValue() as string || "-"}</span> },
    { accessorKey: "status", header: "Status", cell: info => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${info.getValue() === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {info.getValue() as string}
      </span>
    )},
    {
      id: "actions", header: "Aksi",
      cell: info => <TableActions onEdit={() => handleOpenEdit(info.row.original)} onDelete={() => handleDelete(info.row.original.id)} onDetail={() => onViewDetail(info.row.original as unknown as Record<string, unknown>)} isReadOnly={isReadOnly} />
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Dewan Pengajar & Mustahiq Kelas</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Data Mustahiq (Wali Kelas)
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola data pengajar dan Mustahiq penanggung jawab masing-masing kelas diniyyah.
          </p>
        </div>
        {!isReadOnly && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all z-10">
            <Plus className="w-4 h-4" /> Tambah Mustahiq
          </button>
        )}
      </div>

      <UniversalDataGrid
        columns={columns}
        data={teachers}
        pageCount={Math.ceil(totalCount / pageSize) || 1}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchQuery}
        loading={isLoading}
        onRowClick={(row) => setViewingDetail(row as unknown as Guru)}
        tableName="mustahiq"
        importExportProps={{
          title: "Data Mustahiq dan Dewan Pengajar",
          headers: ["Nama Lengkap Mustahiq", "Jenjang", "Tingkat", "Ruang / Lokal", "NIK (16 Digit)", "No. HP / WhatsApp", "Alamat Lengkap"],
          onImportSuccess: async (rows) => {
            let count = 0;
            for (const r of rows) {
              const nameVal = r["Nama Lengkap Mustahiq"] || r["Nama Lengkap"] || r["nama"] || "";
              if (!nameVal.trim()) continue;

              const jenjangVal = r["Jenjang"] || r["jenjang"] || "";
              const tingkatVal = r["Tingkat"] || r["tingkat"] || "";
              const lokalVal = r["Ruang / Lokal"] || r["Lokal"] || r["lokal"] || r["ruang"] || "";

              let fullRole = "";
              const posVal = r["Jabatan / Posisi"] || r["Jabatan"] || r["Posisi"] || r["roleName"] || r["role"];
              if (posVal && String(posVal).trim()) {
                fullRole = String(posVal).trim().startsWith("Mustahiq") ? String(posVal).trim() : `Mustahiq ${String(posVal).trim()}`;
              } else {
                fullRole = `Mustahiq ${jenjangVal} ${tingkatVal} ${lokalVal}`.trim();
              }

              const phoneVal = r["No. HP / WhatsApp"] || r["phone"] || "";
              try {
                await createGuru({
                  name: nameVal,
                  phone: phoneVal,
                  roleName: fullRole,
                  gender: "L",
                });
                await addPosisiToJabatan("Mustahiq", `${jenjangVal} ${tingkatVal} ${lokalVal}`.trim() || "Mustahiq", "MADRASAH");
                count++;
              } catch (err) {
                console.error("Import row failed:", err);
              }
            }
            if (count > 0) {
              toast(`Berhasil mengimpor ${count} data Mustahiq!`, "success", "Import Berhasil");
            }
          }
        }}
      />

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between">
                <h3 className="font-bold">{editingData ? "Edit Mustahiq" : "Tambah Mustahiq"}</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:bg-zinc-100 p-1 rounded-md"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap Mustahiq</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No. HP / WhatsApp</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Jenjang</label>
                    <select value={jenjang} onChange={e => setJenjang(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700">
                      <option value="I'dadiyyah">I&apos;dadiyyah</option>
                      <option value="Ibtida'iyyah">Ibtida&apos;iyyah</option>
                      <option value="Tsanawiyyah">Tsanawiyyah</option>
                      <option value="Aliyyah">Aliyyah</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tingkat</label>
                    <select value={tingkat} onChange={e => setTingkat(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700">
                      <option value="I">Tingkat I</option>
                      <option value="II">Tingkat II</option>
                      <option value="III">Tingkat III</option>
                      <option value="IV">Tingkat IV</option>
                      <option value="V">Tingkat V</option>
                      <option value="VI">Tingkat VI</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Ruang / Lokal</label>
                    <input value={lokal} onChange={e => setLokal(e.target.value.toUpperCase())} placeholder="A, B, C" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden uppercase dark:bg-zinc-800 dark:border-zinc-700" />
                  </div>
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

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewingDetail(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Detail Rinci Mustahiq
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Nama Mustahiq</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-bold">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Jenjang</td>
                      <td className="py-2.5 text-purple-700 dark:text-purple-300 text-left font-bold">{viewingDetail.jenjang || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Tingkat & Lokal</td>
                      <td className="py-2.5 text-blue-600 dark:text-blue-400 text-left font-bold">{viewingDetail.tingkatLokal || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">No. HP / WhatsApp</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left font-mono">{viewingDetail.phone || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 pr-4 font-bold text-zinc-400 dark:text-zinc-500 w-1/3 text-left">Status</td>
                      <td className="py-2.5 text-zinc-800 dark:text-zinc-200 text-left">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${viewingDetail.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {viewingDetail.status || "ACTIVE"}
                        </span>
                      </td>
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
