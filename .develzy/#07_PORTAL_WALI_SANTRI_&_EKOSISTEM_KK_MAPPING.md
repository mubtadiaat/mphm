# 🌟 MASTER BLUEPRINT MPHM v4.5 (ULTIMATE EDITION)
## #07_PORTAL_WALI_SANTRI_&_EKOSISTEM_KK_MAPPING (GUARDIAN PORTAL)

Portal Wali Santri dirancang bukan sebagai aplikasi terpisah, melainkan sebagai ekosistem Read-Only 360° Dashboard yang terintegrasi langsung ke Pusat Data Abadi. Sistem pendaftarannya mengusung Smart KK Mapping Engine untuk menghilangkan pendaftaran manual berulang bagi orang tua yang memiliki lebih dari satu anak di MPHM.

---

## 1. ALGORITMA "SMART KK MAPPING ENGINE"
Aturan pendaftaran Wali Santri wajib mematuhi skema otomasi keluarga.
- **Syarat Pendaftaran**: Wali Santri WAJIB mendaftarkan diri menggunakan 3 parameter utama: Nama, Nomor WhatsApp (WA), dan Nomor KK (Kartu Keluarga).
- **Nomor KK**: Setiap Wali Santri bisa membawahi lebih dari satu siswi berdasarkan Kartu Keluarganya.
- **Contoh Kasus Mutlak**: Jika santri bernama Fatimah memiliki Nomor Induk Keluarga (Nomor KK) yang sama dengan santri bernama Zahro, maka Wali Santri cukup mendaftar SATU KALI menggunakan Nomor KK tersebut.
- **Hasil Otomasi**: Setelah berhasil masuk (Login), Dashboard Wali Santri secara otomatis memunculkan kedua siswi/santriwati tersebut di layar utama tanpa verifikasi manual.

---

## 2. AUTOMATIC ORPHANED GUARDIANS CLEANUP (`cleanOrphanedGuardians`)
- **Pembersihan Otomatis Akun & Data Wali Yatim**:
  Ketika data santri dihapus atau di-*purge* dari database, sistem secara otomatis mengeksekusi helper `cleanOrphanedGuardians`.
- **Mekanisme Kerja**:
  1. Sistem memeriksa seluruh Wali (`GuardianProfile`) yang terikat dengan santri yang dihapus.
  2. Sistem melakukan pengecekan silang apakah Wali tersebut masih memiliki anak/santri aktif lain yang terdaftar di database.
  3. **Jika Wali tidak lagi memiliki santri aktif**, sistem secara otomatis melakukan *soft-delete* (`deletedAt: new Date()`) pada profil `GuardianProfile`, akun login `UserAccount`, dan data individu `Person` milik Wali tersebut.
  4. Mencegah akumulasi data sampah (*garbage data*) di database terenkripsi Neon.

---

## 3. VISIBILITAS DATA MUTLAK (DATA SCOPE AUTHORIZATION)
Berdasarkan System Rule #02, arsitektur keamanan memberlakukan pembatasan ruang lingkup data (Data Scope Authorization) secara absolut:
- Wali Santri HANYA BISA melihat data anak kandung/anak asuh yang terikat dengan Nomor KK yang didaftarkannya.
- API Backend akan langsung menolak (HTTP 403 Forbidden) jika request mencoba mengakses ID Santri yang berada di luar lingkup KK-nya.

---

## 4. ANTARMUKA PORTAL: "READ-ONLY 360° DASHBOARD"
Akun Wali Santri bersifat Eksklusif Read-Only (Hanya Baca). Wali santri tidak memiliki akses untuk melakukan operasi ubah (Update/Delete) data apa pun.
- **Biodata & Kelas Saat Ini**: Profil santri, Jenjang, Tingkat, Bagian, Mustahiq (Wali Kelas), dan status aktif.
- **Rekam Jejak Kehadiran (Absensi)**: Matriks persentase kehadiran per sesi.
- **Catatan Akhlaq & Kedisiplinan**: Data pelanggaran real-time dengan antarmuka timeline.
- **Grafik & Riwayat Nilai / Rapor**: Laporan agregat nilai per Kwartal.

---

## 5. ARSITEKTUR DATABASE RELASI (PRISMA ORM NEON POSTGRES)
- Entitas wali disimpan dalam tabel inti `people`, dengan peran terikat pada tabel `guardian_profiles`.
- Tabel `guardian_profiles` wajib memiliki kolom `family_card_number` (Nomor KK).
- Endpoint login Wali Santri melakukan pencarian silang: mencari semua baris di `student_profiles` yang berelasi dengan tabel `people` (anak) yang memiliki atribut Nomor KK yang sama dengan `family_card_number` milik wali.