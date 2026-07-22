🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#05_PROMOTION_ENGINE_RIWAYAT_AKADEMIK (KENAIKAN KELAS & KELULUSAN)
Modul Kenaikan Kelas di MPHM BUKAN sekadar fitur memindahkan nama santri dari satu tabel ke tabel lain. Ini adalah Academic Progression Engine otomatis yang membaca komputasi Kwartal, mengevaluasi kehadiran, mendeteksi pelanggaran, dan mencatat sejarah permanen yang tidak bisa dihancurkan (immutable record).

1. FILOSOFI "PROMOTION ENGINE" & STATUS MUTLAK
Engine ini akan memberikan rekomendasi otomatis kepada Mustahiq (Wali Kelas) di akhir tahun. Setiap santri wajib diberikan salah satu dari 6 status akhir berikut sebelum ruang kerja (workspace) tahun ajaran ditutup:

PROMOTED (Naik Kelas): Memenuhi syarat pindah ke tingkat selanjutnya.

RETAINED (Tinggal Kelas): Tidak memenuhi syarat, wajib mengulang di tingkat yang sama.

GRADUATED (Lulus): Tamat dari jenjang pendidikan tersebut (Misal: Lulus Ibtida'iyyah VI atau Tsanawiyyah III).

KHIDMAH (Al-Robithoh): Status khusus bagi santri Aliyyah III yang melanjutkan masa pengabdian 1 tahun.

TRANSFERRED (Pindah Program): Pindah jalur akademik di tengah jalan.

DROPPED (Boyong/Keluar): Tidak melanjutkan pendidikan di MPHM.

2. ATURAN HUKUM KENAIKAN PER JENJANG (BUSINESS RULES)
Sistem API wajib menerapkan algoritma validasi State Machine berikut berdasarkan Jenjang (Master Data). Sistem menolak promosi yang menyalahi kodrat jenjang.

A. I'dadiyyah (Pengecualian Mutlak):

Memiliki Tingkat I, II, dan III, tetapi hanya ditempuh dalam masa 1 Tahun Ajaran (sebagai pembagian kelompok dasar).

Rule #PR-01: I'dadiyyah dikecualikan dari eksekusi Promotion Engine tahunan.

B. Madrasah Ibtida'iyyah (Masa 6 Tahun):

Tingkat I ➔ II ➔ III ➔ IV ➔ V ➔ VI ➔ GRADUATED (Lulus Ibtida'iyyah).

C. Madrasah Tsanawiyyah (Masa 3 Tahun):

Tingkat I ➔ II ➔ III ➔ GRADUATED (Lulus Tsanawiyyah).

D. Madrasah Aliyyah (Masa 3 Tahun):

Tingkat I ➔ II ➔ III ➔ GRADUATED / KHIDMAH (Lulus Aliyyah / Langsung masuk ke Al-Robithoh).

3. SIKLUS FINALISASI (WORKFLOW KENAIKAN KELAS)
Proses ini sangat mapel dan hanya bisa dilakukan satu kali dalam satu Tahun Ajaran.

Fase Draft (Wali Kelas): Mustahiq melihat daftar kelasnya. Sistem menampilkan rekomendasi (misal: Ahmad otomatis direkomendasikan PROMOTED karena nilai Kwartal 4 lolos). Mustahiq dapat mengubah rekomendasi ini (Override) dengan memberikan catatan.

Fase Review (Mufattisy/Pimpinan): Pimpinan tingkat memeriksa rekapitulasi massal dan menekan "Setujui".

Fase Eksekusi Akhir (Finalization Lock): Setelah disetujui, Vercel Background Job akan berjalan:

Sistem mengunci data Kenaikan Kelas Tahun Ajaran tersebut (tidak bisa diedit tanpa Bypass Super Admin).

Sistem menyuntikkan data ke tabel academic_history secara permanen.

Sistem secara otomatis menyiapkan Enrollment kosong di Tahun Ajaran berikutnya menggunakan Clone Academic Year.

4. PUSAT DATA ABADI: TABEL academic_history
Untuk memastikan riwayat pendidikan setiap individu dari masuk hingga lulus terekam bagaikan Blockchain, kita menggunakan tabel arsip Append-Only (hanya bisa ditambah, dilarang di-UPDATE/DELETE).

Struktur Drizzle Skema academic_history:

TypeScript
export const academicHistory = pgTable("academic_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull().references(() => studentProfiles.id),
  academicYearId: text("academic_year_id").notNull(), // Misal: 2025/2026
  institutionLevel: text("institution_level").notNull(), // Jenjang (Ibtida'iyyah)
  classId: text("class_id").notNull(), // Kelas spesifik (Ibtida'iyyah II-A)
  status: text("status").notNull(), // "PROMOTED", "RETAINED", "GRADUATED"
  promotionTransactionId: text("promotion_transaction_id"), // Bukti Audit Batch Action
  overrideReason: text("override_reason"), // Alasan jika ada intervensi manual (wajib diisi jika merubah paksa)
  recordedAt: integer("recorded_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
Manfaat UI: Ketika Admin menggunakan fitur Global Command Palette (CTRL+K) dan mencari nama "Fatimah", tab Riwayat Akademik akan menampilkan timeline visual elegan dari tabel ini (seperti perjalanan dari tahun 2020 hingga lulus 2026).

5. UI/UX: KANDIDAT PROMOSI (DATA GRID)
Antarmuka untuk halaman Kenaikan Kelas wajib menggunakan <UniversalDataGrid /> dengan konfigurasi:

Warna Baris Dinamis (Row Highlighting): Baris santri yang berstatus RETAINED (Tinggal) diberi corak latar kemerahan tipis (bg-danger/5), sedangkan PROMOTED normal.

Batch Action: Administrator dapat mencentang ( checkbox ) banyak santri sekaligus dan mengubah statusnya menjadi PROMOTED atau GRADUATED secara massal.