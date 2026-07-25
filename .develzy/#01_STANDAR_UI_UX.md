🌟 MASTER BLUEPRINT MPHM v4.5 (ULTIMATE EDITION)
#01: STANDAR UI/UX, ANIMASI 3D & KOMPONEN MODERN (THE FRONTEND MASTERPIECE)

Frontend MPHM dirancang sebagai Ultra-Modern Enterprise Professional SaaS Dashboard (Terinspirasi dari Vercel, Linear, dan Supabase). Sistem harus terasa sangat cepat, elegan, dan hidup, namun tetap ringan untuk dieksekusi dari Vercel.

---

## 1. HUKUM TANPA HARDCODED FALLBACK STRING (POLICY #UI-08)
Seluruh cell renderer tabel UI dilarang keras menggunakan string fallback palsu (seperti `|| "Tsanawiyyah"`, `|| "Belum Ditentukan"`, `|| "Gedung Utama"`). Semua nilai yang ditampilkan WAJIB murni ditarik dari baris database PostgreSQL atau fallback ke tanda dash (`"-"`).

---

## 2. SISTEM DESAIN & IDENTITAS VISUAL (DESIGN TOKENS)
- **Base / Surface:** Zinc / Neutral (Memberikan kesan bersih, clean, dan profesional).
- **Primary Brand:** Gold MPHM (Digunakan secara elegan sebagai identitas visual/aksen).
- **Secondary Brand:** Blue MPHM (Diambil dari warna logo).
- **Semantic Colors:** Success (Green), Warning (Amber), Danger (Red).
- **Visual Feel:** Soft UI, pixel-perfect, clean layout, minimalis namun mewah dengan glassmorphism ringan (`backdrop-blur`).

---

## 3. UNIVERSAL DATA GRID (STANDAR MUTLAK TABEL ENTERPRISE)
Seluruh modul WAJIB menggunakan komponen `<UniversalDataGrid />` berbasis TanStack Table.

- **Realtime Search (Debounced 300ms):** Kotak pencarian otomatis tanpa tombol "Cari".
- **Server-Side Everything:** Pagination, Sorting, dan Filtering di-handle di backend API Route Handlers.
- **Identity Cell Pattern:** Kolom nama manusia dirender dengan: Avatar bundar + Nama Tebal + Sub-informasi abu-abu (WA / NIK / Role).
- **Pill Badges:** Status data (Aktif, Lulus, Boyong) dirender bentuk kapsul (`rounded-full`) dengan warna semantik berlatar tipis (`bg-green-500/10 text-green-500`).
- **Row Action:** Icon-only button melayang untuk Edit, Detail, dan Hapus.

---

## 4. KARTU KELAS (ROMBEL) & ACTION CONTROLS
Kartu kelas pada Grid Data Kelas (`/sekretariat/kelas`) wajib menyajikan:
- **Judul Kelas:** Nama Rombel (misal `I'dadiyyah I-A`).
- **Mustahiq (Wali):** Nama Wali Kelas resmi yang dipasangkan.
- **Mufattisy (Pengawas):** Nama Mufattisy terpetakan otomatis berdasarkan Jenjang Pengawasan.
- **Kapasitas:** Angka kapasitas maksimal rombel.
- **Action Buttons:** Tombol **Edit Kelas** (`Edit3`) dan **Hapus Kelas** (`Trash2`) pada sudut kanan atas kartu.