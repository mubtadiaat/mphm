🌟 MASTER BLUEPRINT MPHM v4.5 (ULTIMATE EDITION)
**"Sistem Informasi Akademik & Pusat Data Abadi Enterprise"**

## #00: VISI STRATEGIS, ARSITEKTUR STACK & DEPLOYMENT

Sistem Informasi Akademik MPHM dibangun sebagai platform **Enterprise Internal SaaS**. Arsitektur wajib dipisah sepenuhnya (*Strictly Decoupled*) untuk menjamin performa maksimal, keamanan militer, dan keandalan jangka panjang di jaringan Vercel.

**1. Tech Stack Mutlak (The New Stack):**
* **Frontend Layer (PWA & Visual Presentation):** Next.js 16+ (App Router dengan Turbopack), React 19, TypeScript, Progressive Web App (PWA). Di-deploy ke ekosistem **Vercel**.
* **Backend API Gateway (Business Logic):** **Next.js Native Route Handlers** (`apps/web/src/app/api/.../route.ts`). (Murni JSON REST API).
* **Pusat Data (Database & ORM):** Basis Data Relasional Terenkripsi dikelola dengan **Prisma ORM 7** (`@prisma/client`, `prisma/schema.prisma`).
* **Autentikasi:** Native Auth Sesi JWT & Google OAuth yang dipetakan langsung ke entitas pengguna di database (`user_accounts`).
* **Media & Asset Storage:** **Cloud Storage**. Seluruh foto profil & aset media diunggah via Direct Signed Upload.

**2. Aturan Deployment & Domain Produksi:**
* **Domain Utama:** Seluruh sistem beroperasi HANYA di `https://m.p3hm.my.id`.
* **API Base URL:** `https://m.p3hm.my.id/api/*` (API Edge/Serverless Endpoint via Next.js Route Handlers).

---

## #01: UI/UX & MODERN ANIMATION STANDARD
Seluruh antarmuka WAJIB **100% Responsive (Mobile-First, Tablet, Desktop)** dan mengusung filosofi *Ultra-Modern Enterprise Professional SaaS*.

- **Policy #UI-08 (Tanpa Hardcoded Fallback String):** Cell renderer dilarang keras menampilkan string fallback buatan (`|| "Tsanawiyyah"`, `|| "Belum Ditentukan"`). Semua tampilan berasal dari database atau `-`.
- **Universal Data Grid:** Realtime Search (Debounced 300ms), Server-Side Pagination, Column Manager, Identity Cell Pattern (Avatar + Nama Tebal + Sub-teks).
- **Dual-Workspace Architecture:** Hub PondokPesantren & Hub Madrasah Diniyyah.

---

## #02: PIPELINE MEDIA CLOUD STORAGE
Frontend meminta token otorisasi ke Backend, mengunggah file langsung ke Cloud Storage, lalu menyimpan URL gambar di database.

---

## #03: ENTERPRISE DATA ARCHITECTURE (PERSON-CENTRIC)
Database menganut prinsip **Single Source of Truth** (`people`). Entitas `people` mengenakan profil polimorfik (`student_profiles`, `teacher_profiles`, `guardian_profiles`, `organization_memberships`, `alumni_records`).

---

## #04: ACADEMIC WORKSPACE & MANAJEMEN ROMBEL
- **Data Model Mustahiq:** Kolom `Nama Lengkap Mustahiq`, `Jenjang` (Badge Ungu), `Tingkat | Lokal` (Blue Bold), `No. HP / WA`, `Status`, `Aksi`. `Kode Guru/Mustahiq` dihapus.
- **Auto-Generate Classes:** Backend secara otomatis membuat `AcademicClass` di database dari posisi Mustahiq yang diimpor/didaftarkan.
- **Mufattisy Auto-Match:** Pemetaan otomatis pengawas kelas berbasis `supervisedLevel`.
- **Card Edit Action:** Tombol edit `Edit3` & modal edit kelas pada kartu rombel.

---

## #05: ENGINE PENILAIAN & PROMOTION (KENAIKAN KELAS)
Algoritma 4 Kwartal, Eliminasi Nilai Non-Mapel dari Ranking, serta State Machine Kenaikan Kelas (Draft -> Review -> Final).