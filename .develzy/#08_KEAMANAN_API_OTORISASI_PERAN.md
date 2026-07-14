🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#08_KEAMANAN_API_OTORISASI_PERAN_(RBAC) & REALTIME AUDIT LOG (SECURITY LAYER)

Lapisan keamanan MPHM v4.0 dibangun di atas infrastruktur Edge Worker (Cloudflare Workers) menggunakan framework Hono.js. Seluruh pemeriksaan keamanan, otentikasi, otorisasi data (Data Scope), dan pencatatan log dilakukan di tingkat jaringan terdekat dengan pengguna sebelum menyentuh lapisan logika bisnis (Business Service Layer).1. MEKANISME OTENTIKASI (SECURE SESSION COOKIE)Berdasarkan aturan tata kelola sistem, otentikasi dilarang keras menggunakan JWT konvensional di LocalStorage karena rentan terhadap serangan XSS. Sistem wajib menggunakan Session Authentication:Karakteristik Cookie: Sesi disimpan di dalam cookie dengan flag HttpOnly, Secure, SameSite: Strict, dan diikat murni pada domain produksi https://m.p3hm.my.id.Session Rotation: Setiap kali pengguna melakukan tindakan krusial atau setelah masa aktif token habis (misal 1 jam), Edge Worker secara otomatis men-generate ID sesi baru (Session Rotation) untuk mencegah pembajakan sesi (Session Fixation).Stateless Token Verification: Sesi divalidasi langsung secara instan di atas V8 Isolates Cloudflare Workers menggunakan database sesi atau token terenkripsi yang efisien untuk menjaga latensi tetap di bawah 10ms.2. MATRIKS OTORISASI PERAN (ROLE-BASED ACCESS CONTROL - RBAC)Sistem membatasi hak akses secara mutlak. Daftar peran (Roles) resmi yang diakui oleh sistem HANYA TERDIRI DARI 6 PERAN SEBAGAI BERIKUT:NoNama Peran (Role)Ruang Lingkup Otorisasi Data & Hak Akses Global1SekretariatMemiliki akses penuh terhadap seluruh fungsi pengelolaan administratif, master data, dan konfigurasi akademik global institusi.2Mustahiq (Wali Kelas)Mengelola data operasional kelas yang ditugaskan (Assigned Class): Input Nilai Kwartal 1-4 (Non-Mapel & Mapel), rekam kehadiran (Hissoh Ula & Tsani), dan memberikan draf rekomendasi kenaikan kelas.3Mufattisy (Pimpinan Tingkatan)Melakukan peninjauan (Review) dan memberikan persetujuan (Approval) massal terhadap kandidat kenaikan kelas pada tingkatannya.4Pimpinan / MundzirMemiliki akses visibilitas data secara global (Global Dashboard Oversight) untuk kebutuhan monitoring realtime, bersifat Read-Only.5Petugas KeamananMemiliki akses khusus untuk memasukkan, mencatat, dan mengunggah bukti insiden pelanggaran santri langsung ke Disciplinary Engine.6Wali SantriMengakses Guardian Portal berstatus eksklusif Read-Only khusus untuk memantau rekam jejak anak asuh yang terikat dengan Nomor KK-nya.3. ATURAN VISIBILITAS DATA (DATA SCOPE AUTHORIZATION)Aturan Emas Sistem (System Rule #SEC-01): Semua user selain Sekretariat dan Pimpinan/Mundzir wajib hanya melihat data di setiap kinerjanya/lingkup kerjanya masing-masing.Mustahiq Scope Lock: Ketika seorang Mustahiq melakukan GET /api/scores, Middleware Hono secara otomatis menyuntikkan parameter ID kelas aktif miliknya (assignedClassId) yang didapatkan dari sesi login. Mustahiq ditolak keras secara arsitektural untuk menarik data nilai dari kelas lain.Wali Santri Scope Lock: API Gateway memvalidasi bahwa ID Siswi yang diminta berada di dalam array santriwati hasil eksekusi Smart KK Mapping Engine. Jika wali mencoba mengakses data anak di luar KK tersebut, server seketika mengembalikan HTTP 403 Forbidden.4. PIPELINE INTEGRASI REALTIME AUDIT LOG (AUTOMATED MIDDLEWARE)Developer tidak perlu memanggil fungsi Audit Log secara manual di dalam kode controller atau endpoint. Pencatatan rekam jejak dilakukan secara otomatis oleh Middleware Hono pada setiap rute yang mengubah data (POST, PUT, DELETE).Skema Penyimpanan Audit Log (audit_logs):TypeScriptexport const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),          // Siapa yang mengubah
  role: text("role").notNull(),                // Peran saat bertindak
  module: text("module").notNull(),            // Nama Modul (cth: ASSESSMENT, VIOLATION)
  action: text("action").notNull(),            // POST / PUT / DELETE
  beforeData: text("before_data"),             // JSON string sebelum diubah (Null jika POST)
  afterData: text("after_data"),               // JSON string setelah diubah (Null jika DELETE)
  ipAddress: text("ip_address").notNull(),     // IP Address Request
  userAgent: text("user_agent").notNull(),     // Browser / Device User
  timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
Integritasi Data Sebelum & Sesudah: Untuk aksi PUT (Update), middleware melakukan operasi baca cepat (pre-fetch read) data yang ada di D1 sebelum perubahan dieksekusi, lalu mencatatnya ke dalam kolom beforeData. Setelah query simpan berhasil, payload baru dimasukkan ke kolom afterData. Mekanisme ini memastikan rekam jejak forensik data jika terjadi kesalahan administratif atau intervensi nilai ilegal.

🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#08: OTORISASI HAK AKSES (RBAC), KEAMANAN, & GLOBAL REALTIME AUDIT TRAIL
Keamanan, otorisasi, dan forensik data pada ekosistem MPHM v4.0 diimplementasikan secara terpusat di tingkat lapisan Backend API Gateway (Hono.js di atas Cloudflare Workers). Kebijakan ini memastikan bahwa seluruh operasi baca dan tulis (read/write) divalidasi pada jangkauan Edge Server sebelum mengeksekusi perintah ke basis data Cloudflare D1, memberikan perlindungan berlapis dengan performa tinggi.

1. MANAJEMEN SESI & 6 PERAN RESMI (RBAC SYSTEM)
Sistem autentikasiMPH tidak menggunakan token JWT di sisi client storage demi menghindari kerentanan Cross-Site Scripting (XSS). Sistem wajib menggunakan Session Authentication berbasis HttpOnly Cookie.

Spesifikasi Keamanan Cookie (Strict Flag):

HttpOnly: true (Mencegah skrip frontend membaca token sesi).

Secure: true (Wajib dilewatkan hanya melalui jaringan HTTPS murni pada domain https://m.p3hm.my.id).

SameSite: Strict (Mencegah serangan Cross-Site Request Forgery / CSRF).

Session Rotation: Token sesi otomatis diperbarui (rotate) setiap kali pengguna melakukan tindakan krusial atau setelah masa aktif tertentu berlalu.

6 Peran Resmi Sistem (Sesuai Aturan Mutlak #02):
Lapisan otorisasi Backend wajib mengunci hak akses pengguna hanya ke dalam 6 peran struktural berikut:

Sekretariat: Pengelolaan administratif terpusat, kontrol data induk, kurikulum, serta manajemen pelanggaran global.

Mustahiq (Wali Kelas): Memiliki hak input nilai kuartal atau ujian semester, mengelola kehadiran berbasis hissoh, serta memberikan catatan kualitatif akhlaq.

Mufattisy (Pimpinan Tingkatan): Melakukan peninjauan (review) pengisian nilai kelas, kedisiplinan tingkat, serta memberikan persetujuan pada kandidat kenaikan kelas.

Pimpinan / Mundzir: Akses pemantauan eksekutif (monitoring dashboard) lintas jenjang dan visualisasi performa data pesantren secara menyeluruh.

Petugas Keamanan: Pencatatan insiden pelanggaran santri secara langsung ke dalam jurnal kedisiplinan sesuai koridor jenis pelanggaran dinamis.

Wali Santri: Akses masuk Read-Only khusus untuk memantau perkembangan anak asuh.

2. DATA SCOPE AUTHORIZATION INTERCEPTOR
Selain pembatasan berdasarkan fungsi peran (RBAC), sistem menerapkan Data Scope Authorization (Otorisasi Lingkup Data) secara absolut melalui Interceptor Middleware Hono.js. Pengguna di luar peran Sekretariat dan Pimpinan/Mundzir dilarang keras melihat atau mengubah data di luar batasan tugasnya.

Penyekatan Mustahiq (Wali Kelas Guard):

Mustahiq secara otomatis terikat pada satu class_id aktif di Tahun Ajaran berjalan.

Setiap kali Mustahiq memanggil endpoint (Contoh: POST /api/scores atau GET /api/attendance), middleware keamanan backend akan memeriksa apakah data santri atau kelas yang diminta sesuai dengan class_id yang menjadi tanggung jawabnya. Jika tidak cocok, pelayan seketika memuntahkan respon HTTP 403 Forbidden.

Penyekatan Wali Santri (KK Mapping Guard):

Akun Wali Santri dikunci murni berbasis parameter family_card_number (Nomor KK).

Wali Santri hanya diberikan hak akses membaca terhadap profil santriwati yang memiliki Nomor KK yang identik dengan profil walinya di dalam tabel people. Segala bentuk upaya manipulasi ID melalui URL frontend untuk mengintip data anak lain akan dipatahkan di tingkat Edge Workers.

3. AUTOMATED FORENSICS AUDIT LOG ENGINE (BEFORE/AFTER PATTERN)
Setiap operasi manipulasi data yang bersifat merubah isi basis data (POST, PUT, DELETE) wajib dicegat secara otomatis oleh Global Middleware Worker. Developer dilarang menuliskan fungsi pencatatan log audit secara manual di dalam fungsi bisnis controller (No Shortcut Checked).

Atribut Rekam Jejak Forensik:
Setiap baris log audit yang disimpan di dalam tabel audit_logs Cloudflare D1 wajib memuat data berikut:

userId & userRole (Identitas eksekutor tindakan).

module (Nama fitur yang diakses, contoh: ASSESSMENT_ENGINE, CLASS_MANAGEMENT).

action (Jenis manipulasi: INSERT, UPDATE, DELETE).

beforeData (Kondisi draf data lama dalam format JSON murni sebelum eksekusi mutasi).

afterData (Kondisi draf data baru dalam format JSON murni setelah mutasi berhasil disimpan).

meta (Mencatat stempel waktu Edge Timestamp, alamat IP asal request, dan User Agent peramban).

Mekanisme Integritas Nilai (Anti-Ilegal Ingestion):
Jika terjadi intervensi nilai rapor ilegal atau pengubahan sepihak pada data pelanggaran santriwati, administrator dapat melakukan komparasi forensik langsung antara lajur beforeData dan afterData untuk melacak kronologi kebocoran atau kesalahan administratif dengan validitas tinggi.

4. UNIVERSAL API & CRUD STANDARD (THE DECOUPLED BACKBONE)
Sebagai sistem *Decoupled*, seluruh komunikasi Frontend dan Backend wajib terstandarisasi. Tidak ada *endpoint* yang menggunakan struktur sembarangan. Seluruh Master Data wajib mematuhi standar *Universal API*:

- Standar Response JSON: Semua balasan dari Hono.js wajib menggunakan struktur baku `{ success: boolean, message: string, data/errors: object }`.
- Universal Import & Export: Setiap modul pendukung Import wajib menyediakan `GET /import/template` (Unduh Sheet Petunjuk & Sheet Data), `POST /import/preview` (Validasi Pra-Import), dan `POST /import/execute`. Endpoint Export mendukung format `excel`, `csv`, dan `pdf`.
- Universal Bulk & Soft Delete: Aksi massal menggunakan `POST /bulk/update`, `POST /bulk/delete`, dan `POST /bulk/restore`. Penghapusan wajib menggunakan prinsip *Soft Delete* (Recycle Bin) dan dilindungi oleh *Database Transaction* pada tingkat Cloudflare D1.
- Auto-Save API: Modul transaksional intensif (seperti Input Nilai) diharamkan menggunakan "Tombol Simpan". Frontend wajib menahan input (*debounce* 500ms), lalu memanggil `PATCH /api` secara asinkron, sementara Backend merespons status sukses untuk memicu UI 3D Saving State.