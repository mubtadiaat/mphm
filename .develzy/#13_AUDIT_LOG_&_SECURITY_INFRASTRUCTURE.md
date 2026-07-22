🌟 MASTER BLUEPRINT MPHM v4.0 (EKSPANSI FINAL)
BAB XIII: AUDIT LOG & SECURITY INFRASTRUCTURE

Sistem MPHM menggunakan standar keamanan militer (Enterprise Security) karena mengelola data santri, nilai, dan rekam jejak akademik yang bersifat sensitif dan permanen.

1. MIDDLEWARE AUDIT LOG GLOBAL (Forensics)
Seluruh aktivitas operasional sistem diawasi oleh `auditLogMiddleware.ts` yang terpasang di Hono API Server. 
- Middleware ini mencegat setiap HTTP Request berjenis `POST`, `PUT`, `PATCH`, dan `DELETE`.
- Middleware mencatat informasi:
  - Waktu eksekusi
  - Siapa yang melakukan (Actor / Person ID)
  - Modul / Rute yang dipanggil
  - Payload data sebelum (Before) dan sesudah (After) mutasi.
- Data ini disimpan dalam tabel Audit Logs di schema `security.ts`. Data audit bersifat *Append-Only* dan tidak dapat dihapus oleh siapa pun (termasuk Admin).

2. OTENTIKASI & MANAJEMEN SESI (Auth)
Sistem menggunakan otentikasi berbasis HTTP-Only Secure Cookies.
- Dilarang keras menggunakan `localStorage` untuk menyimpan Token Akses demi mencegah serangan XSS (Cross-Site Scripting).
- Skema otentikasi dikelola dalam `auth.ts` schema dan rute di `apps/web/src/server/routes/auth/`.
- CSRF Protection diterapkan dengan validasi origin ketat di jaringan Vercel Edge.

3. ROLE-BASED ACCESS CONTROL (RBAC) MUTLAK
Sistem mengidentifikasi user berdasarkan *Polymorphic Profiles* (`profiles.ts`).
Terdapat 6 level akses yang dijaga oleh fungsi `requireRole` dan `requireDataScope` di Backend:
- Sekretariat: Akses administratif terpusat.
- Mustahiq (Wali Kelas): Hanya bisa membaca/mengubah data santri di dalam ID Kelas miliknya (*Data Scope: CLASS*).
- Mufattisy (Pengawas): Read-only untuk seluruh aktivitas akademik.
- Mundzir (Pimpinan): Akses dashboard eksekutif.
- Wali Santri: Hanya bisa melihat data santri yang terkait dengan Nomor KK / Guardian ID-nya (*Data Scope: GUARDIAN*).
- Keamanan: Mengelola insiden pelanggaran santri.

Setiap pelanggaran batas akses akan otomatis mengembalikan respon `HTTP 403 Forbidden` dan dicatat di Audit Log sebagai percobaan ilegal.
