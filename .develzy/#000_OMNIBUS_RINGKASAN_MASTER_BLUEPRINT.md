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
- **Log-Out Redirection Presisi**: Saat log out, sistem secara otomatis mengarahkan pengguna ke halaman login perannya masing-masing (`/login` untuk Sekretariat, `/login/mufattisy` untuk Mufattisy, `/login/wali` untuk Wali Santri, `/login/mustahiq` untuk Mustahiq).
- **UI/UX & Animation:** Tailwind CSS v4, Glassmorphism, Framer Motion, **Spotlight Card**, **PillBadge**, Lucide React.
- **Pipeline Media:** Cloud Storage. Tidak ada file gambar lokal statis, Frontend menggunakan *Signed Upload Token* ke Cloud Storage.
- **Domain Produksi Tunggal:** Seluruh sistem diakses melalui `https://m.p3hm.my.id`. API diakses via `/api/*`.
- **Standar Bahasa UI:** Bersih dari nama vendor internal (seperti Neon/Postgres/Cloudinary di teks user-facing), diganti dengan istilah umum profesional ("database terenkripsi", "Cloud Storage").
- **Hukum Tanpa Hardcoded Fallback String:** Seluruh cell renderer tabel dilarang keras menggunakan string fallback palsu. Semua tampilan WAJIB murni dari baris database PostgreSQL atau fallback ke tanda dash (`"-"`).

---

## 2. DATA ARCHITECTURE & KEAMANAN SYSTEM (Modul #02, #08, #13)
Sistem menggunakan hukum tata kelola data terpusat dan terenkripsi.
- **Person-Centric & Integrasi Data Santri (Single Source of Truth):**
  - Data entitas manusia hanya satu (tabel `people`). Perannya bisa banyak (Santri, Pengajar, Wali, Pengurus).
  - Pendaftaran identitas utama santriwati dilakukan dari **Pondok (P3HM)**.
  - Aplikasi **Madrasah (MPHM)** memanggil/menarik data santriwati dari Pondok. Jika santriwati belum dipasangkan kelas madrasah saat registrasi di Pondok, Sekretariat MPHM menarik data santriwati tersebut dari daftar *Belum Ada Kelas* lalu mengalokasikannya ke kelas target.
- **Pusat Pengelolaan Akun (Users) & 4 Sub-Menu Utama:**
  - Terpusat pada menu `/sekretariat/users` dengan 4 Sub-Menu Resmi:
    1. **Daftar Akun (Monitoring):** Pemantauan seluruh akun terdaftar beserta status keaktifan & online.
    2. **Generate Akun Instansi:** Generator massal kredensial akun instansi dengan **Deteksi Role Otomatis (`⭐ Otomatis`)** berdasarkan jabatan/profil.
    3. **Keranjang Sampah Dorman (>6 Bulan):** Isolasi otomatis bagi akun tidak aktif >6 bulan.
    4. **Wali Santri (Yang Sudah Mendaftar):** Modul khusus pemantauan & manajemen akun Wali Santri terdaftar.
- **Automatic Orphaned Guardians Cleanup (`cleanOrphanedGuardians`):**
  Saat data santri dihapus atau di-*purge*, sistem secara otomatis memeriksa apakah Wali Santri masih memiliki anak aktif. Jika Wali tidak lagi memiliki anak aktif, profil `GuardianProfile`, `UserAccount`, dan `Person` wali tersebut dibersihkan (*soft-delete*) dari database agar tidak menyisakan data sampah.
- **Otorisasi Roles & Mufattisy / Mundzir Read-Only Scoping:**
  - **Mufattisy & Mundzir 100% Read-Only**: Tidak memiliki akses CRUD. Seluruh tombol Tambah, Edit, Hapus, Impor, dan Mutasi disembunyikan.
  - **Strict Single-Level UI Locking**: Filter Jenjang Bar HANYA menampilkan 1 badge terkunci sesuai `supervisedLevel` akun (*Ibtida'iyyah*, *I'dadiyyah*, *Tsanawiyyah*, *Aliyyah*). Tombol-tombol jenjang lain **DILARANG TAMPIL** di layar. Dropdown kelas HANYA memuat rombel di bawah `supervisedLevel` pengawasannya.
- **Strict SDM Menu Isolation:** API Server (`/api/admin/people?role=pengurus`) secara ketat mengeksklusi Mundzir, Mufattisy, dan Mustahiq agar tabel Dewan Harian & Dewan Pleno 100% bersih.
- **Workspace Auto-Sync:** `WorkspaceContext` secara otomatis mendeteksi role pengguna saat login (`sek.pondok` ➔ Workspace Pondok Pesantren; `sek.madrasah` ➔ Workspace Madrasah Diniyyah).
- **Automated Audit Log:** Route Handler Next.js mencatat setiap mutasi data (POST, PUT, DELETE) dengan skema *Before/After Data* pada tabel `audit_logs`.
- **Soft Delete Mutlak:** Seluruh relasi database menggunakan `onDelete: "restrict"` atau `deletedAt`.

---

## 3. AKADEMIK, ROMBEL & KURIKULUM (Modul #03, #10)
Sistem menggunakan konsep "Academic Workspace" per Tahun Ajaran.
- **Isolasi Tahun Ajaran:** Data transaksional (Rapor, Kelas, Absen) terikat pada ID Tahun Ajaran (`academic_years`).
- **Data Model Mustahiq (Tanpa Kode Guru):** Tabel Mustahiq (`/sekretariat/mustahiq`) menyajikan kolom `Nama Lengkap Mustahiq`, `Jenjang`, `Tingkat | Lokal`, `No. HP / WA`, `Status`, `Aksi`. Kode Guru dihapus sepenuhnya.
- **Auto-Generate Academic Classes:** Backend (`GET /api/admin/classes`) secara otomatis memeriksa dan membuat entitas kelas (`AcademicClass`) di database untuk setiap Mustahiq yang diimpor/didaftarkan.
- **Pemuatan Otomatis Mufattisy (Pengawas):** Mufattisy secara otomatis dipetakan ke kartu kelas berdasarkan kesesuaian `Jenjang Pengawasan`.
- **Modal & Aksi Edit Kelas:** Kartu kelas pada Grid Data Kelas (`/sekretariat/kelas`) dilengkapi tombol **Edit** (`Edit3`) dan modal interaktif untuk mengubah Wali Kelas Mustahiq dan Kapasitas Rombel.
- **Sub-Tab "Belum Ada Kelas (Tarik Data Pondok)":** Memudahkan penempatan kelas bagi siswi baru yang didaftarkan di Pondok.
- **Hierarki Lembaga:** Ibtida'iyyah, Tsanawiyyah, dan Aliyyah.
- **Syllabus Engine & Non-Mapel:** Mapel Diniyyah menggunakan judul kitab berbahasa Arab (seperti فتح القريب, الكيلاني, الآجرومية). Kelompok Non-Mapel dipisahkan dari kalkulasi Ranking.

---

## 4. ENGINE PENILAIAN & KENAIKAN KELAS (Modul #04, #05)
- **Algoritma 4 Kwartal:** Tamrin Sem I, Ujian Sem I, Tamrin Sem II, Ujian Sem II.
- **The Holy Guard Limit (Akhlaq):** Pengontrolan nilai kualitatif Akhlaq dengan proteksi otomatis.
- **Ranking Elimination Engine:** Fitur isolasi nilai Non-Mapel dari perhitungan ranking kelas.
- **Promotion Engine:** State Machine Kenaikan Kelas (Draft -> Review -> Final) dengan status Promoted, Retained, Graduated, Khidmah.

---

## 5. KEDISIPLINAN, ABSENSI, & PERIZINAN (Modul #06, #15)
- **Kehadiran (Rekap Hijriyyah):** Absensi direkap per bulan pada tabel `student_attendances`.
- **Master Pelanggaran & Poin:** Jenis pelanggaran dikelola dari dashboard via tabel `violation_types` dan `student_violations`.
- **Sistem Perizinan & Sambangan (StudentPermit):** Model `StudentPermit` (`student_permits`) mengelola izin PULANG, SAMBANGAN, dan KELUAR.

---

## 6. PORTAL WALI SANTRI & EKOSISTEM KK MAPPING (Modul #07)
- Wali Santri dapat memantau perkembangan akademik, presensi, kedisiplinan, dan perizinan anak kandung secara realtime berdasarkan ikatan Nomor KK / NIK pada `guardian_profiles`. Sistem dilengkapi **`cleanOrphanedGuardians`** untuk pembersihan otomatis wali yang tak lagi beranak aktif.

---

## 7. MANAJEMEN ASRAMA & SANTRI KHIDMAH (Modul #16)
- **2 Gedung Utama & Pemetaan Abjad A-Z**:
  Gedung asrama HANYA terdiri dari **`Gedung Kota`** (Kamar Kode A s/d D, misal `A-02`) dan **`Gedung Desa`** (Kamar Kode E s/d Z, misal `E-01`).
- **Pembuatan Kamar Otomatis saat Impor**:
  Saat data santri diimpor dari Excel/CSV, jika kamar belum terdaftar di database, sistem **secara otomatis membuat kamar baru** di tabel `rooms` dengan gedung yang terhitung otomatis dan `supervisorId: null`.

---

## 8. DOKUMEN & SYSTEM CONFIGURATION (Modul #12, #14)
- **Document Template Builder:** WYSIWYG Editor dengan *Merge Tags* (`{{nama_santri}}`, `{{stambuk}}`) untuk pencetakan Rapor dan Ijazah.
- **System Settings Cockpit Persisten Database:** Dashboard kontrol parameter sistem terpusat (`SystemSettingsCockpit.tsx`) yang tersimpan persisten ke basis data terenkripsi via `PUT /api/settings`.

---

## 9. STANDAR UI/UX & COMPONENT (Modul #01)
- UI/UX Enterprise Premium berstandar *Glassmorphism*, *Responsive Grid*, *Role Quick Login Buttons*, *PillBadge*, dan *Spotlight Cards*.
