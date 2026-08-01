"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit3, BookOpen, Layers, Plus, X, Save } from "lucide-react";
import { useClasses } from "@/features/sekretariat/queries/useClasses";
import { useGuru } from "@/features/sekretariat/queries/useGuru";
import { usePengurus } from "@/features/sekretariat/queries/usePengurus";
import { useToast } from "@/components/shared/ToastContext";

const CLASS_LEVELS_MAP: Record<string, string[]> = {
  "I'dadiyyah": ["I", "II", "III"],
  "Ibtida'iyyah": ["I", "II", "III", "IV", "V", "VI"],
  "Tsanawiyyah": ["I", "II", "III"],
  "Aliyyah": ["I", "II", "III"],
  "Al-Robithoh": ["I"]
};

export function DataKelasGrid({ onViewDetail, selectedYearId, isReadOnly = false }: { onViewDetail?: (data: Record<string, unknown>) => void, selectedYearId?: string, isReadOnly?: boolean }) {
  const { toast, confirm } = useToast();
  const { data: remoteData, isLoading, createClass, isCreating, updateClass, isUpdating, deleteClass } = useClasses(selectedYearId);
  
  const { data: mustahiqListRemote = { data: [], total: 0 } } = useGuru("", 0, 100);
  const mustahiqList = mustahiqListRemote.data;
  const [jenjang, setJenjang] = useState<string>("Semua");
  
  // State for Create Form
  const [showForm, setShowForm] = useState(false);
  const [newJenjang, setNewJenjang] = useState("Ibtida'iyyah");
  const [newTingkat, setNewTingkat] = useState("I");
  const [newRuang, setNewRuang] = useState("A");
  const [newMustahiq, setNewMustahiq] = useState("");
  const [newCapacity, setNewCapacity] = useState(40);

  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [editMustahiqId, setEditMustahiqId] = useState("");
  const [editCapacity, setEditCapacity] = useState(40);

  const classesData = remoteData || [];

  const jenjangOptions = ["Semua", "I'dadiyyah", "Ibtida'iyyah", "Tsanawiyyah", "Aliyyah"];

  const filteredData = classesData.filter(cls => {
    if (jenjang === "Semua") return true;
    return cls.name.toLowerCase().includes(jenjang.toLowerCase());
  });

  const targetPattern = `${newJenjang} ${newTingkat} ${newRuang}`.trim().toLowerCase();

  const sortedMustahiqList = [...mustahiqList].sort((a, b) => {
    const aRole = (a.role || "").toLowerCase();
    const bRole = (b.role || "").toLowerCase();
    const aMatch = aRole.includes(targetPattern) || (aRole.includes(newJenjang.toLowerCase()) && aRole.includes(newRuang.toLowerCase()));
    const bMatch = bRole.includes(targetPattern) || (bRole.includes(newJenjang.toLowerCase()) && bRole.includes(newRuang.toLowerCase()));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return a.name.localeCompare(b.name);
  });



  useEffect(() => {
    if (mustahiqList.length > 0) {
      const match = sortedMustahiqList.find(g => {
        const r = (g.role || "").toLowerCase();
        return r.includes(targetPattern) || (r.includes(newJenjang.toLowerCase()) && r.includes(newRuang.toLowerCase()));
      });
      if (match) {
        setNewMustahiq(match.id);
      }
    }
  }, [newJenjang, newTingkat, newRuang, mustahiqList.length]);



  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            Grid Data Kelas (Rombel)
          </h2>
          <p className="text-sm text-zinc-500">Menampilkan data kelas dan rombongan belajar santri.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Filter Jenjang:</label>
          <select 
            value={jenjang} 
            onChange={(e) => setJenjang(e.target.value)}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            {jenjangOptions.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          {!isReadOnly && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Batal" : "Tambah Kelas"}
            </button>
          )}
        </div>
      </div>

      {/* Form Tambah Kelas */}
      {showForm && !isReadOnly && (
        <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 shadow-sm mb-2 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" /> Registrasi Kelas Permanen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Jenjang *</label>
              <select 
                value={newJenjang}
                onChange={(e) => {
                  setNewJenjang(e.target.value);
                  setNewTingkat(CLASS_LEVELS_MAP[e.target.value][0]);
                }}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
              >
                {Object.keys(CLASS_LEVELS_MAP).map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Tingkat *</label>
              <select 
                value={newTingkat}
                onChange={(e) => setNewTingkat(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
              >
                {CLASS_LEVELS_MAP[newJenjang].map(t => <option key={t} value={t}>Tingkat {t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Ruang/Lokal *</label>
              <input 
                type="text" 
                value={newRuang}
                onChange={(e) => setNewRuang(e.target.value.toUpperCase())}
                placeholder="Contoh: A, B, C"
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none uppercase"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Wali Kelas (Mustahiq)</label>
              <select 
                value={newMustahiq}
                onChange={(e) => setNewMustahiq(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
              >
                <option value="">Pilih Mustahiq...</option>
                {sortedMustahiqList.map((guru) => {
                  const r = (guru.role || "").toLowerCase();
                  const isExact = r.includes(targetPattern);
                  const isPartial = r.includes(newJenjang.toLowerCase()) && r.includes(newRuang.toLowerCase());
                  const star = isExact ? "⭐ " : isPartial ? "✨ " : "";
                  const matchBadge = isExact
                    ? ` [Sesuai ${newJenjang} ${newTingkat} ${newRuang}]`
                    : isPartial
                    ? ` [Sesuai ${newJenjang} ${newRuang}]`
                    : "";
                  return (
                    <option key={guru.id} value={guru.id}>
                      {star}{guru.name} — ({guru.role || "Mustahiq"}){matchBadge}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Kapasitas (Siswa)</label>
              <input 
                type="number" 
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              disabled={isCreating || !newRuang || !newMustahiq}
              onClick={async () => {
                await createClass({
                  academicYearId: selectedYearId,
                  institutionLevel: newJenjang,
                  classLevel: newTingkat,
                  section: newRuang,
                  mustahiqId: newMustahiq,
                  capacity: newCapacity
                } as any);
                setShowForm(false);
                setNewRuang("");
                setNewMustahiq("");
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isCreating ? "Menyimpan..." : "Simpan Kelas"}
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout 3-3 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-20" />
              <p>Tidak ada data kelas untuk jenjang ini.</p>
            </div>
          ) : (
            filteredData.map(cls => (
              <div 
                key={cls.id} 
                onClick={() => onViewDetail && onViewDetail(cls as unknown as Record<string, unknown>)}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col ${onViewDetail ? "cursor-pointer" : ""}`}
              >
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-800/20">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{cls.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Lokal / Ruang Aktif
                    </span>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClass(cls);
                          setEditMustahiqId(cls.mustahiqId || "");
                          setEditCapacity(cls.capacity || 40);
                        }}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Kelas"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          const isConfirmed = await confirm({
                            title: "Hapus Kelas Diniyyah?",
                            message: `Apakah Anda yakin ingin menghapus kelas ${cls.name}? Data kelas ini akan dipindahkan ke keranjang sampah.`,
                            confirmText: "Ya, Hapus Kelas",
                            cancelText: "Batal",
                            type: "danger",
                          });
                          if (isConfirmed) {
                            try {
                              await deleteClass(cls.id);
                              toast(`Kelas ${cls.name} berhasil dihapus!`, "success", "Kelas Dihapus");
                            } catch (err: any) {
                              toast(err?.message || "Gagal menghapus kelas", "error", "Gagal Hapus");
                            }
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Mustahiq (Wali)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-right">{cls.mustahiq}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Kapasitas</span>
                    <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
                      {cls.capacity} Siswa
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Edit Kelas */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                Edit Data Kelas ({editingClass.name})
              </h3>
              <button onClick={() => setEditingClass(null)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 space-y-4 text-sm font-medium">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Wali Kelas (Mustahiq)</label>
                <select 
                  value={editMustahiqId} 
                  onChange={(e) => setEditMustahiqId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700 font-bold"
                >
                  <option value="">Pilih Wali Kelas (Mustahiq)</option>
                  {mustahiqList.map((m) => (
                    <option key={m.id} value={m.personId || m.id}>
                      {m.name} — ({m.role || "Mustahiq"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Kapasitas Maksimal (Siswa)</label>
                <input 
                  type="number"
                  value={editCapacity} 
                  onChange={(e) => setEditCapacity(Number(e.target.value))} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-hidden dark:bg-zinc-800 dark:border-zinc-700 font-mono" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setEditingClass(null)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                  Batal
                </button>
                <button 
                  disabled={isUpdating}
                  onClick={async () => {
                    try {
                      await updateClass({
                        id: editingClass.id,
                        mustahiqId: editMustahiqId,
                        capacity: editCapacity
                      });
                      toast("Data Kelas berhasil diperbarui!", "success", "Sukses");
                      setEditingClass(null);
                    } catch (err: any) {
                      toast(err.message || "Gagal memperbarui kelas", "error", "Gagal");
                    }
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
