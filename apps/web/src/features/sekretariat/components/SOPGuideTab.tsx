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

  const [activeTab, setActiveTab] = useState<"pendataan" | "rombel" | "akademik" | "status" | "konfigurasi">("pendataan");

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
            <span>{isPondok ? "SOP Sekretariat Pondok Pesantren P3HM" : "SOP Sekretariat Madrasah Diniyyah MPHM"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isPondok ? "Panduan & Tata Kelola Keasramaan P3HM" : "Panduan & Tata Kelola Akademik Diniyyah MPHM"}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            {isPondok
              ? "Pedoman resmi operasional Sekretariat Pondok P3HM: Penginputan Santriwati Asrama Baru, Wali Santri, Kamar Asrama, Perizinan, Pelanggaran Kedisiplinan, Approval Boyong, hingga Konfigurasi Sistem Keasramaan."
              : "Pedoman resmi operasional Sekretariat Madrasah MPHM: Penarikan Data Santriwati P3HM vs Input Manual Unit Luar, Rombel/Lokal, Mustahiq/Munawwib, 4 Tahap Penilaian Akademik, Cuti Pembelajaran, & Konfigurasi Sistem Akademik."}
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
          <strong>Ketentuan Baku Sistem:</strong> Seluruh tata cara di bawah ini telah diselaraskan 100% dengan aturan baku instansi dan dikotomi kewenangan Pondok P3HM &amp; Madrasah MPHM.
        </span>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("pendataan")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
            activeTab === "pendataan"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Input &amp; Pendataan Induk</span>
        </button>

        <button
          onClick={() => setActiveTab("rombel")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
            activeTab === "rombel"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Pin className="w-4 h-4" />
          <span>2. {isPondok ? "Asrama & Pengurus" : "Rombel & Pengajar"}</span>
        </button>

        <button
          onClick={() => setActiveTab("akademik")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
            activeTab === "akademik"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3. {isPondok ? "Perizinan & Kedisiplinan" : "Alur 4 Tahap Penilaian"}</span>
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
            activeTab === "status"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>4. {isPondok ? "Approval Boyong Santri" : "Status Cuti & Boyong"}</span>
        </button>

        <button
          onClick={() => setActiveTab("konfigurasi")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap inline-flex items-center gap-2 ${
            activeTab === "konfigurasi"
              ? isPondok ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>5. Tata Kelola Konfigurasi</span>
        </button>
      </div>

      {/* Content Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeWorkspace}-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* TAB 1: PENDATAAN INDUK */}
          {activeTab === "pendataan" && (
            <div className="space-y-6">
              {isPondok ? (
                /* PONDOK P3HM */
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                    <BookOpen className="w-5 h-5" />
                    <h2>SOP Input &amp; Pendataan Induk Santriwati (Pondok P3HM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                      <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Pin className="w-4 h-4 text-emerald-600" />
                        <span>Ketentuan Sumber Data Utama:</span>
                      </span>
                      <p>
                        Pondok Pesantren P3HM merupakan <strong>Sumber Utama (Single Source of Truth)</strong> seluruh data identitas santriwati. Seluruh biodata (Nama, Stambuk, NIK, Tempat/Tgl Lahir, Alamat, Nama Wali) dibuat dan dikelola penuh di Pondok.
                      </p>
                    </div>

                    <h3 className="font-black text-zinc-900 dark:text-white pt-2 text-sm">Langkah-Langkah Operasional Operator Pondok:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Buka menu <strong>Data Santriwati (`/sekretariat/santri`)</strong> pada Dashboard Pondok.</li>
                      <li>Klik tombol <strong>📥 Tambah Santriwati Baru</strong>.</li>
                      <li>Isi Nomor Stambuk resmi P3HM, NIK, Nama Lengkap, Tempat &amp; Tgl Lahir, serta Alamat Lengkap.</li>
                      <li>Pilih Gedung &amp; Kamar Asrama tempat santriwati menginap.</li>
                      <li>Simpan data. Data santriwati kini resmi aktif di database P3HM dan siap ditarik oleh pihak Madrasah MPHM.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* MADRASAH MPHM */
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                    <BookOpen className="w-5 h-5" />
                    <h2>SOP Penarikan &amp; Input Manual Siswi Diniyyah (Madrasah MPHM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                      <span className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span>Mekanisme 2 Jalur Pendataan Siswi Diniyyah:</span>
                      </span>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Jalur 1 (Penarikan Data Pondok P3HM)</strong>: Digunakan bagi siswi yang merupakan santriwati menetap di Asrama Pondok P3HM. Identitas terisi 100% otomatis dan terkunci.</li>
                        <li><strong>Jalur 2 (Input Manual Madrasah)</strong>: Digunakan khusus bagi siswi unit luar / non-P3HM yang tidak tinggal di asrama P3HM.</li>
                      </ul>
                    </div>

                    <h3 className="font-black text-zinc-900 dark:text-white pt-2 text-sm">Langkah-Langkah Operasional Operator Madrasah:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Buka menu <strong>Data Siswi (`/sekretariat/santri`)</strong> pada Dashboard Madrasah.</li>
                      <li>Klik <strong>📥 Tarik Data Siswi dari Pondok P3HM</strong>. Cari nama/stambuk santri. Klik <strong>📥 Tarik Data</strong>. Seluruh identitas akan terisi 100% otomatis.</li>
                      <li>Operator Madrasah kemudian menentukan <strong>Kelas Diniyyah</strong> dan <strong>Lokal (Rombel)</strong>.</li>
                      <li>Apabila siswi tidak ditemukan di database Pondok (Unit Luar), klik <strong>🔓 Buka Form Input Manual Baru</strong> untuk memasukkan identitas secara mandiri.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ROMBEL & PENGAJAR */}
          {activeTab === "rombel" && (
            <div className="space-y-6">
              {isPondok ? (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                    <Pin className="w-5 h-5" />
                    <h2>SOP Penataan Asrama &amp; Pengurus Blok (Pondok P3HM)</h2>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <p>
                      Pihak Pondok P3HM berwenang penuh mengatur pembagian Gedung, Kamar Asrama, serta penunjukan Pengurus Asrama. Pihak Pondok <strong>tidak mengelola Kelas Diniyyah &amp; Lokal Madrasah</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Buka menu <strong>Data Asrama (`/sekretariat/rooms`)</strong> untuk mendaftarkan Gedung &amp; Kapasitas Kamar.</li>
                      <li>Buka menu <strong>Data Pengurus (`/sekretariat/pengurus`)</strong> untuk memilih <strong>14 Jabatan Baku Pengurus Pondok</strong>.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                    <Pin className="w-5 h-5" />
                    <h2>SOP Pembagian Rombel &amp; Peran Pengajar Mustahiq / Munawwib (Madrasah MPHM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <p>
                      Pengelolaan <strong>Kelas &amp; Lokal (Rombel)</strong> serta <strong>Data Pengajar</strong> merupakan kewenangan mutlak Madrasah MPHM dan tidak berasal dari Pondok P3HM.
                    </p>
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                      <span className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Pin className="w-4 h-4 text-blue-600" />
                        <span>Ketentuan 2 Peran Utama Pengajar:</span>
                      </span>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>📌 Mustahiq (Wali Kelas)</strong>: Wajib memilih 1 Rombel Kelas khusus yang diampu sebagai Wali Kelas.</li>
                        <li><strong>📖 Munawwib (Guru Mapel)</strong>: Dapat mengampu beberapa Kelas/Rombel sekaligus (*multi-class*) untuk mata pelajaran tertentu.</li>
                      </ul>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>Buka menu <strong>Data Kelas (Rombel) (`/sekretariat/kelas`)</strong> untuk membuat daftar Rombel.</li>
                      <li>Buka menu <strong>Data Pengajar (`/sekretariat/pengajar`)</strong> untuk menunjuk Mustahiq &amp; Munawwib.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALUR AKADEMIK & PENILAIAN */}
          {activeTab === "akademik" && (
            <div className="space-y-6">
              {isPondok ? (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <h2>SOP Perizinan &amp; Kedisiplinan Keasramaan (Pondok P3HM)</h2>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <p>
                      Pihak Pondok P3HM mencatat dan mengelola seluruh Perizinan Pulang/Keluar serta Pelanggaran Kedisiplinan Santriwati.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Menu <strong>Perizinan (`/sekretariat/perizinan`)</strong>: Mencatat Surat Izin Pulang dan batas waktu kembali ke Asrama.</li>
                      <li>Menu <strong>Pelanggaran (`/sekretariat/pelanggaran`)</strong>: Mencatat Poin Sanksi Kedisiplinan (*Ringan, Sedang, Berat*).</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <h2>SOP Alur 4 Tahap Penilaian Akademik &amp; Kenaikan Kelas (Madrasah MPHM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <p>
                      Proses penilaian dan kenaikan kelas siswi Diniyyah sepenuhnya ditentukan berdasarkan alur akademik 4 tahap baku:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-bold text-xs">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl">
                        <span className="block font-black text-blue-600">TAHAP 1</span>
                        <span>Input Nilai oleh Mustahiq</span>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
                        <span className="block font-black text-purple-600">TAHAP 2</span>
                        <span>Persetujuan Nilai Mufattish</span>
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
                        <span className="block font-black text-indigo-600">TAHAP 3</span>
                        <span>Penandatanganan Digital</span>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                        <span className="block font-black text-emerald-600">TAHAP 4</span>
                        <span>Kenaikan Kelas Otomatis</span>
                      </div>
                    </div>
                    <p>
                      Setelah seluruh tahapan selesai, data **Kelas** siswi akan berubah secara otomatis (*Naik Kelas / Menetap*). Operator Madrasah tinggal melakukan **Ploting Lokal (Rombel)** manual melalui menu Data Kelas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STATUS CUTI VS BOYONG */}
          {activeTab === "status" && (
            <div className="space-y-6">
              {isPondok ? (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                    <RefreshCw className="w-5 h-5" />
                    <h2>SOP Approval / Persetujuan Boyong Santri (Pondok P3HM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                      <span className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Kewenangan Mutlak Boyong Pondok:</span>
                      </span>
                      <p>
                        Status **Boyong** santriwati wajib mendapatkan persetujuan (**approval**) dari Pondok Pesantren P3HM. Apabila Madrasah mengajukan Boyong, status di Pondok akan bernilai `⏳ BOYONG_PENDING`.
                      </p>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>Buka menu <strong>Data Santriwati (`/sekretariat/santri`)</strong> pada Dashboard Pondok.</li>
                      <li>Filter sub-tab <strong>Santriwati Boyong</strong>.</li>
                      <li>Tinjau pengajuan Boyong. Klik **✅ Setujui Boyong** untuk meresmikan status Boyong, atau **❌ Tolak** untuk mengembalikan status santriwati menjadi AKTIF.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-lg">
                    <RefreshCw className="w-5 h-5" />
                    <h2>SOP Pengelolaan Status Cuti &amp; Pengajuan Boyong (Madrasah MPHM)</h2>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                      <span className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Pemisahan Kewenangan Status Siswi:</span>
                      </span>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Status Cuti</strong>: Mandiri Madrasah (langsung berlaku tanpa perlu approval Pondok).</li>
                        <li><strong>Status Boyong</strong>: Diajukan Madrasah, namun baru resmi berlaku setelah **disetujui oleh Pondok P3HM**.</li>
                      </ul>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>Buka menu <strong>Data Siswi (`/sekretariat/santri`)</strong>.</li>
                      <li>Klik tombol mutasi status siswi target. Pilih `Cuti Pembelajaran Madrasah` atau `Pengajuan Boyong ke Pondok`.</li>
                      <li>Simpan data. Pengajuan Boyong otomatis terisi ke antrean approval Sekretariat Pondok P3HM.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KONFIGURASI SISTEM */}
          {activeTab === "konfigurasi" && (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-lg">
                <Lock className="w-5 h-5" />
                <h2>SOP &amp; Tata Cara Penggunaan Konfigurasi Sistem (10 Master Modules)</h2>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                <p>
                  Menu **Konfigurasi Sistem (`/sekretariat/settings`)** merupakan Pusat Kendali 10 Modul Terpadu yang mengatur parameter operasi instansi:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Modul 1: Dikotomi Workspace
                    </span>
                    <p className="text-zinc-500">Mengatur batas tegas kewenangan Cuti &amp; Boyong antara Pondok P3HM &amp; Madrasah MPHM.</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Modul 2: Freeze Kwartal
                    </span>
                    <p className="text-zinc-500">Mengunci input nilai per Kwartal (1-4) agar Mustahiq tidak bisa merubah nilai lama.</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Modul 3: Formulasi Nilai
                    </span>
                    <p className="text-zinc-500">Mengatur bobot % Harian, Kwartal, Syafa'i, serta batas KKTP &amp; mapel merah.</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /> Modul 4: Matriks 6 User
                    </span>
                    <p className="text-zinc-500">Pengaturan izin akses menu &amp; tombol aksi bagi 6 Peran Baku pengguna.</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-rose-600" /> Modul 5: TTD Digital
                    </span>
                    <p className="text-zinc-500">Unggah TTD Digital Pengasuh, Kepala Madrasah, Mufattish, &amp; Stempel Resmi.</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Modul 8: WA Gateway
                    </span>
                    <p className="text-zinc-500">Pengaturan Fonnte API Key &amp; template pesan pengumuman Rapor &amp; Absensi ke Wali Santri.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>Setelah mengubah konfigurasi di menu Konfigurasi Sistem, pastikan menekan tombol <strong>Simpan Konfigurasi Terpusat</strong> di sudut kanan atas banner.</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
