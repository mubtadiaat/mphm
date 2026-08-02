# 🌟 MASTER BLUEPRINT MPHM v5.1
## #01_STANDAR_UI_UX — Design System, Whitelist Ikon & Component Standards

---

## 1. IDENTITAS VISUAL & DESIGN TOKENS

| Token | Nilai | Keterangan |
|---|---|---|
| **Workspace Pondok P3HM** | Emerald / Teal Gradient | `from-emerald-700 via-teal-700 to-emerald-900` |
| **Workspace Madrasah MPHM** | Blue / Indigo Gradient | `from-blue-600 via-indigo-600 to-purple-600` |
| **Base Surface** | Zinc / Neutral | Kesan bersih, clean, profesional |
| **Dark Mode** | `dark:bg-zinc-900` / `dark:border-zinc-800` | Mendukung penuh |
| **Border Radius** | `rounded-2xl`, `rounded-3xl` | Card & container modern |
| **Font Style** | `font-black`, `font-extrabold`, `font-bold` | Hierarchy visual tegas |

---

## 2. HEADER BANNER STANDAR BAKU (SETIAP MENU UTAMA)

Seluruh menu utama Sekretariat & Akademik WAJIB memiliki:

1. **Gradient Banner Ultra-Premium** (mengikuti warna workspace instansi aktif).
2. **Info Notice Banner** (Sparkles ✨) berisi penjelasan ketentuan baku instansi.
3. Tema warna dinamis: **Emerald** untuk Pondok, **Blue** untuk Madrasah.

```tsx
// Contoh header premium:
<div className={`p-6 rounded-3xl text-white border ${
  isPondok
    ? "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 border-emerald-500/30"
    : "bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 border-blue-500/30"
}`}>
```

---

## 3. KEBIJAKAN WHITELIST 10 IKON RESMI (HUKUM MUTLAK)

**DILARANG** menggunakan ikon di luar daftar resmi ini di seluruh UI sistem:

| Ikon | Fungsi Resmi |
|---|---|
| ✅ | Berhasil, aktif, selesai, atau konfirmasi |
| 🔄 | Sinkronisasi, pembaruan, muat ulang, atau proses perubahan data |
| ❌ | Kesalahan, pembatalan, penolakan, atau penghapusan |
| 📌 | Informasi penting, penanda, atau data utama (Mustahiq) |
| 📖 | Data, informasi, dokumentasi, atau referensi (Munawwib, Header) |
| 🔒 | Data terkunci, hak akses terbatas, atau fitur yang tidak dapat diubah |
| 🔓 | Data terbuka, hak akses tersedia, atau fitur yang dapat diubah |
| ⏳ | Proses berlangsung, menunggu, atau status pending (Boyong Pending) |
| 📥 | Penarikan, impor, atau pengambilan data (Tarik Data Pondok) |
| ✨ | Fitur baru, peningkatan, atau penyempurnaan sistem (Notice Banner) |

**Ikon yang DILARANG KERAS**: 🚚 🌴 🥞 🎓 🏠 🚗 🎯 🔥 ⭐ dan seluruh ikon emoji lainnya.

---

## 4. UNIVERSAL DATA GRID (STANDAR MUTLAK TABEL ENTERPRISE)

Semua modul wajib menggunakan komponen `<UniversalDataGrid />` berbasis TanStack Table:

- **Realtime Search (Debounced 300ms)**: Pencarian instan tanpa tombol "Cari".
- **Server-Side**: Pagination, Sorting, dan Filtering di-handle backend API.
- **Identity Cell Pattern**: Avatar bundar + Nama Tebal + Sub-info abu-abu (WA / NIK / Role).
- **Pill Badges**: Status (`rounded-full`, `bg-green-500/10 text-green-500`).
- **Row Action**: Icon-only button melayang untuk Edit, Detail, dan Hapus.

---

## 5. POLICY #UI-08 — TANPA HARDCODED FALLBACK STRING

Seluruh cell renderer dilarang keras menggunakan string fallback palsu:
- ❌ `|| "Tsanawiyyah"`, `|| "Belum Ditentukan"`, `|| "Gedung Utama"`
- ✅ Semua nilai harus murni dari database atau fallback ke tanda dash (`"-"`).

---

## 6. EMPTY STATE CARD (GUIDED EMPTY STATE)

Komponen `GuidedEmptyState.tsx` menggunakan card modern:
- **Madrasah MPHM**: Card berwarna Blue (`blue-50`, `blue-200`)
- **Pondok P3HM**: Card berwarna Emerald (`emerald-50`, `emerald-200`)
- Menampilkan langkah-langkah panduan yang ramah bagi operator baru.

---

## 7. MODAL & DIALOG STANDARDS

- Backdrop: `bg-black/40 backdrop-blur-xs`
- Animasi: `AnimatePresence` + Framer Motion (`initial opacity-0 / animate opacity-1`)
- Modal container: `bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800`

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**