🌟 MASTER BLUEPRINT MPHM v4.0 (EKSPANSI FINAL)
BAB XIV: RAPORT, IJAZAH, & SERTIFIKAT I'DADIYYAH (DOCUMENT ENGINE)

Sistem pencetakan dokumen resmi MPHM tidak menggunakan generator statis kuno, melainkan menggunakan sistem Document Template Builder yang interaktif, dinamis, dan terintegrasi penuh dengan Assessment Engine. Seluruh kode komponen pencetakan ini terpusat di `apps/web/src/features/sekretariat/components/`.

1. THE DOCUMENT TEMPLATE BUILDER
Terletak di `apps/web/src/components/shared/DocumentTemplateBuilder.tsx`, antarmuka ini memberikan kontrol "seperti MS Word" secara langsung dari dalam browser bagi pihak Sekretariat.
- **TipTap WYSIWYG Editor**: Menggunakan TipTap untuk menghadirkan kanvas kertas berukuran A4 secara akurat.
- **Merge Tags / Variabel Pintar**: Mendukung penyisipan data otomatis (misal: `{{nama_santri}}`, `{{stambuk}}`, `{{tabel_nilai_arab}}`). Saat dicetak, tag ini otomatis digantikan dengan data riil dari basis data (Data Binding).
- **Integrasi Cloudinary Mutlak**: Penyisipan KOP Surat, Logo, atau Tanda Tangan akan diunggah langsung ke Cloudinary melalui Direct Signed Upload, sehingga tidak membebani server/Edge.

2. PENILAIAN & PEMBUATAN RAPORT (RaportTab.tsx)
Raport dihasilkan dengan menarik data agregasi dari `assessmentEngine.ts`.
- **Dual Semester**: Administrator dapat mencetak untuk Semester 1 (Kwartal 1 & 2) maupun Semester 2 (Kwartal 3 & 4).
- **Raport Formula Engine**: Rumus perhitungan akhir raport bisa diatur secara dinamis melalui formula matematika (misal: Rata-rata dari nilai Kwartal + Ujian).
- **Pencetakan Massal / Batch Printing**: Antarmuka `UniversalDataGrid` memfasilitasi filter per kelas dan fitur Cetak Raport langsung tanpa reload, menampilkan modal Print Preview yang mereplikasi presisi A4.

3. PEMBUATAN IJAZAH ALIYYAH (IjazahTab.tsx)
Ijazah merupakan dokumen kelulusan paripurna bagi santriwati Aliyyah.
- **Kondisi Akses Mutlak**: Ijazah hanya bisa dicetak untuk santri yang profilnya telah lulus (Alumni) dan menyelesaikan tingkat Aliyyah III.
- **Visual Design**: Dokumen didesain landscape dengan hiasan ornamen (arabesque) premium, menggunakan *typography* Serif klasik untuk memberikan kesan keagungan dan formalitas tingkat institusi.

4. SERTIFIKAT I'DADIYYAH & PENGHARGAAN (SertifikatTab.tsx)
I'dadiyyah adalah jenjang persiapan (1 tahun) tanpa sistem kenaikan tingkat konvensional. 
- Pada akhir tahun ajaran, sistem tidak mencetak Raport standar kenaikan, melainkan Sertifikat I'dadiyyah sebagai bukti penyelesaian masa orientasi.
- Templat Sertifikat I'dadiyyah, Tahfidz, dan Khidmah (Al-Robithoh) dapat disesuaikan lewat Template Builder, sehingga bentuknya bisa bervariasi setiap tahun tanpa perlu merombak *source code*.

5. KEAMANAN DOKUMEN & WATERMARK
- Dokumen dicetak dengan memanggil API untuk memastikan data (nama, nilai) tidak dimanipulasi pada *frontend memory*.
- Setiap dokumen penting mendukung integrasi QR Code (opsional) untuk validasi keaslian dokumen secara digital langsung ke portal verifikasi MPHM.
