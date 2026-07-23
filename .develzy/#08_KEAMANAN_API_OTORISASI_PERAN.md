🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#08: OTORISASI HAK AKSES (RBAC), KEAMANAN, & GLOBAL REALTIME AUDIT TRAIL
Keamanan, otorisasi, dan forensik data pada ekosistem MPHM v4.0 diimplementasikan secara terpusat di tingkat lapisan Backend API Gateway. Kebijakan ini memastikan bahwa seluruh operasi baca dan tulis (read/write) divalidasi sebelum mengeksekusi perintah ke basis data terenkripsi.

1. MANAJEMEN SESI & 6 PERAN RESMI (RBAC SYSTEM)
Sistem autentikasi MPHM tidak menggunakan token JWT di sisi client storage demi menghindari kerentanan Cross-Site Scripting (XSS). Sistem menggunakan Session Authentication berbasis HttpOnly Cookie.

Spesifikasi Keamanan Cookie (Strict Flag):
- **HttpOnly: true** (Mencegah skrip frontend membaca token sesi).
- **Secure: true** (Wajib dilewatkan hanya melalui jaringan HTTPS murni pada domain `https://m.p3hm.my.id`).
- **SameSite: Strict** (Mencegah serangan Cross-Site Request Forgery / CSRF).
- **Session Rotation**: Token sesi otomatis diperbarui (rotate) setiap kali pengguna melakukan tindakan krusial.

6 Peran Resmi Sistem:
1. **Sekretariat**: Pengelolaan administratif terpusat, kontrol data induk, kurikulum, serta manajemen akun global.
2. **Mustahiq (Wali Kelas)**: Hak input nilai kuartal atau ujian semester, mengelola kehadiran berbasis hissoh, serta memberikan catatan kualitatif akhlaq.
3. **Mufattisy (Pimpinan Tingkatan)**: Peninjauan (review) pengisian nilai kelas, kedisiplinan tingkat, serta memberikan persetujuan pada kandidat kenaikan kelas.
4. **Pimpinan / Mundzir**: Akses pemantauan eksekutif (monitoring dashboard) lintas jenjang.
5. **Petugas Keamanan**: Pencatatan insiden pelanggaran santri secara langsung ke dalam jurnal kedisiplinan.
6. **Wali Santri**: Akses masuk Read-Only khusus untuk memantau perkembangan anak asuh.

---

2. PUSAT PENGELOLAAN AKUN (USERS) & MODUL GENERATOR KREDENSIAL
Modul `/sekretariat/users` menyediakan kontrol otorisasi akun pengguna secara massal:
- **Monitoring Akun Aktif**: Menampilkan daftar username, nama lengkap person, role, status aktif/non-aktif, serta pagination dynamic baris (5, 10, 20, 50 baris).
- **Generator Kredensial Instansi Massal**: Menarik data personel (`people`) yang terdaftar sebagai Mustahiq, Mufattisy, atau Mundzir tetapi **belum memilik akun** (`userAccount: { is: null }`). Operator dapat melakukan *multi-select* dan secara otomatis menerbitkan username & password login acak yang siap didistribusikan.
- **Fitur Reset Password**: Menyediakan dialog khusus untuk mereset password akun pengguna secara langsung oleh Sekretariat.
- **Keranjang Sampah Dorman**: Mengisolasi akun yang dorman (> 1 tahun tidak aktif) untuk dikaji ulang oleh Administrator.

---

3. DATA SCOPE AUTHORIZATION INTERCEPTOR
Sistem menerapkan Data Scope Authorization secara absolut:
- **Mustahiq Scope Lock**: Mustahiq secara otomatis terikat pada satu class_id aktif. Endpoint `/api/scores` atau `/api/attendance` menyaring data kelas miliknya secara otomatis.
- **Wali Santri Scope Lock**: Akun Wali Santri dikunci murni berbasis parameter `family_card_number` (Nomor KK).

---

4. AUTOMATED FORENSICS AUDIT LOG ENGINE (BEFORE/AFTER PATTERN)
Setiap operasi manipulasi data yang bersifat merubah isi basis data (POST, PUT, DELETE) dicegat secara otomatis oleh Audit Log Engine:
- **userId & userRole** (Identitas eksekutor tindakan).
- **module** (Nama fitur yang diakses, contoh: ASSESSMENT_ENGINE, CLASS_MANAGEMENT, USER_ACCOUNTS).
- **action** (Jenis manipulasi: INSERT, UPDATE, DELETE).
- **beforeData & afterData** (Kondisi JSON data sebelum dan sesudah mutasi).

---

5. UNIVERSAL API & CRUD STANDARD
- **Standar Response JSON**: `{ success: boolean, message: string, data/errors: object }`.
- **Universal Import & Export**: Mendukung format Excel, CSV, dan PDF.
- **Universal Bulk & Soft Delete**: Aksi massal menggunakan Soft Delete (`deletedAt`) dan dilindungi oleh Database Transaction.