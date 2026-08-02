"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, CheckCircle2, Lock, Unlock, Clock, Download, RefreshCw, Pin, XCircle
} from "lucide-react";
import { useWorkspace } from "@/components/shared/WorkspaceContext";

export function SOPGuideTab() {
  const { activeWorkspace } = useWorkspace();
  const isPondok = activeWorkspace === "pondok";

  const [activeGroup, setActiveGroup] = useState<string>(() => (isPondok ? "database_pondok" : "manajemen_data"));

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner - Workspace Dynamic */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between gap-6 shadow-xl text-white border ${
        isPondok
          ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 border-emerald-500/30"
          : "bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border-blue-500/30"
      }`}>
        <div className="flex flex-col gap-1.5 z-10 flex-1">
          <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>{isPondok ? "SOP Lengkap Sekretariat Pondok Pesantren P3HM" : "SOP Lengkap Sekretariat Madrasah Diniyyah MPHM"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isPondok ? "Tata Cara & SOP Pengelolaan Pondok P3HM" : "Tata Cara & SOP Pengelolaan Madrasah MPHM"}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            Pedoman resmi operasional seluruh menu Sekretariat: Dari Pendataan Induk, Rombel, Kurikulum, Penilaian 4 Tahap, Dokumen Siswi (Rapor &amp; Ijazah), hingga Konfigurasi Sistem Terpadu.
          </p>
        </div>

        <div className="z-10 shrink-0 bg-white/10 p-3.5 rounded-2xl border border-white/20 backdrop-blur-md flex flex-col gap-1 justify-center">
          <span className="text-[10px] font-black text-white/80 uppercase tracking-wider">INSTANSI AKTIF:</span>
          <span className="text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isPondok ? "Pondok Pesantren P3HM" : "Madrasah Diniyyah MPHM"}</span>
          </span>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs border ${
        isPondok
          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
          : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200"
      }`}>
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Ketentuan Baku Sistem:</strong> Seluruh panduan di bawah ini disusun persis mengikuti struktur menu navigasi sidebar instansi Anda.
        </span>
      </div>

      {/* Category Group Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        {!isPondok ? (
          <>
            <button
              onClick={() => setActiveGroup("manajemen_data")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "manajemen_data"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>MANAJEMEN DATA</span>
            </button>

            <button
              onClick={() => setActiveGroup("pengajar_pengurus")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "pengajar_pengurus"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Pin className="w-4 h-4" />
              <span>PENGAJAR &amp; PENGURUS</span>
            </button>

            <button
              onClick={() => setActiveGroup("akademik_penilaian")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "akademik_penilaian"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>AKADEMIK &amp; PENILAIAN</span>
            </button>

            <button
              onClick={() => setActiveGroup("dokumen_siswi")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "dokumen_siswi"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>DOKUMEN SISWI</span>
            </button>

            <button
              onClick={() => setActiveGroup("sistem_utilitas")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "sistem_utilitas"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>SISTEM &amp; UTILITAS</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveGroup("database_pondok")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "database_pondok"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>DATABASE PONDOK</span>
            </button>

            <button
              onClick={() => setActiveGroup("perizinan_kedisiplinan")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "perizinan_kedisiplinan"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Pin className="w-4 h-4" />
              <span>PERIZINAN &amp; KEDISIPLINAN</span>
            </button>

            <button
              onClick={() => setActiveGroup("sistem_utilitas")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
                activeGroup === "sistem_utilitas"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>SISTEM &amp; UTILITAS</span>
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeWorkspace}-${activeGroup}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* GROUP: MANAJEMEN DATA (MADRASAH) */}
          {activeGroup === "manajemen_data" && (
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                  <BookOpen className="w-5 h-5" />
                  <h2>SOP Kelompok: MANAJEMEN DATA (Madrasah MPHM)</h2>
                </div>

                {/* Data Siswi */}
                <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-3">
                  <h3 className="font-black text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>1. Data Siswi (`/sekretariat/santri`)</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                    <p><strong>A. Tarikan Data Santri P3HM (Jalur 1):</strong> Masuk ke tab Data Siswi → Klik <strong>📥 Tarik Data Siswi dari Pondok P3HM</strong> → Cari Nama/Stambuk → Klik <strong>📥 Tarik Data</strong>. Seluruh identitas &amp; alamat otomatis terisi 100% dan terkunci.</p>
                    <p><strong>B. Form Input Manual (Jalur 2):</strong> Digunakan bagi siswi unit luar/non-P3HM. Klik <strong>🔓 Buka Form Input Manual Baru</strong> → Isi Identitas lengkap &amp; Alamat secara mandiri.</p>
                    <p><strong>C. Penutupan Cuti &amp; Pengajuan Boyong:</strong> Madrasah berwenang menetapkan status Cuti secara mandiri. Namun status **Boyong** wajib dikirim ke Pondok untuk mendapatkan persetujuan (**approval**).</p>
                  </div>
                </div>

                {/* Data Kelas */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-3">
                  <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>2. Data Kelas / Rombel (`/sekretariat/kelas`)</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                    <p>Pengelolaan **Kelas &amp; Lokal (Rombel)** merupakan kewenangan mutlak Madrasah. Pihak Pondok tidak mengelola data Kelas &amp; Lokal.</p>
                    <p><strong>Langkah Operasional:</strong> Daftarkan Rombel Kelas berdasarkan Jenjang (*I'dadiyyah, Ibtida'iyyah, Tsanawiyyah, Aliyyah*) → Tentukan Tingkat Kelas &amp; Nama Lokal → Lakukan ploting siswi kenaikan kelas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GROUP: PENGAJAR & PENGURUS (MADRASAH) */}
          {activeGroup === "pengajar_pengurus" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                <Pin className="w-5 h-5" />
                <h2>SOP Kelompok: PENGAJAR &amp; PENGURUS (Madrasah MPHM)</h2>
              </div>

              {/* Data Pengurus */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Pin className="w-4 h-4 text-blue-600" />
                  <span>1. Data Pengurus (`/sekretariat/pengurus`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-1.5 font-medium">
                  <p>Penarikan data Pengurus Pondok ke Madrasah <strong>hanya mengambil data identitas</strong>. Jabatan di Pondok tidak disinkronkan karena merupakan kewenangan masing-masing instansi.</p>
                  <p>Operator Madrasah menentukan <strong>Jabatan Pengurus Madrasah (11 Jabatan Resmi)</strong> secara mandiri.</p>
                </div>
              </div>

              {/* Data Pengajar */}
              <div className="p-5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  <Pin className="w-4 h-4 text-purple-600" />
                  <span>2. Data Pengajar Mustahiq / Munawwib (`/sekretariat/pengajar`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                  <p>Data Pengajar dibuat langsung oleh Madrasah tanpa penarikan Pondok. Pengajar wajib memilih 1 peran utama:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>📌 Mustahiq (Wali Kelas)</strong>: Memegang tanggung jawab 1 Rombel Kelas &amp; rekomendasi Kenaikan Kelas.</li>
                    <li><strong>📖 Munawwib (Guru Mapel)</strong>: Dapat mengampu beberapa Rombel/Kelas (*multi-class*) sekaligus.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* GROUP: AKADEMIK & PENILAIAN (MADRASAH) */}
          {activeGroup === "akademik_penilaian" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                <CheckCircle2 className="w-5 h-5" />
                <h2>SOP Kelompok: AKADEMIK &amp; PENILAIAN (Madrasah MPHM)</h2>
              </div>

              {/* Kurikulum */}
              <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>1. Kurikulum &amp; Silabus Diniyyah (`/sekretariat/kurikulum`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                  <p>Seluruh Kurikulum dan Mata Pelajaran diolah berbasis **Jenjang &amp; Kelas** masing-masing. Setiap Jenjang (*I'dadiyyah, Ibtida'iyyah, Tsanawiyyah, Aliyyah*) memiliki struktur mata pelajaran resmi yang terikat.</p>
                  <p><strong>Langkah Operasional:</strong> Pilih Jenjang &amp; Kelas → Tinjau daftar Mapel Baku → Klik <strong>🔄 Sinkronkan Ke Database</strong> untuk memperbarui data ke seluruh sistem.</p>
                </div>
              </div>

              {/* Penilaian */}
              <div className="p-5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>2. Penilaian Akademik &amp; Audit Kwartal (`/sekretariat/penilaian`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                  <p>Layar ini digunakan Sekretariat untuk mengaudit dan mengoreksi nilai yang diinput Mustahiq sebelum pencetakan Rapor.</p>
                  <p><strong>Alur Penilaian:</strong> 1. Mustahiq Input Nilai → 2. Mufattish Menyetujui Nilai → 3. Penandatanganan Digital → 4. Nilai terkunci otomatis.</p>
                </div>
              </div>

              {/* Kenaikan Kelas */}
              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>3. Kenaikan Kelas &amp; Status Akademik (`/sekretariat/kenaikan-kelas`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                  <p>Setelah pengesahan nilai akhir tahun ajaran, sistem akan memperbarui data **Kelas** siswi secara **otomatis** berbasis kriteria lulus/naik kelas (*Naik Kelas / Menetap*).</p>
                  <p>Adapun penempatan **Lokal** baru dilakukan secara fleksibel oleh Operator Madrasah melalui tombol ploting Rombel.</p>
                </div>
              </div>
            </div>
          )}

          {/* GROUP: DOKUMEN SISWI (MADRASAH) */}
          {activeGroup === "dokumen_siswi" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                <BookOpen className="w-5 h-5" />
                <h2>SOP Kelompok: DOKUMEN SISWI (Madrasah MPHM)</h2>
              </div>

              {/* Sertifikat */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>1. Sertifikat Prestasi &amp; Khataman (`/sekretariat/sertifikat`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pilih siswi penerima penghargaan → Tentukan Jenis Sertifikat (*Tahfidz / Khataman / Prestasi*) → Cetak PDF dengan TTD Digital resmi.</p>
              </div>

              {/* Raport Kwartal */}
              <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>2. Raport Kwartal Diniyyah (`/sekretariat/raport`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Filter Kelas &amp; Kwartal → Pastikan status nilai telah disetujui Mufattish → Klik **Cetak Rapor Masal** atau kirim ringkasan nilai ke WhatsApp Wali Santri.</p>
              </div>

              {/* Ijazah Kelulusan */}
              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Ijazah Kelulusan Diniyyah (`/sekretariat/ijazah`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Khusus bagi siswi kelas akhir yang berstatus **LULUS / ALUMNI**. Cetak lembar Ijazah resmi beserta Transkrip Nilai kelulusan.</p>
              </div>

              {/* Template Dokumen */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>4. Template Dokumen (`/sekretariat/template-dokumen`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pengaturan tata letak, margin, header kop surat, serta logo instansi untuk pencetakan Rapor &amp; Surat Keterangan.</p>
              </div>
            </div>
          )}

          {/* GROUP: DATABASE PONDOK (PONDOK P3HM) */}
          {activeGroup === "database_pondok" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                <BookOpen className="w-5 h-5" />
                <h2>SOP Kelompok: DATABASE PONDOK (Pondok P3HM)</h2>
              </div>

              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>1. Data Santriwati Asrama (`/sekretariat/santri`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Penginputan santriwati baru, NIK, Stambuk P3HM, Tempat/Tgl Lahir, Alamat, Wali Santri, dan Gedung/Kamar Asrama. Data ini menjadi acuan tarikan Madrasah.</p>
              </div>

              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Pin className="w-4 h-4 text-emerald-600" />
                  <span>2. Data Asrama &amp; Wali Santri (`/sekretariat/rooms` &amp; `/sekretariat/wali-santri`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pendataan Gedung/Kamar Asrama P3HM dan pengelompokan akun Wali Santri untuk akses aplikasi mobile/parent portal.</p>
              </div>

              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Pin className="w-4 h-4 text-emerald-600" />
                  <span>3. Data Pengurus Pondok (`/sekretariat/pengurus`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pengelolaan **14 Jabatan Baku Pengurus Pondok** (Pimpinan, Sekretaris, Keuangan, Keamanan, Pendidikan, Pembina Asrama, DLL.).</p>
              </div>
            </div>
          )}

          {/* GROUP: PERIZINAN & KEDISIPLINAN (PONDOK P3HM) */}
          {activeGroup === "perizinan_kedisiplinan" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                <Pin className="w-5 h-5" />
                <h2>SOP Kelompok: PERIZINAN &amp; KEDISIPLINAN (Pondok P3HM)</h2>
              </div>

              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>1. Perizinan Pulang / Keluar (`/sekretariat/perizinan`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pencatatan Surat Izin Pulang/Keluar Asrama, Alasan, Tanggal Kembali, &amp; verifikasi kedatangan santriwati tepat waktu.</p>
              </div>

              <div className="p-5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-rose-950 dark:text-rose-100 flex items-center gap-2">
                  <Pin className="w-4 h-4 text-rose-600" />
                  <span>2. Pelanggaran &amp; Poin Sanksi (`/sekretariat/pelanggaran`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pencatatan poin sanksi kedisiplinan keasramaan (*Ringan, Sedang, Berat*) dan pengeluaran Surat Peringatan (SP).</p>
              </div>
            </div>
          )}

          {/* GROUP: SISTEM & UTILITAS (KEDUANYA) */}
          {activeGroup === "sistem_utilitas" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-lg">
                <Lock className="w-5 h-5" />
                <h2>SOP Kelompok: SISTEM &amp; UTILITAS (Pondok &amp; Madrasah)</h2>
              </div>

              {/* Manajemen Akun */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>1. Manajemen Akun Pengguna (`/sekretariat/users`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pembuatan akun login, penetapan Peran Pengguna (*Sekretariat, Mustahiq, Munawwib, Mufattish, Wali Santri*), &amp; Reset Password.</p>
              </div>

              {/* Audit Log */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>2. Audit Log Aktivitas (`/sekretariat/audit-log`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Pemantauan rekam jejak aktivitas sensitif sistem (Mencatat Siapa, Kapan, IP Address, &amp; data apa yang diubah/dihapus).</p>
              </div>

              {/* Recycling Bin */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-2">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span>3. Recycling Bin / Tempat Sampah (`/sekretariat/recycle-bin`)</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Fitur pemulihan (*Restore*) data yang tidak sengaja terhapus, atau penghapusan permanen dari database.</p>
              </div>

              {/* Konfigurasi Sistem */}
              <div className="p-5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-3">
                <h3 className="font-black text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>4. Konfigurasi Sistem Terpadu (`/sekretariat/settings`)</span>
                </h3>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2 font-medium">
                  <p>Pusat Kendali **10 Master Control Modules**:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Modul Dikotomi Workspace (Cuti vs Boyong Approval)</li>
                    <li>Modul Kalender Akademik &amp; Kwartal Freeze Lock Switches</li>
                    <li>Modul Formulasi Nilai (%) &amp; Syarat Kenaikan Kelas (KKTP)</li>
                    <li>Modul Matriks Hak Akses 6 User</li>
                    <li>Modul Stempel &amp; TTD Digital Resmi</li>
                    <li>Modul Master Kedisiplinan &amp; Sanksi Poin</li>
                    <li>Modul Struktur Jabatan Pengurus (14 Pondok / 11 Madrasah)</li>
                    <li>Modul WhatsApp Gateway (Fonnte) &amp; Template Notifikasi</li>
                    <li>Modul API Data Wilayah Indonesia</li>
                    <li>Modul Keamanan, Auto-Backup DB, &amp; Emergency Maintenance Lock</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
