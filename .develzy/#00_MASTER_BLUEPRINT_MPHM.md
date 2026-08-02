# 🌟 MASTER BLUEPRINT MPHM v5.1
## #00_MASTER_BLUEPRINT_MPHM — Visi, Stack & Deployment Architecture

---

## 1. VISI SISTEM

Sistem Informasi Akademik MPHM dibangun sebagai platform **Enterprise Internal SaaS Web Application** untuk dua instansi:
- **Pondok Pesantren Putri P3HM Lirboyo** (Workspace Emerald 🟢)
- **Madrasah Putri Hidayatul Mubtadi'aat MPHM** (Workspace Blue 🔵)

Seluruh layanan terpusat di satu Web App terpadu yang dapat diakses dari PC Desktop, Laptop, Tablet, maupun HP Android via Web & Progressive Web App (PWA).

---

## 2. TECH STACK MUTLAK

| Layer | Teknologi |
|---|---|
| **Frontend (PWA & Visual)** | Next.js 15+ (App Router + Turbopack), React 19, TypeScript, TailwindCSS v4, Framer Motion |
| **Backend API Gateway** | Next.js Native Route Handlers (`apps/web/src/app/api/.../route.ts`) — Murni JSON REST API |
| **Database & ORM** | Basis data relasional terenkripsi, Prisma ORM 7 (`prisma/schema.prisma`) |
| **Autentikasi** | Native Auth Sesi JWT — dipetakan ke entitas `user_accounts` di database |
| **Media & Asset Storage** | Penyimpanan cloud berbasis tanda tangan (Direct Signed Upload) |
| **Deployment** | Vercel Production (`https://m.p3hm.my.id`) |

---

## 3. ATURAN DEPLOYMENT & DOMAIN PRODUKSI

- **Domain Utama**: `https://m.p3hm.my.id` (SATU-SATUNYA domain resmi)
- **API Base URL**: `https://m.p3hm.my.id/api/*`
- **Repository GitHub**: `mubtadiaat/mphm` (branch: `main`)
- **Dilarang keras**: Menggunakan localhost atau fallback lokal di production

---

## 4. PIPELINE MEDIA (UPLOAD GAMBAR)

1. Frontend meminta token otorisasi ke Backend (`/api/media/signature`)
2. File gambar diproses di browser (RemoveBG canvas untuk TTD/Stempel)
3. File di-upload langsung ke server cloud
4. URL gambar tersimpan di database
5. UI menampilkan preview gambar

---

## 5. ENTERPRISE DATA ARCHITECTURE (PERSON-CENTRIC)

Database menganut prinsip **Single Source of Truth** via entitas `people`:
- `student_profiles` — Data siswi (akademik)
- `santri_profiles` — Data santriwati asrama (keasramaan)
- `teacher_profiles` — Data Mustahiq & Munawwib
- `guardian_profiles` — Data Wali Santri
- `organization_memberships` — Data Pengurus
- `alumni_records` — Data Alumni

---

## 6. NAVIGATION CONFIG (6 PERAN AKTIF)

| Role | Navigasi | Workspace |
|---|---|---|
| `sek.pondok` | Sidebar (Emerald) | Pondok P3HM |
| `sek.madrasah` | Sidebar (Blue) | Madrasah MPHM |
| `mustahiq` | Bottom Nav | Akademik |
| `wali_santri` | Bottom Nav | Guardian Portal |
| *(munawwib)* | *(sesuai config)* | *(Akademik)* |
| *(mufattish)* | *(sesuai config)* | *(Pengawas)* |

---

## 7. KELOMPOK MENU SEKRETARIAT PONDOK (P3HM)

**DATABASE PONDOK**: Data Santriwati, Wali Santri, Data Asrama, Data Pengurus, Alumni

**PERIZINAN & KEDISIPLINAN**: Perizinan, Pelanggaran

**SISTEM & UTILITAS**: Manajemen Akun, Audit Log, Recycling Bin, **Panduan & SOP Sistem**, Konfigurasi Sistem

---

## 8. KELOMPOK MENU SEKRETARIAT MADRASAH (MPHM)

**MANAJEMEN DATA**: Data Siswi, Data Kelas (Rombel)

**PENGAJAR & PENGURUS**: Data Pengurus, Data Pengajar

**AKADEMIK & PENILAIAN**: Kurikulum, Penilaian, Kenaikan Kelas

**DOKUMEN SISWI**: Sertifikat, Raport Kwartal, Ijazah Kelulusan, Template Dokumen

**SISTEM & UTILITAS**: Manajemen Akun, Audit Log, Recycling Bin, **Panduan & SOP Sistem**, Konfigurasi Sistem

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**