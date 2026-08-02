# 🌟 MASTER BLUEPRINT MPHM v5.1
## #23_MENU_PANDUAN_SOP_SISTEM — Halaman Tata Cara & SOP Operasional

---

## 1. DESKRIPSI HALAMAN

**Route**: `/sekretariat/sop`
**Komponen Utama**: `SOPGuideTab.tsx` (`apps/web/src/features/sekretariat/components/SOPGuideTab.tsx`)
**Page Next.js**: `apps/web/src/app/(dashboard)/sekretariat/sop/page.tsx`

Halaman ini berisi Panduan dan Tata Cara (SOP) penggunaan seluruh menu Sekretariat yang **dinamis** — isinya menyesuaikan workspace aktif secara otomatis.

---

## 2. ATURAN DESAIN PANDUAN SOP

1. **Tidak ada simbol raw markdown**: Dilarang menggunakan `*`, `**`, backtick, atau path teknis seperti `/sekretariat/santri`.
2. **Judul menu human-readable**: Gunakan "Menu Data Siswi", bukan `('/sekretariat/santri')`.
3. **Tidak ada nama vendor teknologi**: Jangan sebut "Database", "Server" generik sudah cukup.
4. **Bahasa Indonesia formal**: Profesional, lugas, tanpa jargon teknis berlebihan.

---

## 3. STRUKTUR KONTEN — WORKSPACE PONDOK P3HM (Emerald)

Kelompok menu yang disajikan:

### A. DATABASE PONDOK:
1. **Menu Data Santriwati Asrama** — Input biodata baru, Stambuk, NIK, Asrama, Wali Santri. Data ini menjadi acuan tarikan Madrasah.
2. **Menu Data Asrama & Wali Santri** — Pendataan gedung/kamar asrama & akun Wali Santri.
3. **Menu Data Pengurus Pondok** — Pengelolaan 14 Jabatan Baku Pengurus Pondok.

### B. PERIZINAN & KEDISIPLINAN:
1. **Menu Perizinan Pulang / Keluar** — Surat Izin Pulang, Tanggal Kembali, verifikasi.
2. **Menu Pelanggaran & Poin Sanksi** — Poin sanksi kedisiplinan (Ringan, Sedang, Berat) & SP.

### C. SISTEM & UTILITAS:
1. **Menu Manajemen Akun** — Pembuatan akun, penetapan Peran, Reset Password.
2. **Menu Audit Log** — Rekam jejak aktivitas sensitif (Siapa, Kapan, Data apa).
3. **Menu Recycling Bin** — Pemulihan atau penghapusan permanen data.
4. **Menu Konfigurasi Sistem** — 10 Master Control Modules.

---

## 4. STRUKTUR KONTEN — WORKSPACE MADRASAH MPHM (Blue)

Kelompok menu yang disajikan:

### A. MANAJEMEN DATA:
1. **Menu Data Siswi**:
   - Jalur 1 (Tarik Data Santri P3HM): Identitas terisi otomatis 100% & terkunci.
   - Jalur 2 (Input Manual Siswi Unit Luar/Non-P3HM): Form terbuka sepenuhnya.
   - Penetapan status Cuti (Mandiri) dan pengajuan Boyong (ke Pondok).
2. **Menu Data Kelas (Rombel)** — Daftarkan Rombel per Jenjang & Tingkat Kelas.

### B. PENGAJAR & PENGURUS:
1. **Menu Data Pengurus** — 11 Jabatan Baku Pengurus Madrasah.
2. **Menu Data Pengajar** — Penetapan peran Mustahiq (1 Rombel) atau Munawwib (Multi-Kelas).

### C. AKADEMIK & PENILAIAN:
1. **Menu Kurikulum & Silabus** — Struktur Mapel per Jenjang & Kelas.
2. **Menu Penilaian Akademik** — Audit nilai 4 Kwartal sebelum cetak Rapor.
3. **Menu Kenaikan Kelas** — Kenaikan otomatis berbasis KKTP & ploting Rombel baru.

### D. DOKUMEN SISWI:
1. **Menu Sertifikat** — Cetak Sertifikat Tahfidz, Khataman, Prestasi.
2. **Menu Raport Kwartal** — Cetak Rapor Masal atau kirim WA Wali Santri.
3. **Menu Ijazah Kelulusan** — Cetak Ijazah Resmi & Transkrip Nilai.
4. **Menu Template Dokumen** — Pengaturan margin, kop surat, header/footer.

### E. SISTEM & UTILITAS:
1. **Menu Manajemen Akun** — Pembuatan akun, peran, Reset Password.
2. **Menu Audit Log** — Rekam jejak aktivitas sensitif sistem.
3. **Menu Recycling Bin** — Pemulihan atau penghapusan permanen data.
4. **Menu Konfigurasi Sistem** — 10 Master Control Modules.

---

## 5. NAVIGASI SIDEBAR (ROUTES AKTIF)

Menu **Panduan & SOP Sistem** terdaftar di:
- `navigation.config.ts`: Kelompok **SISTEM & UTILITAS** di `SEKRETARIAT_PONDOK_NAV` & `SEKRETARIAT_MADRASAH_NAV`
- `rbac.ts`: Terdaftar di `enabledMenus[]` untuk role `sek.pondok` dan `sek.madrasah`

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
