"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, X, Printer, Eye, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { IdentityCell } from "@/components/shared/IdentityCell";

import { useClasses } from "../queries/useClasses";
import { useAssessmentMatrix } from "../queries/useManajemenNilai";
import { useAuth } from "@/lib/auth";

interface StudentScore {
  id: string;
  name: string;
  stambuk?: string;
  avatarUrl?: string;
  class: string;
  scoresKwartal: Record<string, number>;
  scoresUjian: Record<string, number>;
}

export function RaportTab({ selectedYearId }: { selectedYearId?: string }) {
  const { data: user } = useAuth();
  const isSekretariat = user?.role === "sek.pondok" || user?.role === "sek.madrasah" || user?.role === "Sekretariat" || user?.role === "ADMIN" || user?.role === "DEVELOPER" || user?.role === "Pimpinan";

  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  
  const { data: classes = [] } = useClasses(selectedYearId);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      queueMicrotask(() => {
        setSelectedClassId(classes[0].id);
      });
    }
  }, [classes, selectedClassId]);

  const { data: matrixKwartal, isLoading: isLoading1 } = useAssessmentMatrix(selectedClassId, selectedSemester === 1 ? 1 : 3);
  const { data: matrixUjian, isLoading: isLoading2 } = useAssessmentMatrix(selectedClassId, selectedSemester === 1 ? 2 : 4);

  const displayedStudents = useMemo(() => {
    if (!matrixKwartal?.students) return [];
    
    return matrixKwartal.students.map(studentKwartal => {
      const studentUjian = matrixUjian?.students?.find(s => s.id === studentKwartal.id);
      return {
        id: studentKwartal.id,
        name: studentKwartal.name,
        stambuk: studentKwartal.stambuk,
        class: classes.find(c => c.id === selectedClassId)?.name || "",
        scoresKwartal: studentKwartal.scores,
        scoresUjian: studentUjian?.scores || {},
      };
    });
  }, [matrixKwartal, matrixUjian, selectedClassId, classes]);

  const subjects = useMemo(() => {
    return matrixKwartal?.subjects || [];
  }, [matrixKwartal]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<StudentScore | null>(null); 

  const [raportFormula, setRaportFormula] = useState<{type: string; value: string}[] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("raport_formula");
      if (saved) {
        setTimeout(() => {
          setRaportFormula(JSON.parse(saved) as {type: string; value: string}[]);
        }, 0);
      }
    }
  }, []);

  const handleCetak = (student: StudentScore) => {
    setPreviewStudent(student);
    setShowPreview(true);
  };

  const calculateFinalScore = (kwartal: number, ujian: number, tugas = 0, akhlaq = 0) => {
    if (!raportFormula || raportFormula.length === 0) {
      return ((kwartal + ujian) / 2).toFixed(2);
    }
    
    try {
      const formulaStr = raportFormula.map(chip => {
        if (chip.type === "variable") {
          if (chip.value === "KWARTAL") return kwartal;
          if (chip.value === "UJIAN") return ujian;
          if (chip.value === "TUGAS") return tugas;
          if (chip.value === "AKHLAQ") return akhlaq;
        }
        return chip.value;
      }).join(" ");
      
      const result = new Function(`return ${formulaStr}`)();
      return Number(result).toFixed(2);
    } catch (e) {
      console.error("Formula evaluation error", e);
      return ((kwartal + ujian) / 2).toFixed(2);
    }
  };

  const columns: ColumnDef<StudentScore, unknown>[] = [
    { 
      accessorKey: "name", 
      header: "Nama Santri", 
      cell: info => (
        <IdentityCell 
          name={info.getValue() as string} 
          subInfo={`Stambuk: ${info.row.original.stambuk}`} 
          stambuk={info.row.original?.stambuk}
          avatarUrl={info.row.original?.avatarUrl}
        />
      )
    },
    { accessorKey: "class", header: "Kelas", cell: info => <span className="font-semibold">{info.getValue() as string}</span> },
    {
      id: "actions", 
      header: isSekretariat ? "Cetak Dokumen" : "Pratinjau Dokumen",
      cell: info => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleCetak(info.row.original); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
            isSekretariat 
              ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
          }`}
        >
          {isSekretariat ? <Printer className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{isSekretariat ? "Cetak Raport" : "Lihat Raport"}</span>
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl flex flex-col justify-between gap-6 shadow-md text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Akademik Enterprise</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Pencetakan Raport Semester {selectedSemester}
          </h1>
          <p className="text-indigo-100 text-sm max-w-xl mt-2">
            Kalkulasi otomatis rata-rata {selectedSemester === 1 ? 'Kwartal 1 & Ujian Ganjil (Kwartal 2)' : 'Kwartal 3 & Ujian Genap (Kwartal 4)'} sesuai blueprint MPHM.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 z-10 bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-xs w-fit">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-indigo-200 uppercase">Pilih Semester</label>
            <div className="flex bg-indigo-900/50 rounded-lg p-1 border border-indigo-400/30">
              <button onClick={() => setSelectedSemester(1)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedSemester === 1 ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-indigo-800'}`}>Semester 1</button>
              <button onClick={() => setSelectedSemester(2)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedSemester === 2 ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-indigo-800'}`}>Semester 2</button>
            </div>
          </div>
          <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-indigo-200 uppercase">Filter Kelas</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-indigo-900/50 border border-indigo-400/30 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {classes.map(cls => <option key={cls.id} value={cls.id} className="bg-zinc-800 text-white">{cls.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <UniversalDataGrid
        columns={columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]}
        data={displayedStudents as unknown as Record<string, unknown>[]}
        pageCount={1} pageIndex={0} pageSize={100} loading={isLoading1 || isLoading2}
        onRowClick={(row) => handleCetak(row as unknown as StudentScore)}
        tableName="raport"
      />

      {/* Raport Print Preview Modal */}
      <AnimatePresence>
        {showPreview && previewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-3xl bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[90vh]">
              
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-lg">{isSekretariat ? "Print Preview Raport" : "Pratinjau Raport Santri"}</h3>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-xl"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-200/50 dark:bg-zinc-950/50">
                {/* Kertas A4 Simulation */}
                <div className="bg-white text-black p-10 w-full max-w-[210mm] min-h-[297mm] shadow-md border border-zinc-300">
                  <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h2 className="text-xl font-bold uppercase">Madrasah Putri Hidayatul Mubtadi&apos;aat [MPHM] Lirboyo</h2>
                    <p className="text-sm">Laporan Hasil Belajar Santri (Raport)</p>
                    <p className="text-sm font-semibold mt-1">Semester {selectedSemester}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-8 font-semibold">
                    <div>
                      <p>Nama: {previewStudent.name}</p>
                      <p>Stambuk: {previewStudent.stambuk}</p>
                    </div>
                    <div className="text-right">
                      <p>Kelas: {previewStudent.class}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm border-collapse border border-black mb-6">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black px-3 py-2 w-10 text-center">No</th>
                        <th className="border border-black px-3 py-2 text-left">Mata Pelajaran</th>
                        <th className="border border-black px-3 py-2 w-24 text-center">Nilai Kwartal</th>
                        <th className="border border-black px-3 py-2 w-24 text-center">Nilai Ujian</th>
                        <th className="border border-black px-3 py-2 w-24 text-center">Nilai Akhir (Raport)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub, idx) => {
                        const kwartal = previewStudent.scoresKwartal[sub.id] || 0;
                        const ujian = previewStudent.scoresUjian[sub.id] || 0;
                        return (
                          <tr key={sub.id}>
                            <td className="border border-black px-3 py-1 text-center">{idx + 1}</td>
                            <td className="border border-black px-3 py-1 font-semibold">{sub.name} <span className="text-[10px] font-normal text-gray-500 ml-1">({sub.type})</span></td>
                            <td className="border border-black px-3 py-1 text-center">{kwartal}</td>
                            <td className="border border-black px-3 py-1 text-center">{ujian}</td>
                            <td className="border border-black px-3 py-1 text-center font-bold">{calculateFinalScore(kwartal, ujian)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="mt-20 flex justify-between text-sm text-center">
                    <div>
                      <p>Wali Kelas,</p>
                      <br /><br /><br />
                      <p className="font-bold underline">_________________</p>
                    </div>
                    <div>
                      <p>Mundzir Asrama,</p>
                      <br /><br /><br />
                      <p className="font-bold underline">_________________</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-white dark:bg-zinc-950">
                {!isSekretariat ? (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Hanya Kesekretariatan yang memiliki akses untuk mencetak fisik Raport.</span>
                  </div>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Tutup</button>
                  {isSekretariat && (
                    <button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Cetak Fisik
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
