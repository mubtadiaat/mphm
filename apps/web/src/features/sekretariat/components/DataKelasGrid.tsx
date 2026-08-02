import { useState, useEffect } from "react";
import { Trash2, Edit3, BookOpen, Layers, Plus, X, Save, UserPlus, Search, CheckCircle2 } from "lucide-react";
import { useClasses } from "@/features/sekretariat/queries/useClasses";
import { useGuru } from "@/features/sekretariat/queries/useGuru";
import { useToast } from "@/components/shared/ToastContext";
import { apiRequest } from "@/lib/api";

const CLASS_LEVELS_MAP: Record<string, string[]> = {
  "I'dadiyyah": ["I", "II", "III"],
  "Ibtida'iyyah": ["I", "II", "III", "IV", "V", "VI"],
  "Tsanawiyyah": ["I", "II", "III"],
  "Aliyyah": ["I", "II", "III"],
  "Al-Robithoh": ["I"]
};

export function DataKelasGrid({ onViewDetail, selectedYearId, isReadOnly = false }: { onViewDetail?: (data: Record<string, unknown>) => void, selectedYearId?: string, isReadOnly?: boolean }) {
  const { toast, confirm } = useToast();
  const { data: remoteData, isLoading, updateClass, isUpdating, deleteClass } = useClasses(selectedYearId);
  
  const { data: mustahiqListRemote = { data: [], total: 0 } } = useGuru("", 0, 100);
  const mustahiqList = mustahiqListRemote.data;
  const [jenjang, setJenjang] = useState<string>("Semua");
  
  // State for Create Form
  const [newJenjang] = useState("Ibtida'iyyah");
  const [newTingkat] = useState("I");
  const [newRuang] = useState("A");
  const [, setNewMustahiq] = useState("");

  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [editMustahiqId, setEditMustahiqId] = useState("");
  const [editCapacity, setEditCapacity] = useState(40);

  // State for Kenaikan Kelas Ploting Modal
  const [plotingClass, setPlotingClass] = useState<any | null>(null);
  const [plotingCandidates, setPlotingCandidates] = useState<any[]>([]);
  const [selectedPlotingIds, setSelectedPlotingIds] = useState<string[]>([]);
  const [isLoadingPloting, setIsLoadingPloting] = useState(false);
  const [isSavingPloting, setIsSavingPloting] = useState(false);
  const [plotingSearch, setPlotingSearch] = useState("");

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

  const handleOpenPlotingModal = async (targetClass: any) => {
    setPlotingClass(targetClass);
    setSelectedPlotingIds([]);
    setPlotingSearch("");
    setIsLoadingPloting(true);
    try {
      const res = await apiRequest<{ data: any[] }>("/api/admin/people?role=student&scope=madrasah&limit=1000");
      if (res.data) {
        const baseName = targetClass.name.split("-")[0].split(" ")[0].trim();
        const filtered = res.data.filter((s: any) => {
          const sClass = (s.class || "").trim();
          return sClass.toLowerCase().includes(baseName.toLowerCase());
        });
        setPlotingCandidates(filtered.length > 0 ? filtered : res.data.slice(0, 100));
      }
    } catch {
      setPlotingCandidates([]);
    } finally {
      setIsLoadingPloting(false);
    }
  };

  const handleSavePloting = async () => {
    if (!plotingClass || selectedPlotingIds.length === 0) {
      toast("Pilih minimal satu siswi untuk di-ploting ke lokal ini!", "warning");
      return;
    }
    setIsSavingPloting(true);
    let successCount = 0;
    try {
      for (const id of selectedPlotingIds) {
        await apiRequest(`/api/admin/people/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ class: plotingClass.name }),
        });
        successCount++;
      }
      toast(`✅ ${successCount} Siswi Kenaikan Kelas berhasil di-ploting ke Lokal ${plotingClass.name}!`, "success", "Ploting Berhasil");
      setPlotingClass(null);
    } catch {
      toast("Gagal memproses ploting lokal siswi", "error");
    } finally {
      setIsSavingPloting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kewenangan Mutlak Madrasah (MPHM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Data Kelas &amp; Rombongan Belajar (Rombel)
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Pengelolaan <strong>Kelas &amp; Lokal (Rombel)</strong> merupakan kewenangan mutlak Madrasah. Pihak Pondok tidak mengelola data Kelas &amp; Lokal karena merupakan bagian dari administrasi akademik Madrasah.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0 bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
          <label className="text-xs font-black text-blue-100 uppercase tracking-wider">Filter Jenjang:</label>
          <select 
            value={jenjang} 
            onChange={(e) => setJenjang(e.target.value)}
            className="px-3.5 py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer shadow-md"
          >
            {jenjangOptions.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>

      {/* Auto-fill & Promotion Banner */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-xs">
        <span className="text-base">✨</span>
        <span>
          <strong>Alur Kenaikan Kelas &amp; Ploting Lokal:</strong> Data Jenjang &amp; Kelas siswi <strong>diperbarui otomatis</strong> oleh sistem setelah pengesahan nilai (Mustahiq → Mufattish → TTD Digital). Pengisian <strong>Lokal (Rombel)</strong> dilakukan secara fleksibel oleh Operator Madrasah melalui tombol <em>"Ploting Siswi Kenaikan Kelas"</em> di setiap Lokal.
        </span>
      </div>

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
                      {cls.capacity} Siswi
                    </span>
                  </div>

                  {!isReadOnly && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPlotingModal(cls);
                        }}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>📥 Ploting Siswi Kenaikan Kelas</span>
                      </button>
                    </div>
                  )}
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
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Kapasitas Maksimal (Siswi)</label>
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

      {/* Modal Ploting Siswi Kenaikan Kelas ke Lokal (Rombel) */}
      {plotingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[90vh]">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-blue-50/70 dark:bg-blue-950/40">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-extrabold text-base">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Ploting Siswi Kenaikan Kelas ke Lokal: {plotingClass.name}</span>
              </div>
              <button onClick={() => setPlotingClass(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                ✨ <strong>Alur Otomatis Kenaikan Kelas:</strong> Data Jenjang &amp; Kelas siswi telah diperbarui secara otomatis setelah pengesahan nilai (Mustahiq → Mufattish → TTD Digital). Silakan centang siswi di bawah ini untuk ditempatkan ke <strong>{plotingClass.name}</strong>.
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Cari Nama / Stambuk / NIK Siswi..."
                    value={plotingSearch}
                    onChange={(e) => setPlotingSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold dark:text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPlotingIds.length === plotingCandidates.length) {
                      setSelectedPlotingIds([]);
                    } else {
                      setSelectedPlotingIds(plotingCandidates.map((c) => c.id));
                    }
                  }}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {selectedPlotingIds.length === plotingCandidates.length ? "Batal Pilih Semua" : "Pilih Semua Siswi"}
                </button>
              </div>

              {isLoadingPloting ? (
                <div className="p-8 text-center text-xs font-bold text-zinc-500 animate-pulse">Memuat daftar siswi kenaikan kelas...</div>
              ) : plotingCandidates.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  Tidak ada siswi yang ditemukan untuk tingkat/jenjang kelas ini.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {plotingCandidates
                    .filter((c) => !plotingSearch || c.name.toLowerCase().includes(plotingSearch.toLowerCase()) || c.stambuk?.includes(plotingSearch))
                    .map((c) => {
                      const isSelected = selectedPlotingIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPlotingIds(selectedPlotingIds.filter((id) => id !== c.id));
                            } else {
                              setSelectedPlotingIds([...selectedPlotingIds, c.id]);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                            ? "bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"}`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-white block">{c.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">Stambuk: {c.stambuk} • Kelas Saat Ini: {c.class || "-"}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            {c.class || "Belum Ditentukan"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Terpilih: <strong className="text-blue-600">{selectedPlotingIds.length}</strong> Siswi
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPlotingClass(null)} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl">Batal</button>
                <button
                  type="button"
                  disabled={isSavingPloting || selectedPlotingIds.length === 0}
                  onClick={handleSavePloting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingPloting ? "Memproses..." : `Tempatkan ${selectedPlotingIds.length} Siswi ke ${plotingClass.name}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

