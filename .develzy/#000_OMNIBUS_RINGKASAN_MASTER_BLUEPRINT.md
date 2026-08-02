# 🌟 MASTER BLUEPRINT MPHM v5.1 (OMNIBUS EDITION 2026)
## #000_RINGKASAN_EKSEKUTIF_MASTER_BLUEPRINT (MODUL 00 — 20+)

Dokumen ini adalah Ringkasan Eksekutif (Omnibus) yang merangkum 100% inti sari seluruh blueprint versi terbaru yang telah berjalan 100% di Live Production.

---

## 📌 DAFTAR MODUL BLUEPRINT

| Modul | Nama Blueprint | Pokok Aturan & Arsitektur Utama |
|---|---|---|
| **#00** | MASTER BLUEPRINT MPHM | Visi & Arsitektur Unified Enterprise Web App Next.js + PWA |
| **#01** | STANDAR UI/UX | Design system, Dark Mode, Glassmorphism, Whitelist 10 Ikon Resmi |
| **#02** | ENTERPRISE DATA ARCHITECTURE | Schema Database & Single Source of Truth (`people`) |
| **#03** | ACADEMIC WORKSPACE & ROMBEL | Manajemen rombel kelas, mutasi siswi, Mustahiq/Munawwib |
| **#04** | ENGINE PENILAIAN KWARTAL | Formula nilai kwartal & generator raport Diniyyah 4 Tahap |
| **#05** | PROMOTION ENGINE | Kenaikan kelas otomatis & riwayat akademik santriwati |
| **#06** | KEHADIRAN & KEDISIPLINAN | Presensi & pencatatan poin kedisiplinan keasramaan |
| **#07** | PORTAL WALI SANTRI | Smart KK mapping & portal pemantauan orang tua |
| **#08** | KEAMANAN & RBAC | Otorisasi RBAC berbasis peran & workspace security |
| **#09** | DEPLOYMENT VERCEL | Standar CI/CD & uji kepatuhan otomatis Vercel |
| **#10** | KURIKULUM & MAPEL | Master mata pelajaran diniyyah per jenjang kelas |
| **#11** | FEATURE-BASED ARCHITECTURE | Struktur folder features per modul domain |
| **#12** | SETTINGS & SYSTEM CONFIG | Cockpit Konfigurasi 10 Master Modules tersambung Database |
| **#13** | AUDIT LOG 24 JAM | Logging aktivitas pengubah data & keamanan audit |
| **#14** | RAPORT, IJAZAH & SERTIFIKAT | Generator PDF & sertifikat kelulusan siswi |
| **#15** | PERIZINAN & SAMBANGAN | Manajemen perizinan keluar-masuk & sambangan wali |
| **#16** | ASRAMA & SANTRI KHIDMAH | Penetapan blok, kamar asrama, & tugas khidmah |
| **#17** | ENTERPRISE PWA & CROSS-PLATFORM | Konsolidasi 100% ke Web Platform Next.js PWA, Universal Responsive |
| **#18** | RESTRUKTURISASI PENGURUS | Single Source of Truth Pengurus dari Pondok P3HM |
| **#19** | SANTRIWATI MUKIM 100% | Eliminasi total opsi Non-Mukim / Kalong (Wajib Mukim) |
| **#20** | DEVELOPER SAAS & ROLE MATRIX | Dashboard Developer, Master Killswitches, Granular Permission Matrix |
| **#21** | DIKOTOMI KEWENANGAN P3HM vs MPHM | Aturan mutlak pemisahan wewenang Pondok & Madrasah |
| **#22** | WHITELIST IKON RESMI SISTEM | 10 ikon yang diizinkan & larangan keras ikon lainnya |
| **#23** | MENU PANDUAN & SOP SISTEM | Halaman panduan dinamis berbasis workspace aktif |
| **#24** | BRANDING POLICY TEKNOLOGI | Penyamaran nama vendor menjadi terminologi "Database" |

---

## 🎯 DIKOTOMI KEWENANGAN UTAMA (ATURAN MUTLAK)

### Pondok Pesantren P3HM (Tema Emerald 🟢):
- **Single Source of Truth** identitas santriwati (Nama, NIK, Stambuk, Alamat, Wali Santri)
- Pengelola kamar & gedung asrama
- Pemegang approval resmi status **Boyong**
- Pengelola Perizinan Pulang & Poin Pelanggaran Kedisiplinan
- 14 Jabatan Baku Pengurus Pondok

### Madrasah Diniyyah MPHM (Tema Blue 🔵):
- Tarikan data siswi dari Pondok (locked/terkunci) atau input manual siswi unit luar
- Penetapan **Cuti Pembelajaran** secara mandiri (tanpa approval Pondok)
- Pengelola Rombel/Kelas, Mustahiq, Munawwib, Kurikulum, Penilaian, Raport, Ijazah
- 11 Jabatan Baku Pengurus Madrasah

---

## 🔐 KONFIGURASI SISTEM — 10 MASTER MODULES (LIVE DATABASE)

Semua modul tersambung penuh ke tabel `system_settings` (database), API `PUT /api/settings`, dan localStorage browser:

1. Dikotomi Workspace & Hak Akses Instansi
2. Kalender Akademik & Kwartal Freeze Lock Engine
3. Formulasi Nilai & Kriteria Kenaikan Kelas (KKTP)
4. Matriks Hak Akses 6 User Baku
5. Stempel & Tanda Tangan Digital (Upload File → Auto RemoveBG HD → Database)
6. Master Kedisiplinan & Poin Sanksi Keasramaan
7. Struktur Jabatan Pengurus (14 Pondok + 11 Madrasah)
8. WhatsApp Gateway & Template Notifikasi Wali Santri
9. API Data Wilayah Indonesia (Cahyadsn / Binderbyte / Kemendagri)
10. Keamanan Sistem, Auto-Backup DB, Emergency Maintenance Lock

---

## ✅ WHITELIST 10 IKON RESMI (KEBIJAKAN MUTLAK)

`✅ 🔄 ❌ 📌 📖 🔒 🔓 ⏳ 📥 ✨` — Selain ini **DILARANG KERAS** di seluruh UI.

---

## 🏷️ BRANDING TERMINOLOGI TEKNOLOGI

- Cloudinary / Cloud Storage / Neon / PostgreSQL → **"Database"** (di semua teks UI yang terlihat user).
- Nama vendor hanya boleh muncul di kode internal (comments, variabel teknis).

---

## 🚀 KONTROL DEVELOPER (`m.p3hm.my.id/developer`)

- **Login**: `develzy` / `develzy25`
- **Fitur**: Real-time System Metrics, Master Killswitches, Live DB Inspector, Export Backup JSON.

---

## 📖 MENU PANDUAN & SOP SISTEM (`/sekretariat/sop`)

Halaman panduan tata kelola dashboard yang **dinamis berbasis workspace**:
- Pondok (P3HM): 3 Kelompok Menu (Database Pondok, Perizinan & Kedisiplinan, Sistem & Utilitas)
- Madrasah (MPHM): 5 Kelompok Menu (Manajemen Data, Pengajar & Pengurus, Akademik & Penilaian, Dokumen Siswi, Sistem & Utilitas)

Tampilan bersih tanpa simbol raw markdown, tanpa path URL teknis (`/sekretariat/...`).

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1 LIVE PRODUCTION**
