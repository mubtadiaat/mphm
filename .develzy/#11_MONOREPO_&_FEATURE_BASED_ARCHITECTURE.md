🌟 MASTER BLUEPRINT MPHM v4.0 (EKSPANSI FINAL)
BAB XI: MONOREPO (TURBOREPO) & FEATURE-BASED ARCHITECTURE

1. Root Monorepo Structure
Kita menggunakan pnpm workspace untuk mengelola dependensi antar app dan packages.

```text
mphm-enterprise/
├── apps/
│   └── web/            # Next.js 15 (Frontend Dashboard) + Hono.js (API Routes Server)
├── packages/
│   ├── db/             # Drizzle Schema & Neon Postgres Configuration
│   ├── ui/             # Shared components (shadcn/ui + custom premium) (opsional, jika dipisah)
│   ├── config/         # Shared ESLint/TypeScript configs
├── package.json
├── turbo.json          # Turborepo task pipeline
└── pnpm-workspace.yaml
```

2. Frontend Structure (apps/web)
Setiap dashboard user dipisah berdasarkan role menggunakan App Router. Kita menggunakan struktur `(dashboard)/[role]` agar setiap role memiliki layout dan navigasi sendiri.

```text
apps/web/src/
├── app/
│   ├── (dashboard)/
│   │   ├── sekretariat/ # Dashboard Sekretariat
│   │   ├── mustahiq/    # Dashboard Wali Kelas
│   │   ├── pimpinan/    # Dashboard Pimpinan / Mundzir
│   │   ├── keamanan/    # Dashboard Keamanan
│   │   └── guardian/    # Dashboard Wali Santri
│   └── layout.tsx
├── components/
│   ├── shared/          # Universal components (DocumentTemplateBuilder, Sidebar)
│   └── data-grid/       # Implementasi Universal Data Grid Standard
├── features/            # LOGIKA BISNIS PER ROLE (Pemisahan Total)
│   ├── sekretariat/
│   │   ├── components/  # RaportTab, IjazahTab, SertifikatTab
│   │   └── queries/     # React Query hooks
│   ├── mustahiq/
│   ├── guardian/
│   └── keamanan/
└── lib/                 # Utilitas dan API Client
```

3. Backend API Gateway & Route Structure (apps/web/src/server)
Sistem ini menggunakan Hono.js sebagai Engine Backend yang *embedded* di dalam aplikasi Next.js (via Edge API Routes di Vercel). Struktur rute memisahkan secara ketat *business engines* dan endpoint berdasarkan *role*.

```text
apps/web/src/server/
├── routes/
│   ├── admin/               # Endpoint untuk Administrator & Sekretariat (people, users, onboarding)
│   ├── auth/                # Session & Auth Logic
│   ├── guardian/            # Endpoint untuk Wali Santri (dashboard)
│   ├── keamanan/            # Endpoint untuk modul Keamanan
│   ├── mustahiq/            # Endpoint untuk Wali Kelas
│   ├── public/              # Endpoint Publik
│   ├── academicWorkspace.ts # Engine pengelolaan kurikulum dan akademik dasar
│   ├── assessmentEngine.ts  # Engine Penilaian & Kwartal
│   ├── disciplinaryEngine.ts# Engine Manajemen Kedisiplinan & Pelanggaran
│   ├── media.ts             # Gateway Cloudinary untuk Unggah Aset
│   ├── promotionEngine.ts   # Mesin Kenaikan Kelas & Histori Akademik
│   └── settings.ts          # Konfigurasi Sistem Global
├── middlewares/
│   ├── authMiddleware.ts    # RBAC & Session Check
│   └── auditLogMiddleware.ts# Middleware pencatatan aktivitas Forensik
├── services/                # Logika Bisnis Kompleks (GradeService, dll)
└── index.ts                 # Hono App Entry Point
```

4. Shared Database Schema (packages/db)
Pusat Data Abadi (Drizzle Schema) disimpan di satu tempat untuk menjamin "Single Source of Truth" bagi Serverless DB (Neon Postgres).

```text
packages/db/src/schema/
├── academic.ts              # Master Kurikulum & Mata Pelajaran (MAPEL vs NON-MAPEL)
├── academic_ops.ts          # Tahun Ajaran, Kelas, Enrollments, Penilaian Kwartal, Pelanggaran, Akademik Histori
├── attendance.ts            # Matriks Kehadiran Sesi (Ula & Tsani)
├── auth.ts                  # Otentikasi dan Sesi (Secure Cookies)
├── disciplinary_master.ts   # Kategori & Tingkat Pelanggaran
├── people.ts                # Identitas Inti Abadi Manusia (Avatar, NIK, dsb)
├── profiles.ts              # Matriks Polimorfik (Student, Teacher, Guardian)
├── security.ts              # Log Audit Forensik Global
├── settings.ts              # Konfigurasi Master Sistem (JSON Value)
└── index.ts                 # Drizzle Instance Export
```
