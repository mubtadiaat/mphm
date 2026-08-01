🌟 THE ULTIMATE MASTER BLUEPRINT MPHM v5.0 (FINAL ENTERPRISE EDITION 2026)
"Sistem Informasi Akademik & Pusat Data Abadi Enterprise SaaS"
Status: 100% FINAL, APPROVED, & LIVE PRODUCTION IN EXCLUSIVE DEPLOYMENT

---

### BAB I: VISI, ARSITEKTUR INFRASTRUKTUR & DUAL GITHUB STRATEGY
MPHM & P3HM Lirboyo merupakan Pusat Data Abadi dengan standar Enterprise SaaS. Sistem terpisah secara presisi (Strictly Decoupled) dengan Strategi Dual Repository GitHub:

1. **Dual GitHub Repository Strategy:**
   - **`mubtadiaat/mphm`**: Khusus Deploy Aplikasi Web Next.js 15 ke **Vercel Production** (`https://m.p3hm.my.id`). Dilarang keras menjalankan Flutter build action di repo ini.
   - **`mubtadiaat/app_software`**: Khusus Build Actions CI/CD dan rilis binari Software / Aplikasi Flutter (`app-release.apk` & `mphm-windows-desktop-v2.0.0.zip`).
2. **The Unified Monorepo Stack:**
   - **Web Layer:** Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind v4, Framer Motion (`apps/web`).
   - **Flutter Multi-Platform Layer:** Flutter Engine v3.22.x, Dart 3.0+ (`apps/mphm_app` untuk Android APK & Windows Desktop Native C++ RAM < 60MB).
   - **API Gateway Layer:** Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`).
   - **Database Layer:** PostgreSQL Terenkripsi dikelola dengan Prisma ORM 7 (`@prisma/client`, `prisma/schema.prisma`) disinkronkan ke Cloud Neon PostgreSQL.
   - **Production Gateway:** 100% Terkoneksi ke Live Production `https://m.p3hm.my.id/api` (Bebas total dari localhost / fallback lokal).

---

### BAB II: SAAS DEVELOPER MASTER COCKPIT & DYNAMIC ROLE MATRIX
1. **Developer Master Control (`m.p3hm.my.id/developer` -> `/developer`):**
   - **Kredensial:** `develzy` / `develzy25`.
   - **Kontrol Penuh:** Real-time System Metrics (CPU, V8 Heap, DB Latency), Master Killswitches (Maintenance Mode, DB Write Lock, Registration Lock, API Rate Limiter, Mobile API Switch), Live Raw DB Inspector, dan Backup JSON Exporter.
2. **Engine Dynamic Role & Granular Matrix Engine:**
   - Instansi mengendalikan sistem 100%, bukan instansi yang dikendalikan oleh sistem.
   - Pembuatan Role Kustom Dinamis tanpa batas.
   - Otorisasi Granular Per Menu: **Full CRUD**, **View Only**, **Cari-View**, dan **No Access**, serta Toggle **Export/Import**.
   - **Gaya Navigasi Dinamis Per Akun/Role**: Penentuan tampilan per akun antara **Sidebar Utama** (Desktop/Tablet) atau **Bottom Navigation** (Mobile/Tablet) dieksekusi secara otomatis oleh `DashboardShell.tsx`.

---

### BAB III: RESTRUKTURISASI PENGURUS & SANTRIWATI 100% MUKIM
1. **Single Source of Truth Pengurus:** Seluruh data Pengurus berawal dan ditarik dari Pondok Pesantren P3HM Lirboyo. Peran statis lama (*Mufattisy*, *Mundzir*, *Keamanan*, *Dewan Harian*, *Dewan Pleno*) telah dieliminasi total dari codebase.
2. **Aturan Mutlak Santriwati Mukim:**
   - Eliminasi total opsi Santri Non-Mukim / Kalong.
   - Kategori Asrama Siswi Madrasah (MPHM) hanya: **🏛️ Santri Pondok Mubtadi-aat** (Tarik dari P3HM Lirboyo) & **🏡 Unit Asrama Lain** (Darussa'adah, Ar-Risalah, Dalem Gus Ya'lu, Dalem Yai Atho', dan Isian Manual Kustom Lainnya).
3. **Form Auto-Locking Data Pondok pada Madrasah:**
   Saat mendaftarkan Siswi Pondok di Madrasah, identitas pribadi & alamat otomatis **TERKUNCI** (`disabled`) dengan banner `🔒 FORM IDENTITAS & ALAMAT TERKUNCI RESMI DARI PONDOK P3HM`. HANYA field Jenjang & Kelas Diniyyah serta NISN yang terbuka untuk diisi oleh Madrasah.

---

### BAB IV: ENTERPRISE GOOGLE OAUTH 2.0 & VERSIONING RETENTION POLICY
1. **Enterprise Google Sign-In (OAuth 2.0):**
   - Diintegrasikan di Flutter App via `google_sign_in` dan diverifikasi langsung ke API Gateway Next.js (`/api/auth/google`).
   - Ekstraksi otomatis SHA-1 & SHA-256 Fingerprint ke GitHub Actions Summary untuk didaftarkan ke Firebase Console.
2. **Pemberian Versi Ganjil (Maksimal `.39`):**
   - Format versi wajib berakhiran **angka ganjil** (contoh: `2.0.1`, `2.0.3`, ..., `2.0.39`). Jika melebih `.39`, rollover ke minor versi berikutnya (`2.1.1`).
3. **Kebijakan Retensi Build Harian (*Daily Build Retention*):**
   - Pada tanggal yang sama, hanya build rilis **TERBARU** yang disimpan di database, build lama di hari yang sama dibersihkan otomatis.
   - Build rilis terbaru pada tanggal-tanggal sebelumnya tetap disimpan secara rapi sebagai histori rilis resmi.

---

### BAB V: ANIMASI LOADING NYATA ULTRA-PREMIUM
1. **PremiumLoader Component (`PremiumLoader.tsx`):**
   - Glassmorphism backdrop dengan dual glowing background orbs (`emerald` & `blue`).
   - Multi-Ring Rotating Spinner & Framer Motion Shimmer Progress Line.
   - Terintegrasi penuh ke `SkeletonLoader.tsx`, transisi rute, dan pemuatan tabel data.

---

<div align="center">
**BLUEPRINT MPHM v5.0 HAS BEEN FULLY EXECUTED & APPROVED FOR LIVE PRODUCTION**
</div>