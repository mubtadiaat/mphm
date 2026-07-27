# 🌟 MASTER BLUEPRINT MPHM v4.5 (DORMITORY & KHIDMAH ENGINE)
## #16_MANAJEMEN_ASRAMA_ROOMS_&_SANTRI_KHIDMAH

Modul Manajemen Asrama (`rooms`), Penugasan Alumni Khidmah (`khidmah_assignments`), dan Jabatan Struktural Pengurus mengelola ekosistem kehidupan asrama santriwati dan pengabdian alumni di Pondok Pesantren MPHM Enterprise.

---

## 1. MANAJEMEN ASRAMA & KAMAR (`rooms`)
- **Tabel Database**: `rooms` terhubung ke `people` (sebagai Musyrifah / Wali Kamar) dan `student_profiles` (sebagai Penghuni).
- **Atribut Utama**: Nama Kamar (`name`), Nama Blok / Komplek (`building_name`), Kapasitas Maksimal (`capacity`), dan Wali Kamar (`supervisor_id`).
- **Aturan Nama Blok (Komplek) Dinamis**:
  Gedung/Blok Asrama menggunakan istilah resmi **`Nama Blok (Komplek)`** yang bebas dikelola secara dinamis oleh Sekretariat (contoh: `Blok A`, `Blok B`, `Komplek Al-Mahrusiyah`, `Komplek Utama`).
- **2 Sub-Menu Navigasi Data Asrama (`/sekretariat/rooms`)**:
  1. **Sub-Menu 1: Blok / Komplek**: Grid visual kartu blok berisi daftar kamar di dalamnya, kapasitas total, penghuni aktif, persentase keterisian, dan statistik hunian.
  2. **Sub-Menu 2: Data Kamar**: Form input dan tabel kamar yang disesuaikan secara presisi dengan pilihan Nama Blok (Komplek) terkait.
- **Otomatisasi Pembuatan Kamar saat Impor Santri**:
  Jika saat **Impor Data Santri (Excel/CSV)** atau registrasi baru terdapat kamar yang belum terdaftar di database, sistem **secara otomatis membuat kamar baru** di tabel `rooms` dengan `buildingName` yang terhitung otomatis dan `supervisorId: null` (siap diedit oleh Sekretariat).
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
