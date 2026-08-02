"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X, UserCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { TableActions } from "@/components/shared/TableActions";
import { useToast } from "@/components/shared/ToastContext";

import { useGuru, Guru } from "../queries/useGuru";
import { addPosisiToJabatan } from "@/config/jobPositions.config";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { apiRequest } from "@/lib/api";

const DEFAULT_PAGINATED_DATA = { data: [], total: 0 };

export function PengajarTab({ onViewDetail, isReadOnly = false }: { onViewDetail: (data: Record<string, unknown>) => void, isReadOnly?: boolean }) {
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

  // DB Subjects & Classes
  const [dbSubjects, setDbSubjects] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [dbClasses, setDbClasses] = useState<Array<{ id: string; name: string; fullName?: string }>>([]);

  useEffect(() => {
    apiRequest<{ data: Array<{ id: string; name: string; code?: string }> }>("/api/admin/subjects")
      .then((res) => {
        if (res.data) setDbSubjects(res.data);
      })
      .catch(() => {});

    apiRequest<{ data: Array<{ id: string; name: string; fullName?: string }> }>("/api/admin/classes")
      .then((res) => {
        if (res.data) setDbClasses(res.data);
      })
      .catch(() => {});
  }, []);

  // Form states - Dual Role
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isMustahiq, setIsMustahiq] = useState(true);
  const [kelasLevel, setKelasLevel] = useState("Ibtida'iyyah I");
  const [lokal, setLokal] = useState("A");

  // Munawwib Role States
  const [isMunawwib, setIsMunawwib] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [subjectClasses, setSubjectClasses] = useState("");

  useEffect(() => {
    if (dbSubjects.length > 0 && !subjectName) {
      setSubjectName(dbSubjects[0].name);
    }
  }, [dbSubjects, subjectName]);

  useEffect(() => {
    if (dbClasses.length > 0 && !subjectClasses) {
      setSubjectClasses(dbClasses[0].name);
    }
  }, [dbClasses, subjectClasses]);

  useEffect(() => {
    if (remoteData) {
      setTeachers(remoteData.data as Guru[]);
      setTotalCount(remoteData.total);
    }
  }, [remoteData.data, remoteData.total]);

  const resetForm = () => {
    setName(""); setPhone(""); setKelasLevel("Ibtida'iyyah I"); setLokal("A");
    setIsMustahiq(true); setIsMunawwib(true); 
    setSubjectName(dbSubjects[0]?.name || "");
    setSubjectClasses(dbClasses[0]?.name || "");
  };

  const handleOpenAdd = () => {
    setEditingData(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: Guru) => {
    setEditingData(item);
    setName(item.name);
    setPhone(item.phone || "");
    setKelasLevel(item.jenjang && item.jenjang !== "-" ? item.jenjang : "Ibtida'iyyah I");
    setLokal(item.lokal && item.lokal !== "-" ? item.lokal : "A");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data Pengajar?",
      message: "Apakah Anda yakin ingin menghapus data Pengajar ini?",
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
    });

    if (isConfirmed) {
      try {
        await deleteGuru(id);
        toast("Data Pengajar berhasil dihapus", "success", "Sukses");
      } catch (_err) {
        toast("Gagal menghapus data Pengajar", "error", "Gagal");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast("Lengkapi nama Pengajar", "warning", "Peringatan");
    
    let fullRole = "";
    if (isMustahiq && isMunawwib) {
      fullRole = `Mustahiq ${kelasLevel}-${lokal} & Munawwib ${subjectName}`;
    } else if (isMustahiq) {
      fullRole = `Mustahiq ${kelasLevel}-${lokal}`;
    } else if (isMunawwib) {
      fullRole = `Munawwib ${subjectName} (${subjectClasses})`;
    } else {
      fullRole = "Pengajar Diniyyah";
    }

    try {
      if (editingData) {
        const targetPersonId = editingData.personId || editingData.id;
        await updateGuru({
          personId: targetPersonId,
          name,
          phone,
          roleName: fullRole,
        });
        toast("Data Pengajar berhasil diperbarui!", "success", "Perubahan Disimpan");
      } else {
        await createGuru({
          name,
          phone,
          roleName: fullRole,
          gender: "L",
        });

        if (isMustahiq) {
          await addPosisiToJabatan("Mustahiq", `${kelasLevel}-${lokal}`.trim(), "MADRASAH");
          await apiRequest("/api/admin/classes").catch(() => {});
        }
        toast("Data Pengajar berhasil ditambahkan! Kelas Rombel terisi & terhubung otomatis di database.", "success", "Pengajar Ditambahkan");
      }
      setShowModal(false);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data pengajar", "error", "Gagal Simpan");
    }
  };

  const columns: ColumnDef<Guru, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nama Pengajar",
      cell: info => (
        <div className="flex items-center gap-3">
          <UserAvatar name={info.getValue() as string} avatarUrl={info.row.original.avatarUrl} size="md" />
          <div>
            <span className="font-bold text-zinc-900 dark:text-white block">{info.getValue() as string}</span>
            <span className="text-[11px] font-mono text-zinc-400">{info.row.original.phone || "Tidak ada No HP"}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "roleName",
      header: "Peran Mustahiq (Wali Kelas)",
      cell: info => {
        const row = info.row.original;
        const role = row.roleName || "";
        const isMustahiqRole = role.toLowerCase().includes("mustahiq") || (row.jenjang && row.jenjang !== "-");
        return (
          <div className="space-y-0.5">
            {isMustahiqRole ? (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800">
                📌 Mustahiq {row.jenjang || ""} {row.tingkatLokal || ""}
              </span>
            ) : (
              <span className="text-xs text-zinc-400 font-mono italic">Bukan Wali Kelas</span>
            )}
          </div>
        );
      }
    },
    {
      id: "munawwibRole",
      header: "Peran Munawwib (Guru Mapel)",
      cell: info => {
        const row = info.row.original;
        const role = row.roleName || "";
        const isMunawwibRole = role.toLowerCase().includes("munawwib") || role.toLowerCase().includes("guru") || role.toLowerCase().includes("pengajar");
        return (
          <div className="space-y-0.5">
            {isMunawwibRole ? (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                📖 {role.includes("&") ? role.split("&")[1]?.trim() : role}
              </span>
            ) : (
              <span className="text-xs text-zinc-400 font-mono italic">Pengajar Reguler</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${info.getValue() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
          {info.getValue() as string || "ACTIVE"}
        </span>
      )
    },
    {
      id: "actions",
      header: "Aksi",
      cell: info => <TableActions onEdit={() => handleOpenEdit(info.row.original)} onDelete={() => handleDelete(info.row.original.id)} onDetail={() => onViewDetail(info.row.original as unknown as Record<string, unknown>)} isReadOnly={isReadOnly} />
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Kewenangan Penuh Madrasah (MPHM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Pengajar (Mustahiq / Munawwib)
          </h1>
          <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
            Pengelolaan data Pengajar merupakan kewenangan internal Madrasah dan berdiri sendiri tanpa penarikan data Pondok P3HM. Seluruh data <strong>Mustahiq (Wali Kelas)</strong> &amp; <strong>Munawwib (Guru Mapel)</strong> ditambahkan secara langsung.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2 z-10 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengajar Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-xs">
        <span className="text-base">✨</span>
        <span>
          <strong>Ketentuan Data Pengajar:</strong> Data Pengajar dibuat dan dikelola penuh oleh Madrasah. Tidak ada fitur penarikan dari Pondok P3HM untuk menjaga independensi administrasi akademik Madrasah.
        </span>
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
        tableName="pengajar"
        importExportProps={{
          title: "Data Pengajar Diniyyah (Mustahiq & Munawwib)",
          headers: ["Nama_Pengajar", "NIK_KTP", "No_HP", "Jenjang_Tingkat_Baku", "Lokal_Ruang", "Peran_Utama", "Mapel_Munawwib", "Status"],
          onExportFetchAll: async () => {
            let url = `/api/admin/people?role=teacher&limit=10000&offset=0`;
            if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest<{ data: Guru[] }>(url);
            return res?.data || [];
          },
          onImportSuccess: async (rows) => {
            let count = 0;
            for (const r of rows) {
              const nameVal = r["Nama_Pengajar"] || r["Nama Lengkap Pengajar"] || r["Nama Lengkap"] || r["nama"] || "";
              if (!nameVal.trim()) continue;
              const phoneVal = r["No_HP"] || r["No. HP / WhatsApp"] || r["phone"] || "";
              const jenjangTingkat = r["Jenjang_Tingkat_Baku"] || r["Mustahiq Wali Kelas"] || "Ibtida'iyyah I";
              const lokalRuang = r["Lokal_Ruang"] || "A";
              const mapel = r["Mapel_Munawwib"] || "";

              let fullRole = `Mustahiq ${jenjangTingkat}-${lokalRuang}`;
              if (mapel && mapel !== "-") {
                fullRole += ` & Munawwib ${mapel}`;
              }

              try {
                await createGuru({
                  name: nameVal,
                  phone: phoneVal,
                  roleName: fullRole,
                  gender: "L",
                });
                await addPosisiToJabatan("Mustahiq", `${jenjangTingkat}-${lokalRuang}`.trim(), "MADRASAH");
                count++;
              } catch (err) {
                console.error("Import row failed:", err);
              }
            }
            if (count > 0) {
              await apiRequest("/api/admin/classes").catch(() => {});
              toast(`Berhasil mengimpor ${count} data Pengajar! Kelas Rombel terisi otomatis di database.`, "success", "Import Berhasil");
            }
          }
        }}
      />

      {/* Modal Add/Edit Pengajar */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-950">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                  {editingData ? "Edit Data Pengajar" : "Pendaftaran Pengajar Baru (Madrasah)"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md cursor-pointer"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nama Lengkap Pengajar *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ketik Nama Lengkap beserta Gelar..." className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:text-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No. HP / WhatsApp</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="081234567890" className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:text-white font-mono" />
                </div>

                {/* Section 1: Peran Mustahiq (Wali Kelas) */}
                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      📌 Peran Mustahiq (Wali Kelas)
                    </span>
                    <input type="checkbox" checked={isMustahiq} onChange={(e) => setIsMustahiq(e.target.checked)} className="w-4 h-4 accent-purple-600 rounded cursor-pointer" />
                  </div>

                  {isMustahiq && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block mb-1">Jenjang &amp; Tingkat Kelas (Baku) *</label>
                          <select value={kelasLevel} onChange={e => setKelasLevel(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white">
                            <optgroup label="I'dadiyyah">
                              <option value="I'dadiyyah I">I&apos;dadiyyah I</option>
                              <option value="I'dadiyyah II">I&apos;dadiyyah II</option>
                              <option value="I'dadiyyah III">I&apos;dadiyyah III</option>
                            </optgroup>
                            <optgroup label="Ibtida'iyyah">
                              <option value="Ibtida'iyyah I">Ibtida&apos;iyyah I</option>
                              <option value="Ibtida'iyyah II">Ibtida&apos;iyyah II</option>
                              <option value="Ibtida'iyyah III">Ibtida&apos;iyyah III</option>
                              <option value="Ibtida'iyyah IV">Ibtida&apos;iyyah IV</option>
                              <option value="Ibtida'iyyah V">Ibtida&apos;iyyah V</option>
                              <option value="Ibtida'iyyah VI">Ibtida&apos;iyyah VI</option>
                            </optgroup>
                            <optgroup label="Tsanawiyyah">
                              <option value="Tsanawiyyah I">Tsanawiyyah I</option>
                              <option value="Tsanawiyyah II">Tsanawiyyah II</option>
                              <option value="Tsanawiyyah III">Tsanawiyyah III</option>
                            </optgroup>
                            <optgroup label="Aliyyah">
                              <option value="Aliyyah I">Aliyyah I</option>
                              <option value="Aliyyah II">Aliyyah II</option>
                              <option value="Aliyyah III">Aliyyah III</option>
                            </optgroup>
                            <optgroup label="Khusus">
                              <option value="Al-Rabithoh">Al-Rabithoh</option>
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block mb-1">Ruang / Lokal *</label>
                          <input value={lokal} onChange={e => setLokal(e.target.value.toUpperCase())} placeholder="Contoh: A, B, C..." className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white uppercase" />
                        </div>
                      </div>

                      <div className="p-3 bg-purple-100/60 dark:bg-purple-900/40 rounded-xl flex items-center gap-2.5 text-[11px] text-purple-900 dark:text-purple-200 font-semibold">
                        <Info className="w-4 h-4 shrink-0 text-purple-600" />
                        <span>Kelas Rombel (<strong>{kelasLevel}-{lokal}</strong>) akan terisi &amp; dibuat otomatis di database untuk pencetakan Raport, Ijazah &amp; Sertifikat.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Peran Munawwib (Guru Mapel) */}
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      📖 Peran Munawwib (Guru Mata Pelajaran)
                    </span>
                    <input type="checkbox" checked={isMunawwib} onChange={(e) => setIsMunawwib(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
                  </div>

                  {isMunawwib && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-1">Mata Pelajaran (Dari Database Kurikulum)</label>
                        {dbSubjects.length > 0 ? (
                          <select value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white">
                            {dbSubjects.map((s) => (
                              <option key={s.id} value={s.name}>{s.name} {s.code ? `(${s.code})` : ""}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-2.5 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl text-[11px] font-semibold border border-amber-200">
                            ⚠️ Belum ada Mata Pelajaran dibuat di Database. Silakan buat Kurikulum / Mapel di menu <a href="/sekretariat/kurikulum" className="underline font-bold">/sekretariat/kurikulum</a> terlebih dahulu.
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-1">Kelas Ampuan (Dari Database Rombel)</label>
                        {dbClasses.length > 0 ? (
                          <select value={subjectClasses} onChange={e => setSubjectClasses(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white">
                            {dbClasses.map((c) => (
                              <option key={c.id} value={c.name}>{c.fullName || c.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-2.5 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl text-[11px] font-semibold border border-amber-200">
                            ⚠️ Belum ada Kelas Rombel dibuat di Database.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Simpan Data Pengajar</button>
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
                  <UserCheck className="w-5 h-5 text-blue-500" />
                  Detail Data Pengajar
                </h3>
                <button onClick={() => setViewingDetail(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md cursor-pointer"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-4 text-xs font-medium">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">Nama Lengkap</td>
                      <td className="py-2.5 font-bold text-zinc-900 dark:text-white">{viewingDetail.name || "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">Peran Mustahiq</td>
                      <td className="py-2.5 font-extrabold text-purple-600 dark:text-purple-400">{viewingDetail.jenjang ? `Mustahiq ${viewingDetail.jenjang} ${viewingDetail.tingkatLokal}` : "-"}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-400 w-1/3">Peran / Mapel</td>
                      <td className="py-2.5 font-extrabold text-blue-600 dark:text-blue-400">{viewingDetail.roleName || "-"}</td>
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
