# 🌟 THE ULTIMATE MASTER BLUEPRINT MPHM v5.1 (ENTERPRISE EDITION 2026)
## "Sistem Informasi Akademik & Pusat Data Abadi Enterprise SaaS"
### Status: 100% FINAL, APPROVED, & LIVE PRODUCTION — `https://m.p3hm.my.id`

---

## BAB I: VISI, ARSITEKTUR INFRASTRUKTUR & UNIFIED GITHUB STRATEGY

MPHM & P3HM Lirboyo merupakan Pusat Data Abadi dengan standar Enterprise SaaS. Sistem terpisah secara presisi (Strictly Decoupled) sesuai kewenangan instansi.

### 1. Unified GitHub Repository:
- **`mubtadiaat/mphm`**: Repo utama Web App Next.js 15 + API Route Handlers, di-deploy ke **Vercel Production** (`https://m.p3hm.my.id`).

### 2. The Unified Monorepo Stack:
- **Web Layer:** Next.js 15 (App Router + Turbopack), React 19, TypeScript, TailwindCSS v4, Framer Motion (`apps/web`).
- **API Gateway Layer:** Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`).
- **Database Layer:** Basis data relasional terenkripsi, dikelola dengan Prisma ORM 7. Seluruh tabel & query tertera di `prisma/schema.prisma`.
- **Media & Asset Storage:** Penyimpanan media berbasis Cloud (Direct Signed Upload). Seluruh URL gambar tersimpan di database.
- **Production Gateway:** 100% terkoneksi ke Live Production `https://m.p3hm.my.id/api`.

---

## BAB II: DIKOTOMI KEWENANGAN PONDOK (P3HM) & MADRASAH (MPHM)

Ini adalah aturan mutlak sistem yang tidak dapat dikonfigurasi ulang:

| Kewenangan | Pondok Pesantren P3HM (Emerald) | Madrasah Diniyyah MPHM (Blue) |
|---|---|---|
| Data Identitas Santriwati | **PENGELOLA TUNGGAL (Single Source of Truth)** | Hanya bisa Tarik Data dari Pondok |
| Kamar & Asrama | Pondok | — |
| Wali Santri | Pondok | — |
| Status Boyong | Approval wajib dari Pondok | Hanya bisa mengajukan |
| Status Cuti | — | **Mandiri, tanpa approval Pondok** |
| Rombel/Kelas Diniyyah | — | **Kewenangan penuh Madrasah** |
| Mustahiq (Wali Kelas) & Munawwib (Guru Mapel) | — | **Input mandiri Madrasah** |
| Kurikulum & Mata Pelajaran Diniyyah | — | **Kewenangan penuh Madrasah** |
| Penilaian 4 Kwartal & Raport | — | **Alur 4 Tahap Madrasah** |
| Kenaikan Kelas Diniyyah | — | **Kewenangan penuh Madrasah** |
| Perizinan Pulang Santri | **Pondok** | — |
| Pelanggaran & Poin Sanksi | **Pondok** | — |

---

## BAB III: KONFIGURASI SISTEM (10 MASTER CONTROL MODULES)

Menu Konfigurasi Sistem (`/sekretariat/settings`) adalah Pusat Kendali Enterprise:

1. **Modul 1 — Dikotomi Workspace**: Toggle Cuti Mandiri Madrasah, Toggle Boyong Approval Pondok, Toggle Penguncian Identitas Pondok.
2. **Modul 2 — Kalender Akademik & Kwartal Lock**: Tahun Ajaran Aktif, Kwartal Berjalan (1-4), Freeze Switches per Kwartal.
3. **Modul 3 — Formulasi Nilai & Kenaikan Kelas**: Bobot Harian/Kwartal/Syafa'i (%), KKTP Nilai Minimal, Maks Mapel Merah.
4. **Modul 4 — Matriks Hak Akses 6 User**: Granular permission untuk Sekretariat Pondok, Sekretariat Madrasah, Mustahiq, Munawwib, Mufattish, Wali Santri.
5. **Modul 5 — Stempel & TTD Digital**: Upload File PNG/JPG → Auto RemoveBG Canvas HD → Tersimpan ke Database. (Preview pada checker pattern).
6. **Modul 6 — Master Kedisiplinan**: Kategori poin sanksi kedisiplinan keasramaan P3HM.
7. **Modul 7 — Struktur Jabatan**: 14 Jabatan Baku Pengurus Pondok & 11 Jabatan Baku Pengurus Madrasah.
8. **Modul 8 — WhatsApp Gateway**: Fonnte/Wablas API Token, Template Pesan Rapor, Boyong, Absensi.
9. **Modul 9 — API Data Wilayah**: Pilihan server API wilayah (Cahyadsn / Binderbyte / Kemendagri).
10. **Modul 10 — Keamanan & Backup**: Cookie Lifetime, HTTPS Enforce, Emergency Maintenance Lock, Auto-Backup Interval.

Semua konfigurasi tersimpan di tabel `system_settings` (key-value) via `PUT /api/settings`, dan ter-sync ke localStorage browser.

---

## BAB IV: KEBIJAKAN WHITELIST IKON RESMI SISTEM

Hanya 10 ikon resmi yang boleh digunakan di seluruh UI/UX:

| Ikon | Fungsi Resmi |
|---|---|
| ✅ | Berhasil, aktif, selesai, atau konfirmasi |
| 🔄 | Sinkronisasi, pembaruan, muat ulang, atau proses perubahan data |
| ❌ | Kesalahan, pembatalan, penolakan, atau penghapusan |
| 📌 | Informasi penting, penanda, atau data utama (Mustahiq) |
| 📖 | Data, informasi, dokumentasi, atau referensi (Munawwib, Header) |
| 🔒 | Data terkunci, hak akses terbatas, atau fitur yang tidak dapat diubah |
| 🔓 | Data terbuka, hak akses tersedia, atau fitur yang dapat diubah |
| ⏳ | Proses berlangsung, menunggu, atau status pending |
| 📥 | Penarikan, impor, atau pengambilan data |
| ✨ | Fitur baru, peningkatan, atau penyempurnaan sistem |

**DILARANG KERAS** menggunakan ikon di luar daftar ini (contoh: 🚚, 🌴, 🥞, 🎓, 🏠, dll).

---

## BAB V: MENU PANDUAN & SOP SISTEM (`/sekretariat/sop`)

Menu khusus berisi tatacara penggunaan dashboard Sekretariat yang bersifat **dinamis** sesuai workspace aktif:
- **Mode Pondok P3HM (Emerald)**: SOP 5 Kelompok Menu (Database Pondok, Perizinan & Kedisiplinan, Sistem & Utilitas) dengan alur approval Boyong.
- **Mode Madrasah MPHM (Blue)**: SOP 5 Kelompok Menu (Manajemen Data, Pengajar & Pengurus, Akademik & Penilaian, Dokumen Siswi, Sistem & Utilitas) dengan alur 4 tahap penilaian.

---

## BAB VI: DEVELOPER SAAS COCKPIT (`/developer`)

- **Kredensial**: `develzy` / `develzy25`
- **Fitur Utama**: System Health Real-Time, Master Killswitches (Maintenance Lock, DB Write Lock, Import Lock, Rate Limiter, Mobile API Switch), Live DB Inspector, Backup JSON Exporter.

---

## BAB VII: STANDAR TERMINOLOGI TEKNOLOGI (BRANDING POLICY)

**Aturan Penyamaran Teknologi** — Seluruh tampilan UI, pesan toast, dokumentasi, dan teks yang terlihat pengguna WAJIB menggunakan terminologi generik:

| Nama Vendor Asli | Terminologi Resmi di Sistem |
|---|---|
| Cloudinary / Cloud Storage | **Database** atau **Penyimpanan Database** |
| Neon DB | **Database** |
| PostgreSQL | **Database** |
| Prisma ORM | (tidak ditampilkan ke user) |

**Nama vendor HANYA boleh muncul di kode internal (comments, variabel), bukan di teks UI yang terlihat pengguna.**

---

<div align="center">

**BLUEPRINT MPHM v5.1 — FULLY EXECUTED & LIVE PRODUCTION**
`https://m.p3hm.my.id` | Branch: `main` | Repository: `mubtadiaat/mphm`

</div>