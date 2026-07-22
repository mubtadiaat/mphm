🌟 THE ULTIMATE MASTER BLUEPRINT MPHM v4.0
"Sistem Informasi Akademik & Pusat Data Abadi Enterprise SaaS"
Status: FINAL & APPROVED FOR PRODUCTION

BAB I: VISI, ARSITEKTUR INFRASTRUKTUR & DEPLOYMENT MUTLAK
MPHM bukan sekadar web pendataan nilai, melainkan Pusat Data Abadi dengan standar Enterprise SaaS. Sistem WAJIB dipisah 100% (Strictly Decoupled) untuk menjamin performa tanpa batas di ekosistem Vercel.

1. Tech Stack (The New Stack):

Frontend (UI/UX & 3D Layer): Next.js 15+ (App Router), React 19. Di-deploy ke Vercel.

Backend (API Gateway): Hono.js berjalan via Edge API Routes di dalam Next.js (`apps/web/src/server`). (Zero HTML, murni JSON REST API secepat milidetik).

Database: Neon Postgres (Serverless PostgreSQL) dikelola dengan Drizzle ORM tersentralisasi di `packages/db`.

Penyimpanan Media: Cloudinary. (Semua foto dan bukti wajib menggunakan Direct Signed Upload dari Frontend ke Cloudinary. Database Neon hanya menyimpan URL).

2. Aturan Deployment Produksi:

Domain mutlak HANYA di https://m.p3hm.my.id.

Tidak ada referensi ke *.vercel.app di lingkungan produksi. API berjalan di https://m.p3hm.my.id/api/*.

BAB II: STANDAR UI/UX, ANIMASI 3D, & DATA GRID ENTERPRISE
Antarmuka mengusung filosofi Premium Enterprise SaaS (Terinspirasi linear/Uiverse) yang 100% Responsif (Mobile-First).

1. Estetika & Interaksi (Tailwind v4 + shadcn/ui):

Framer Motion: Wajib digunakan untuk transisi halaman (fade/slide), efek hover kartu (subtle elevation), buka-tutup sidebar/drawer yang sangat mulus, dan skeleton loading bergelombang.

React Three Fiber (3D Elements): Digunakan secara elegan dan ringan. Contoh: Ilustrasi logo 3D melayang di Dashboard yang bereaksi terhadap kursor (mouse parallax), atau objek kotak 3D interaktif pada "Data Kosong" (Empty State).

2. Universal Data Grid (Standar Semua Tabel):

Wajib memiliki Server-Side Pagination, Debounced Realtime Search (tanpa tombol cari), dan Column Manager (Pin/Hide kolom).

Identity Cell Pattern: Kolom nama orang WAJIB dirender dengan format: Avatar bundar (dari Cloudinary) + Nama Tebal + Sub-teks (NIS/NIK/Email) di bawahnya.

Pill Badges: Status (Aktif, Lulus) wajib menggunakan kapsul berwarna semantik.

3. Dual-Workspace Architecture (Dashboard Segregation):
Sistem memisahkan menu dan navigasi operasional menjadi dua ruang kerja terpisah menggunakan Workspace Switcher pada header:
- Workspace Pondok: Fokus pada Kepengasuhan, Santriwati sebagai penghuni, Kamar, dan Kedisiplinan.
- Workspace Madrasah: Fokus pada Akademik, Siswi per kelas, Rombel, dan Penilaian (Rapor).

BAB III: ENTERPRISE DATA ARCHITECTURE (PERSON-CENTRIC)
Sistem menggunakan hukum Single Source of Truth. Tidak ada duplikasi manusia seumur hidup.

1. Tabel Inti (people): Menyimpan identitas fisik abadi (Nama, TTL, Alamat, Cloudinary Avatar URL). Dilarang keras dihapus jika memiliki relasi profil (ON DELETE RESTRICT).
2. Matriks Profil Polimorfik: Entitas people mengenakan "baju peran" seiring waktu:

student_profiles (Santri)

alumni_records (Alumni)

teacher_profiles (Mustahiq / Pengajar)

guardian_profiles (Wali Santri)
3. Global Command Palette (CTRL+K): Fitur pencarian ala "Mac Spotlight" untuk mencari nama siapapun lintas profil dan memunculkan Halaman Profil Terpadu 360°.

BAB IV: ACADEMIC WORKSPACE & ENGINE MANAJEMEN KELAS
Semua data transaksional (Rapor, Jadwal, Absensi) terisolasi secara kedap udara di dalam ID Tahun Ajaran.

1. Hierarki Mutlak: Tahun Ajaran ➔ Semester ➔ Jenjang ➔ Tingkat ➔ Kelas.
2. Master Jenjang & Tingkat (HARDCODED ENUMS, BUKAN TABEL):

I'dadiyyah (Tingkat I-III, masa 1 tahun, pengecualian: tidak ada kenaikan kelas).

Ibtida'iyyah (Tingkat I-VI, masa 6 tahun).

Tsanawiyyah (Tingkat I-III, masa 3 tahun).

Aliyyah (Tingkat I-III, masa 3 tahun).

Al-Robithoh (Khidmah/Mengabdi pasca-Aliyyah, 1 tahun).
3. Hukum Mustahiq (Wali Kelas): Satu kelas HANYA dipegang 1 Mustahiq aktif per Tahun Ajaran.
4. Manajemen Kelas: Nama kelas auto-generated (Cth: Tsanawiyyah I-A). Penghapusan kelas menggunakan sistem Soft Delete.

BAB V: ENGINE PENILAIAN & BUKU RAPOR (THE SACRED RULES)
Ini adalah "Otak Komputasi" MPHM. API Backend bertugas keras menjaga integritas angka. Penilaian terbagi menjadi 4 Kwartal (Kwartal 1 hingga 4). Guru memasukkan Nilai Asli (mendukung desimal seperti 6.5).

1. Jenis Pelajaran (MAPEL vs NON-MAPEL):

Manajemen pelajaran dikelola secara dinamis melalui Dashboard Admin. Pelajaran dibagi menjadi dua kategori utama:
- MAPEL (Mata Pelajaran): Batas nilai maksimal adalah 10 (atau 100).
- NON-MAPEL (Non-Mata Pelajaran): Batas nilai maksimal adalah 8 (atau 80). (Contoh historis: Al-Qur'an, Al-Khoth/Al-Imla', Qiro'ah al-Kutub, Al-Muhafadhoh, Akhlaq).

Batas Maksimal Dinamis: API Worker (Zod) wajib memblokir input nilai yang melebihi batas tipe pelajaran tersebut (10 untuk MAPEL, 8 untuk NON-MAPEL).

Eliminasi Ranking: Pelajaran berjenis NON-MAPEL TIDAK DIHITUNG dalam akumulasi total agregat nilai untuk menentukan Peringkat (Ranking) kelas.

2. Anti-Singkatan UI: Antarmuka dilarang menggunakan singkatan malas (Haram: "K1". Wajib: "Kwartal 1"). Antarmuka Spreadsheet menggunakan Auto-Save Buffer (menahan data 500ms lalu otomatis menyimpan).

BAB VI: SISTEM KEHADIRAN & KEDISIPLINAN (TIER SHIFTING)
Kehadiran dan kedisiplinan berinteraksi langsung dengan Rapor.

1. Absensi Berbasis Sesi: Kehadiran dihitung berdasarkan matriks Hissoh Ula (Sesi 1) dan Hissoh Tsani (Sesi 2) dengan status: Sakit, Izin, Alfa.
2. Master Pelanggaran Dinamis: Dikelola Administrator, terbagi menjadi Kategori dan Tingkat Keparahan (Ringan hingga Sangat Berat). Menggunakan Soft Delete (isActive: false).
3. Algoritma Worst-Case Tier Shifting: * Jika santri memiliki nilai Akhlaq kertas sempurna, namun sistem mendeteksi insiden "Sangat Berat" atau peratusan "Alfa" tinggi, sistem akan secara otomatis menjatuhkan predikat kualitatif Akhlaq (misal: dari Jayyid Awwal jatuh ke Maqbul).

Override Traps Guard: Jika Wali Kelas mencoba mengubah manual predikat yang jatuh ini, API WAJIB menyetopnya kecuali diisi overrideReason minimal 15 aksara (terekam permanen di Audit Log).

BAB VII: PROMOTION ENGINE (MESIN KENAIKAN KELAS & HISTORI)
Modul ini mengeksekusi akhir perjalanan santri di penghujung Tahun Ajaran.

Status Mutlak: PROMOTED (Naik), RETAINED (Tinggal), GRADUATED (Lulus), KHIDMAH, TRANSFERRED, DROPPED.

Otomasi: Mesin membaca komputasi Kwartal 1-4, memilah kandidat, dan meminta finalisasi. Jenjang I'dadiyyah secara algoritma dilewati dari aturan kenaikan tingkat.

Tabel academic_history: Saat dikunci, sistem menyuntikkan riwayat permanen ke tabel arsip (Append-Only, dilarang di-UPDATE/DELETE), lalu menggunakan algoritma Clone Academic Year untuk membuat rumah kelas baru yang kosong di tahun berikutnya.

BAB VIII: PORTAL WALI SANTRI (SMART KK MAPPING ENGINE)
Wali Santri memiliki Read-Only 360° Dashboard untuk memantau anak asuhnya.

Otomatisasi Pendaftaran: Wali mendaftar dengan Nama, WA, dan Nomor KK.

KK Mapping Engine: Sistem Backend akan menyisir relasi secara otomatis. Jika dalam database ada 3 santriwati yang memiliki Nomor KK identik dengan Wali tersebut, ketiga anak tersebut otomatis muncul di Dashboard Wali tanpa perlu approval admin satu per satu.

BAB IX: KEAMANAN MILITER (RBAC, OTORISASI & GLOBAL AUDIT)
Seluruh eksekusi logika dikunci di tingkat Vercel Edge/Serverless Middleware.

HttpOnly Secure Cookie Session: Tidak menggunakan JWT di local storage. Anti-XSS & Anti-CSRF mutlak.

6 Peran Rigid: Sekretariat, Mustahiq, Mufattisy, Pimpinan/Mundzir, Keamanan, Wali Santri.

Data Scope Authorization: Mustahiq hanya bisa menarik API untuk ID Kelasnya. Wali Santri hanya bisa menarik API untuk ID Santri di dalam KK-nya. Melanggar = HTTP 403 Forbidden.

Global Forensics Audit Log: Setiap interaksi Hono API yang melakukan POST/PUT/DELETE otomatis direkam oleh Middleware Global. Database audit_logs akan mencatat: Siapa, Kapan, Modul, dan format JSON murni Before Data vs After Data untuk melacak segala manipulasi.