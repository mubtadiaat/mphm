# 🌟 MASTER BLUEPRINT MPHM v4.5 (ENTERPRISE DATA ARCHITECTURE)
## #02_ENTERPRISE_DATA_ARCHITECTURE (PERSON-CENTRIC & PRISMA ORM)

Transformasi MPHM dari sekadar "aplikasi web" menjadi "Pusat Data Abadi" bergantung sepenuhnya pada arsitektur database ini. Sistem dirancang untuk berjalan pada **Database Relasional Terenkripsi** menggunakan **Prisma ORM 7** dan **Next.js Native Route Handlers**, menjamin waktu eksekusi API yang sangat tinggi secara global.

---

## 1. FILOSOFI "SINGLE SOURCE OF TRUTH" (PERSON-CENTRIC CORE)
Kelemahan aplikasi akademik tradisional adalah redundansi data. Di MPHM Enterprise v4.5, satu manusia di alam nyata hanya boleh memiliki satu baris data identitas (ID) seumur hidup pada tabel `people`.

### Integrasi Alur Data Santriwati (Pondok ➔ Madrasah)
- **Sumber Utama Master Data (Pondok)**: Pendaftaran identitas utama santriwati (Nama, NIK, TTL, Alamat, Wali) dilakukan di level **Pondok Pesantren (P3HM)**.
- **Tarik Data & Penempatan Kelas (Madrasah)**: Aplikasi **Madrasah (MPHM)** memanggil/menarik data santriwati dari Pondok. Jika santriwati belum dipasangkan kelas madrasah saat registrasi awal di Pondok, Sekretariat MPHM menarik data santriwati dari daftar *Belum Ada Kelas* lalu mengalokasikannya ke kelas rujukan (Tsanawiyyah, Aliyyah, Ibtida'iyyah, I'dadiyyah).
- **Proteksi Read-Only**: Data biologi & wali utama dikunci di tingkat Madrasah untuk mencegah duplikasi atau konflik master data.

Sistem menggunakan konsep **Polymorphic Profiles (Matriks Profil)**:
- **Entitas Inti (`people`)**: Data biologi & identitas utama (Nama, NIK, TTL, Jenis Kelamin, Alamat, Telepon).
- **Entitas Profil (Role)**:
  - Profil Santri (`student_profiles`) ➔ Terhubung ke NIK, NIS, NISN, Stambuk, Asrama (`rooms`), dan Kelas (`class_enrollments`).
  - Profil Pengajar / Mustahiq (`teacher_profiles`).
  - Profil Wali Santri (`guardian_profiles`) ➔ Terhubung via Nomor KK (`family_card_number`).
  - Profil Alumni (`alumni_records`).
  - Profil Pengurus (`organization_memberships`).

---

## 2. SPESIFIKASI SKEMA DATABASE INTI (PRISMA SCHEMA)

```prisma
model Person {
  id          String    @id @default(uuid())
  nik         String?
  fullName    String    @map("full_name")
  gender      String    // L or P
  birthPlace  String?   @map("birth_place")
  birthDate   String?   @map("birth_date")
  address     String?
  phoneNumber String?   @map("phone_number")
  avatarUrl   String?   @map("avatar_url")
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  userAccount             UserAccount?
  studentProfile          StudentProfile?
  teacherProfile          TeacherProfile?
  guardianProfiles        GuardianProfile[]
  organizationMemberships OrganizationMembership[]
  alumniRecord            AlumniRecord?
  supervisedRooms         Room[]
  khidmahAssignments      KhidmahAssignment[]
  mustahiqClasses         AcademicClass[]          @relation("MustahiqClasses")
  approvedPermits         StudentPermit[]          @relation("PermitApprover")

  @@map("people")
}

model StudentProfile {
  id             String    @id @default(uuid())
  personId       String    @unique @map("person_id")
  stambukNumber  String    @map("stambuk_number")
  nis            String    @unique
  nisn           String?
  enrollmentYear Int       @map("enrollment_year")
  status         String    @default("ACTIVE")
  roomId         String?   @map("room_id")
  deletedAt      DateTime? @map("deleted_at")

  person        Person              @relation(fields: [personId], references: [id], onDelete: Restrict)
  room          Room?               @relation(fields: [roomId], references: [id], onDelete: SetNull)
  enrollments   ClassEnrollment[]
  studentScores StudentScore[]
  attendances   StudentAttendance[]
  violations    StudentViolation[]
  certificates  AcademicCertificate[]
  permits       StudentPermit[]

  @@map("student_profiles")
}

model StudentPermit {
  id           String    @id @default(uuid())
  studentId    String    @map("student_id")
  permitType   String    @map("permit_type") // PULANG, SAMBANGAN, KELUAR
  reason       String
  startDate    String    @map("start_date")
  endDate      String    @map("end_date")
  status       String    @default("PENDING") // PENDING, APPROVED, REJECTED, COMPLETED
  approvedById String?   @map("approved_by_id")
  notes        String?
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  student    StudentProfile @relation(fields: [studentId], references: [id], onDelete: Restrict)
  approvedBy Person?        @relation("PermitApprover", fields: [approvedById], references: [id], onDelete: SetNull)

  @@map("student_permits")
}

model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @default(now()) @map("updated_at")

  @@map("system_settings")
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?  @map("user_id")
  action      String
  entity      String
  entityId    String?  @map("entity_id")
  beforeState String?  @map("before_state")
  afterState  String?  @map("after_state")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

---

## 3. PROSEDUR PEMBERSIHAN (TRUNCATE) & SEEDING DATA (`seed.js`)
Pembersihan total data dummy mengambang dieksekusi dengan perintah SQL `TRUNCATE TABLE ... CASCADE;` di file `seed.js`:
- Seluruh 21 tabel database di-reset secara serentak.
- Menanamkan data akun pengguna (Admin, Sek.Pondok, Sek.Madrasah, Mustahiq, Mufattisy, Mundzir, Keamanan, Wali Santri), Tahun Ajaran 2026/2027, Mapel Diniyyah, Kurikulum, Asrama, Kelas, Profiles Santriwati, Nilai Kwartal, Presensi, Pelanggaran, dan Surat Perizinan Pulang/Sambangan secara terintegrasi 100%.

---

## 4. STANDAR MEDIA UPLOAD (CLOUD STORAGE PIPELINE)
- Upload foto dan dokumen tidak menggunakan file biner lokal statis.
- Frontend mengambil *Signed Upload Token* dari backend (`/api/media/signature`) dan mengirimkan berkas langsung ke **Cloud Storage**.
- URL file hasil upload disimpan secara permanen di database.

---

## 5. STANDAR KEAMANAN NAMA VENDOR
Seluruh antarmuka pengguna (UI) dan pesan API wajib bebas dari penyebutan istilah vendor internal rahasia. Digantikan secara konsisten dengan istilah umum profesional:
- **`Neon cloud` / `PostgreSQL`** ➔ **`database`** atau **`database terenkripsi`**.
- **`Cloudinary`** ➔ **`Cloud Storage`**.