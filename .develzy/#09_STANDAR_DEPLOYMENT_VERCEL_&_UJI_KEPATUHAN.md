🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#09_STANDAR_DEPLOYMENT_VERCEL_&_UJI_KEPATUHAN (PRODUCTION GATEWAY)
Sistem Informasi Akademik MPHM dirancang secara eksklusif (Cloud-Native) untuk dieksekusi di atas infrastruktur Vercel Ecosystem. Oleh karena arsitekturnya dipisah 100% (Frontend terpisah dari Backend), proses deployment wajib mematuhi aturan jaringan murni tanpa campur tangan arsitektur monolithic tradisional (seperti cPanel atau VPS).

1. ATURAN DOMAIN PRODUKSI TUNGGAL (THE ONLY ORIGIN RULE)
Ini adalah hukum jaringan yang tidak bisa ditawar. Seluruh ekosistem harus tunduk pada satu domain utama.

Domain Produksi: https://m.p3hm.my.id

*Tidak Ada .vercel.app: AI Agent / Developer DILARANG KERAS menggunakan domain bawaan *.vercel.app pada variabel lingkungan (ENV) tingkat produksi (Production).

Base URL Mutlak: Semua Canonical URL, Sitemap, Cookie Auth, dan API Callback wajib menganggap https://m.p3hm.my.id sebagai Base Origin.

Routing API Terpusat: Meskipun Backend (Hono) berjalan di Vercel Edge/Serverless Functions dan terpisah secara konsep dari Frontend (Next.js), keduanya direkatkan menggunakan fitur Next.js App Router (di `apps/web/src/server/routes`).

UI Web diakses melalui: https://m.p3hm.my.id/*

API Gateway diakses melalui: https://m.p3hm.my.id/api/*

2. INFRASTRUKTUR DEPLOYMENT (THE DECOUPLED STACK)
Karena proyek menggunakan Turborepo/Nx (Monorepo), proses build dikelola di Vercel Dashboard:

A. Frontend & Backend Gateway (Vercel Deployment):

Framework: Next.js 15+ (App Router).

Runtime: Menggunakan konfigurasi Vercel Edge atau Serverless Functions untuk merender Hono.js.

Environment Variable: NEXT_PUBLIC_API_URL = /api.

B. Database (Neon Postgres):

Platform: Menggunakan Neon Database (Serverless Postgres).

Database Binding: Wajib mengatur `DATABASE_URL` di Vercel Environment Variables.

CORS Policy: Middleware Hono hanya menerima Access-Control-Allow-Origin: https://m.p3hm.my.id.

3. KEAMANAN OTENTIKASI PRODUKSI (SECURE COOKIE POLICY)
Mekanisme pengikatan sesi (session binding) di tingkat produksi wajib menerapkan parameter perlindungan lapis baja:

Seluruh Set-Cookie dari respon login POST /api/auth/login harus mengandung:

HttpOnly=true (Mencegah serangan pembacaan token oleh ekstensi peramban jahat).

Secure=true (Memaksa kuki hanya berjalan di sambungan https://).

SameSite=Strict (Menahan serangan CSRF dari domain lain).

Domain=m.p3hm.my.id.

4. PIPELINE MEDIA CLOUDINARY
Mengingat Vercel Edge/Serverless tidak dirancang untuk menangani manipulasi atau unggahan berkas berukuran raksasa secara terus-menerus, MPHM menggunakan Cloudinary sebagai Pangkalan Data Media.

ENV Secrets: Wajib menanamkan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET dengan aman di dashboard Vercel.

Frontend Upload: UI (Next.js) tidak pernah mengirim berkas gambar (Foto Santri, Bukti Pelanggaran) melewati Serverless Function. UI meminta token dari Backend, lalu mengunggahnya langsung ke CDN Cloudinary, untuk kemudian hanya menyimpan tautan URL-nya ke dalam basis data Neon.

5. SEPARASI ENVIRONMENT (PREVIEW & DEVELOPMENT STAGES)
Meskipun *Domain Produksi Tunggal* adalah hukum mutlak, pengembangan fitur baru wajib melewati area karantina untuk mencegah kerusakan *Production*.
- **Development**: Dijalankan secara lokal di mesin Developer menggunakan `pnpm dev`. Menggunakan URL database lokal atau dev dari Neon.
- **Preview**: Otomatis tercipta (Auto-Deployment) setiap ada *Pull Request* atau *Push* ke branch non-main di Vercel. Lingkungan Preview diharamkan mengakses Database Production; wajib di-bind ke Branch Database di Neon (Branching Database).
- **Routing & SEO Preview**: Aplikasi Frontend wajib mendeteksi domain *Preview* Vercel dan secara otomatis menyematkan tag `X-Robots-Tag: noindex, nofollow` agar tidak terindeks oleh Google.

6. LEMBAR UJI KEPATUHAN MUTU AKHIR (SANITY CHECKLIST)
Sebelum sistem dinyatakan "Lulus Uji Terbang" dan diluncurkan ke para Mustahiq, Developer dan Pimpinan wajib memverifikasi poin-poin mutlak berikut:

[ ] Zero Shortcut Checked: Seluruh antarmuka Rapor dan Transkrip wajib bersih dari singkatan pemalas (Tidak ada teks "K1" atau "S1", wajib menampilkan "Kwartal I" dan "Semester Ganjil").

[ ] The Sacred Mapel Guard: Telah dicoba memasukkan nilai 9 pada mata pelajaran "Akhlaq" di form UI. API Backend wajib merespons HTTP 400 Validation Error (Maksimal nilai Al-Qur'an dan Akhlaq adalah 8).

[ ] KK Mapping Engine Verified: Melakukan simulasi pendaftaran Wali Santri baru dengan Nomor KK. Sistem terbukti secara ajaib memunculkan seluruh data anak sekandung di layar pemantauan Wali tanpa campur tangan admin.

[ ] Override Traps Guard Verified: Melakukan simulasi pengubahan predikat Rapor Akhlaq oleh Mustahiq. Sistem wajib menolak simpan jika alasan pengubahan (overrideReason) berisi teks pendek seperti "Telah dimaafkan". (Wajib minimal 15 aksara).

[ ] Soft-Delete Rule: Memastikan penghapusan data Kelas atau Jenis Pelanggaran dari Dashboard hanya menyembunyikan status aktifnya (merubah is_active: false), tanpa memicu hilangnya jejak sejarah (DELETE FROM).