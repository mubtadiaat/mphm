🌟 MASTER BLUEPRINT MPHM v4.0 (OMNIBUS EDITION)
#000_RINGKASAN_EKSEKUTIF_MASTER_BLUEPRINT (MODUL 00 - 14)

Dokumen ini adalah Ringkasan Eksekutif (Omnibus) yang merangkum 100% inti sari dari seluruh blueprint (Modul 00 hingga 14) tanpa ada yang tertinggal. Sistem Informasi Akademik MPHM v4.0 dirancang sebagai "Pusat Data Abadi" berskala Enterprise Internal SaaS yang Strictly Decoupled, dengan performa super cepat, dan desain visual level dunia.

---

## 1. INFRASTRUKTUR & DEPLOYMENT (Modul #00, #09, #11)
Arsitektur sistem mematuhi **Vercel Ecosystem** dan **Turborepo** (Monorepo) untuk isolasi yang rapi.
- **Frontend Layer & PWA:** Next.js 15+ (App Router), React 19, TypeScript, Progressive Web App (PWA).
- **Backend API Gateway:** Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`).
- **Database & ORM:** Neon Postgres (Serverless PostgreSQL) dikelola menggunakan Prisma ORM 7 (`@prisma/adapter-neon`, `prisma/schema.prisma`).
- **Autentikasi:** Firebase Authentication (Google OAuth & Email/Password) yang dipetakan langsung ke entitas pengguna di Neon Postgres (`firebase_uid`).
- **UI/UX & Animation:** Tailwind CSS v4, shadcn/ui, Framer Motion, **Magic UI** (Bento Grid, Animated List), **Aceternity UI** (Spotlight Card, Glowing Effects), Lucide React.
- **Pipeline Media:** Cloudinary. Tidak ada gambar masuk ke server, Frontend menggunakan *Direct Signed Upload*.
- **Domain Produksi Tunggal:** Seluruh sistem wajib diakses melalui `https://m.p3hm.my.id`. Tidak ada subdomain bawaan Vercel di mode produksi. API diakses via `/api/*`.
- **Environment:** Terdapat pemisahan tegas antara Production, Preview (ter-bind ke branch db Neon), dan Development.

## 2. DATA ARCHITECTURE & KEAMANAN MILITER (Modul #02, #08, #13)
Sistem menggunakan hukum tata kelola data yang tidak bisa dinegosiasikan.
- **Person-Centric (Single Source of Truth):** Data entitas manusia hanya satu (tabel `people`). Perannya bisa banyak (Santri, Pengajar, Wali).
- **Otentikasi Firebase & Otorisasi Roles:** Otentikasi terkelola via Firebase Auth (Google Login & Email) dengan verifikasi token serverless yang diikat ke tabel `user_accounts` (`firebase_uid`).
- **Role-Based Access Control (RBAC):** Hanya ada 6 peran resmi: Sekretariat, Mustahiq (Wali Kelas), Mufattisy, Mundzir, Keamanan, dan Wali Santri.
- **Data Scope Authorization (Penyekatan Data):** 
  - *Mustahiq* hanya bisa mengakses data kelas miliknya.
  - *Wali Santri* hanya bisa melihat data yang cocok dengan Nomor KK-nya.
- **Automated Audit Log:** Route Handler Next.js secara otomatis mencatat setiap mutasi data (POST, PUT, DELETE) dengan skema *Before/After Data* untuk keperluan forensik (Anti-Manipulasi Nilai).
- **Soft Delete Mutlak:** Seluruh relasi database menggunakan `onDelete: "restrict"`. Dilarang ada penghapusan baris permanen jika masih memiliki riwayat akademik/pelanggaran.

## 3. AKADEMIK, ROMBEL & KURIKULUM (Modul #03, #10)
Sistem membuang cara tradisional, beralih ke "Academic Workspace" per Tahun Ajaran.
- **Isolasi Tahun Ajaran:** Data transaksional (Rapor, Kelas, Absen) sepenuhnya terikat pada ID Tahun Ajaran. Transisi tahun baru menggunakan algoritma *Clone Workspace*.
- **Hierarki Konstan:** Jenjang dan Tingkat adalah data statis (bukan tabel dinamis). (I'dadiyyah, Ibtida'iyyah, Tsanawiyyah, Aliyyah). I'dadiyyah dipisah secara khusus (1 tahun masa orientasi tanpa kenaikan kelas).
- **Manajemen Asrama (Rooms):** Sistem mengelola data Kamar/Asrama Santriwati secara terpusat lengkap dengan Wali Kamar dan Kapasitas. Profil santri terhubung langsung ke Asrama mana mereka tinggal.
- **Syllabus Engine & The Holy 5:** 
  - Sistem menggunakan Global Subject Pool. **Wajib berbahasa Arab penuh** (seperti فتح المعين) karena akan diekspor langsung ke Rapor/Ijazah tanpa translasi.
  - Terdapat **NON-MAPEL (The Holy 5)**: Al-Qur'an (القرآن), Khoth (الخط \ الإملاء), Qiro'ah (قراءة الكتب), Muhafadhoh (المحافظة), Akhlaq (الأخلاق). Kelompok ini dikeluarkan dari perhitungan *Ranking*.
  - Sisanya diklasifikasikan sebagai **MAPEL** reguler.
- **Contoh Referensi Kurikulum 2 Aliyyah:**
  - **MAPEL:** تفسير الجلالين (Tafsir Jalalain), إتمام الدراية (Itmamud Diroyah), رياض الصالحين (Riyadush Sholihin), كفاية العوام (Kifayatul Awam), فتح المعين (Fathul Mu'in), تسهيل الطرقات (Tashilut Thuruqot), مبادئ قواعد الفقهية (Mabadi Qowaid Fiqhiyyah), عدة الفارض (Uddatul Farid), الفية ابن مالك (Alfiyah Ibnu Malik), بداية الهداية (Bidayatul Hidayah).
- **Manajemen Jadwal:** Jadwal fleksibel diturunkan ke kelas (Inheritance) yang terbagi dalam dua hissoh (Ula & Tsani).

## 4. ENGINE PENILAIAN & KENAIKAN KELAS (Modul #04, #05)
Bukan sekadar form input, melainkan Mesin Pemroses Data Akademik Hono.js.
- **Algoritma 4 Kuartal:** Tamrin Sem I, Ujian Sem I, Tamrin Sem II, Ujian Sem II. (Dilarang menyingkat istilah K1, U1 di UI/Cetak).
- **The Holy Guard Limit (Akhlaq):** Hanya untuk **AKHLAQ**, nilai tidak boleh lebih dari **8**. Jika Mustahiq mengetik 9, akan ditolak sistem. Mapel lainnya (Khoth, Qiro'ah, dll) bebas mendapat angka 9.
- **Ranking Elimination Engine:** 5 NON-MAPEL dikeluarkan secara otomatis dari perhitungan Ranking kelas.
- **Data Input (3D Spreadsheet):** Sistem tidak memakai tombol Simpan Massal. Input nilai menggunakan mekanisme *Auto Save Buffer* (500ms Debounce).
- **Promotion Engine (Mesin Kenaikan Kelas):** Algoritma *State Machine* (Draft -> Review -> Final). Status mutlak: Promoted, Retained, Graduated, Khidmah. Hasil kelulusan akan diukir abadi secara permanen di tabel `academic_history`.

## 5. KEDISIPLINAN, ABSENSI, & GUARDIAN PORTAL (Modul #06, #07)
Modul operasional harian yang berdampak langsung pada kelulusan santri.
- **Kehadiran (Rekap Hijriyyah):** Absensi direkap per akhir bulan. Form input hanya dibuka pada tanggal 23 ke atas per bulan Hijriyyah.
- **Kedisiplinan Dinamis:** Jenis pelanggaran dikelola dari dashboard, tidak di-hardcode. Insiden disimpan beserta bukti (URL Cloudinary).
- **Worst-Case Tier Shifting:** Nilai kualitatif Akhlaq di Rapor akan otomatis dijatuhkan (diturunkan predikatnya) jika mesin mendeteksi banyak Alfa atau ada pelanggaran berat. Perubahan manual oleh Mustahiq wajib menyertakan alasan >15 karakter untuk dilog.
- **Smart KK Mapping:** Wali Santri cukup mendaftar via Nomor KK. Sistem akan memunculkan *Read-Only 360° Dashboard* untuk semua anak kandungnya, menampilkan timeline absensi, pelanggaran, dan rapor secara realtime.

## 6. DOKUMEN (RAPORT, IJAZAH, SERTIFIKAT) & PENGATURAN (Modul #12, #14)
- **Document Template Builder:** Menggunakan editor WYSIWYG TipTap. Administrator dapat menyisipkan *Merge Tags* (variabel dinamis `{{nama_santri}}`) untuk mendesain Raport, Ijazah, dan Sertifikat tanpa mengubah source code.
- **Ijazah Aliyyah & Sertifikat I'dadiyyah:** Dokumen khusus Ijazah didesain landscape premium, sedangkan santri I'dadiyyah tidak mendapatkan rapor kenaikan melainkan Sertifikat penyelesaian orientasi.
- **System Settings:** Parameter global (seperti `activeAcademicYear`, `isScoreInputLocked`) dikelola di database lewat arsitektur *Key-Value* JSON (`system_settings`) yang bisa diakses oleh Super Admin.

## 7. STANDAR UI/UX, 3D & COMPONENT (Modul #01)
Tampilan tidak boleh terlihat seperti template murahan. Wajib mengusung identitas Enterprise Premium.
- **Visual:** *Soft UI*, *Glassmorphism*, menggunakan Tailwind CSS v4 Design Tokens (Base Zinc, aksen Gold/Blue MPHM).
- **Interaksi Mikro & 3D:** Animasi mulus menggunakan Framer Motion. Penyajian widget kosong menggunakan objek 3D interaktif (React Three Fiber) untuk menghadirkan "Wow Factor".
- **Universal Data Grid:** Seluruh tabel menggunakan standar baku (TanStack Table v9) lengkap dengan *Realtime Server-Side Debounced Search*, pemilihan baris, integrasi avatar awan Cloudinary, dan kapsul status. 100% responsif (Mobile-First / Card-Stack list di layar HP).
- **Global Command Palette:** Fitur magis `CTRL + K` ala *macOS Spotlight* untuk mencari data profil, fitur, atau nama santri secara instan dari halaman manapun, yang berujung ke *Profil Terpadu 360°*.
