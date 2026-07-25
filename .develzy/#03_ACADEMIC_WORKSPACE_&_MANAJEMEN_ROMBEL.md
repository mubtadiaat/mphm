🌟 MASTER BLUEPRINT MPHM v4.5 (ULTIMATE EDITION)
#03_ACADEMIC_WORKSPACE_&_MANAJEMEN_ROMBEL (CORE ACADEMIC ENGINE)

Pusat gravitasi dari seluruh operasional sistem MPHM adalah Tahun Ajaran. Sistem ini membuang desain "Tabel Kelas" tradisional dan beralih ke arsitektur Academic Workspace layaknya platform SaaS Enterprise, di mana setiap Tahun Ajaran adalah ruang kerja tertutup yang terisolasi.

---

## 1. FILOSOFI "ACADEMIC WORKSPACE" (ISOLASI DATA MUTLAK)
Tidak ada data transaksional (Rapor, Nilai, Absensi, Pelanggaran, Penempatan Kelas, Jadwal) yang beredar bebas tanpa terikat pada suatu `academic_year_id`.

- **Isolasi Histori:** Jika Administrator melihat Tahun Ajaran 2026/2027, maka seluruh antarmuka, dropdown siswa, list Mustahiq, dan tabel hanya akan menampilkan data spesifik di tahun tersebut.
- **Mencegah Kebocoran Cache:** Di Frontend (Next.js), TanStack Query Keys wajib menyertakan `academicYearId` di ujung array key-nya (cth: `['sekretariat-classes', academicYearId]`) agar pergantian Tahun Ajaran seketika me-reset layar tanpa data yang "nyangkut".

---

## 2. HIRARKI MUTLAK & MASTER DATA PERMANEN
Sistem akademik MPHM sangat spesifik. Urutan mutlaknya adalah:
`Tahun Ajaran ➔ Semester ➔ Jenjang ➔ Tingkat ➔ Kelas/Bagian ➔ Jadwal & Nilai`

**Aturan Emas (System Rule #AC-01):** Jenjang dan Tingkat BUKAN tabel database dinamis. Keduanya adalah Data Permanen (Hardcoded Constants / Enums / Zod Schemas) di dalam sistem. Administrator tidak boleh melakukan CRUD (Tambah/Hapus) pada Jenjang dan Tingkat.

- **I'dadiyyah:** Tingkat I, II, III. (Aturan Khusus: Masa pendidikan 1 tahun penuh, tanpa kenaikan tingkat. Hanya sekadar pembagian kelompok).
- **Ibtida'iyyah:** Tingkat I, II, III, IV, V, VI. (Masa pendidikan 6 tahun).
- **Tsanawiyyah:** Tingkat I, II, III. (Masa pendidikan 3 tahun).
- **Aliyyah:** Tingkat I, II, III. (Masa pendidikan 3 tahun).
- **Al-Robithoh:** Khidmah/Mengabdi purna-Aliyyah. (Masa pendidikan 1 tahun).

---

## 3. IDENTITAS KELAS OTOMATIS, MUSTAHIQ DATA MODEL & MANAJEMEN ROMBEL

### A. Auto-Generate Academic Classes Algorithm
Pembuatan entitas Kelas (`academic_classes`) dirancang cerdas dan otomatis:
- **Auto-Class Sync (`autoEnsureClassesFromMustahiqs`):** Saat data Mustahiq diimpor via Excel atau ditambahkan manual dengan posisi struktural (seperti `Mustahiq I'dadiyyah I A`), backend (`GET /api/admin/classes`) secara otomatis me-check dan membuatkan baris `AcademicClass` baru di database untuk Tahun Ajaran aktif tanpa perlunya penginputan kelas manual satu per satu.
- **Mustahiq Assignment:** Mustahiq yang bersangkutan langsung ditugaskan sebagai `mustahiqId` resmi dari rombel tersebut.

### B. Mufattisy Auto-Match Engine
- Backend API secara otomatis mencocokkan `institutionLevel` kelas dengan `supervisedLevel` dari Dewan Mufattisy (misal *Nur Hidayat* untuk *I'dadiyyah*, *Ali Imran* untuk *Ibtida'iyyah*, dst.) dan menyajikannya pada bidang `mufattisy` kartu kelas.

### C. Data Model Mustahiq (Tanpa Kode Guru)
- Tabel Mustahiq (`/sekretariat/mustahiq`) membuang kolom `Kode Guru/Mustahiq` dan menyajikan struktur informasi yang 100% transparan:
  - `Nama Lengkap Mustahiq`
  - **`Jenjang`** *(Badge Ungu: I'dadiyyah, Ibtida'iyyah, Tsanawiyyah, Aliyyah)*
  - **`Tingkat | Lokal`** *(Teks Biru Cetak Tebal: Tingkat I | Lokal A, Tingkat II | Lokal B)*
  - `No. HP / WA`
  - `Status`
  - `Aksi`
- **Template Excel & Import Headers:** `["Nama Lengkap Mustahiq", "Jenjang", "Tingkat", "Ruang / Lokal", "NIK (16 Digit)", "No. HP / WhatsApp", "Alamat Lengkap"]`.

### D. Kartu Kelas & Modal Edit Rombel
- Setiap Kartu Kelas pada Grid Data Kelas (`/sekretariat/kelas`) menyediakan tombol **Edit Kelas** (`Edit3`) dan modal interaktif untuk memperbarui Wali Kelas Mustahiq serta Kapasitas Rombel secara realtime.
- **Soft Delete Policy:** Penghapusan Kelas berstatus aktif menggunakan Soft Delete (`deletedAt`). Data Nilai, Absensi, dan Jadwal di kelas tersebut tetap aman.

---

## 4. ENGINE PENEMPATAN SANTRI & SUB-TAB "BELUM ADA KELAS" (BATCH ENROLLMENT)
Bagaimana santri masuk ke dalam kelas? Melalui tabel persimpangan `class_enrollments`.

- **Tarik Data Santriwati Pondok:** Data induk santriwati terdaftar melalui sistem Pondok (P3HM). Di workspace Madrasah (MPHM), terdapat sub-tab khusus **"Belum Ada Kelas (Tarik Data Pondok)"** yang mengkueri `StudentProfile` yang belum memiliki `ClassEnrollment` aktif di Tahun Ajaran berjalan.
- **Batch & Quick Assignment:** Operator Madrasah cukup mengklik tombol **"Pasang Kelas Madrasah"** untuk memasangkan kelas target tanpa perlu mengisi ulang biodata pribadi dari nol.
- **Kapasitas Rombel Guard:** Setiap kelas memiliki parameter capacity (misal maksimal 40). Sistem menolak penambahan santri jika melebihi batas.

---

## 5. MANAJEMEN JADWAL PESANTREN (HISSOH ULA & TSANI)
Jadwal dipisahkan secara struktural menjadi dua sesi krusial:
- **Hissoh Ula (Sesi 1):** Umumnya 07.00 - 08.00 (atau menyesuaikan).
- **Hissoh Tsani (Sesi 2):** Setelah jeda kitab.