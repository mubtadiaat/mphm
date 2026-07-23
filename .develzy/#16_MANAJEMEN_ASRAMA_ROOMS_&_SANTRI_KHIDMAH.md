# 🌟 MASTER BLUEPRINT MPHM v4.5 (DORMITORY & KHIDMAH ENGINE)
## #16_MANAJEMEN_ASRAMA_ROOMS_&_SANTRI_KHIDMAH

Modul Manajemen Asrama (`rooms`), Penugasan Alumni Khidmah (`khidmah_assignments`), dan Jabatan Struktural Pengurus mengelola ekosistem kehidupan asrama santriwati dan pengabdian alumni di Pondok Pesantren MPHM Enterprise.

---

## 1. MANAJEMEN KAMAR & ASRAMA (`rooms`)
- **Tabel Database**: `rooms` terhubung ke `people` (sebagai Musyrifah / Wali Kamar) dan `student_profiles` (sebagai Penghuni).
- **Atribut Utama**: Nama Kamar (`name`), Nama Gedung (`building_name`), Kapasitas Maksimal (`capacity`), dan Wali Kamar (`supervisor_id`).
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
