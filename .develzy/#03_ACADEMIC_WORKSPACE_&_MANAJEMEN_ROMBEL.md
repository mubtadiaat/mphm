🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)
#03_ACADEMIC_WORKSPACE_&_MANAJEMEN_ROMBEL (CORE ACADEMIC ENGINE)
Pusat gravitasi dari seluruh operasional sistem MPHM adalah Tahun Ajaran. Sistem ini membuang desain "Tabel Kelas" tradisional dan beralih ke arsitektur Academic Workspace layaknya platform SaaS Enterprise, di mana setiap Tahun Ajaran adalah ruang kerja tertutup yang terisolasi.

1. FILOSOFI "ACADEMIC WORKSPACE" (ISOLASI DATA MUTLAK)
Tidak ada data transaksional (Rapor, Nilai, Absensi, Pelanggaran, Penempatan Kelas, Jadwal) yang beredar bebas tanpa terikat pada suatu academic_year_id.

Isolasi Histori: Jika Administrator melihat Tahun Ajaran 2025/2026, maka seluruh antarmuka, dropdown siswa, list Mustahiq, dan tabel hanya akan menampilkan data spesifik di tahun tersebut.

Mencegah Kebocoran Cache: Di Frontend (Next.js), TanStack Query Keys wajib menyertakan academicYearId di ujung array key-nya (cth: ['students', 'enrollment', academicYearId]) agar pergantian Tahun Ajaran seketika me-reset layar tanpa data yang "nyangkut".

2. HIRARKI MUTLAK & MASTER DATA PERMANEN
Sistem akademik MPHM sangat spesifik. Urutan mutlaknya adalah:
Tahun Ajaran ➔ Semester ➔ Jenjang ➔ Tingkat ➔ Kelas/Bagian ➔ Jadwal & Nilai

Aturan Emas (System Rule #AC-01): Jenjang dan Tingkat BUKAN tabel database dinamis. Keduanya adalah Data Permanen (Hardcoded Constants / Enums / Zod Schemas) di dalam sistem. Administrator tidak boleh melakukan CRUD (Tambah/Hapus) pada Jenjang dan Tingkat.

Berikut adalah ketetapan sistematisnya:

I'dadiyyah: Tingkat I, II, III. (Aturan Khusus: Masa pendidikan 1 tahun penuh, tanpa kenaikan tingkat. Hanya sekadar pembagian kelompok).

Ibtida'iyyah: Tingkat I, II, III, IV, V, VI. (Masa pendidikan 6 tahun).

Tsanawiyyah: Tingkat I, II, III. (Masa pendidikan 3 tahun).

Aliyyah: Tingkat I, II, III. (Masa pendidikan 3 tahun).

Al-Robithoh: Khidmah/Mengabdi purna-Aliyyah. (Masa pendidikan 1 tahun).

3. IDENTITAS KELAS OTOMATIS & MANAJEMEN ROMBEL
Pembuatan entitas Kelas (academic_classes) dirancang cerdas agar terstandarisasi dan mencegah kesalahan ketik (typo) oleh operator.

Auto-Generated Naming: Administrator HANYA memilih Jenjang, Tingkat, dan mengetikkan "Bagian" (Contoh: A, B, Tahfidz). Sistem akan otomatis menggabungkannya menjadi identitas resmi yang dikunci: "Tsanawiyyah I-A".

Aturan Satu Mustahiq (Wali Kelas): * Satu kelas aktif HANYA memiliki 1 Mustahiq.

Satu Mustahiq HANYA boleh memegang 1 kelas aktif per Tahun Ajaran (Kecuali dilakukan bypass khusus oleh Super Admin). Mustahiq dikaitkan langsung melalui teacher_profiles.id.

Soft Delete Policy: Penghapusan Kelas berstatus aktif menggunakan Soft Delete (mengubah deletedAt). Data Nilai, Absensi, dan Jadwal yang sudah melekat di kelas tersebut tetap aman dan tidak ikut terhapus.

4. ENGINE PENEMPATAN SANTRI (BATCH ENROLLMENT)
Bagaimana santri masuk ke dalam kelas? Melalui tabel persimpangan class_enrollments.

Batch Assignment UI: Antarmuka khusus berupa Dual-List Transfer (layaknya sistem enterprise). Sebelah kiri adalah daftar santri berstatus Active yang "Belum Memiliki Kelas di Tahun Ini". Sebelah kanan adalah "Keranjang Kelas Tujuan".

Kapasitas Rombel Guard: Setiap kelas memiliki parameter capacity (misal maksimal 35). Sistem akan menolak drag-and-drop santri jika melebihi batas.

Historical Append-Only: Jika santri pindah kelas di tengah tahun, status enrollment di kelas lama diubah menjadi MOVED/DROPPED, dan sistem membuat baris enrollment baru di kelas baru. Jejak perpindahannya terlihat permanen di database.

5. MANAJEMEN JADWAL PESANTREN (HISSOH ULA & TSANI)
Jadwal di MPHM tidak mengikuti format sekolah umum. Modul jadwal dirancang mengikuti jam Pesantren (Struktur_Jadwal_Pendidikan_MPHM.md).

Slot Waktu Spesifik: Jadwal dipisahkan secara struktural menjadi dua sesi krusial:

Hissoh Ula (Sesi 1): Umumnya 07.00 - 08.00 (atau menyesuaikan).

Hissoh Tsani (Sesi 2): Setelah jeda kitab.

Target Jadwal Fleksibel (Inheritance): Jadwal dapat diterapkan pada level "Tingkat" atau "Kelas". Jika Administrator menerapkan "Mata Pelajaran Fathul Mubin pada Hari Sabtu Hissoh Ula untuk Tingkat Tsanawiyyah I", maka otomatis Lokal A, B, C, D, dst di tingkat tersebut mewarisi jadwal yang sama, tanpa perlu diinput manual satu per satu.

6. TRANSISI TAHUN AJARAN (CLONE WORKSPACE ALGORITHM)
Setiap pergantian tahun (misal dari 2025/2026 ke 2026/2027), sistem menggunakan fitur "Clone Academic Year". Ini dijalankan melalui Background Job via Vercel.

Yang OTOMATIS DISALIN (Copied): Struktur Kelas (Jenjang, Tingkat, Bagian), Kurikulum Mata Pelajaran, Jadwal Mingguan, dan Penugasan Wali Kelas (bisa dicentang opsional).

Yang DITINGGALKAN (Not Copied - Clean Slate): Data Siswi (Enrollment dikosongkan untuk diisi melalui Modul Kenaikan Kelas), Data Nilai, Raport, Absensi, dan Jurnal Pelanggaran. Ruang kerja baru benar-benar bersih dan siap menampung hasil eksekusi dari Promotion Engine (Mesin Kenaikan Kelas).