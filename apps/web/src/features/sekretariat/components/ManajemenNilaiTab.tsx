"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2, ClipboardList, BookOpen } from "lucide-react";
import { PillBadge } from "@/components/shared/PillBadge";
import { useAcademicYear } from "@/components/shared/AcademicYearContext";
import { GuidedEmptyState } from "@/components/shared/GuidedEmptyState";

import { useClasses } from "../queries/useClasses";
import { useAssessmentMatrix, useSaveScoreMutation, StudentScore } from "../queries/useManajemenNilai";

export function ManajemenNilaiTab({ isReadOnly: propsIsReadOnly, selectedYearId, fixedClass, fixedClassId }: { isReadOnly?: boolean; selectedYearId?: string; fixedClass?: string; fixedClassId?: string }) {
  const context = useAcademicYear();
  const isReadOnly = propsIsReadOnly !== undefined ? propsIsReadOnly : context.isReadOnly;
  const [activeCell, setActiveCell] = useState<{ studentId: string; subjectId: string } | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pendingSaves, setPendingSaves] = useState<{ studentId: string; subjectId: string; score: number }[]>([]);
  const [selectedKwartal, setSelectedKwartal] = useState<number>(1);
  
  const { data: classes = [] } = useClasses(selectedYearId);
  const [selectedClassId, setSelectedClassId] = useState<string>(fixedClassId || "");

  useEffect(() => {
    if (fixedClassId) {
      setSelectedClassId(fixedClassId);
      return;
    }
    if (classes.length > 0) {
      if (fixedClass) {
        const found = classes.find(c => c.name === fixedClass || c.id === fixedClass || (c as any).fullName === fixedClass);
        if (found) {
          setSelectedClassId(found.id);
        } else if (!selectedClassId) {
          setSelectedClassId(classes[0].id);
        }
      } else if (!selectedClassId) {
        setSelectedClassId(classes[0].id);
      }
    }
  }, [classes, selectedClassId, fixedClass, fixedClassId]);

  const { data: matrixData, isLoading: isMatrixLoading } = useAssessmentMatrix(selectedClassId, selectedKwartal);
  const saveMutation = useSaveScoreMutation();

  const [localStudents, setLocalStudents] = useState<StudentScore[]>([]);

  useEffect(() => {
    if (matrixData?.students) {
      queueMicrotask(() => {
        setLocalStudents(matrixData.students);
      });
    } else {
      queueMicrotask(() => {
        setLocalStudents([]);
      });
    }
  }, [matrixData]);

  // Modul ini khusus Sekretariat, jadi bisa view-edit, tetapi tergantung isReadOnly (arsip)
  const isEditable = !isReadOnly;

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    setErrorStatus(null);
    const scoreNum = parseFloat(value);
    
    // Check bounds based on type (Mapel max 10, Non-Mapel max 8)
    const subject = matrixData?.subjects.find(s => s.id === subjectId);
    const maxScore = subject?.type === "MAPEL" ? 10 : 8;

    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      setErrorStatus(`Nilai ${subject?.type === "MAPEL" ? "Mapel" : "Non-Mapel"} "${subject?.name}" dibatasi antara 0 hingga ${maxScore}.`);
      return;
    }

    // Update state local
    setLocalStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          scores: { ...student.scores, [subjectId]: scoreNum }
        };
      }
      return student;
    }));

    // Trigger auto-save simulation
    setSavingStatus("saving");
    if (!isReadOnly && selectedClassId) {
      setPendingSaves(prev => {
        const filtered = prev.filter(p => !(p.studentId === studentId && p.subjectId === subjectId));
        return [...filtered, { studentId, subjectId, score: scoreNum }];
      });
    }
  };

  // Auto-Save Buffer (Debounce 500ms)
  useEffect(() => {
    if (pendingSaves.length === 0) return;

    const delayDebounceFn = setTimeout(() => {
      pendingSaves.forEach((save) => {
        saveMutation.mutate({
          classId: selectedClassId,
          studentId: save.studentId,
          subjectId: save.subjectId,
          kwartal: selectedKwartal,
          score: save.score
        }, {
          onSuccess: () => {
            setSavingStatus("saved");
            setTimeout(() => setSavingStatus("idle"), 1500);
          },
          onError: (err: any) => {
            setErrorStatus(err?.message || "Gagal menyimpan nilai.");
            setSavingStatus("idle");
          }
        });
      });
      setPendingSaves([]);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [pendingSaves, saveMutation, selectedClassId, selectedKwartal]);

  if (classes.length === 0) {
    return (
      <GuidedEmptyState
        title="Menu Manajemen Nilai Belum Dapat Digunakan"
        description="Sistem mendeteksi belum ada Rombel Kelas Diniyyah yang dibuat untuk Tahun Ajaran ini. Silakan daftarkan Rombel Kelas & tetapkan Mustahiq terlebih dahulu."
        prerequisiteStep="Mustahiq & Rombel Kelas Diniyyah"
        actionLabel="+ Buat Rombel Kelas Diniyyah Sekarang"
        actionHref="/sekretariat/kelas"
        icon={BookOpen}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row justify-between gap-6 shadow-xl text-white">
        <div className="flex flex-col gap-1.5 z-10 flex-1">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>Kewenangan Akademik Madrasah (MPHM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Penilaian Akademik Siswi &amp; Koreksi Raport Diniyyah
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Alur Akademik: 1. Input Nilai oleh <strong>Mustahiq</strong> → 2. Persetujuan Nilai oleh <strong>Mufattish</strong> → 3. Penandatanganan Digital → 4. Penetapan Kenaikan Kelas Otomatis. Layar ini digunakan Operator Madrasah untuk memantau, mengaudit, dan mengoreksi nilai.
          </p>
        </div>

        {/* Filter Kelas & Kwartal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10 shrink-0 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
          {!fixedClass && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-blue-100 uppercase tracking-wider">Pilih Kelas Rombel *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer shadow-md"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-blue-100 uppercase tracking-wider">Kwartal Akademik *</label>
            <select
              value={selectedKwartal}
              onChange={(e) => setSelectedKwartal(parseInt(e.target.value))}
              className="px-3 py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer shadow-md"
            >
              <option value={1}>Kwartal 1 (Ganjil Awal)</option>
              <option value={2}>Kwartal 2 (Ganjil Akhir)</option>
              <option value={3}>Kwartal 3 (Genap Awal)</option>
              <option value={4}>Kwartal 4 (Genap Akhir / Final)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules Info Notice Banner */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-xs">
        <span className="text-base">✨</span>
        <span>
          <strong>Ketentuan Penilaian Akademik:</strong> Penilaian Diniyyah sepenuhnya merupakan kewenangan Madrasah. Seluruh nilai yang sah akan dijadikan acuan utama pencetakan Raport, Ijazah, dan Kenaikan Kelas otomatis siswi.
        </span>
      </div>

      {/* Auto-Save & Error Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {errorStatus ? (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">{errorStatus}</span>
          </div>
        ) : (
          <div className="text-sm font-medium text-zinc-500">
            Menampilkan data santriwi kelas <strong className="text-zinc-800 dark:text-zinc-200">{classes.find(c => c.id === selectedClassId)?.name || "Pilih Kelas"}</strong>
          </div>
        )}

        <div className="flex items-center gap-2 min-h-[24px]">
          {savingStatus === "saving" && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Menyimpan sinkronisasi...
            </div>
          )}
          {savingStatus === "saved" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle className="w-3.5 h-3.5" />
              Perubahan tersimpan (Cloud)
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-5 py-4 text-left font-bold min-w-[220px] sticky left-0 bg-zinc-50 dark:bg-zinc-800/90 backdrop-blur-sm z-10 border-r border-zinc-200 dark:border-zinc-800">
                Data Induk Siswa (Nama Lengkap)
              </th>
              {matrixData?.subjects?.map((sub, idx) => (
                <th key={`${sub.id}-${idx}`} className="px-4 py-4 font-semibold text-center min-w-[140px] whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]" title={sub.name}>{sub.name}</span>
                    <PillBadge 
                      label={sub.type} 
                      variant={sub.type === "MAPEL" ? "gold" : "info"} 
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {isMatrixLoading ? (
              <tr>
                <td colSpan={100} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
                </td>
              </tr>
            ) : localStudents.length === 0 ? (
              <tr>
                <td colSpan={100} className="py-12 text-center text-zinc-500 font-medium bg-zinc-50/50 dark:bg-zinc-900/50">
                  Belum ada data santri untuk kelas terpilih.
                </td>
              </tr>
            ) : (
              localStudents.map(student => (
                <tr key={student.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-white sticky left-0 bg-white group-hover:bg-zinc-50 dark:bg-zinc-900 dark:group-hover:bg-zinc-800/80 transition-colors border-r border-zinc-100 dark:border-zinc-800 z-10 flex flex-col justify-center">
                    <span>{student.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400 font-normal mt-0.5">NIS: {student.nis}</span>
                  </td>
                  {matrixData?.subjects?.map((sub, idx) => {
                    const score = student.scores[sub.id] ?? "";
                    const isActive = activeCell?.studentId === student.id && activeCell?.subjectId === sub.id;

                    return (
                      <td key={`${sub.id}-${idx}`} className="p-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={score}
                          disabled={!isEditable}
                          onFocus={() => setActiveCell({ studentId: student.id, subjectId: sub.id })}
                          onBlur={() => setActiveCell(null)}
                          onChange={(e) => handleScoreChange(student.id, sub.id, e.target.value)}
                          className={`w-20 text-center py-2 border rounded-xl focus:outline-none transition-all duration-150 font-bold ${
                            isActive 
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400" 
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                          } dark:text-zinc-100 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
