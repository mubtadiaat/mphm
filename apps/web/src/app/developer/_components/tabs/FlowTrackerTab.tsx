"use client";
import React, { useState } from "react";
import { GitBranch, ChevronRight, ChevronDown, CheckCircle2, ArrowRight, Globe, Database, Lock, FileText, Users, Ticket, Award, ShieldAlert, BookOpen } from "lucide-react";

interface FlowStep {
  id: string;
  label: string;
  detail: string;
  endpoint?: string;
  type: "action" | "api" | "db" | "ui" | "check";
}

interface SystemFlow {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  description: string;
  steps: FlowStep[];
}

const SYSTEM_FLOWS: SystemFlow[] = [
  {
    id: "auth",
    title: "Login & Autentikasi",
    icon: <Lock className="w-5 h-5" />,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    description: "Alur masuk pengguna dari form login hingga redirect ke dashboard sesuai peran.",
    steps: [
      { id: "auth-1", label: "Form Login", detail: "User mengisi Username/Email/NIK dan Password di halaman /loginsekr atau /loginStaff", type: "ui" },
      { id: "auth-2", label: "POST /api/auth/login", detail: "Frontend mengirim payload { identifier, password } ke API login", endpoint: "/api/auth/login", type: "api" },
      { id: "auth-3", label: "Cek DB user_accounts", detail: "Backend query Prisma: user_accounts WHERE (username = ? OR email = ? OR nik = ?) AND password (bcrypt compare)", type: "db" },
      { id: "auth-4", label: "Validasi Role & Status", detail: "Cek apakah akun aktif (status = ACTIVE) dan role sesuai (sek.pondok, sek.madrasah, mustahiq, wali_santri)", type: "check" },
      { id: "auth-5", label: "Generate JWT Token", detail: "Buat token JWT berisi { userId, role, workspace } dengan expiry 7 hari, simpan di HttpOnly cookie", type: "action" },
      { id: "auth-6", label: "Redirect Dashboard", detail: "Redirect ke /sekretariat (Sekretariat), /mustahiq (Guru), atau /guardian (Wali Santri) sesuai role", type: "ui" },
    ],
  },
  {
    id: "pull-pondok",
    title: "Tarik Data Pondok → Madrasah",
    icon: <Users className="w-5 h-5" />,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    description: "Alur sinkronisasi data santriwati dari Pondok P3HM ke database Madrasah MPHM.",
    steps: [
      { id: "pull-1", label: "Klik 'Tarik Data Pondok'", detail: "Sekretariat Madrasah menekan tombol Tarik Data di halaman /sekretariat/santri", type: "ui" },
      { id: "pull-2", label: "POST /api/academic/pull-pondok", detail: "Frontend mengirim request tarik data ke API backend", endpoint: "/api/academic/pull-pondok", type: "api" },
      { id: "pull-3", label: "Query Santri P3HM (Pondok)", detail: "Backend query people + student_profiles WHERE workspace = 'pondok' AND status = ACTIVE", type: "db" },
      { id: "pull-4", label: "Salin ke student_profiles MPHM", detail: "Upsert data: jika santri belum ada di Madrasah → INSERT. Jika sudah ada → UPDATE identitas dari Pondok", type: "db" },
      { id: "pull-5", label: "Form Auto-Lock", detail: "Identitas & alamat santriwati OTOMATIS TERKUNCI (🔒) di form Madrasah. Hanya field Jenjang & Kelas Diniyyah yang terbuka", type: "check" },
      { id: "pull-6", label: "Tampil di /sekretariat/santri", detail: "Data santriwati yang sudah ditarik muncul di tabel Data Siswi MPHM dengan badge sumber 🏛️ Pondok Mubtadi-aat", type: "ui" },
    ],
  },
  {
    id: "assessment",
    title: "Input Nilai Kwartal",
    icon: <FileText className="w-5 h-5" />,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    description: "Alur pengisian nilai kwartal oleh Mustahiq hingga tersimpan di database.",
    steps: [
      { id: "assess-1", label: "Mustahiq Pilih Kelas", detail: "Mustahiq login → pilih kelas yang diampu dari daftar rombel di /mustahiq/penilaian", type: "ui" },
      { id: "assess-2", label: "GET /api/assessment/matrix/[classId]", detail: "Ambil matriks penilaian: daftar siswa × daftar mapel × kwartal aktif", endpoint: "/api/assessment/matrix", type: "api" },
      { id: "assess-3", label: "Isi Nilai di Grid", detail: "Mustahiq mengisi nilai per siswa per mapel di dalam grid interaktif (0–100)", type: "ui" },
      { id: "assess-4", label: "POST /api/assessment/scores", detail: "Simpan nilai yang diisi ke database: student_scores (studentId, subjectId, quarter, score)", endpoint: "/api/assessment/scores", type: "api" },
      { id: "assess-5", label: "Simpan ke Database", detail: "Prisma upsert student_scores: jika sudah ada → UPDATE, belum ada → INSERT. Audit log dicatat", type: "db" },
      { id: "assess-6", label: "Tampil di Raport", detail: "Nilai yang tersimpan dapat dilihat di modul Raport (/sekretariat/raport) dan Portal Wali Santri", type: "ui" },
    ],
  },
  {
    id: "permits",
    title: "Perizinan Santri",
    icon: <Ticket className="w-5 h-5" />,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    description: "Alur pembuatan izin santri oleh Sekretariat hingga validasi keluar oleh Keamanan.",
    steps: [
      { id: "permit-1", label: "Sekretariat Buat Izin", detail: "Sekretariat membuka /sekretariat/perizinan → Klik 'Tambah Perizinan' → Pilih santri, jenis izin (KELUAR/PULANG/SAMBANGAN), tanggal", type: "ui" },
      { id: "permit-2", label: "POST /api/disciplinary/permits", detail: "Kirim data perizinan ke API: { studentId, type, startDate, endDate, reason }", endpoint: "/api/disciplinary/permits", type: "api" },
      { id: "permit-3", label: "Simpan ke DB student_permits", detail: "Insert record baru ke tabel student_permits dengan status APPROVED", type: "db" },
      { id: "permit-4", label: "Muncul di Portal Wali", detail: "Wali Santri melihat status perizinan anak di /guardian/kedisiplinan → badge status 'DIIZINKAN'", type: "ui" },
      { id: "permit-5", label: "Keamanan Validasi Keluar", detail: "Pos Keamanan membuka /keamanan/perizinan → scan / cari santri → konfirmasi keluar/kembali", type: "ui" },
      { id: "permit-6", label: "Update Status Kembali", detail: "Saat santri kembali, Keamanan update status izin menjadi COMPLETED. Audit log dicatat", type: "db" },
    ],
  },
  {
    id: "promotion",
    title: "Kenaikan Kelas",
    icon: <Award className="w-5 h-5" />,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    description: "Alur eksekusi kenaikan kelas masal dari Draft → Review → Final.",
    steps: [
      { id: "promo-1", label: "Sekretariat Pilih Kelas", detail: "Buka /sekretariat/kenaikan-kelas → Pilih tahun ajaran & kelas yang akan diproses", type: "ui" },
      { id: "promo-2", label: "GET /api/promotion/candidates/[classId]", detail: "Ambil daftar kandidat kenaikan kelas beserta nilai akhir & status kehadiran", endpoint: "/api/promotion/candidates", type: "api" },
      { id: "promo-3", label: "Tandai Status Siswa", detail: "Sekretariat menandai setiap siswa: PROMOTED (naik), RETAINED (tinggal kelas), atau GRADUATED (lulus)", type: "ui" },
      { id: "promo-4", label: "POST /api/promotion/execute", detail: "Eksekusi kenaikan kelas masal: kirim array { studentId, decision } ke backend", endpoint: "/api/promotion/execute", type: "api" },
      { id: "promo-5", label: "Update Rombel Baru", detail: "Backend memproses: PROMOTED → pindahkan ke kelas berikutnya. GRADUATED → pindahkan ke alumni_records", type: "db" },
      { id: "promo-6", label: "Cetak Rapor & Ijazah", detail: "Setelah eksekusi, Rapor Akhir Tahun & Ijazah Kelulusan dapat dicetak untuk siswa GRADUATED", type: "ui" },
    ],
  },
  {
    id: "violations",
    title: "Pencatatan Pelanggaran & Takzir",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    description: "Alur pencatatan pelanggaran santri dan penjatuhan poin takzir.",
    steps: [
      { id: "vio-1", label: "Sekretariat Catat Pelanggaran", detail: "Buka /sekretariat/pelanggaran → Klik 'Catat Pelanggaran' → Pilih santri, jenis pelanggaran, tingkat keparahan", type: "ui" },
      { id: "vio-2", label: "POST /api/disciplinary/violations", detail: "Kirim data pelanggaran: { studentId, violationTypeId, severityId, notes, date }", endpoint: "/api/disciplinary/violations", type: "api" },
      { id: "vio-3", label: "Simpan ke DB & Hitung Poin", detail: "Insert record ke violations. Backend otomatis menghitung akumulasi poin takzir santri", type: "db" },
      { id: "vio-4", label: "Notifikasi Wali Santri", detail: "Pelanggaran muncul di Portal Wali (/guardian/kedisiplinan) dengan badge poin pelanggaran", type: "ui" },
      { id: "vio-5", label: "Evaluasi Batas Poin", detail: "Jika poin melebihi batas, sistem menandai santri untuk tindak lanjut (pemanggilan wali, skorsing)", type: "check" },
      { id: "vio-6", label: "Arsip Audit Log", detail: "Seluruh pencatatan pelanggaran tercatat di audit_logs untuk transparansi dan akuntabilitas", type: "db" },
    ],
  },
  {
    id: "rooms",
    title: "Manajemen Asrama (Blok & Kamar)",
    icon: <Globe className="w-5 h-5" />,
    color: "text-teal-400",
    borderColor: "border-teal-500/30",
    description: "Alur pengelolaan data blok asrama dan penempatan kamar santri.",
    steps: [
      { id: "room-1", label: "Buka Menu Asrama", detail: "Sekretariat Pondok buka /sekretariat/rooms → Sub-menu Blok/Komplek atau Data Kamar", type: "ui" },
      { id: "room-2", label: "GET /api/admin/rooms", detail: "Ambil data seluruh blok asrama, kamar, kapasitas, dan penghuni aktif", endpoint: "/api/admin/rooms", type: "api" },
      { id: "room-3", label: "Tambah / Edit Blok & Kamar", detail: "Sekretariat menambah blok baru (nama komplek), menambah kamar (nama kamar, kapasitas, pembina)", type: "ui" },
      { id: "room-4", label: "POST /api/admin/rooms", detail: "Simpan data kamar baru atau perubahan ke database rooms", endpoint: "/api/admin/rooms", type: "api" },
      { id: "room-5", label: "Penempatan Santri", detail: "Setiap santri wajib memiliki alokasi Nama Blok & Kamar aktif (aturan mukim 100%)", type: "db" },
      { id: "room-6", label: "Grid Visual Kamar", detail: "Dashboard menampilkan grid visual kartu blok dengan jumlah penghuni / kapasitas per kamar", type: "ui" },
    ],
  },
  {
    id: "curriculum",
    title: "Kurikulum & Mata Pelajaran Diniyyah",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    description: "Alur pengelolaan master mata pelajaran diniyyah per jenjang kelas.",
    steps: [
      { id: "cur-1", label: "Buka Menu Kurikulum", detail: "Sekretariat Madrasah buka /sekretariat/kurikulum → Master Mata Pelajaran Diniyyah", type: "ui" },
      { id: "cur-2", label: "GET /api/admin/subjects", detail: "Ambil daftar seluruh mata pelajaran: nama, jenjang, kode mapel, status", endpoint: "/api/admin/subjects", type: "api" },
      { id: "cur-3", label: "Tambah / Edit Mapel", detail: "Sekretariat menambah mata pelajaran baru atau mengubah data mapel yang sudah ada", type: "ui" },
      { id: "cur-4", label: "POST /api/admin/subjects", detail: "Simpan data mata pelajaran ke database subjects", endpoint: "/api/admin/subjects", type: "api" },
      { id: "cur-5", label: "Pemetaan Mapel ke Kelas", detail: "Mapel otomatis terpetakan ke kelas berdasarkan jenjang (Ibtida'iyyah, I'dadiyyah, Tsanawiyyah, Aliyyah)", type: "db" },
      { id: "cur-6", label: "Dipakai di Penilaian", detail: "Mapel yang terdaftar menjadi kolom pada matriks penilaian kwartal di modul Assessment", type: "check" },
    ],
  },
];

const stepTypeConfig: Record<FlowStep["type"], { bg: string; border: string; label: string }> = {
  ui:     { bg: "bg-blue-500/10",     border: "border-blue-500/30",     label: "UI" },
  api:    { bg: "bg-emerald-500/10",  border: "border-emerald-500/30",  label: "API" },
  db:     { bg: "bg-purple-500/10",   border: "border-purple-500/30",   label: "DB" },
  action: { bg: "bg-amber-500/10",    border: "border-amber-500/30",    label: "ACTION" },
  check:  { bg: "bg-rose-500/10",     border: "border-rose-500/30",     label: "CHECK" },
};

export function FlowTrackerTab() {
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 shadow-xl">
        <div>
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-400" /> System Flow Tracker — Diagram Alur Data Interaktif
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Klik setiap subsistem untuk melihat alur data langkah demi langkah. Klik setiap langkah untuk detail teknis.
          </p>
        </div>

        <div className="space-y-3">
          {SYSTEM_FLOWS.map((flow) => {
            const isExpanded = expandedFlow === flow.id;
            return (
              <div key={flow.id} className={`border rounded-2xl transition-all ${isExpanded ? flow.borderColor + " bg-zinc-950" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"}`}>
                {/* Flow Header */}
                <button
                  type="button"
                  onClick={() => { setExpandedFlow(isExpanded ? null : flow.id); setActiveStep(null); }}
                  className="w-full flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={flow.color}>{flow.icon}</span>
                    <div className="text-left">
                      <span className={`font-extrabold text-sm ${flow.color}`}>{flow.title}</span>
                      <p className="text-[11px] text-zinc-500">{flow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">{flow.steps.length} langkah</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                  </div>
                </button>

                {/* Flow Steps (Expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-5 space-y-0">
                    {flow.steps.map((step, idx) => {
                      const isActive = activeStep === step.id;
                      const cfg = stepTypeConfig[step.type];
                      return (
                        <div key={step.id}>
                          {/* Step Card */}
                          <button
                            type="button"
                            onClick={() => setActiveStep(isActive ? null : step.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                              isActive
                                ? `${cfg.bg} ${cfg.border} shadow-md`
                                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-black border ${cfg.bg} ${cfg.border}`}>
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white">{step.label}</span>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${cfg.bg} ${cfg.border} border`}>{cfg.label}</span>
                                </div>
                                {isActive && (
                                  <div className="mt-2 space-y-1.5">
                                    <p className="text-[11px] text-zinc-300 leading-relaxed">{step.detail}</p>
                                    {step.endpoint && (
                                      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
                                        {step.endpoint}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />}
                            </div>
                          </button>

                          {/* Arrow between steps */}
                          {idx < flow.steps.length - 1 && (
                            <div className="flex justify-center py-1">
                              <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
