🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#02_ENTERPRISE_DATA_ARCHITECTURE (PERSON-CENTRIC) & API GATEWAY
Transformasi MPHM dari sekadar "aplikasi web" menjadi "Pusat Data Abadi" bergantung sepenuhnya pada arsitektur database ini. Sistem dirancang untuk berjalan di Neon Postgres (Serverless PostgreSQL) menggunakan Drizzle ORM dan Hono.js, menjamin waktu eksekusi API di bawah 10ms secara global.

1. FILOSOFI "SINGLE SOURCE OF TRUTH" (PERSON-CENTRIC CORE)
Kelemahan aplikasi akademik tradisional adalah redundansi data. Di MPHM v4.0, satu manusia di alam nyata hanya boleh memiliki satu baris data identitas (ID) seumur hidup.

Sistem menggunakan konsep Polymorphic Profiles (Matriks Profil):

Entitas Inti (people): Data biologi yang tidak pernah berubah (Nama, TTL, Jenis Kelamin, Golongan Darah, Nama Ibu Kandung).

Entitas Profil (Role): Baju/Seragam yang dikenakan orang tersebut seiring berjalannya waktu.

Fase 1: Santri (student_profiles).

Fase 2: Lulus menjadi Alumni (alumni_records).

Fase 3: Mengabdi menjadi Wali Kelas (teacher_profiles).

Fase 4: Menjadi Pengurus Yayasan (organization_memberships).

Keuntungan Mutlak: Jika Fatimah (yang kini menjadi pengajar) memperbarui nomor WhatsApp-nya, sistem hanya memperbarui tabel people. Secara otomatis, data nomor kontaknya sebagai alumni dan santri lama ikut terbarui.

2. SPESIFIKASI SKEMA DATABASE INTI (DRIZZLE ORM)
Ini adalah struktur absolut untuk dieksekusi oleh Developer / AI Agent.

TypeScript
// packages/db/src/schema/person.ts
import { pgTable, text, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. TABEL CORE: PEOPLE
export const people = pgTable("people", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nik: text("nik").unique(), // Nullable (belum punya KTP/KK)
  fullName: text("full_name").notNull(),
  gender: text("gender", { enum: ["L", "P"] }).notNull(),
  birthPlace: text("birth_place"),
  birthDate: text("birth_date"), // Format YYYY-MM-DD
  address: text("address"),
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"), // MUTLAK URL DARI CLOUDINARY
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
}, (table) => ({
  nameIdx: uniqueIndex("name_idx").on(table.fullName), // INDEXING FOR SPEED
}));

// 2. MASTER ASRAMA / KAMAR (Rooms)
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(), // Cth: "Kamar Al-Ghozali 01"
  buildingName: text("building_name").notNull(), // Cth: "Gedung A"
  capacity: integer("capacity").notNull().default(10),
  supervisorId: text("supervisor_id").references(() => teacherProfiles.id, { onDelete: "set null" }), // Wali Kamar
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// 3. PROFIL SANTRI
export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // ATURAN MUTLAK: ON DELETE RESTRICT (Anti-hapus fatal)
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }), 
  stambukNumber: text("stambuk_number").notNull().unique(),
  nis: text("nis").notNull().unique(),
  nisn: text("nisn").unique(),
  enrollmentYear: integer("enrollment_year").notNull(),
  status: text("status", { enum: ["ACTIVE", "GRADUATED", "DROPPED", "BOYONG", "KHIDMAH"] }).default("ACTIVE"),
  khidmahPlacement: text("khidmah_placement"),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
});

// 4. PROFIL PENGAJAR / MUSTAHIQ
export const teacherProfiles = pgTable("teacher_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  teacherCode: text("teacher_code").notNull().unique(), // Cth: "UST-01"
  teacherType: text("teacher_type", { enum: ["MUSTAHIQ", "MUNAWIB", "KEDUANYA", "LAINNYA"] }).notNull().default("LAINNYA"),
  startTeachingYear: text("start_teaching_year"), // Cth: "2021/2022"
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).default("ACTIVE"),
});

// 5. PROFIL WALI SANTRI (Smart Guardian Mapping)
export const guardianProfiles = pgTable("guardian_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  familyCardNumber: text("family_card_number").notNull(), // NOMOR KK
  relation: text("relation", { enum: ["AYAH", "IBU", "WALI"] }).notNull(),
});

// 6. PROFIL ALUMNI (Rekam Jejak Khidmah & Ijazah)
export const alumniRecords = pgTable("alumni_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  studentProfileId: text("student_profile_id").notNull().references(() => studentProfiles.id),
  graduationYear: text("graduation_year").notNull(),
  khidmahStatus: text("khidmah_status", { enum: ["KHIDMAH", "TIDAK_KHIDMAH"] }).default("TIDAK_KHIDMAH"),
  khidmahLocation: text("khidmah_location"), // Cth: "Ustadzah", "Keamanan MPHM"
  ijazahTaken: text("ijazah_taken", { enum: ["SUDAH", "BELUM"] }).default("BELUM"),
  notes: text("notes"), // Cth: "Menikah", "Tidak Lulus UBK"
});

// 7. PROFIL DEWAN HARIAN / ORGANISASI
export const organizationMemberships = pgTable("organization_memberships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  role: text("role").notNull(), // Cth: "Sekertaris Tiga", "Ketua Umum"
  serviceYear: text("service_year").notNull(), // Cth: "2024/2025"
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});
Aturan Keamanan Database (DB-01): onDelete: "restrict". Postgres di Serverless Database akan otomatis menolak penghapusan baris pada tabel people jika orang tersebut masih tercatat memiliki rapor, pelanggaran, atau profil. Sistem hanya mengenal Soft Delete / Perubahan Status.

3. CLOUDINARY PIPELINE (STRICTLY DECOUPLED MEDIA)
Untuk menjaga database Neon Postgres tetap sangat ringan, tidak ada file biner yang dikirim melewati Serverless Function.

Alur Keamanan Upload Media (Zero Worker Bottleneck):

Frontend Intercept: Pengguna memilih foto santri di antarmuka Next.js.

Request Signature: Frontend memanggil GET /api/media/signature ke Hono Backend.

Generate Token: Hono Backend menghasilkan SHA-1 Signature menggunakan Cloudinary Secret Key dan membalas dengan parameter rahasia.

Direct to Cloudinary: Frontend melakukan POST langsung ke https://api.cloudinary.com/v1_1/mphm/image/upload.

URL Persistence: Cloudinary mengembalikan secure_url. Frontend lalu melakukan PUT /api/students/:id dengan menyisipkan URL tersebut ke database Neon Postgres.

4. API GATEWAY STANDARD (HONO.JS ON EDGE)
API Backend bukan sekadar media CRUD, melainkan gerbang hukum bisnis.

1. Interseptor Validasi Mapel (Zod Payload Validation):
Semua request masuk wajib ditangkap oleh Middleware Zod sebelum menyentuh logika database.

TypeScript
// Contoh implementasi di Hono API
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

app.post('/api/students', zValidator('json', z.object({
  fullName: z.string().min(3),
  gender: z.enum(['L', 'P']),
  nis: z.string().length(6)
})), (c) => {
  // Hanya dieksekusi jika validasi lolos
})
2. Standar Respon Universal:
Tidak peduli endpoint manapun, respons yang diterima Frontend wajib seragam:

JSON
{
  "status": "Success",  // atau "Validation Error" / "Server Error"
  "message": "Data profil santri berhasil diperbarui",
  "data": {
    "id": "abc-123",
    "avatarUrl": "https://res.cloudinary.com/..."
  }
}
3. Realtime Edge Audit Log (Otomatis):
Setiap operasi POST, PUT, DELETE secara otomatis dicegat oleh Middleware Hono untuk mencatat ke tabel audit_logs:

Siapa (ID User / Role)

Kapan (Edge Timestamp)

Modul Apa (Cth: STUDENT_PROFILE)

Aksi (UPDATE)

Diff Matrix (Data sebelum diubah vs Data setelah diubah).

5. PROFIL TERPADU 360° & GLOBAL COMMAND PALETTE
Karena datanya terpusat secara rapi, Frontend dapat menyediakan dua fitur sakti bagi Administrator:

Global Command Palette (CTRL + K): Modal Spotlight Search yang bisa mencari nama siapapun dari halaman manapun. Hasil pencarian akan menampilkan Badge (Apakah dia Santri, Alumni, atau Keduanya).

Profil Terpadu 360°: Mengklik nama seseorang akan membuka halaman megah yang menampilkan:

Tab 1: Biodata Inti & Pas Foto (Cloudinary).

Tab 2: Riwayat Kelas (Tahun ke Tahun).

Tab 3: Grafik Agregat Rapor (Dihitung langsung dari Neon Postgres).

Tab 4: Rekam Jejak Kedisiplinan & Pelanggaran.

6. WORKFLOW ENGINE STATE MACHINE (DATA GOVERNANCE)
Seluruh modul operasional di MPHM wajib dikendalikan oleh *Workflow Engine* (State Machine) yang terpusat di Backend. Workflow tidak sekadar menjadi label "Status", melainkan mesin pembatas hak akses, visibilitas tombol UI, dan validasi logika.

Alur Transisi Baku (Draft ➔ Review ➔ Final ➔ Locked):
- DRAFT: Data baru dimasukkan (contoh: Nilai di-input oleh Mustahiq). Masih bisa di-edit dan di-hapus (menggunakan Auto-Save).
- REVIEW: Data diajukan untuk ditinjau oleh Mufattisy. Mustahiq kehilangan hak Edit/Delete (Read-Only).
- FINAL: Data disetujui (Approved) secara massal.
- LOCKED: Data dikunci permanen (Archive) oleh sistem.

Aturan Mutlak Workflow: Perpindahan status yang melompati hierarki (misal dari DRAFT langsung ke FINAL) adalah ILEGAL, kecuali dilakukan secara eksplisit oleh peran Super Admin/Sekretariat melalui *Override API* yang memicu Audit Log.

🚀 Cara Mengeksekusi Tahap #02 Ini ke AI Agent / Developer:
Salin prompt ini ke AI IDE Anda (Cursor, Windsurf, dll) untuk langsung mengeksekusi arsitektur database:

"Berdasarkan Blueprint MPHM Tahap #02, silakan setup Drizzle ORM di dalam folder packages/db. Buat skema people, student_profiles, teacher_profiles, dan guardian_profiles menggunakan dialect drizzle-orm/pg-core untuk Neon Postgres. Terapkan indeks pada kolom pencarian dan pastikan Foreign Key menggunakan onDelete: 'restrict'. Setelah itu, setup endpoint dasar di apps/backend menggunakan Hono untuk melakukan operasi GET dan POST dengan validasi Zod."