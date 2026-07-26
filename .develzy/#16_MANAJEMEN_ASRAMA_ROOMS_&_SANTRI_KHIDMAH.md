# 🌟 MASTER BLUEPRINT MPHM v4.5 (DORMITORY & KHIDMAH ENGINE)
## #16_MANAJEMEN_ASRAMA_ROOMS_&_SANTRI_KHIDMAH

Modul Manajemen Asrama (`rooms`), Penugasan Alumni Khidmah (`khidmah_assignments`), dan Jabatan Struktural Pengurus mengelola ekosistem kehidupan asrama santriwati dan pengabdian alumni di Pondok Pesantren MPHM Enterprise.

---

## 1. MANAJEMEN KAMAR & ASRAMA (`rooms`)
- **Tabel Database**: `rooms` terhubung ke `people` (sebagai Musyrifah / Wali Kamar) dan `student_profiles` (sebagai Penghuni).
- **Atribut Utama**: Nama Kamar (`name`), Nama Gedung (`building_name`), Kapasitas Maksimal (`capacity`), dan Wali Kamar (`supervisor_id`).
- **Aturan Mutlak 2 Gedung Utama**:
  Gedung Asrama HANYA terdiri dari 2 pilihan resmi:
  1. `Gedung Kota` (Komplek Asrama Kota)
  2. `Gedung Desa` (Komplek Asrama Desa)
- **Rumus Pemetaan Abjad Kamar A-Z (`determineBuildingName`)**:
  - Kamar Kode **A s/d D** (Contoh: `A-01`, `A-02`, `B-05`, `C-10`, `D-02`) $\rightarrow$ Otomatis dialokasikan ke **`Gedung Kota`** (Contoh: `A-02` di Gedung Kota).
  - Kamar Kode **E s/d Z** (Contoh: `E-01`, `F-02`, `G-10`, `Z-01`) $\rightarrow$ Otomatis dialokasikan ke **`Gedung Desa`** (Contoh: `E-01` di Gedung Desa).
  - Override Kata Kunci: Jika nama kamar mengandung kata `"Kota"` atau `"Desa"`, gedung disesuaikan otomatis dengan kata kunci tersebut.
- **Otomatisasi Pembuatan Kamar saat Impor Santri**:
  Jika saat **Impor Data Santri (Excel/CSV)** atau registrasi baru terdapat kamar yang belum terdaftar di database, sistem **secara otomatis membuat kamar baru** di tabel `rooms` dengan `buildingName` yang dihitung otomatis dari rumus abjad A-Z dan `supervisorId: null` (siap diedit oleh Sekretariat).
- **Integrasi Dashboard Pondok**: Sekretariat Pondok (`sek.pondok`) dapat memantau keterisian kamar, memindahkan santri antar kamar, dan menugaskan Musyrifah secara dinamis.

---

## 2. PENUGASAN ALUMNI KHIDMAH (`khidmah_assignments`)
- Santri alumni yang mengabdi di pesantren dicatat pada tabel `khidmah_assignments`.
- Atribut mencakup: Lokasi Pengabdian (`location`), Tugas/Peran (`role_task`), Tanggal Mulai (`start_date`), Tanggal Selesai (`end_date`), dan Status (`status`).
- Terhubung langsung ke biodata `people` untuk menjamin histori pengabdian tersimpan abadi.

---

## 3. JABATAN STRUKTURAL & PERAN ORGANISASI (`organization_memberships`)
- Jabatan struktural Mufattisy, Mundzir, Pengurus Asrama, dan Keamanan dikelola dari `SystemSettingsCockpit` via tabel `organization_memberships`.
- Administrator dapat menambahkan atau memperbarui gelar jabatan struktural secara terpusat tanpa mengubah kode aplikasi.
