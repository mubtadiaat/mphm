🌟 MASTER BLUEPRINT MPHM v4.0 (EKSPANSI FINAL)
BAB X: KURIKULUM & MANAJEMEN MATA PELAJARAN (SYLLABUS ENGINE)
Modul ini adalah Syllabus Engine yang memastikan setiap santri mendapatkan mata pelajaran yang tepat sesuai dengan Jenjang dan Tingkatannya, serta memberikan sinyal otomatis kepada Scoring Engine mana mata pelajaran yang tergolong "Mapel" (maksimal nilai 8).

1. FILOSOFI "GLOBAL SUBJECT POOL" & TIPE MAPEL
   Sistem tidak boleh membuat mata pelajaran yang berulang-ulang untuk setiap kelas. Kita menggunakan konsep Global Subject Pool (Kolam Mata Pelajaran Terpusat) yang dikelola oleh Sekretariat.

Master Mata Pelajaran (subjects): Menyimpan daftar murni secara global.
**ATURAN MUTLAK PENAMAAN:** Seluruh nama mata pelajaran (Mapel/Non-Mapel) wajib diketik dan disimpan menggunakan Aksara Arab (Contoh: فتح المعين, bukan Fathul Mu'in). Hal ini diwajibkan karena nantinya sistem akan mencetak Rapor, Ijazah, dan Sertifikat sepenuhnya dalam bahasa Arab tanpa modifikasi manual.

Klasifikasi Tipe Mutlak (The Sacred Flag): Di dalam database, setiap mata pelajaran wajib diklasifikasikan ke dalam 2 tipe (ENUM):

NON-MAPEL (The Holy 5): Khusus untuk Al-Qur'an (القرآن), Al-Khoth / Al-Imla' (الخط \ الإملاء), Qiro'ah al-Kutub (قراءة الكتب), Al-Muhafadhoh (المحافظة), dan Akhlaq (الأخلاق).

MAPEL (General): Untuk mata pelajaran selain kelima di atas.

Integrasi Otomatis ke Engine Penilaian: Saat Mustahiq membuka form input nilai, API Hono akan membaca flag NON-MAPEL ini. Jika terdeteksi NON-MAPEL, kolom UI otomatis terkunci maksimal 8, dan di Backend, mapel ini langsung dikeluarkan dari komputasi Ranking.

2. ARSITEKTUR "CURRICULUM MAPPING" (PEMETAAN SILABUS)
   Mata pelajaran tidak ditempelkan langsung ke Kelas (Rombel), melainkan ditempelkan pada Kurikulum -> Jenjang -> Tingkat.

Alur Logika Mutlak:
Jika Administrator menetapkan bahwa Kurikulum "KMI 2026":
Tsanawiyyah ➔ Tingkat I ➔ Mendapatkan Mapel: Al-Qur'an, Fath al-Mubin, dan Al-Ajurrumiyah.
Maka, secara otomatis seluruh lokal kelas (Lokal A hingga Lokal I pada Tsanawiyyah I) akan memiliki kolom penilaian yang sama. Administrator tidak perlu menyusun mapel satu per satu untuk Lokal A, B, atau C.

Versioning Kurikulum: Jika tahun depan ada perubahan kitab/mapel, Administrator tidak mengedit kurikulum lama (karena akan merusak rapor tahun lalu), melainkan menggunakan fitur Clone Curriculum, mengedit yang baru, dan menerapkannya untuk Academic Year yang baru.

---
**REFERENSI KURIKULUM 2 ALIYYAH (Berdasarkan Legger Resmi):**
Sebagai acuan, berikut adalah *mapping* mata pelajaran khusus untuk tingkat 2 Aliyyah (Kelas G, H, dll) yang wajib masuk ke sistem dalam aksara Arab:

**MAPEL (Masuk Perhitungan Ranking):**
1. تفسير الجلالين (Tafsir Jalalain)
2. إتمام الدراية (Itmamud Diroyah)
3. رياض الصالحين (Riyadush Sholihin)
4. كفاية العوام (Kifayatul Awam)
5. فتح المعين (Fathul Mu'in)
6. تسهيل الطرقات (Tashilut Thuruqot)
7. مبادئ قواعد الفقهية (Mabadi Qowaid Fiqhiyyah)
8. عدة الفارض (Uddatul Farid)
9. الفية ابن مالك (Alfiyah Ibnu Malik)
10. بداية الهداية (Bidayatul Hidayah)

**NON-MAPEL (The Holy 5 - Tidak Masuk Ranking):**
1. الخط \ الإملاء (Al-Khoth / Al-Imla')
2. قراءة الكتب (Qiro'ah al-Kutub)
3. المحافظة (Al-Muhafadhoh)
4. الأخلاق (Akhlaq) - *Catatan: Khusus Akhlaq, nilai maksimal mutlak 8.*
*(Al-Qur'an juga masuk dalam blok ini jika diadakan di jenjang tersebut).*
---

3. SKEMA DATABASE DRIZZLE ORM (SYLLABUS ENGINE)
   Untuk menjamin eksekusi cepat di Neon Postgres, relasi dibangun dengan struktur berikut:

TypeScript
// packages/db/src/schema/academic.ts
import { pgTable, text, integer, uniqueIndex } from "drizzle-orm/pg-core";

// 1. MASTER MATA PELAJARAN (Global Pool)
export const subjects = pgTable("subjects", {
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
code: text("code").notNull().unique(), // Cth: "MP-FQH-01"
name: text("name").notNull(), // Cth: "Fath al-Mubin"
subjectType: text("subject_type", { enum: ["MAPEL", "NON_MAPEL"] }).default("NON_MAPEL"),
isActive: integer("is_active", { mode: "boolean" }).default(true), // Soft Delete Mutlak
});

// 2. MASTER KURIKULUM (Wadah Silabus)
export const curriculums = pgTable("curriculums", {
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
name: text("name").notNull(), // Cth: "Kurikulum Pesantren 2026"
description: text("description"),
isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// 3. PEMETAAN SILABUS (Curriculum Subjects Mapping)
// Mengikat Mapel ke Jenjang & Tingkat di dalam suatu Kurikulum
export const curriculumSubjects = pgTable("curriculum_subjects", {
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
curriculumId: text("curriculum_id").notNull().references(() => curriculums.id, { onDelete: "cascade" }),
subjectId: text("subject_id").notNull().references(() => subjects.id, { onDelete: "restrict" }), // ANTI HAPUS
institutionLevel: text("institution_level").notNull(), // Enum: Ibtida'iyyah, Tsanawiyyah, dll
classLevel: text("class_level").notNull(), // Enum: I, II, III, dll
}, (table) => ({
// Mencegah mapel yang sama dimasukkan 2x di tingkat yang sama pada 1 kurikulum
uniqueMapping: uniqueIndex("unique_curriculum_mapping").on(
table.curriculumId, table.subjectId, table.institutionLevel, table.classLevel
),
})); 4. UI/UX: SYLLABUS BUILDER (ANTARMUKA PENYUSUNAN)
Sistem menolak cara kuno dengan form input dropdown yang melelahkan. Penyusunan Kurikulum menggunakan Interactive Syllabus Builder.

Matrix View: Administrator melihat layar berupa Grid/Tabel Matriks.

Baris (Rows): Daftar Mata Pelajaran Aktif.

Kolom (Columns): Tingkat Kelas (Ibtida'iyyah I, Ibtida'iyyah II, dst).

Toggle / Checkbox Interaktif: Administrator hanya perlu mencentang (checklist) kotak persimpangan untuk memasukkan Fath al-Mubin ke Tsanawiyyah I.

Batch Mutation API: Saat tombol "Simpan Silabus" ditekan, Frontend mengumpulkan seluruh struktur matriks dan mengirimkannya dalam satu payload JSON array ke Hono API PUT /api/curriculums/:id/subjects untuk disimpan dalam satu kali transaksi Serverless Database.

5. INTEGRASI AKHIR KE KELAS (academic_classes)
   Pada tabel academic_classes (yang sudah dibahas di BAB IV), terdapat kolom curriculumId.

Ketika Administrator membuat kelas baru (Contoh: "Tsanawiyyah I-A"), Administrator mengaitkan kelas ini dengan "Kurikulum Pesantren 2026".

API akan otomatis menarik semua mata pelajaran dari tabel curriculum_subjects yang berjenjang Tsanawiyyah dan bertingkat I, dan menyajikannya secara instan di buku nilai Mustahiq.
