🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#06_SISTEM_KEHADIRAN_&_MATRIKS_KEDISIPLINAN (ATTENDANCE & DISCIPLINARY ENGINE)
Modul ini adalah mesin aktif yang mengintegrasikan kedisiplinan dan absensi langsung ke dalam Enjin Penilaian (Rapor) dan Kenaikan Kelas. Semuanya dirancang tanpa hardcode, terpusat, dan memiliki guardrail (sistem pengaman) yang sangat ketat.

1. MASTER JENIS PELANGGARAN (DINAMIS & TERPUSAT)
Berdasarkan aturan ## Master Jenis Pelanggaran.md, sistem dilarang keras mematok mati jenis pelanggaran di dalam kode. Seluruhnya dikelola secara dinamis oleh Administrator melalui Dashboard.

Struktur Skema Hierarki Pelanggaran (D1 Database):

Kategori Utama (violation_categories): Hanya boleh menggunakan kategori resmi yang disetujui: Adab, Ibadah, Administrasi, Perizinan, Kebersihan, Asrama, dan Keamanan.

Tingkat Keparahan (violation_severities): Hierarki mutlak yang terdiri dari: Ringan, Sedang, Berat, Sangat Berat.

Jenis Pelanggaran (violation_types): Entitas yang mengikat Kategori dan Tingkat Keparahan. Atribut mutlaknya meliputi: Nama Pelanggaran, Poin Pelanggaran (Opsional), Deskripsi, dan Status Aktif.

Aturan Soft-Delete Mutlak: Jika suatu jenis pelanggaran tidak lagi berlaku di MPHM, Administrator hanya bisa mengubah statusnya menjadi dinonaktifkan (isActive: false). Sistem API wajib menolak penghapusan permanen (DELETE) agar riwayat pelanggaran santri di tahun-tahun sebelumnya tidak rusak/hilang.

2. PEREKODAN INSIDEN (student_violations) & BUKTI CLOUDINARY
Berdasarkan 10_ENTERPRISE_DATA_ARCHITECTURE.md, setiap insiden pelanggaran yang dilakukan oleh santri dicatat dengan struktur rekaman yang detail dan menggunakan pipeline media yang terpisah sepenuhnya (decoupled).

Atribut Wajib Insiden: academicYearId, studentId, violationTypeId, incidentDate, incidentTime, location, description, reportedBy, dan status.

Bukti Pelanggaran (evidenceUrl): Jika pelapor/pengurus mengunggah bukti (seperti foto), file tersebut WAJIB diunggah menggunakan mekanisme Direct Signed Upload langsung ke Cloudinary. Database D1 hanya menyimpan URL Cloudinary-nya saja.

3. ALGORITMA "WORST-CASE TIER SHIFTING" (PENURUNAN PREDIKAT AKHLAQ)
Ini adalah jantung kedisiplinan yang berinteraksi langsung dengan Rapor. Nilai mata pelajaran Akhlaq (sebagai NON-MAPEL yang dibatasi maksimal di angka 8/80) akan menghasilkan Predikat Kualitatif (Jayyid Awwal, dll) di rapor.

Trigger Penalti Otomatis: Meskipun nilai ujian Akhlaq seorang santri sempurna, jika enjin sistem mendeteksi santri tersebut memiliki rekod pelanggaran pada tingkat "Sangat Berat" atau memiliki jumlah absensi "Alfa" yang melebihi batas kewajaran, sistem akan menjatuhkan (shift down) Predikat Kualitatif Akhlaq santri tersebut secara otomatis saat Generate Raport.

Override Traps Guard (Sistem Perangkap Manipulasi): Jika Mustahiq (Wali Kelas) mencoba mengubah manual predikat Akhlaq yang sudah dijatuhkan oleh sistem, API Hono wajib memblokir proses simpan tersebut, KECUALI Mustahiq mengisi kolom overrideReason (Alasan Perubahan).

Aturan Zod Validasi: Kolom overrideReason wajib diisi dengan minimal 15 karakter. Jika kurang, kembalikan HTTP 400 Validation Error. Semua intervensi ini direkam otomatis oleh sistem Audit Log.

4. MANAJEMEN KEHADIRAN (REKAP BULANAN HIJRIYYAH)
Berdasarkan kebijakan sistem terbaru, **tidak ada presensi harian**. Seluruh manajemen kehadiran santri menggunakan input rekap absensi setiap akhir bulan Hijriyyah.

Sistem Penguncian Absensi (Lock & Open Mechanism):
- Pengisian atau perubahan data absensi (Sakit, Izin, Alfa) pada suatu bulan Hijriyyah **dikunci sepenuhnya** oleh sistem.
- Sistem hanya akan membuka (unlock) form pengisian absensi jika tanggal kalender Hijriyyah saat ini berada pada **7 hari terakhir** bulan tersebut (yaitu mulai tanggal 23 ke atas).
- Mekanisme ini mencegah manipulasi dan kebocoran entri data absensi di luar masa rekapitulasi akhir bulan.

Status Kehadiran: Hanya mengakomodasi 3 status ketidakhadiran yaitu: Sakit, Izin, dan Alfa.

Data akumulasi ketidakhadiran ini akan disalurkan ke modul Kenaikan Kelas (Promotion Engine) sebagai prasyarat evaluasi pada akhir tahun.

5. UI/UX: PROFIL TERPADU 360° (COMMAND PALETTE)
Setiap pencarian melalui Global Command Palette (CTRL + K) akan membuka halaman Profil Terpadu 360° milik santri.

Halaman ini wajib memiliki Tab Riwayat Pelanggaran & Kedisiplinan.

Sistem antarmuka harus menampilkan garis waktu (activity timeline) menggunakan Universal Data Grid Standard.

Pelanggaran wajib ditampilkan dengan Pill Badges (kapsul) yang warnanya diambil langsung dari atribut badgeColor pada tabel violation_severities (contoh: Merah untuk Sangat Berat).