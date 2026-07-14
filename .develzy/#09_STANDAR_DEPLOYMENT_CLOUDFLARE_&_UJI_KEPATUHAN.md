🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#09_STANDAR_DEPLOYMENT_CLOUDFLARE_&_UJI_KEPATUHAN (PRODUCTION GATEWAY)
Sistem Informasi Akademik MPHM dirancang secara eksklusif (Cloud-Native) untuk dieksekusi di atas infrastruktur Cloudflare Ecosystem. Oleh karena arsitekturnya dipisah 100% (Frontend terpisah dari Backend), proses deployment wajib mematuhi aturan jaringan murni tanpa campur tangan arsitektur monolithic tradisional (seperti cPanel, VPS, atau Vercel).

1. ATURAN DOMAIN PRODUKSI TUNGGAL (THE ONLY ORIGIN RULE)
Ini adalah hukum jaringan yang tidak bisa ditawar. Seluruh ekosistem harus tunduk pada satu domain utama.

Domain Produksi: https://m.p3hm.my.id

*Tidak Ada .pages.dev: AI Agent / Developer DILARANG KERAS menggunakan domain bawaan *.pages.dev atau *.workers.dev pada variabel lingkungan (ENV) tingkat produksi (Production).

Base URL Mutlak: Semua Canonical URL, Sitemap, Cookie Auth, dan API Callback wajib menganggap https://m.p3hm.my.id sebagai Base Origin.

Routing API Terpusat: Meskipun Backend (Hono) berjalan di Cloudflare Workers dan terpisah dari Frontend (Next.js di Pages), keduanya direkatkan menggunakan fitur Cloudflare Custom Domains / Worker Routes.

UI Web diakses melalui: https://m.p3hm.my.id/*

API Gateway diakses melalui: https://m.p3hm.my.id/api/*

2. INFRASTRUKTUR DEPLOYMENT (THE DECOUPLED STACK)
Karena proyek menggunakan Turborepo/Nx (Monorepo), proses build dipecah menjadi dua pipeline yang berbeda di Cloudflare Dashboard:

A. Frontend (Cloudflare Pages):

Framework: Next.js 15+ (App Router).

Runtime: Menggunakan konfigurasi @cloudflare/next-on-pages (OpenNext) agar fitur Server Components (SSR/ISR) dapat berjalan mulus di infrastruktur Edge.

Environment Variable: NEXT_PUBLIC_API_URL = /api.

B. Backend (Cloudflare Workers):

Framework: Hono.js.

Database Binding: Wajib melakukan binding ke Cloudflare D1 (Serverless SQLite) pada wrangler.toml.

CORS Policy: Middleware Worker hanya menerima Access-Control-Allow-Origin: https://m.p3hm.my.id.

3. KEAMANAN OTENTIKASI PRODUKSI (SECURE COOKIE POLICY)
Mekanisme pengikatan sesi (session binding) di tingkat produksi wajib menerapkan parameter perlindungan lapis baja:

Seluruh Set-Cookie dari respon login POST /api/auth/login harus mengandung:

HttpOnly=true (Mencegah serangan pembacaan token oleh ekstensi peramban jahat).

Secure=true (Memaksa kuki hanya berjalan di sambungan https://).

SameSite=Strict (Menahan serangan CSRF dari domain lain).

Domain=m.p3hm.my.id.

4. PIPELINE MEDIA CLOUDINARY
Mengingat Cloudflare Workers tidak dirancang untuk menangani manipulasi atau unggahan berkas berukuran raksasa secara terus-menerus, MPHM menggunakan Cloudinary sebagai Pangkalan Data Media.

ENV Secrets Backend (Worker): Wajib menanamkan CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET dengan aman menggunakan perintah rahasia (wrangler secret put).

Frontend Upload: UI (Next.js) tidak pernah mengirim berkas gambar (Foto Santri, Bukti Pelanggaran) melewati Worker. UI meminta token dari Worker, lalu mengunggahnya langsung ke CDN Cloudinary, untuk kemudian hanya menyimpan tautan URL-nya ke dalam basis data D1.

5. SEPARASI ENVIRONMENT (PREVIEW & DEVELOPMENT STAGES)
Meskipun *Domain Produksi Tunggal* adalah hukum mutlak, pengembangan fitur baru wajib melewati area karantina untuk mencegah kerusakan *Production*.
- **Development**: Dijalankan secara lokal di mesin Developer menggunakan `wrangler dev`. Menggunakan database lokal yang meniru D1.
- **Preview**: Otomatis tercipta (Auto-Deployment) setiap ada *Pull Request* atau *Push* ke branch non-main. Lingkungan Preview diharamkan mengakses D1 Production; wajib di-bind ke D1 Preview.
- **Routing & SEO Preview**: Aplikasi Frontend wajib mendeteksi domain *Preview* dan secara otomatis menyematkan tag `X-Robots-Tag: noindex, nofollow` agar tidak terindeks oleh Google.

6. LEMBAR UJI KEPATUHAN MUTU AKHIR (SANITY CHECKLIST)
Sebelum sistem dinyatakan "Lulus Uji Terbang" dan diluncurkan ke para Mustahiq, Developer dan Pimpinan wajib memverifikasi poin-poin mutlak berikut:

[ ] Zero Shortcut Checked: Seluruh antarmuka Rapor dan Transkrip wajib bersih dari singkatan pemalas (Tidak ada teks "K1" atau "S1", wajib menampilkan "Kwartal I" dan "Semester Ganjil").

[ ] The Sacred Mapel Guard: Telah dicoba memasukkan nilai 9 pada mata pelajaran "Akhlaq" di form UI. API Backend wajib merespons HTTP 400 Validation Error (Maksimal nilai Al-Qur'an dan Akhlaq adalah 8).

[ ] KK Mapping Engine Verified: Melakukan simulasi pendaftaran Wali Santri baru dengan Nomor KK. Sistem terbukti secara ajaib memunculkan seluruh data anak sekandung di layar pemantauan Wali tanpa campur tangan admin.

[ ] Override Traps Guard Verified: Melakukan simulasi pengubahan predikat Rapor Akhlaq oleh Mustahiq. Sistem wajib menolak simpan jika alasan pengubahan (overrideReason) berisi teks pendek seperti "Telah dimaafkan". (Wajib minimal 15 aksara).

[ ] Soft-Delete Rule: Memastikan penghapusan data Kelas atau Jenis Pelanggaran dari Dashboard hanya menyembunyikan status aktifnya (merubah is_active: false), tanpa memicu hilangnya jejak sejarah (DELETE FROM).