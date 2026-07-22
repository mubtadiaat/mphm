🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#07_PORTAL_WALI_SANTRI_&_EKOSISTEM_KK_MAPPING(GUARDIAN PORTAL)
Portal Wali Santri dirancang bukan sebagai aplikasi terpisah, melainkan sebagai ekosistem Read-Only 360° Dashboard yang terintegrasi langsung ke Pusat Data Abadi. Sistem pendaftarannya mengusung Smart KK Mapping Engine untuk menghilangkan pendaftaran manual berulang bagi orang tua yang memiliki lebih dari satu anak di MPHM.

1. ALGORITMA "SMART KK MAPPING ENGINE"
Aturan pendaftaran Wali Santri wajib mematuhi skema otomasi keluarga.

Syarat Pendaftaran: Wali Santri WAJIB mendaftarkan diri menggunakan 3 parameter utama: Nama, Nomor WhatsApp (WA), dan Nomor KK (Kartu Keluarga).

Alasan Penggunaan Nomor KK: Setiap Wali Santri bisa membawahi lebih dari satu siswi berdasarkan Kartu Keluarganya.

Contoh Kasus Mutlak: Jika santri bernama Fatimah memiliki Nomor Induk Keluarga (Nomor KK) yang sama dengan santri bernama Zahro, maka Wali Santri cukup mendaftar SATU KALI menggunakan Nomor KK tersebut.

Hasil Otomasi: Setelah berhasil masuk (Login), Dashboard Wali Santri akan secara otomatis memunculkan kedua siswi/santriwati tersebut di layar utama, tanpa memerlukan verifikasi admin yang berbelit-belit.

2. VISIBILITAS DATA MUTLAK (DATA SCOPE AUTHORIZATION)
Berdasarkan System Rule #02, arsitektur keamanan memberlakukan pembatasan ruang lingkup data (Data Scope Authorization) secara absolut:

Wali Santri HANYA BISA melihat data anak kandung/anak asuh yang terikat dengan Nomor KK yang didaftarkannya.

API Backend Hono akan langsung menolak (HTTP 403 Forbidden) jika request mencoba mengakses ID Santri yang berada di luar lingkup KK-nya.

3. ANTARMUKA PORTAL: "READ-ONLY 360° DASHBOARD"
Akun Wali Santri bersifat Eksklusif Read-Only (Hanya Baca). Wali santri tidak memiliki akses untuk melakukan operasi ubah (Update/Delete) data apa pun. Saat Wali Santri memilih salah satu anaknya (misal memilih tab "Fatimah"), portal akan menyajikan fitur komprehensif berikut:

Biodata & Kelas Saat Ini: Menampilkan profil santri, Jenjang, Tingkat, Bagian, nama Mustahiq (Wali Kelas), dan status aktif (Active/Khidmah/Graduated).

Rekam Jejak Kehadiran (Absensi): Menampilkan matriks persentase kehadiran (Sakit, Izin, Alfa) per sesi (Hissoh Ula & Hissoh Tsani).

Catatan Akhlaq & Kedisiplinan: Mengambil data langsung dari Disciplinary Engine, menampilkan grafik aktivitas dan riwayat pelanggaran anak menggunakan antarmuka timeline (Garis Waktu). Jika anak melakukan pelanggaran, rinciannya langsung terlihat di sini secara real-time.

Grafik & Riwayat Nilai / Rapor: Menampilkan laporan agregat nilai per Kwartal. Angka pelajaran berjenis NON-MAPEL wajib dikunci maksimal angka 8 (atau 80) pada visualisasinya, serta memunculkan Predikat Akhlaq secara visual.

4. ARSITEKTUR DATABASE RELASI (D1 DRIZZLE)
Relasi Person-Centric di Backend dipetakan secara ketat untuk menopang KK Mapping Engine:

Entitas wali disimpan dalam tabel inti people, dengan peran terikat pada tabel guardian_profiles.

Tabel guardian_profiles wajib memiliki kolom family_card_number (Nomor KK).

Endpoint login Wali Santri akan melakukan pencarian silang: mencari semua baris di student_profiles yang berelasi dengan tabel people (anak) yang memiliki atribut Nomor KK yang sama dengan family_card_number milik wali.