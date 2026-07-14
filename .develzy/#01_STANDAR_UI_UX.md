🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#01: STANDAR UI/UX, ANIMASI 3D & KOMPONEN MODERN (THE FRONTEND MASTERPIECE)
Frontend MPHM dirancang bukan sebagai web administrasi biasa, melainkan sebagai Ultra-Modern Enterprise Professional SaaS Dashboard (Terinspirasi dari Vercel, Linear, Supabase, dan desain premium di Uiverse.io). Sistem harus terasa sangat cepat, elegan, dan hidup, namun tetap ringan untuk dieksekusi dari Edge (Cloudflare Pages).

1. SISTEM DESAIN & IDENTITAS VISUAL (DESIGN TOKENS)
Tidak ada nilai warna atau spasi yang di-hardcode. Seluruhnya harus menggunakan Design Tokens dari Tailwind CSS v4 dengan palet warna berikut:

Base / Surface: Zinc / Neutral (Memberikan kesan bersih, clean, dan profesional).

Primary Brand: Gold MPHM (Digunakan secara elegan sebagai identitas visual/aksen, BUKAN warna latar belakang dominan).

Secondary Brand: Blue MPHM (Diambil dari warna logo).

Semantic Colors: Success (Green), Warning (Amber), Danger (Red).

Visual Feel: Soft UI, pixel-perfect, clean layout, minimalis namun mewah. Menggunakan glassmorphism ringan (backdrop-blur) pada elemen melayang (seperti Dropdown, Modal, Sticky Header).

2. EKOSISTEM ANIMASI & 3D INTERAKTIF (THE "WOW" FACTOR)
MPHM wajib mengimplementasikan animasi mikro dan elemen 3D untuk meningkatkan User Experience, dengan syarat mutlak tidak mengorbankan performa (bebas lag).

Framer Motion (Micro-interactions):

Seluruh pergantian rute/halaman wajib menggunakan transisi fade-in/slide yang sangat mulus.

Button & Card: Efek hover yang lembut (subtle scale scale: 1.02), soft shadow expansion, dan ripple/glow effect saat diklik.

Sidebar & Drawer: Animasi buka-tutup wajib smooth collapse tanpa patah-patah.

Loading State: Menggunakan Skeleton loading bergelombang (shimmering) yang elegan (bukan sekadar spinner statis).

React Three Fiber / Three.js (Elemen 3D Interaktif):

3D Dashboard Widgets: Statistik utama (misal: Total Santri atau Kartu Status Server) dirender sebagai objek 3D berbentuk "koin" atau "kartu" melayang yang sedikit bereaksi berputar (rotasi mikrometer) saat kursor mouse digerakkan (mouse parallax/hover interaction).

3D Empty State: Saat data kosong (misal tidak ada pelanggaran), jangan hanya tampilkan ikon datar. Tampilkan objek 3D interaktif ringan (seperti kotak kosong 3D atau ilustrasi logo 3D) yang dapat diputar perlahan oleh pengguna.

Performa Mutlak: Semua elemen 3D wajib dibungkus dengan React.Suspense dan next/dynamic agar di-lazy-load dan tidak menunda render halaman utama (LCP).

3. UNIVERSAL DATA GRID (STANDAR MUTLAK TABEL ENTERPRISE)
Tidak boleh ada tabel yang dibuat manual atau berbeda gaya antar modul. Seluruh modul (Santri, Pengajar, Kelas, Jadwal) WAJIB menggunakan satu komponen <UniversalDataGrid /> yang dibangun di atas TanStack Table v9.

Spesifikasi Fungsional:

Realtime Search (Debounced): Kotak pencarian (tanpa tombol "Cari"). Saat mengetik, sistem menunggu 300ms (debounce), lalu otomatis memfilter data (Server-side API call).

Server-Side Segala Hal: Pagination, Sorting, dan Filtering wajib di- handle di backend Hono untuk menopang puluhan ribu baris data.

Column Manager: Fitur Show/Hide, Reorder, dan Pin Left/Right untuk setiap kolom. Preferensi ini disimpan otomatis.

Bulk Selection & Bulk Actions: Menyediakan checkbox untuk seleksi massal (termasuk "Select All Across Pages"). Aksi massal (seperti Hapus Massal atau Ubah Status Massal) WAJIB dilindungi oleh modal konfirmasi ganda (Double Confirmation Dialog) dan dijalankan menggunakan mekanisme Database Transaction.

Import/Export Template Pipeline: Modul yang menerima Import data harus menyediakan fitur Download Template yang memuat 2 sheet wajib: `Sheet Petunjuk` (berisi panduan validasi pengisian) dan `Sheet Data` (area input). Frontend wajib melakukan pra-validasi tipe data sebelum melempar Execute Request ke backend.

Spesifikasi Visual Tabel (AdminHMD Model):

Identity Cell Pattern (Penting!): Untuk kolom nama manusia, wajib di-render sebagai:

Avatar bulat (rounded-full) yang mengambil foto HANYA dari CDN Cloudinary.

Nama tebal (font-semibold text-sm).

Sub-informasi (NIS / NIK / Email) dengan teks kecil abu-abu tepat di bawah nama.

Pill Badges: Status data (Aktif, Lulus, Boyong) dirender dengan bentuk kapsul (rounded-full) dengan warna semantik berlatar tipis (bg-green-500/10 text-green-500).

Row Action: Tombol aksi pada ujung kanan tabel (Edit, Lihat, Hapus) menggunakan icon-only button yang memunculkan efek subtle glow saat di-hover.

Desain Tabel: Garis pembatas tipis (divide-zinc-200/50), gaya zebra-stripes ringan atau hover row illumination yang bersih.

4. SPESIFIKASI KOMPONEN PREMIUM (shadcn/ui KUSTOM)
Setiap komponen standar tidak boleh langsung dipakai mentah, melainkan harus disesuaikan menjadi spesifikasi Premium Enterprise:

Card: Berbentuk rounded-xl atau rounded-2xl, dengan soft shadow yang membesar perlahan saat di-scroll atau di-hover, garis tepi yang sangat tipis (border-zinc-200/40).

Forms (Input/Select): Menggunakan animasi floating label atau focus-ring beranimasi (warna Brand Blue atau Gold MPHM yang muncul dari tengah saat form di-klik).

Command Palette (CTRL + K): Modal pencarian ala "Mac Spotlight" yang blur di belakangnya. Bisa mencari fitur, nama santri, atau menu dalam sekejap mata dari halaman mana pun.

5. LAYOUT & RESPONSIVITAS 100% (MOBILE-FIRST)
Seluruh desain antarmuka menjamin responsivitas sempurna di Layar Lebar, Tablet, hingga Handphone.

Desktop: Sidebar mengambang (floating feeling), Top bar elegan, dan ruang data spasial yang lega.

Tablet/Mobile: Sidebar otomatis tersembunyi menjadi Bottom Navigation bergaya iOS atau Drawer Menu dari kiri (menggunakan Framer Motion). Universal Data Grid berubah menjadi Card-Stack List (tabel runtuh menjadi deretan kartu) di layar kecil agar tetap nyaman digulir.

6. MANAJEMEN ASET MEDIA (CLOUDINARY PIPELINE)
Komponen frontend untuk gambar wajib menggunakan integrasi langsung dengan Cloudinary.

Image Component: Wajib menggunakan <Image /> dari Next.js dengan konfigurasi loader khusus Cloudinary agar otomatis mengatur tingkat kompresi (format WebP/AVIF), resize on the fly, dan optimasi resolusi.

Fallback Avatar: Jika profil tidak memiliki foto dari Cloudinary, komponen wajib me-render Inisial Nama dua huruf dengan latar belakang gradien yang smooth.