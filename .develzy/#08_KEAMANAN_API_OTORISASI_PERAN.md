🌟 MASTER BLUEPRINT MPHM v4.5 (ULTIMATE EDITION)
#08: OTORISASI HAK AKSES (RBAC), KEAMANAN, & GLOBAL REALTIME AUDIT TRAIL

Keamanan, otorisasi, dan forensik data pada ekosistem MPHM v4.5 diimplementasikan secara terpusat di tingkat lapisan Backend API Gateway. Kebijakan ini memastikan bahwa seluruh operasi baca dan tulis (read/write) divalidasi sebelum mengeksekusi perintah ke basis data terenkripsi.

---

## 1. MANAJEMEN SESI & PERAN RESMI (RBAC SYSTEM)
Sistem menggunakan Session Authentication berbasis HttpOnly Cookie & JWT Token Sesi.

**Spesifikasi Keamanan Cookie (Strict Flag):**
- **HttpOnly: true** (Mencegah skrip frontend membaca token sesi).
- **Secure: true** (Wajib dilewatkan hanya melalui jaringan HTTPS murni pada domain `https://m.p3hm.my.id`).
- **SameSite: Strict** (Mencegah serangan Cross-Site Request Forgery / CSRF).

---

## 2. STRICT SDM MENU ISOLATION (ISOLASI MENU EKSEKUTIF & DEWAN)
Untuk menjaga kerapian administratif dan integritas peran, API Server (`/api/admin/people?role=pengurus`) secara mutlak memisahkan data personel:
- **Dewan Harian & Dewan Pleno:** Menggunakan filter eksplisit server-side:
  - `EXCLUDE: Mundzir`
  - `EXCLUDE: Mufattisy / Mufatish`
  - `EXCLUDE: Mustahiq / Wali Kelas`
- **Menu Terisolasi 100%:**
  - `/sekretariat/mundzir`: Khusus menampilkan Dewan Harian Mundzir.
  - `/sekretariat/mufattisy`: Khusus menampilkan Inspektorat Mufattisy.
  - `/sekretariat/mustahiq`: Khusus menampilkan Dewan Pengajar Mustahiq.
  - `/sekretariat/pengurus-madrasah` & `/sekretariat/dewan-pleno`: Khusus untuk Pengurus Eksekutif (Ketua, Sekretaris, Bendahara, IT, Keamanan, dst.).

---

## 3. PUSAT PENGELOLAAN AKUN (USERS) & 4 SUB-MENU RESMI
Modul `/sekretariat/users` menyediakan 4 Sub-Menu Utama:

1. **Daftar Akun (Monitoring):** Monitoring seluruh akun pengguna terdaftar beserta status keaktifan & status online.
2. **Generate Akun Instansi:** Generator kredensial massal dengan **Deteksi Role Otomatis (`⭐ Otomatis`)**.
   - Sistem membaca `OrganizationMembership` & `TeacherProfile` untuk menentukan role secara presisi (Mustahiq, Mufattisy, Mundzir, atau Pengurus Harian).
   - Lay-out Tabel: `Nama Lengkap | Jabatan (Jabatan/Jenjang/Tingkat) | Pilih Role Akun (Otomatis) | No. WhatsApp`.
3. **Keranjang Sampah Dorman (>6 Bulan):** Isolasi otomatis bagi akun tidak login >6 bulan.
4. **Wali Santri (Yang Sudah Mendaftar):** Sub-menu khusus monitoring & pengelolaan akun Wali Santri / Orang Tua murid terdaftar.

---

## 4. DATA SCOPE AUTHORIZATION INTERCEPTOR
Sistem menerapkan Data Scope Authorization secara absolut:
- **Mustahiq Scope Lock:** Mustahiq secara otomatis terikat pada kelas miliknya per Tahun Ajaran.
- **Wali Santri Scope Lock:** Akun Wali Santri dikunci murni berbasis parameter NIK / Nomor KK (`family_card_number`).

---

## 5. AUTOMATED FORENSICS AUDIT LOG ENGINE (BEFORE/AFTER PATTERN)
Setiap operasi manipulasi data (POST, PUT, DELETE) dicegat secara otomatis oleh Audit Log Engine:
- **userId & userRole** (Identitas eksekutor).
- **module** (Nama fitur).
- **action** (INSERT, UPDATE, DELETE).
- **beforeData & afterData** (Kondisi JSON data sebelum dan sesudah mutasi).