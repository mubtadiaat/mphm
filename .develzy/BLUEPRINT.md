# BLUEPRINT SISTEM MANAJEMEN MPHM & P3HM LIRBOYO
*Versi Blueprint Resmi Terbaru: 2026.2 (Terbuka & Terintegrasi)*

Dokumen ini merupakan acuan resmi (*single source of truth*) mengenai seluruh arsitektur sistem, aturan bisnis, alur data, hak akses, serta spesifikasi teknis untuk sistem **Madrasah Putri Hidayatul Mubtadi'aat [MPHM]** dan **Pondok Pesantren Putri Hidayatul Mubtadi'aat [P3HM] Lirboyo**.

---

## 1. STRUKTUR KEASRAMAAN & GEDUNG (BLUEPRINT #07 - KEASRAMAAN)

### 1.1. Aturan Gedung & Komplek Asrama
* **Jumlah Gedung Resmi**: Hanya ada **2 Gedung Utama**:
  1. `Gedung Kota` (Komplek Asrama Kota)
  2. `Gedung Desa` (Komplek Asrama Desa)
* **Aturan Penamaan Kamar & Pemetaan Gedung Otomatis**:
  Kamar dinamai dengan format abjad **A-Z** + Nomor (Contoh: `A-02`, `E-01`, `B-05`, `G-12`).
  - **Kamar Kode A s/d D** (`A-*`, `B-*`, `C-*`, `D-*`) $\rightarrow$ Otomatis dialokasikan ke **`Gedung Kota`** (Contoh: `A-02` berada di Gedung Kota).
  - **Kamar Kode E s/d Z** (`E-*`, `F-*`, `G-*`, dst.) $\rightarrow$ Otomatis dialokasikan ke **`Gedung Desa`** (Contoh: `E-01` berada di Gedung Desa).
  - **Override Kata Kunci**: Jika nama kamar/asrama secara eksplisit mengandung kata `"Kota"` atau `"Desa"`, gedung disesuaikan secara otomatis.

### 1.2. Pembuatan Kamar Otomatis saat Impor Santri
* Jika saat **Impor Data Santri (Excel/CSV)** atau registrasi baru terdapat data kamar yang belum terdaftar di database (misal `A-02` atau `E-01`), sistem akan **secara otomatis membuat kamar baru tersebut** di tabel `rooms` dengan `buildingName` yang terhitung dari rumus abjad A-Z.
* Penanggung jawab / Musyrifah Kamar (`supervisorId`) dikosongkan (`null`) terlebih dahulu agar Sekretariat dapat mengedit dan menetapkannya di menu Data Kamar.

---

## 2. ATURAN HAK AKSES & PERAN PENGGUNA (BLUEPRINT #08 - PRIVILEGES & SCOPING)

### 2.1. Peran View-Only / Read-Only (Mufattisy & Mundzir)
* Peran **Mufattisy** (Inspektur Pengawas) dan **Mundzir / Pimpinan** bersifat **100% Read-Only (Inspeksi)**.
* **Pembatasan Fitur**:
  - Tombol Tambah/Registrasi (`+ Registrasi Siswi Baru`, `+ Tambah Pelanggaran`, `+ Buat Perizinan Baru`) **100% disembunyikan**.
  - Tombol **Import Excel/CSV** disembunyikan.
  - Aksi per baris tabel (**Edit**, **Hapus**, **Setujui/Tolak**, **Mutasi**) terkunci rapat.

### 2.2. Automatic Supervised Level Scoping & UI Locking (`supervisedLevel`)
* Pengguna dengan peran Mufattisy dan Mundzir terikat secara mutlak pada 1 Jenjang Pengawasan (`supervisedLevel`) masing-masing:
  - *Ali Imran* $\rightarrow$ `Ibtida'iyyah`
  - *Nur Hidayat* $\rightarrow$ `I'dadiyyah`
  - *Hasan Basri* $\rightarrow$ `Tsanawiyyah`
  - *Yusuf Maulana* $\rightarrow$ `Aliyyah`
* **Aturan Kunci Tampilan (Strict Single-Level UI Locking)**:
  - **Filter Jenjang Bar**: HANYA boleh menampilkan 1 badge terkunci sesuai `supervisedLevel` akun aktif. Tombol-tombol jenjang lain ("Semua", "Ibtida'iyyah", "Tsanawiyyah", "Aliyyah", "I'dadiyyah") **DILARANG TAMPIL** di layar Mufattisy/Mundzir.
  - **Filter Kelas Dropdown**: HANYA boleh memuat dan mengisikan kelas-kelas yang berada di bawah `supervisedLevel` akun Mufattisy aktif (misal jika Mufattisy I'dadiyyah, dropdown kelas hanya berisi rombel I'dadiyyah, tidak boleh menampilkan rombel dari jenjang lain).
  - **Backend API Scoping**: Endpoint `/api/admin/people`, `/api/admin/classes`, dan `/api/mufattisy/dashboard/stats` secara otomatis menyaring query database hanya untuk `supervisedLevel` akun yang sedang login.

---

## 3. ATURAN PEMBERSIHAN OTOMATIS WALI SANTRI (BLUEPRINT #09 - SMART GUARDIAN)

### 3.1. Relasi KK & Wali Santri
* Santriwati dan Wali Santri dihubungkan melalui Nomor Kartu Keluarga (`familyCardNumber`).
* Sistem mendukung *Smart KK Mapping*, yaitu wali dapat terhubung dengan lebih dari satu santri jika memiliki Nomor KK yang sama.

### 3.2. Automatic Orphaned Guardians Cleanup (`cleanOrphanedGuardians`)
* Jika seorang santri dihapus atau dipurge dari sistem, sistem akan memeriksa apakah Wali Santri dari santri tersebut masih memiliki anak/santri aktif lain yang terdaftar.
* **Jika Wali tidak lagi memiliki santri aktif**, sistem secara otomatis membersihkan (*soft-delete*) profil `GuardianProfile`, `UserAccount`, dan `Person` milik Wali tersebut sehingga tidak menyisakan data sampah di database.

---

## 4. SKEMA DATABASE & CORE API (BLUEPRINT RECAP)

### 4.1. Tabel Utama Prisma
* `persons`: Data individu fisik (Santri, Wali, Guru, Pengurus).
* `student_profiles`: Profil santriwati (Stambuk, NIS, NISN, status, `roomId`).
* `rooms`: Data kamar asrama (`name`, `buildingName` ["Gedung Kota" | "Gedung Desa"], `capacity`, `supervisorId`).
* `guardian_profiles`: Profil wali santri (`familyCardNumber`, `relation`).
* `organization_memberships`: Peran pengurus/mufattisy/mundzir & `supervisedLevel`.
