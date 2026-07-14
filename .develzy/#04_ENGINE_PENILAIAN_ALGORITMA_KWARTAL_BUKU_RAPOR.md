# 🌟 MASTER BLUEPRINT MPHM v4.0 (ULTIMATE EDITION)

# 04_ENGINE_PENILAIAN_ALGORITMA_KUARTAL_BUKU_RAPOR (CORE ASSESSMENT ENGINE)

## Modul Mesin Penilaian Akademik

Modul Penilaian bukan sekadar formulir input data (CRUD) biasa, melainkan merupakan **mesin pemrosesan akademik berperforma tinggi** yang mengimplementasikan seluruh **aturan mutlak penilaian Pesantren MPHM**.

Seluruh proses perhitungan nilai, agregasi total, pemeringkatan (ranking), validasi aturan akademik, serta logika bisnis wajib diproses **sepenuhnya di sisi Backend (Cloudflare Workers)** untuk menjamin integritas data, menjaga konsistensi perhitungan, serta mencegah manipulasi dari sisi Frontend.

Frontend hanya bertugas sebagai media input dan tampilan hasil, sedangkan seluruh keputusan akademik merupakan hasil komputasi Backend.

---

# 1. STRUKTUR WAKTU PENILAIAN (ALGORITMA 4 KUARTAL)

Dalam satu Tahun Ajaran, sistem penilaian dibagi menjadi **empat periode tetap (Kuartal)**.

### Kuartal 1

**Tamrin Semester I**

### Kuartal 2

**Ujian Semester I**

Menjadi dasar penyusunan **Buku Rapor Semester Ganjil**.

### Kuartal 3

**Tamrin Semester II**

### Kuartal 4

**Ujian Semester II**

Menjadi dasar penyusunan:

- Buku Rapor Semester Genap
- Penentuan Kenaikan Kelas
- Rekapitulasi Nilai Tahunan

---

### Aturan Input Nilai (Rule #EV-01)

Wali Kelas (Mustahiq) memasukkan **Nilai Asli** sesuai hasil penilaian.

Sistem wajib mendukung angka desimal, misalnya:

- 6,5
- 7,5
- 8,5
- 9,25

Sistem **dilarang melakukan pembulatan otomatis (rounding)** pada saat proses input.

Nilai harus disimpan sesuai angka asli yang dimasukkan dan hanya diproses sesuai kebutuhan perhitungan akademik.

---

# 2. HUKUM MUTLAK 5 MATA PELAJARAN (THE SACRED GUARD)

Terdapat **lima mata pelajaran khusus** yang memiliki aturan penilaian berbeda dari mata pelajaran lainnya.

Kelima mata pelajaran tersebut adalah:

1. Al-Qur'an
2. Al-Khoth / Al-Imla'
3. Qiro'ah al-Kutub
4. Al-Muhafadhoh
5. Akhlaq

Kelima mata pelajaran tersebut memperoleh perlakuan khusus dalam sistem akademik.

---

## Ketentuan Validasi Sistem (Strict API Guard)

### Batas Maksimum Nilai = 8 (Hard Limit)

Untuk kelima mata pelajaran di atas, nilai maksimal yang diperbolehkan adalah:

**8**

Backend wajib menolak setiap data yang melebihi angka tersebut.

Contoh nilai yang harus ditolak:

- 8,5
- 9
- 9,5
- 10

Apabila ditemukan nilai di atas 8, Backend wajib mengembalikan respons:

**HTTP 400 – Bad Request**

Validasi dilakukan pada Middleware Zod sehingga data yang tidak valid tidak pernah masuk ke basis data.

---

### Mata Pelajaran Selain Lima Mapel Khusus

Seluruh mata pelajaran selain lima mapel khusus menggunakan ketentuan berikut:

- Nilai maksimum = 10
- Tidak ada batas minimum khusus
- Nilai mengikuti hasil ujian sebenarnya sesuai ketentuan akademik

---

# 3. MESIN PERHITUNGAN RANKING (RANKING ELIMINATION ENGINE)

Pada saat sistem menghitung **Total Nilai** untuk menentukan **Peringkat (Ranking)** di dalam kelas, sistem **secara otomatis mengeluarkan lima mata pelajaran khusus dari proses perhitungan ranking**.

Kelima mata pelajaran tersebut tetap tampil pada rapor, namun **tidak ikut dihitung dalam penentuan peringkat kelas**.

---

## Algoritma Perhitungan Ranking

```
Total Ranking

=

Total Seluruh Nilai

-

(
Nilai Al-Qur'an
+
Nilai Al-Khoth / Al-Imla'
+
Nilai Qiro'ah al-Kutub
+
Nilai Al-Muhafadhoh
+
Nilai Akhlaq
)
```

Dengan demikian, hanya mata pelajaran umum seperti:

- Fath al-Mubin
- Al-Ajurrumiyah
- Sullam at-Taufiq
- dan seluruh mata pelajaran lainnya

yang digunakan sebagai dasar menentukan:

- Peringkat 1
- Peringkat 2
- Peringkat 3
- dan seterusnya dalam satu rombongan belajar (kelas).

Seluruh proses ini dijalankan sepenuhnya di Backend.

---

# 4. WORST-CASE TIER SHIFTING (ALGORITMA PREDIKAT AKHLAQ)

Predikat Akhlaq tidak hanya ditentukan berdasarkan nilai akademik pada lembar penilaian.

Sistem akan melakukan integrasi otomatis dengan:

- Data Kehadiran (Attendance)
- Data Pelanggaran Santri (Student Violations)

untuk menentukan predikat akhir.

---

## Mekanisme Penalti Otomatis

Apabila seorang santri memperoleh nilai Akhlaq yang tinggi, tetapi sistem mendeteksi salah satu kondisi berikut:

- memiliki catatan Pelanggaran Sangat Berat;
- memiliki jumlah ketidakhadiran tanpa keterangan (Alfa) yang tinggi; atau
- memenuhi kriteria pelanggaran disiplin tertentu,

maka sistem akan secara otomatis **menurunkan predikat Akhlaq akhir (Tier Shifting)**.

Contoh:

Nilai Akhlaq:

**Jayyid Awwal**

dapat berubah menjadi:

**Jayyid Tsani**

atau

**Maqbul**

sesuai matriks penalti yang telah ditentukan.

---

## Perlindungan dari Manipulasi (Trap Guard)

Apabila Wali Kelas mencoba mengubah secara manual hasil penurunan predikat tersebut, sistem tidak akan langsung menerima perubahan.

Backend akan mewajibkan pengisian kolom:

**overrideReason**

dengan ketentuan:

- minimal 15 karakter;
- wajib menjelaskan alasan perubahan secara lengkap; dan
- seluruh aktivitas perubahan akan dicatat ke dalam Audit Log sehingga dapat ditelusuri kembali.

---

# 5. KOMPONEN UI/UX (3D ADAPTIVE SPREADSHEET)

Antarmuka input nilai dirancang menyerupai aplikasi spreadsheet modern agar memudahkan Wali Kelas mengelola nilai puluhan santri secara cepat, responsif, dan efisien.

---

## Pemisahan Visual Mata Pelajaran

Kolom untuk lima mata pelajaran khusus diberikan tampilan berbeda, misalnya:

- latar belakang berwarna emas lembut (subtle gold/amber);
- garis pemisah visual; atau
- indikator khusus yang membedakannya dari mata pelajaran umum.

Apabila pengguna mengetik angka **9** pada kolom Al-Qur'an, maka sistem akan:

- langsung mengubah kolom menjadi merah;
- memberikan animasi getaran menggunakan Framer Motion;
- menampilkan pesan validasi;
- mengembalikan nilai menjadi **8** atau mengosongkan kolom sesuai konfigurasi sistem.

---

## Auto Save Buffer Matrix (Debounced Ingestion)

Sistem **tidak menyediakan tombol "Simpan Semua"**.

Setiap selesai mengetik sebuah nilai, sistem akan:

1. menahan data selama **500 milidetik (500 ms)**;
2. mengirimkan data secara otomatis ke Backend;
3. menyimpan data tanpa tindakan tambahan dari pengguna.

Pada bagian sudut layar akan ditampilkan indikator status berbentuk ikon Cloud 3D yang berubah secara otomatis:

- **Menyimpan...**
- **Tersimpan**

Hal ini memastikan pengalaman penggunaan tetap cepat tanpa risiko kehilangan data.

---

# 6. KEPATUHAN TERMINOLOGI (ZERO SHORTCUT RULE)

Sistem **dilarang keras menggunakan singkatan teknis** baik pada antarmuka pengguna (UI) maupun pada hasil cetak Buku Rapor PDF.

## Istilah yang Dilarang

- K1
- K2
- K3
- K4
- S1
- U1
- U2
- Smt 1
- Smt 2

## Istilah yang Wajib Digunakan

- Kuartal 1
- Kuartal 2
- Kuartal 3
- Kuartal 4
- Tamrin Semester I
- Ujian Semester I
- Tamrin Semester II
- Ujian Semester II
- Semester Ganjil
- Semester Genap

Seluruh tampilan antarmuka, laporan, dokumen PDF, ekspor data, serta komunikasi resmi sistem wajib menggunakan terminologi lengkap tanpa singkatan agar konsisten dengan standar akademik Pesantren MPHM.
