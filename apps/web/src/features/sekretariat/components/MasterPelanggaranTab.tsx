"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldAlert, Tag, LayoutList, Loader2 } from "lucide-react";
import { useViolationMaster } from "../queries/useViolationMaster";

export function MasterPelanggaranTab() {
  const {
    categories,
    severities,
    types,
    isLoadingCategories,
    isLoadingSeverities,
    isLoadingTypes,
    createCategory,
    createSeverity,
    createViolation,
    deleteViolation,
    isCreatingCategory,
    isCreatingSeverity,
    isCreatingViolation,
    isDeletingViolation,
  } = useViolationMaster();

  // State for forms
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [newSevName, setNewSevName] = useState("");
  const [newSevLevel, setNewSevLevel] = useState<number | "">("");
  const [newSevColor, setNewSevColor] = useState("#ef4444");

  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCatId, setNewTypeCatId] = useState("");
  const [newTypeSevId, setNewTypeSevId] = useState("");
  const [newTypePoints, setNewTypePoints] = useState<number | "">("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await createCategory({ name: newCatName, description: newCatDesc });
    setNewCatName("");
    setNewCatDesc("");
  };

  const handleAddSeverity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSevName || !newSevLevel || !newSevColor) return;
    await createSeverity({ name: newSevName, level: Number(newSevLevel), badgeColor: newSevColor });
    setNewSevName("");
    setNewSevLevel("");
    setNewSevColor("#ef4444");
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName || !newTypeCatId || !newTypeSevId) return;
    await createViolation({
      categoryId: newTypeCatId,
      severityId: newTypeSevId,
      name: newTypeName,
      points: Number(newTypePoints) || 0,
    });
    setNewTypeName("");
    setNewTypeCatId("");
    setNewTypeSevId("");
    setNewTypePoints("");
  };

  const handleDeleteType = async (id: string) => {
    if (confirm("Yakin ingin menonaktifkan pelanggaran ini?")) {
      await deleteViolation(id);
    }
  };

  if (isLoadingCategories || isLoadingSeverities || isLoadingTypes) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Manajemen Master Pelanggaran</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
          Kelola kategori, tingkat keparahan (severity), dan jenis pelanggaran yang tersedia di sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CATEGORY FORM */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <LayoutList className="w-5 h-5 text-blue-500" />
            <h4 className="font-bold text-zinc-900 dark:text-white">Kategori Pelanggaran</h4>
          </div>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-3 mb-6">
            <input
              type="text"
              placeholder="Nama Kategori (Contoh: Ibadah)"
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Deskripsi (Opsional)"
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
            />
            <button
              type="submit"
              disabled={isCreatingCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Kategori
            </button>
          </form>
          <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {categories.map((cat) => (
              <li key={cat.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm border border-zinc-100 dark:border-zinc-700/50">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                {cat.description && <span className="text-zinc-500 ml-2">({cat.description})</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* SEVERITY FORM */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold text-zinc-900 dark:text-white">Tingkat Keparahan (Severity)</h4>
          </div>
          <form onSubmit={handleAddSeverity} className="flex flex-col gap-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama (Contoh: Berat)"
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                value={newSevName}
                onChange={(e) => setNewSevName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Level (Contoh: 1)"
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                value={newSevLevel}
                onChange={(e) => setNewSevLevel(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Warna Badge:</span>
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                value={newSevColor}
                onChange={(e) => setNewSevColor(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingSeverity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingSeverity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Tingkat
            </button>
          </form>
          <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {severities.map((sev) => (
              <li key={sev.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm border border-zinc-100 dark:border-zinc-700/50 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sev.badgeColor }} />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sev.name} (Lvl {sev.level})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* TYPES FORM */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-zinc-900 dark:text-white">Daftar Induk Pelanggaran</h4>
        </div>
        
        <form onSubmit={handleAddType} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <input
            type="text"
            placeholder="Nama Pelanggaran"
            className="md:col-span-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            required
          />
          <select
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
            value={newTypeCatId}
            onChange={(e) => setNewTypeCatId(e.target.value)}
            required
          >
            <option value="">Pilih Kategori...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
            value={newTypeSevId}
            onChange={(e) => setNewTypeSevId(e.target.value)}
            required
          >
            <option value="">Pilih Tingkat...</option>
            {severities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Poin"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
              value={newTypePoints}
              onChange={(e) => setNewTypePoints(Number(e.target.value))}
            />
            <button
              type="submit"
              disabled={isCreatingViolation}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0"
            >
              {isCreatingViolation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left rounded-l-lg">Pelanggaran</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Tingkat</th>
                <th className="px-4 py-3 text-center">Poin</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                  <td className="px-4 py-3 text-left font-medium text-zinc-900 dark:text-white">{type.name}</td>
                  <td className="px-4 py-3 text-left text-zinc-500">{type.category}</td>
                  <td className="px-4 py-3 text-left">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium">
                      {type.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-500 font-mono">{type.points}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteType(type.id)}
                      disabled={isDeletingViolation}
                      className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-zinc-500 italic">Belum ada induk pelanggaran.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
