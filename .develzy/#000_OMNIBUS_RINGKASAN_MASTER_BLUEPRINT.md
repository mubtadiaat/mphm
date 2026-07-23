# 🌟 MASTER BLUEPRINT MPHM v4.5 (OMNIBUS EDITION 2026)
## #000_RINGKASAN_EKSEKUTIF_MASTER_BLUEPRINT (MODUL 00 - 16)

Dokumen ini adalah Ringkasan Eksekutif (Omnibus) yang merangkum 100% inti sari dari seluruh blueprint (Modul 00 hingga 16) tanpa ada yang tertinggal. Sistem Informasi Akademik MPHM Enterprise v4.5 dirancang sebagai "Pusat Data Abadi" berskala Enterprise Internal SaaS yang Strictly Decoupled, dengan performa super cepat, dan standar UI/UX modern kelas dunia.

---

## 1. INFRASTRUKTUR & DEPLOYMENT (Modul #00, #09, #11)
Arsitektur sistem mematuhi **Vercel Ecosystem** dan **Turborepo** (Monorepo) untuk isolasi yang rapi.
- **Frontend Layer & PWA:** Next.js 16+ (App Router dengan Turbopack), React 19, TypeScript, Progressive Web App (PWA).
- **Backend API Gateway:** Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`).
- **Database & ORM:** Relational Database Terenkripsi dikelola menggunakan Prisma ORM 7 (`@prisma/client`, `prisma/schema.prisma`).
- **Autentikasi:** Native Auth Sesi JWT & Google OAuth yang dipetakan langsung ke entitas pengguna di database (`user_accounts`).
- **UI/UX & Animation:** Tailwind CSS v4, Glassmorphism, Framer Motion, **Spotlight Card**, **PillBadge**, Lucide React.
- **Pipeline Media:** Cloud Storage. Tidak ada file gambar lokal statis, Frontend menggunakan *Signed Upload Token* ke Cloud Storage.
- **Domain Produksi Tunggal:** Seluruh sistem diakses melalui `https://m.p3hm.my.id`. API diakses via `/api/*`.
- **Standar Bahasa UI:** Bersih dari nama vendor internal (seperti Neon/Postgres/Cloudinary di teks user-facing), diganti dengan istilah umum profesional ("database terenkripsi", "Cloud Storage").

## 2. DATA ARCHITECTURE & KEAMANAN SYSTEM (Modul #02, #08, #13)
Sistem menggunakan hukum tata kelola data terpusat dan terenkripsi.
- **Person-Centric (Single Source of Truth):** Data entitas manusia hanya satu (tabel `people`). Perannya bisa banyak (Santri, Pengajar, Wali, Pengurus).
- **Otorisasi Roles & Multi-Role Support:** Mendukung peran Sekretariat Utama, Sekretariat Pondok (`sek.pondok`), Sekretariat Madrasah (`sek.madrasah`), Mustahiq (Wali Kelas), Mufattisy, Mundzir (Pimpinan), Keamanan, dan Wali Santri.
- **Workspace Auto-Sync:** `WorkspaceContext` secara otomatis mendeteksi role pengguna saat login:
  - Role `sek.pondok` ➔ Otomatis memuat Workspace **Pondok Pesantren** (Asrama, Kamar, Khidmah Alumni, Poin Takzir, Wali Santri).
  - Role `sek.madrasah` ➔ Otomatis memuat Workspace **Madrasah Diniyyah** (Kurikulum, GPA Diniyyah, Presensi Realtime, Rombel).
- **Automated Audit Log:** Route Handler Next.js mencatat setiap mutasi data (POST, PUT, DELETE) dengan skema *Before/After Data* pada tabel `audit_logs`.
- **Soft Delete Mutlak:** Seluruh relasi database menggunakan `onDelete: "restrict"` atau `deletedAt`. Dilarang ada penghapusan baris jika masih memiliki riwayat akademik/pelanggaran.
- **Wipe Out & Relational Seeding:** Skrip `seed.js` mengeksekusi `TRUNCATE TABLE ... CASCADE` untuk pembersihan total data dummy mengambang dan menanamkan data terintegrasi 100%.

## 3. AKADEMIK, ROMBEL & KURIKULUM (Modul #03, #10)
Sistem menggunakan konsep "Academic Workspace" per Tahun Ajaran.
- **Isolasi Tahun Ajaran:** Data transaksional (Rapor, Kelas, Absen) terikat pada ID Tahun Ajaran (`academic_years`).
- **Hierarki Lembaga:** Ibtida'iyyah, Tsanawiyyah, dan Aliyyah.
- **Manajemen Asrama (Rooms):** Pengelolaan Kamar/Asrama Santriwati terpusat lengkap dengan Wali Kamar dan Kapasitas (tabel `rooms`).
- **Syllabus Engine & Non-Mapel:**
  - Mapel Diniyyah menggunakan judul kitab berbahasa Arab (seperti فتح القريب, الكيلاني, الآجرومية).
  - Kelompok Non-Mapel (Al-Qur'an, Khoth, Qiro'ah, Muhafadhoh, Akhlaq) dapat dipisahkan dari kalkulasi Ranking.
- **Jadwal & Hissoh:** Jadwal fleksibel diturunkan ke kelas yang terbagi dalam dua hissoh (Ula & Tsani).

## 4. ENGINE PENILAIAN & KENAIKAN KELAS (Modul #04, #05)
- **Algoritma 4 Kwartal:** Tamrin Sem I, Ujian Sem I, Tamrin Sem II, Ujian Sem II.
- **The Holy Guard Limit (Akhlaq):** Pengontrolan nilai kualitatif Akhlaq dengan proteksi otomatis.
- **Ranking Elimination Engine:** Fitur isolasi nilai Non-Mapel dari perhitungan ranking kelas.
- **Promotion Engine:** State Machine Kenaikan Kelas (Draft -> Review -> Final) dengan status Promoted, Retained, Graduated, Khidmah.

## 5. KEDISIPLINAN, ABSENSI, & PERIZINAN (Modul #06, #15)
- **Kehadiran (Rekap Hijriyyah):** Absensi direkap per bulan pada tabel `student_attendances`.
- **Master Pelanggaran & Poin:** Jenis pelanggaran dikelola dari dashboard via tabel `violation_types` dan `student_violations`.
- **Sistem Perizinan & Sambangan (StudentPermit):** 
  - Model `StudentPermit` (`student_permits`) mengelola izin PULANG, SAMBANGAN, dan KELUAR.
  - Alur persetujuan (*approval flow*) dari Pimpinan/Sekretariat dengan audit status PENDING, APPROVED, REJECTED, COMPLETED.
  - RESTful API CRUD di `/api/disciplinary/permits` dan `/api/disciplinary/permits/[id]`.

## 6. PORTAL WALI SANTRI & EKOSISTEM KK MAPPING (Modul #07)
- Wali Santri dapat memantau perkembangan akademik, presensi, kedisiplinan, dan perizinan anak kandung secara realtime berdasarkan ikatan Nomor KK / NIK pada `guardian_profiles`.

## 7. MANAJEMEN ASRAMA & SANTRI KHIDMAH (Modul #16)
- Pengelolaan Kamar/Asrama (`rooms`), penugasan alumni khidmah (`khidmah_assignments`), dan pemetaan jabatan struktural pengurus pondok/madrasah.

## 8. DOKUMEN (RAPORT, IJAZAH, SERTIFIKAT) & PENGATURAN (Modul #12, #14)
- **Document Template Builder:** WYSIWYG Editor dengan *Merge Tags* (`{{nama_santri}}`, `{{stambuk}}`) untuk pencetakan Rapor dan Ijazah.
- **System Settings Cockpit:** Dashboard kontrol parameter sistem terpusat (`SystemSettingsCockpit.tsx`) yang terhubung langsung ke API `/api/settings` dan database `system_settings`.

## 9. STANDAR UI/UX & COMPONENT (Modul #01)
- UI/UX Enterprise Premium berstandar *Glassmorphism*, *Responsive Grid*, *Role Quick Login Buttons*, *PillBadge*, dan *Spotlight Cards*.
