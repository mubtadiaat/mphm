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

---

## 2. STRUKTUR KEASRAMAAN & DATA ASRAMA (BLOK & KAMAR)

### 2.1. Aturan Nama Blok (Komplek) & Sub-Menu Asrama
* **Nama Blok (Komplek) Dinamis**:
  Gedung/Blok Asrama menggunakan istilah resmi **`Nama Blok (Komplek)`** yang dikelola bebas oleh Sekretariat (contoh: `Blok A`, `Blok B`, `Komplek Al-Mahrusiyah`).
* **2 Sub-Menu Navigasi Data Asrama (`/sekretariat/rooms`)**:
  1. **Sub-Menu 1: Blok / Komplek**: Grid visual kartu blok berisi daftar kamar di dalamnya, kapasitas total, dan penghuni aktif.
  2. **Sub-Menu 2: Data Kamar**: Form input dan tabel kamar yang disesuaikan secara dinamis dengan pilihan Nama Blok (Komplek).

### 2.2. Pembuatan Kamar Otomatis saat Impor Santri
* Jika saat **Impor Data Santri (Excel/CSV)** atau registrasi baru terdapat data kamar yang belum terdaftar di database, sistem secara otomatis membuat kamar baru di tabel `rooms` dengan `buildingName` terhitung otomatis.

---

## 3. ATURAN HAK AKSES & PERAN PENGGUNA (PRIVILEGES & SCOPING)

### 3.1. Peran View-Only / Read-Only (Mufattisy & Mundzir)
* Peran **Mufattisy** (Inspektur Pengawas) dan **Mundzir / Pimpinan** bersifat **100% Read-Only (Inspeksi)**.
* **Pembatasan Fitur**: Tombol Tambah, Edit, Hapus, Import, dan Mutasi disembunyikan.

### 3.2. Automatic Supervised Level Scoping & UI Locking (`supervisedLevel`)
* Pengguna Mufattisy dan Mundzir terikat pada `supervisedLevel` (*Ibtida'iyyah*, *I'dadiyyah*, *Tsanawiyyah*, *Aliyyah*).
* **Strict Single-Level UI Locking**: Filter Jenjang Bar HANYA menampilkan 1 badge terkunci sesuai `supervisedLevel` akun aktif.

### 3.3. Portal Pos Keamanan (`keamanan`)
* User Keamanan memiliki akses langsung ke menu **Perizinan Santri** (`/keamanan/perizinan`).
* Mendukung 3 jenis perizinan: `KELUAR` (Izin Keluar Komplek), `PULANG` (Izin Pulang Ke Rumah), dan `SAMBANGAN` (Kunjungan Wali Santri di Gerbang).

---

## 4. ATURAN PEMBERSIHAN OTOMATIS WALI SANTRI (SMART GUARDIAN)

### 4.1. Automatic Orphaned Guardians Cleanup (`cleanOrphanedGuardians`)
* Jika seorang santri dihapus atau dipurge dari sistem dan walinya tidak lagi memiliki santri aktif lain, sistem secara otomatis membersihkan (*soft-delete*) profil `GuardianProfile`, `UserAccount`, dan `Person` milik Wali tersebut.

---

## 5. SYSTEM SETTINGS COCKPIT & DASHBOARD REAL-TIME

### 5.1. User-Friendly System Settings Cockpit
* Terbagi dalam 4 Kategori (Modul & Otorisasi, Peran & Hirarki, Aturan & Integrasi, Pemeliharaan Data) dengan 10 Sub-Tab.
* Dilengkapi **`FriendlyGuideCard`** (💡 Petunjuk Penggunaan) dan **`FriendlySwitch`** (`[ AKTIF ]` / `[ NON-AKTIF ]`).

### 5.2. Dashboard Real-Time 100% Database Murni
* Zero mock/demo data. Polling otomatis 10 detik.
* Akses Cepat (Quick Action Shortcuts) disesuaikan khusus per instansi (Madrasah vs Pondok).
