🌟 THE ULTIMATE MASTER BLUEPRINT MPHM v4.5
"Sistem Informasi Akademik & Pusat Data Abadi Enterprise SaaS"
Status: FINAL & APPROVED FOR PRODUCTION

---

### BAB I: VISI, ARSITEKTUR INFRASTRUKTUR & DEPLOYMENT MUTLAK
MPHM bukan sekadar web pendataan nilai, melainkan Pusat Data Abadi dengan standar Enterprise SaaS. Sistem WAJIB dipisah 100% (Strictly Decoupled) untuk menjamin performa tanpa batas di ekosistem Vercel.

1. **Tech Stack (The New Stack):**
   - **Frontend Layer:** Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion.
   - **Backend Layer (API Gateway):** Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`).
   - **Database & ORM:** PostgreSQL Terenkripsi dikelola dengan Prisma ORM 7 (`@prisma/client`, `prisma/schema.prisma`).
   - **Media Storage:** Cloud Storage via Direct Signed Upload.

2. **Aturan Deployment & Log-Out Redirection:**
   - Domain mutlak HANYA di `https://m.p3hm.my.id`. API berjalan di `https://m.p3hm.my.id/api/*`.
   - Log-Out mengarahkan pengguna secara presisi ke halaman login masing-masing peran (`/login`, `/login/mufattisy`, `/login/wali`, `/login/mustahiq`).

---

### BAB II: STANDAR UI/UX, ANIMASI, & DATA GRID ENTERPRISE
1. **Policy #UI-08 (Tanpa Hardcoded Fallback String):** Cell renderer dilarang keras menampilkan string fallback palsu (`|| "Tsanawiyyah"`, `|| "Gedung Utama"`). Semua tampilan murni dari baris database PostgreSQL atau fallback ke dash (`"-"`).
2. **Universal Data Grid:** Server-Side Pagination, Debounced Realtime Search (300ms), Column Manager, dan Identity Cell Pattern (Avatar + Nama Tebal + Sub-teks).
3. **Dual-Workspace Architecture:** Segregasi fokus antara Workspace Pondok Pesantren dan Workspace Madrasah Diniyyah.

---

### BAB III: ENTERPRISE DATA ARCHITECTURE (PERSON-CENTRIC)
1. **Single Source of Truth (`people`):** Menyimpan identitas fisik abadi (Nama, NIK, TTL, Alamat, Avatar URL). Dilarang keras dihapus jika memiliki relasi profil (`ON DELETE RESTRICT`).
2. **Matriks Profil Polimorfik:** Entitas `people` mengenakan profil `student_profiles`, `teacher_profiles`, `guardian_profiles`, `organization_memberships`, dan `alumni_records`.
3. **Automatic Orphaned Guardians Cleanup (`cleanOrphanedGuardians`):** Saat data santri dihapus, sistem memeriksa apakah Wali Santri masih memiliki anak aktif. Jika tidak ada lagi anak aktif, profil Wali (`GuardianProfile`), akun login (`UserAccount`), dan data fisik (`Person`) dibersihkan (*soft-delete*) otomatis.

---

### BAB IV: ACADEMIC WORKSPACE, MUSTAHIQ MODEL & ENGINE ROMBEL
1. **Hierarki Mutlak:** Tahun Ajaran ➔ Semester ➔ Jenjang ➔ Tingkat ➔ Kelas.
2. **Data Model Mustahiq (Tanpa Kode Guru):** Menyajikan `Nama Lengkap Mustahiq`, `Jenjang` (Badge Ungu), `Tingkat | Lokal` (Teks Biru Cetak Tebal), `No. HP / WA`, `Status`, `Aksi`. `Kode Guru` dihapus.
3. **Auto-Generate Classes:** Server Backend secara otomatis membuat entitas `AcademicClass` di database dari posisi Mustahiq yang didaftarkan/diimpor via Excel, sekaligus memasangkan Mustahiq sebagai Wali Kelas resmi.
4. **Mufattisy Auto-Match & Strict Single-Level UI Locking:**
   - Hak akses Mufattisy & Mundzir 100% Read-Only (tombol CRUD, Impor, Edit, Hapus disembunyikan).
   - Filter Jenjang Bar HANYA menampilkan 1 badge terkunci sesuai `supervisedLevel` (*Ibtida'iyyah*, *I'dadiyyah*, *Tsanawiyyah*, *Aliyyah*). Tombol jenjang lain **DILARANG TAMPIL**.
   - Dropdown kelas HANYA memuat rombel di bawah `supervisedLevel` pengawasannya.
5. **Kartu Kelas Action Controls:** Tombol Edit (`Edit3`) & Modal Edit Rombel untuk memperbarui Mustahiq dan Kapasitas Rombel.

---

### BAB V: ISOLASI SDM & PUSAT PENGELOLAAN AKUN (USERS)
1. **Strict SDM Menu Isolation:** API Route (`/api/admin/people?role=pengurus`) secara mutlak mengeksklusi Mundzir, Mufattisy, dan Mustahiq agar tabel Dewan Harian & Dewan Pleno 100% bersih dan berdiri sendiri-sendiri.
2. **Pusat Pengelolaan Akun (`/sekretariat/users`) 4 Sub-Menu Utama:**
   - **Daftar Akun (Monitoring)**
   - **Generate Akun Instansi** *(dengan Deteksi Role Otomatis `⭐ Otomatis` & Layout Tabel: Nama | Jabatan | Role Otomatis | WA)*
   - **Keranjang Sampah Dorman (>6 Bulan)**
   - **Wali Santri (Yang Sudah Mendaftar)**

---

### BAB VI: MANAJEMEN ASRAMA & SANTRI KHIDMAH
1. **2 Gedung Utama & Pemetaan Abjad A-Z**:
   Gedung asrama HANYA terdiri dari **`Gedung Kota`** (Kamar Kode A s/d D, misal `A-02`) dan **`Gedung Desa`** (Kamar Kode E s/d Z, misal `E-01`).
2. **Pembuatan Kamar Otomatis saat Impor**:
   Saat data santri diimpor dari Excel/CSV, jika kamar belum terdaftar di database, sistem **secara otomatis membuat kamar baru** di tabel `rooms` dengan gedung yang terhitung otomatis dari rumus A-Z dan `supervisorId: null`.

---

### BAB VII: ENGINE PENILAIAN & BUKU RAPOR
1. **Pelajaran MAPEL vs NON-MAPEL:** Mapel batas nilai 10, Non-Mapel batas nilai 8.
2. **Eliminasi Ranking:** Pelajaran NON-MAPEL dieliminasi dari perhitungan agregat total nilai ranking kelas.
3. **Anti-Singkatan UI:** Menampilkan nama kwartal utuh ("Kwartal 1", "Kwartal 2", dst.).