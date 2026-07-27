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
- **Standar Bahasa UI:** Bersih dari nama vendor internal di teks user-facing, diganti dengan istilah umum profesional ("database terenkripsi", "Cloud Storage").
- **Hukum Tanpa Hardcoded Fallback String:** Seluruh cell renderer tabel dilarang keras menggunakan string fallback palsu. Semua tampilan WAJIB murni dari baris database terenkripsi atau fallback ke tanda dash (`"-"`).

---

## 2. DATA ARCHITECTURE & INTEGRASI DATA SANTRI-SISWI (Modul #02, #03, #08)
Sistem menggunakan hukum tata kelola data terpusat dan terenkripsi.
- **Single Source of Truth (`people` & `student_profiles`):**
  - Identitas induk utama seluruh santriwati terpusat pada database **Pondok Pesantren (P3HM)**.
  - **Data Siswi Madrasah (MPHM) Ditarik dari Santriwati Pondok**: Data Siswi Diniyyah di Madrasah (MPHM) ditarik dari Data Santriwati Pondok (P3HM). 
  - **Fitur Auto-Fill Registrasi Siswi**: Pada modal registrasi Siswi Baru di Madrasah, Sekretariat MPHM dapat memilih Santriwati Pondok melalui menu **`🔍 Tarik Data dari Santriwati Pondok (P3HM)`**. Pilihan ini secara otomatis mengisi Nama, NIK, Tempat/Tgl Lahir, Alamat, No KK, Wali, No HP, Pas Foto, dan No Kamar dari database master.
- **Sub-Tab "Belum Ada Kelas (Tarik Data Pondok)":** Memudahkan penempatan kelas bagi siswi baru yang didaftarkan di Pondok tapi belum dipasangkan rombel diniyyah.
- **Pusat Pengelolaan Akun (Users) & 4 Sub-Menu Utama:**
  - Terpusat pada menu `/sekretariat/users` dengan 4 Sub-Menu Resmi:
    1. **Daftar Akun (Monitoring):** Pemantauan seluruh akun terdaftar beserta status keaktifan.
    2. **Generate Akun Instansi:** Generator massal kredensial akun instansi dengan **Deteksi Role Otomatis (`⭐ Otomatis`)** berdasarkan jabatan.
    3. **Keranjang Sampah Dorman (>6 Bulan):** Isolasi otomatis bagi akun tidak aktif >6 bulan.
    4. **Wali Santri (Yang Sudah Mendaftar):** Modul khusus pemantauan & manajemen akun Wali Santri.
- **Automatic Orphaned Guardians Cleanup (`cleanOrphanedGuardians`):**
  Saat data santri dihapus atau di-*purge*, sistem secara otomatis memeriksa apakah Wali Santri masih memiliki anak aktif. Jika tidak, profil `GuardianProfile`, `UserAccount`, dan `Person` wali tersebut dibersihkan (*soft-delete*).
- **Otorisasi Roles & Mufattisy / Mundzir Read-Only Scoping:**
  - **Mufattisy & Mundzir 100% Read-Only**: Seluruh tombol Tambah, Edit, Hapus, Impor, dan Mutasi disembunyikan.
  - **Strict Single-Level UI Locking**: Filter Jenjang Bar HANYA menampilkan 1 badge terkunci sesuai `supervisedLevel` akun.
- **Workspace Auto-Sync**: Mendeteksi role pengguna saat login (`sek.pondok` ➔ Workspace Pondok; `sek.madrasah` ➔ Workspace Madrasah).
- **Portal Pos Keamanan (`keamanan`)**: Akses khusus menu Perizinan Santri (`/keamanan/perizinan`) untuk 3 perizinan: `KELUAR`, `PULANG`, dan `SAMBANGAN`.

---

## 3. AKADEMIK, ROMBEL & KURIKULUM (Modul #03, #10)
Sistem menggunakan konsep "Academic Workspace" per Tahun Ajaran.
- **Isolasi Tahun Ajaran:** Data transaksional (Rapor, Kelas, Absen) terikat pada ID Tahun Ajaran (`academic_years`).
- **Data Model Mustahiq (Tanpa Kode Guru):** Tabel Mustahiq (`/sekretariat/mustahiq`) menyajikan kolom `Nama Lengkap Mustahiq`, `Jenjang`, `Tingkat | Lokal`, `No. HP / WA`, `Status`, `Aksi`.
- **Auto-Generate Academic Classes:** Backend (`GET /api/admin/classes`) secara otomatis membuat entitas kelas (`AcademicClass`) untuk setiap Mustahiq yang terdaftar.
- **Pemuatan Otomatis Mufattisy (Pengawas):** Mufattisy dipetakan ke kartu kelas berdasarkan `Jenjang Pengawasan`.
- **Modal & Aksi Edit Kelas:** Kartu kelas pada Grid Data Kelas (`/sekretariat/kelas`) dilengkapi tombol **Edit** (`Edit3`) dan modal interaktif.

---

## 4. ENGINE PENILAIAN & KENAIKAN KELAS (Modul #04, #05)
- **Algoritma 4 Kwartal:** Tamrin Sem I, Ujian Sem I, Tamrin Sem II, Ujian Sem II.
- **The Holy Guard Limit (Akhlaq):** Pengontrolan nilai kualitatif Akhlaq dengan proteksi otomatis.
- **Ranking Elimination Engine:**Fitur isolasi nilai Non-Mapel dari perhitungan ranking kelas.
- **Promotion Engine:** State Machine Kenaikan Kelas (Draft -> Review -> Final).

---

## 5. KEDISIPLINAN, ABSENSI, & PERIZINAN (Modul #06, #15)
- **Kehadiran (Rekap Hijriyyah):** Absensi direkap per bulan pada tabel `student_attendances`.
- **Master Pelanggaran & Poin:** Kategori dan poin kedisiplinan dikelola via `violation_types` dan `student_violations`.
- **Sistem Perizinan & Sambangan (StudentPermit):** Izin PULANG, SAMBANGAN, dan KELUAR terhubung langsung ke Portal Pos Keamanan.

---

## 6. MANAJEMEN ASRAMA & BLOK (Modul #16)
- **Istilah Nama Blok (Komplek) Dinamis**:
  Gedung/Blok Asrama menggunakan istilah **`Nama Blok (Komplek)`** yang dikelola bebas oleh Sekretariat.
- **2 Sub-Menu Navigasi Data Asrama (`/sekretariat/rooms`)**:
  1. **Sub-Menu 1: Blok / Komplek**: Grid visual kartu blok berisi daftar kamar, kapasitas, dan penghuni aktif.
  2. **Sub-Menu 2: Data Kamar**: Form input dan tabel kamar yang disesuaikan secara dinamis.
- **Pembuatan Kamar Otomatis saat Impor**:
  Jika kamar belum terdaftar saat impor santri, sistem secara otomatis membuat kamar baru di tabel `rooms`.

---

## 7. SYSTEM SETTINGS COCKPIT & DASHBOARD REAL-TIME (Modul #12)
- **System Settings Cockpit (`SystemSettingsCockpit.tsx`)**:
  - Dikelompokkan ke 4 Kategori (Modul & Otorisasi, Peran & Hirarki, Aturan & Integrasi, Pemeliharaan Data) dengan 10 Sub-Tab.
  - Dilengkapi **`FriendlyGuideCard`** (💡 Petunjuk Penggunaan) dan **`FriendlySwitch`** (`[ AKTIF ]` / `[ NON-AKTIF ]`).
- **Dashboard Real-Time 100% Database Murni**:
  - Tanpa data uji coba, mock array, maupun fallback palsu.
  - Polling *real-time* otomatis 10 detik (`refetchInterval: 10000`).
  - **Akses Cepat (Quick Action Shortcuts)** disesuaikan khusus per instansi (Madrasah vs Pondok).
