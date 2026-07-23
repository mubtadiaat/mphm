"use client";

import { useState } from "react";
import { ShieldAlert, Search, Plus, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalViolations } from "@/features/sekretariat/queries/useGlobalViolations";
import { useSantri } from "@/features/sekretariat/queries/useSantri";
import { useViolationMaster } from "@/features/sekretariat/queries/useViolationMaster";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { useToast } from "@/components/shared/ToastContext";
import { PillBadge } from "@/components/shared/PillBadge";

export default function KeamananJurnalPage() {
  const { selectedYearId } = useAcademicYear();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Load Data
  const { data: violations = [], isLoading: loadingViolations } = useGlobalViolations(selectedYearId);
  const { data: studentsRes } = useSantri(selectedYearId, 0, 200, "", "aktif");
  const studentsList = studentsRes?.data || [];
  const { types: violationTypes = [], categories, severities } = useViolationMaster();

  // Form States
  const [studentId, setStudentId] = useState("");
  const [violationTypeId, setViolationTypeId] = useState("");
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incidentTime, setIncidentTime] = useState("08:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const { createViolation, isCreating } = useGlobalViolations(selectedYearId);

  const resetForm = () => {
    setStudentId("");
    setViolationTypeId("");
    setIncidentDate(new Date().toISOString().split("T")[0]);
    setIncidentTime("08:00");
    setLocation("");
    setDescription("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !violationTypeId || !incidentDate) {
      toast("Lengkapi seluruh field bertanda bintang (*)", "warning", "Validasi Gagal");
      return;
    }

    try {
      await createViolation({
        studentId,
        violationTypeId,
        academicYearId: selectedYearId || "",
        incidentDate,
        incidentTime: incidentTime || undefined,
        location: location || undefined,
        description: description || undefined,
      });
      toast("Kejadian pelanggaran berhasil dicatat!", "success", "Berhasil");
      setShowModal(false);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan data pelanggaran", "error", "Gagal");
    }
  };

  // Filtering
  const filteredViolations = violations.filter(v => {
    const nameStr = (v.name || "").toLowerCase();
    const stambukStr = (v.stambuk || "").toLowerCase();
    const descStr = (v.desc || "").toLowerCase();
    const q = (searchQuery || "").toLowerCase();
    const matchesSearch = !q || nameStr.includes(q) || stambukStr.includes(q) || descStr.includes(q);
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || v.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 dark:border-rose-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-rose-650 dark:text-rose-450 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Keamanan & Kedisiplinan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Jurnal Pelanggaran
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl mt-1">
            Pencatatan insiden kedisiplinan santri harian di lingkungan pondok pesantren secara terpadu.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="z-10 flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> Catat Kejadian
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Cari nama santri atau stambuk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:outline-none outline-hidden"
            >
              <option value="all">Semua Kategori</option>
              {categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Tingkat:</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:outline-none outline-hidden"
            >
              <option value="all">Semua Tingkat</option>
              {severities?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Incidents Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-500" />
            Jurnal Pelanggaran Harian
          </h3>
          <span className="px-3 py-1 bg-white dark:bg-zinc-700 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-600">
            Total: {loadingViolations ? "..." : filteredViolations.length}
          </span>
        </div>

        {loadingViolations ? (
          <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat jurnal pelanggaran...</div>
        ) : filteredViolations.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3 text-zinc-500">
            <AlertCircle className="w-10 h-10 opacity-30 text-rose-500" />
            <p className="text-sm font-semibold">Tidak ditemukan kejadian pelanggaran yang sesuai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-left">Santri</th>
                  <th className="px-5 py-3 text-left">Kelas</th>
                  <th className="px-5 py-3 text-left">Pelanggaran</th>
                  <th className="px-5 py-3 text-left">Tingkat</th>
                  <th className="px-5 py-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredViolations.map((v) => {
                  let variant: "info" | "warning" | "danger" | "success" = "info";
                  if (v.severity === "Sedang") variant = "warning";
                  else if (v.severity === "Berat" || v.severity === "Sangat Berat") variant = "danger";

                  return (
                    <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-zinc-900 dark:text-white">{v.date}</div>
                        {v.time && <div className="text-[10px] text-zinc-400">{v.time}</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-zinc-900 dark:text-white">{v.name}</div>
                        <div className="text-[10px] font-mono text-zinc-400">Stambuk: {v.stambuk}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{v.class || "-"}</td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-800 dark:text-zinc-200">{v.desc}</td>
                      <td className="px-5 py-3.5">
                        <PillBadge label={v.severity} variant={variant} />
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-xs text-zinc-500 font-medium" title={v.detailDescription || undefined}>
                        {v.location && <span className="font-bold block text-zinc-700 dark:text-zinc-300">Lokasi: {v.location}</span>}
                        {v.detailDescription || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Violation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden max-h-[90vh]">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-800/30">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Pencatatan Pelanggaran Baru
                </h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-colors"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto flex-1 font-sans">
                {/* Student Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Santri Pelanggar *</label>
                  <select 
                    required 
                    value={studentId} 
                    onChange={e => setStudentId(e.target.value)} 
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none"
                  >
                    <option value="">Pilih Santri...</option>
                    {studentsList.map(student => (
                      <option key={student.id} value={student.id}>{student.name} ({student.nis})</option>
                    ))}
                  </select>
                </div>

                {/* Violation Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Jenis Pelanggaran *</label>
                  <select 
                    required 
                    value={violationTypeId} 
                    onChange={e => setViolationTypeId(e.target.value)} 
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none"
                  >
                    <option value="">Pilih Pelanggaran...</option>
                    {violationTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name} ({type.points} Poin - {type.severity})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Tanggal Kejadian *</label>
                    <input 
                      type="date" 
                      required 
                      value={incidentDate} 
                      onChange={e => setIncidentDate(e.target.value)} 
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Waktu Kejadian</label>
                    <input 
                      type="time" 
                      value={incidentTime} 
                      onChange={e => setIncidentTime(e.target.value)} 
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Lokasi Insiden</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Asrama Putra, Kelas, Kantin" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Rincian Deskripsi Kejadian</label>
                  <textarea 
                    rows={3}
                    placeholder="Deskripsikan secara rinci kronologi kejadian..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/10 -mx-4 -mb-4 p-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors cursor-pointer font-sans">Batal</button>
                  <button type="submit" disabled={isCreating} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer font-sans">
                    {isCreating ? "Menyimpan..." : "Simpan Pelanggaran"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
