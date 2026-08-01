# BLUEPRINT SISTEM MANAJEMEN MPHM & P3HM LIRBOYO
*Versi Blueprint Resmi Terbaru: 2026.6 (Enterprise Web & PWA Standalone Edition)*

Dokumen ini merupakan acuan resmi (*single source of truth*) mengenai seluruh arsitektur sistem, aturan bisnis, alur data, hak akses, serta spesifikasi teknis untuk sistem **Madrasah Putri Hidayatul Mubtadi'aat [MPHM]** dan **Pondok Pesantren Putri Hidayatul Mubtadi'aat [P3HM] Lirboyo**.

---

## 1. UNIFIED REPOSITORY & DEPLOYMENT UTAMA
1. **Repository Platform Web (`mubtadiaat/mphm`)**:
   - Terintegrasi penuh untuk Web Application & API Gateway Next.js 15 di **Vercel Production** (`https://m.p3hm.my.id`).
   - Mendukung Progressive Web App (PWA) 1-Klik yang dapat diinstal langsung di Windows Desktop (Standalone App) dan HP Android/iOS.

---

## 2. RESTRUKTURISASI PENGURUS & SANTRIWATI MUKIM 100%
1. **Single Source of Truth Pengurus**:
   - Seluruh data Pengurus berawal dari Pondok Pesantren P3HM Lirboyo.
   - Folder dan peran statis legacy (*Mufattisy*, *Mundzir*, *Keamanan*, *Dewan Harian*, *Dewan Pleno*) telah diselaraskan ke dalam matriks peran dinamis.
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

## 4. ENTERPRISE PWA & UNIVERSAL RESPONSIVE ENGINE
1. **Unified Enterprise Web Architecture**:
   - Next.js 15 App Router, React 19, TypeScript, TailwindCSS, Prisma ORM 7 PostgreSQL.
2. **Progressive Web App (PWA Standalone)**:
   - Instalasi 1-Klik di Windows Desktop (tanpa browser URL bar) & HP Android (ikon aplikasi di Home Screen).
3. **Pembaruan Realtime Terpusat**:
   - Seluruh perbaikan data dan rilis fitur baru aktif secara realtime di semua perangkat tanpa perlu mengunduh installer ulang.

---

<div align="center">
**BLUEPRINT RESMI MPHM & P3HM LIRBOYO v2026.6 ENTERPRISE HAS BEEN APPROVED FOR LIVE PRODUCTION**
</div>
