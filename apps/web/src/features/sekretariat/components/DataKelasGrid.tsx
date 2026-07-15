"use client";

import { useState } from "react";
import { Users, MoreVertical, BookOpen, Layers, Plus, X, Save } from "lucide-react";
import { useClasses } from "@/features/sekretariat/queries/useClasses";
import { useGuru } from "@/features/sekretariat/queries/useGuru";
import { usePengurus } from "@/features/sekretariat/queries/usePengurus";

const CLASS_LEVELS_MAP: Record<string, string[]> = {
  "I'dadiyyah": ["I", "II", "III"],
  "Ibtida'iyyah": ["I", "II", "III", "IV", "V", "VI"],
  "Tsanawiyyah": ["I", "II", "III"],
  "Aliyyah": ["I", "II", "III"],
  "Al-Robithoh": ["I"]
};

export function DataKelasGrid({ onViewDetail, selectedYearId, isReadOnly = false }: { onViewDetail?: (data: Record<string, unknown>) => void, selectedYearId?: string, isReadOnly?: boolean }) {
  const { data: remoteData, isLoading, createClass, isCreating } = useClasses(selectedYearId);
  
  const { data: mustahiqListRemote = { data: [], total: 0 } } = useGuru("", 0, 100);
  const mustahiqList = mustahiqListRemote.data;
  const { data: mufattisyListRemote = { data: [], total: 0 } } = usePengurus("Mufattisy", 0, 100);
  const mufattisyList = mufattisyListRemote.data;
  const [jenjang, setJenjang] = useState<string>("Semua");
  
  // State for Create Form
  const [showForm, setShowForm] = useState(false);
  const [newJenjang, setNewJenjang] = useState("Ibtida'iyyah");
  const [newTingkat, setNewTingkat] = useState("I");
  const [newRuang, setNewRuang] = useState("A");
  const [newMustahiq, setNewMustahiq] = useState("");
  const [newMufattisy, setNewMufattisy] = useState("");
  const [newCapacity, setNewCapacity] = useState(40);

  const classesData = remoteData || [];

  const jenjangOptions = ["Semua", "I'dadiyyah", "Ibtida'iyyah", "Tsanawiyyah", "Aliyyah"];

  const filteredData = classesData.filter(cls => {
    if (jenjang === "Semua") return true;
    return cls.name.toLowerCase().includes(jenjang.toLowerCase());
  });

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
                {mustahiqList.map((guru) => (
                  <option key={guru.id} value={guru.name}>{guru.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500">Pengawas (Mufattisy)</label>
              <select 
                value={newMufattisy}
                onChange={(e) => setNewMufattisy(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none"
              >
                <option value="">Pilih Mufattisy...</option>
                {mufattisyList.map((muf) => (
                  <option key={muf.id} value={muf.name}>{muf.name}</option>
                ))}
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
              disabled={isCreating || !newRuang}
              onClick={async () => {
                const finalName = `${newJenjang} ${newTingkat}-${newRuang}`;
                await createClass({
                  name: finalName,
                  mustahiq: newMustahiq || "Belum Ditentukan",
                  mufattisy: newMufattisy || "Belum Ditentukan",
                  capacity: newCapacity
                });
                setShowForm(false);
                setNewRuang("");
                setNewMustahiq("");
                setNewMufattisy("");
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
                  <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Mustahiq (Wali)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-right">{cls.mustahiq}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Mufattisy (Pengawas)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-right">{cls.mufattisy}</span>
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
    </div>
  );
}
