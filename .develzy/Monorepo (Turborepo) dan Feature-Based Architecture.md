1. Root Monorepo Structure
   Kita menggunakan pnpm workspace untuk mengelola dependensi antar app dan packages.

Plaintext
mphm-enterprise/
├── apps/
│ ├── web/ # Next.js 15 (Frontend Dashboard)
│ └── api/ # Hono.js (Backend API Gateway)
├── packages/
│ ├── db/ # Drizzle Schema & D1 Configuration
│ ├── ui/ # Shared components (shadcn/ui + custom premium)
│ ├── utils/ # Shared logic (Zod validation, types, constants)
│ └── config/ # Shared ESLint/TypeScript configs
├── package.json
├── turbo.json # Turborepo task pipeline
└── pnpm-workspace.yaml

2. Frontend Structure (apps/web)
   setiap dashboard user dipisah berdasarkan role. Kita menggunakan struktur (dashboard)/[role] agar setiap role memiliki layout dan file navigasi sendiri.

Plaintext
apps/web/src/
├── app/
│ ├── (dashboard)/
│ │ ├── sekretariat/ # Dashboard Sekretariat
│ │ ├── mustahiq/ # Dashboard Wali Kelas
│ │ ├── mufattisy/ # Dashboard Pengawas
│ │ ├── pimpinan/ # Dashboard Pimpinan
│ │ ├── keamanan/ # Dashboard Keamanan
│ │ └── guardian/ # Dashboard Wali Santri
│ └── layout.tsx
├── components/
│ ├── shared/ # Universal components (Sidebar, Topbar)
│ └── data-grid/ # Implementasi Universal Data Grid Standard
├── features/ # LOGIKA BISNIS PER ROLE (Pemisahan Total)
│ ├── sekretariat/
│ │ ├── components/ # Komponen khusus Admin (Cth: ViolationManager)
│ │ ├── services/
│ │ └── queries/
│ ├── mustahiq/
│ │ ├── components/ # Komponen khusus Wali Kelas (Cth: ScoreInputGrid)
│ │ └── queries/
│ ├── guardian/
│ │ ├── components/ # Komponen Wali Santri (Cth: RaporViewer)
│ │ └── queries/
│ └── ... (role lainnya)
└── lib/ # API Client (axios/fetch wrapper) 

3. Backend Structure (apps/api)
Karena kita menggunakan Hono.js, struktur routing dipisahkan berdasarkan peran untuk menjamin Data Scope Authorization yang ketat.

Plaintext
apps/api/src/
├── routes/
│ ├── admin/ # Endpoint untuk Sekretariat
│ ├── mustahiq/ # Endpoint khusus Wali Kelas
│ ├── guardian/ # Endpoint khusus Wali Santri (Read-Only)
│ ├── auth/ # Session & Auth Logic
│ └── public/
├── middleware/
│ ├── auth-middleware.ts # RBAC & Session check
│ └── audit-middleware.ts # Forensics Audit Log
├── services/ # Business Logic Layer (Pemisahan dari Controller)
│ ├── academic.service.ts
│ ├── disciplinary.service.ts
│ └── grade.service.ts
└── index.ts # Entry point

4. Shared Package (packages/db)
   Pusat Data Abadi (Drizzle Schema) disimpan di satu tempat untuk diakses baik oleh Backend (untuk validasi database) maupun Frontend (untuk tipe data/TypeScript).

Plaintext
packages/db/
├── schema/
│ ├── people.ts # Core Identity (People)
│ ├── students.ts # Profil Santri
│ ├── teachers.ts # Profil Mustahiq
│ ├── academic.ts # Tahun Ajaran, Kelas, Rombel
│ ├── scores.ts # Penilaian
│ └── violations.ts # Pelanggaran
└── index.ts # Drizzle Instance & Export
