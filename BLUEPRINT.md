# BLUEPRINT SISTEM MANAJEMEN MPHM & P3HM LIRBOYO
*Versi Blueprint Resmi Terbaru: 2026.2 (Terbuka & Terintegrasi)*

Dokumen ini merupakan acuan resmi (*single source of truth*) mengenai seluruh arsitektur sistem, aturan bisnis, alur data, hak akses, serta spesifikasi teknis untuk sistem **Madrasah Putri Hidayatul Mubtadi'aat [MPHM]** dan **Pondok Pesantren Putri Hidayatul Mubtadi'aat [P3HM] Lirboyo**.

---

## 1. INTEGRASI DATA SANTRIWATI (PONDOK) & SISWI (MADRASAH)

### 1.1. Single Source of Truth Identitas Santriwati
* Entire master identity data reside in **Pondok Pesantren (P3HM)** database (`student_profiles`).
* **Data Siswi Madrasah (MPHM) Ditarik dari Data Santriwati Pondok (P3HM)**:
  Santriwati yang didaftarkan di Pondok P3HM adalah induk utama. Saat mendaftarkan Siswi Diniyyah Baru di Madrasah MPHM, Sekretariat Madrasah tidak perlu mengetik ulang biodata.
* **Fitur Auto-Fill Registrasi Siswi**:
  Pada modal registrasi Siswi Baru, Sekretariat MPHM memilih Santriwati Pondok via menu **`🔍 Tarik Data dari Santriwati Pondok (P3HM)`**. Pilihan ini mengisi Nama, NIK, Tempat/Tgl Lahir, Alamat, No KK, Wali, Telepon, Foto Avatar, dan Kamar secara otomatis.

### 1.2. Transisi Tahun Ajaran Baru (Automatic Roll-over)
* Identitas santriwati **100% ABADI (0% ketik ulang saat ganti Tahun Ajaran Baru)**.
* Saat berganti Tahun Ajaran Baru, data biodata, kamar, mapel, dan poin takzir diwariskan otomatis. Yang diubah HANYA penempatan rombel baru via **Proses Kenaikan Kelas 1-Klik** (`PROMOTED`, `RETAINED`, `GRADUATED`).

---

## 2. PENGELOLAAN TAHUN AJARAN & KALENDER SYAWAL

### 2.1. Notifikasi Syawal & Active Year Rule
* Kalender Akademik Diniyyah berpatokan pada Kalender Hijriyyah (Dimulai pertengahan **Bulan Syawal** dan berakhir di bulan **Sya'ban**).
* Saat kalender Hijriyyah memasuki bulan Syawal, Dasbor Sekretariat menampilkan Notifikasi Pengingat Otomatis untuk mengaktifkan Tahun Ajaran Baru.
* HANYA ada **1 Tahun Ajaran yang berstatus `AKTIF`** untuk transaksi harian. Tahun-tahun ajaran lama otomatis menjadi `ARSIP (READ-ONLY)`.

---

## 3. ENGINE PENILAIAN, BATASAN NILAI & PRASYARAT CETAK

### 3.1. Kwartal Grade Entry Lock Engine
* Status Kwartal (`DIBUKA/DRAFT` vs `TERKUNCI/FINAL`).
* Saat status Kwartal `TERKUNCI`, Mustahiq tidak dapat mengubah nilai lagi kecuali ada *24-hour Override Window* dari Sekretariat.

### 3.2. Prasyarat Cetak Rapor, Ijazah & Sertifikat
* **Rapor Kwartal 1-3**: Dapat dicetak begitu nilai Kwartal terkait berstatus `FINAL`.
* **Rapor Akhir Tahun & Ijazah**: HANYA dapat dicetak setelah **Eksekusi Kenaikan Kelas Masal** dengan status `GRADUATED`.
* **Sertifikat Khidmah / Hafalan**: Dapat dicetak untuk santri yang menyelesaikan penugasan Khidmah / Hafalan.

---

## 4. STRUKTUR KEASRAMAAN & DATA ASRAMA (BLOK & KAMAR)

### 4.1. Aturan Nama Blok (Komplek) & Sub-Menu Asrama
* **Nama Blok (Komplek) Dinamis**:
  Gedung/Blok Asrama menggunakan istilah resmi **`Nama Blok (Komplek)`** yang dikelola bebas oleh Sekretariat (contoh: `Blok A`, `Blok B`, `Komplek Al-Mahrusiyah`).
* **2 Sub-Menu Navigasi Data Asrama (`/sekretariat/rooms`)**:
  1. **Sub-Menu 1: Blok / Komplek**: Grid visual kartu blok berisi daftar kamar di dalamnya, kapasitas total, dan penghuni aktif.
  2. **Sub-Menu 2: Data Kamar**: Form input dan tabel kamar yang disesuaikan secara dinamis dengan pilihan Nama Blok (Komplek).

---

## 5. ATURAN HAK AKSES & PERAN PENGGUNA (PRIVILEGES & SCOPING)

### 5.1. Peran View-Only / Read-Only (Mufattisy & Mundzir)
* Peran **Mufattisy** (Inspektur Pengawas) dan **Mundzir / Pimpinan** bersifat **100% Read-Only (Inspeksi)**.

### 5.2. Automatic Supervised Level Scoping & UI Locking (`supervisedLevel`)
* Pengguna Mufattisy dan Mundzir terikat pada `supervisedLevel` (*Ibtida'iyyah*, *I'dadiyyah*, *Tsanawiyyah*, *Aliyyah*).

### 5.3. Portal Pos Keamanan (`keamanan`)
* User Keamanan memiliki akses langsung ke menu **Perizinan Santri** (`/keamanan/perizinan`) untuk 3 jenis perizinan: `KELUAR`, `PULANG`, dan `SAMBANGAN`.

---

## 6. SYSTEM SETTINGS COCKPIT & DASHBOARD REAL-TIME

### 6.1. System Readiness Wizard & Guided Empty State
* Terbagi dalam 4 Kategori Cockpit dengan 10 Sub-Tab.
* Banner **`🚀 Panduan Kesiapan Sistem`** dan komponen **`GuidedEmptyState`** menuntun Sekretariat mengisi prasyarat data langkah demi langkah.
