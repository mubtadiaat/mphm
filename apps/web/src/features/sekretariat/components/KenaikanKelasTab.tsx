"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Award, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/shared/ToastContext";
import { useClasses } from "@/features/sekretariat/queries/useClasses";
import { apiRequest } from "@/lib/api";

interface Candidate {
  studentId: string;
  nis: string;
  name: string;
  stambuk: string;
  averageScore: number;
  attendanceRate: number;
  recommendedStatus: "PROMOTED" | "RETAINED";
  isApproved: boolean;
  status: "PROMOTED" | "RETAINED" | "GRADUATED";
}

export function KenaikanKelasTab({ isReadOnly = false, selectedYearId, fixedClassId }: { isReadOnly?: boolean; selectedYearId?: string; fixedClassId?: string }) {
  const { toast } = useToast();
  const { data: classes = [], isLoading: classesLoading } = useClasses(selectedYearId);
  const [selectedClassId, setSelectedClassId] = useState<string>(fixedClassId || "");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Sync active class as default
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      queueMicrotask(() => {
        setSelectedClassId(classes[0].id);
      });
    }
  }, [classes, selectedClassId]);

  const toggleApproval = (id: string) => {
    if (isReadOnly) return;
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.studentId === id) {
          const nextApproved = !c.isApproved;
          return {
            ...c,
            isApproved: nextApproved,
            status: nextApproved ? "PROMOTED" : "RETAINED"
          };
        }
        return c;
      })
    );
    toast("Status rekomendasi santri diubah!", "info", "Konfigurasi Kenaikan");
  };

  const handleNextStep2 = async () => {
    if (!selectedClassId) {
      toast("Silakan pilih kelas terlebih dahulu.", "warning", "Evaluasi Kelas");
      return;
    }
    setIsLoadingCandidates(true);
    try {
      const res = await apiRequest<{ data: Omit<Candidate, 'isApproved' | 'status'>[] }>(`/api/promotion/candidates/${selectedClassId}`);
      if (res.data) {
        setCandidates(res.data.map((c) => ({
          ...c,
          isApproved: c.recommendedStatus === "PROMOTED",
          status: c.recommendedStatus === "PROMOTED" ? "PROMOTED" : "RETAINED"
        })));
        setCurrentStep(2);
      } else {
        toast("Gagal memuat kandidat.", "error", "Promotion Engine");
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal memuat kandidat.", "error", "Promotion Engine");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleRunRollover = async () => {
    if (isReadOnly) return;
    setIsProcessing(true);
    toast("Memulai pemrosesan kenaikan kelas massal...", "info", "Promotion Engine");

    try {
      const promotionCandidates = candidates.map((c) => ({
        studentId: c.studentId,
        status: c.status,
        overrideReason: c.isApproved !== (c.recommendedStatus === "PROMOTED") ? "Override manual pimpinan/sekretariat" : undefined
      }));

      const res = await apiRequest<{ status: string; message: string }>(
        `/api/promotion/finalize/${selectedYearId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promotionCandidates }),
        }
      );

      if (res.status === "Success") {
        setFinalized(true);
        toast("Kenaikan kelas & kelulusan massal berhasil difinalisasi!", "success", "Proses Sukses");
      } else {
        toast(res.message || "Gagal melakukan rollover.", "error", "Rollover Gagal");
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal melakukan rollover.", "error", "Rollover Gagal");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCount = candidates.filter((c) => c.isApproved).length;
  const selectedClassObj = classes.find(c => c.id === selectedClassId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Premium Gradient Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-amber-650 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Promotion Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Kenaikan Kelas & Kelulusan
          </h1>
          <p className="text-zinc-555 dark:text-zinc-400 text-sm max-w-xl">
            Kelola kenaikan kelas santri otomatis, persetujuan bersyarat, dan kelulusan angkatan akhir pesantren.
          </p>
        </div>
      </div>

      {/* Modern Horizontal Wizard Steps */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-200/55 dark:border-zinc-800/80">
        {[
          { step: 1, label: "Pilih Rombel" },
          { step: 2, label: "Evaluasi Santri" },
          { step: 3, label: "Kunci & Rollover" }
        ].map((s) => (
          <button
            key={s.step}
            disabled={finalized}
            onClick={() => {
              if (s.step === 2 && candidates.length === 0) return;
              if (s.step === 3 && candidates.length === 0) return;
              setCurrentStep(s.step as 1 | 2 | 3);
            }}
            className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              currentStep === s.step
                ? "bg-white dark:bg-zinc-850 text-amber-650 dark:text-amber-450 shadow-xs border border-amber-500/10"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === s.step ? "bg-amber-500/20 text-amber-600" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
            }`}>{s.step}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step Panels */}
      {!finalized ? (
        <div className="space-y-6">
          {/* STEP 1: PILIH ROMBEL */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
              {isReadOnly && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                  <span>
                    <strong>PERHATIAN:</strong> Anda sedang meninjau arsip tahun ajaran lampau. 
                    Seluruh proses kenaikan kelas telah terkunci (read-only) untuk tujuan analisa dan arsip sejarah.
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Pilih Rombongan Belajar Untuk Evaluasi</h3>
                <p className="text-xs text-zinc-455 dark:text-zinc-500 mt-0.5">
                  Tingkatan kelas aktif di tahun ajaran ini yang akan dievaluasi kelayakan promosinya.
                </p>
              </div>

              {classesLoading ? (
                <div className="py-8 text-center text-zinc-500">Memuat rombel...</div>
              ) : (
                <div className="flex flex-col gap-1.5 max-w-md">
                  {!fixedClassId && (
                    <>
                      <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Rombongan Belajar (Rombel):</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-hidden dark:text-zinc-100 cursor-pointer"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} (Mustahiq: {cls.mustahiq})
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {fixedClassId && (
                    <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Kelas Anda: {classes.find(c => c.id === fixedClassId)?.name || 'Loading...'}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  disabled={isLoadingCandidates || classes.length === 0}
                  onClick={handleNextStep2}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingCandidates ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memuat...</span>
                    </>
                  ) : (
                    <>
                      <span>Lanjutkan Evaluasi</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EVALUASI REKOMENDASI */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Daftar Kandidat Kenaikan Kelas - {selectedClassObj?.name}</h3>
                <p className="text-xs text-zinc-455 dark:text-zinc-500 mt-0.5">
                  Tinjau rekomendasi otomatis dari IPK/Nilai rata-rata santri dan tentukan persetujuan akhir.
                </p>
              </div>

              {candidates.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">Tidak ada santri aktif di kelas ini.</div>
              ) : (
                <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-850 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-850 text-zinc-500 text-xs font-bold uppercase">
                        <th className="px-4 py-3 text-left">Nama Santri</th>
                        <th className="px-4 py-3 text-center">Nomor Stambuk</th>
                        <th className="px-4 py-3 text-center">Kehadiran</th>
                        <th className="px-4 py-3 text-center">Nilai Rerata</th>
                        <th className="px-4 py-3 text-center">Rekomendasi System</th>
                        <th className="px-4 py-3 text-center">Persetujuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {candidates.map((c) => (
                        <tr key={c.studentId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                          <td className="px-4 py-3 text-left font-bold text-zinc-800 dark:text-zinc-200">{c.name}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs">{c.stambuk}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                            {(c.attendanceRate * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{c.averageScore}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                              c.recommendedStatus === "PROMOTED" 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450" 
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450"
                            }`}>
                              {c.recommendedStatus === "PROMOTED" ? "Naik Kelas" : "Tinggal Kelas"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              disabled={isReadOnly}
                              onClick={() => toggleApproval(c.studentId)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                              } ${
                                c.isApproved
                                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500"
                              }`}
                            >
                              {c.isApproved ? "Disetujui" : "Ditunda"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <span className="text-xs text-zinc-400 font-semibold">
                  Telah disetujui: <strong className="text-zinc-800 dark:text-zinc-200">{activeCount} dari {candidates.length} santri</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    disabled={candidates.length === 0}
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>Tahap Kunci & Rollover</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KUNCI & ROLLOVER */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white">Kelulusan & Penguncian Tahun Ajaran</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                    Melakukan pendaftaran kelulusan massal angkatan akhir, menaikkan kelas santri aktif ke tingkat berikutnya, 
                    mengunci seluruh transaksi akademik tahun ajaran aktif, serta merotasi kalender akademik ke tahun ajaran baru.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-400 flex gap-2.5 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>PENTING:</strong> Tindakan ini bersifat permanen dan tidak dapat dibatalkan luring. Kunci data akan diaplikasikan ke database.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  disabled={isProcessing}
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  disabled={isReadOnly || isProcessing}
                  onClick={handleRunRollover}
                  className={`flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 ${
                    isReadOnly 
                      ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed border-0" 
                      : "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 cursor-pointer"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses Kenaikan...</span>
                    </>
                  ) : (
                    <span>Jalankan Kelulusan & Rollover</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SUCCESS FINALIZED PANEL */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-zinc-900 dark:text-white">Proses Rollover Selesai!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Kenaikan kelas santri dan kelulusan angkatan akhir telah sukses disalin ke tabel arsip `academic_history`. 
              Tahun Ajaran aktif diubah ke periode berikutnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
