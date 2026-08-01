# BLUEPRINT SISTEM MANAJEMEN MPHM & P3HM LIRBOYO
*Versi Blueprint Resmi Terbaru: 2026.5 (Enterprise Decoupled & Multi-Platform Edition)*

Dokumen ini merupakan acuan resmi (*single source of truth*) mengenai seluruh arsitektur sistem, aturan bisnis, alur data, hak akses, serta spesifikasi teknis untuk sistem **Madrasah Putri Hidayatul Mubtadi'aat [MPHM]** dan **Pondok Pesantren Putri Hidayatul Mubtadi'aat [P3HM] Lirboyo**.

---

## 1. DUAL REPOSITORY GITHUB STRATEGY & DEPLOYMENT MUTLAK
1. **Repository Deployment Web (`mubtadiaat/mphm`)**:
   - Khusus untuk deploy aplikasi web Next.js 15 ke **Vercel Production** (`https://m.p3hm.my.id`).
   - Dilarang keras memicu build action Flutter pada repository ini.
2. **Repository Release Software (`mubtadiaat/app_software`)**:
   - Khusus untuk **GitHub Actions CI/CD Build Pipeline** dan **Penerbitan Rilis Biner Aplikasi** (`app-release.apk` & `mphm-windows-desktop-v2.0.0.zip`).
   - Menyimpan seluruh kode sumber Flutter Multi-Platform (`apps/mphm_app`).

---

## 2. RESTRUKTURISASI PENGURUS & SANTRIWATI MUKIM 100%
1. **Single Source of Truth Pengurus**:
   - Seluruh data Pengurus berawal dari Pondok Pesantren P3HM Lirboyo.
   - Folder dan peran statis legacy (*Mufattisy*, *Mundzir*, *Keamanan*, *Dewan Harian*, *Dewan Pleno*) telah dihapus total.
2. **Aturan Mutlak Santriwati Mukim**:
   - Opsi Santri Non-Mukim / Kalong telah dieliminasi 100%.
   - Pilihan Unit Asrama: **🏛️ Santri Pondok Mubtadi-aat** (Tarik dari P3HM Lirboyo) & **🏡 Unit Asrama Lain** (Darussa'adah, Ar-Risalah, Dalem Gus Ya'lu, Dalem Yai Atho', dan Isian Kustom Manual).
3. **Form Auto-Locking Data Pondok pada Madrasah**:
   - Saat Siswi Pondok dipilih di Madrasah, identitas & alamat fisik **OTOMATIS TERKUNCI** dengan banner `🔒 FORM IDENTITAS & ALAMAT TERKUNCI RESMI DARI PONDOK P3HM`. HANYA field Jenjang & Kelas Diniyyah yang terbuka.

---

## 3. DEVELOPER SAAS COCKPIT & DYNAMIC ROLE MATRIX
1. **Developer Cockpit (`m.p3hm.my.id/developer`)**:
   - Akses Developer (`develzy` / `develzy25`) untuk mengendalikan 100% sistem, killswitches, DB inspector, dan versi aplikasi.
2. **Dynamic Role Matrix & Navigation Style Switcher**:
   - Peran & Hak Akses ditentukan 100% oleh Instansi secara dinamis (Full CRUD, View Only, Cari-View, Block Access).
   - Penentuan Gaya Navigasi per akun: **Sidebar Utama** (Desktop) vs **Bottom Navigation** (Mobile/Tablet).

---

## 4. FLUTTER MULTI-PLATFORM ENGINE & OAUTH 2.0
1. **Unified Codebase Flutter (`apps/mphm_app`)**:
   - Android APK (`app-release.apk`) & Windows Desktop Native C++ Executable (`mphm-windows-desktop-v2.0.0.zip` RAM < 60MB).
2. **Enterprise Google Sign-In (OAuth 2.0)**:
   - Terkoneksi langsung ke REST API Gateway (`/api/auth/google`).
   - Ekstraksi otomatis SHA-1 & SHA-256 ke GitHub Actions Summary untuk Firebase Console.
3. **Aturan Versi Ganjil (.39 Max) & Daily Build Retention**:
   - Versi wajib berakhiran angka ganjil (contoh: `2.0.1`, max `.39`).
   - Retensi build harian hanya menyimpan 1 build rilis terbaru per tanggal rilis.

---

<div align="center">
**BLUEPRINT RESMI MPHM & P3HM LIRBOYO v2026.5 ENTERPRISE HAS BEEN APPROVED FOR LIVE PRODUCTION**
</div>
