# 🌟 MASTER BLUEPRINT MPHM v4.5 (PERMITS & VISITORS ENGINE)
## #15_SISTEM_PERIZINAN_SANTRI_&_MANAJEMEN_SAMBANGAN

Modul Sistem Perizinan dan Sambangan (`StudentPermit`) bertindak sebagai pusat kontrol operasional keluar-masuk santri serta kunjungan wali santri di Pondok Pesantren MPHM Enterprise.

---

## 1. ALUR PENGELOLAAN PERIZINAN (PERMIT WORKFLOW)
Sistem perizinan mengacu pada entitas `student_permits` dengan status transisi yang ketat:
1. **PENDING (Pengajuan)**: Dibuat oleh Pos Keamanan, Sekretariat Pondok, atau Wali Santri.
2. **APPROVED (Disetujui)**: Disetujui oleh Pimpinan/Mundzir atau Pengurus Asrama dengan mencatat ID Penyetuju (`approved_by_id`).
3. **REJECTED (Ditolak)**: Ditolak dengan menyertakan alasan tertulis pada kolom `notes`.
4. **COMPLETED (Selesai)**: Santri telah kembali ke asrama tepat waktu dan dikonfirmasi oleh Pos Keamanan.

---

## 2. KATEGORI PERIZINAN (`permit_type`)
- **PULANG**: Perizinan pulang ke rumah (Libur Semester, Acara Keluarga Darurat, Sakit).
- **SAMBANGAN**: Kunjungan wali santri di komplek pesantren untuk pengiriman bekal / tatap muka.
- **KELUAR**: Perizinan keluar komplek singkat (Ke Dokter, Keperluan Bank, Perlengkapan Diniyyah).

---

## 3. SPESIFIKASI API ENDPOINT CRUD
- `GET /api/disciplinary/permits`: Mengambil daftar perizinan dengan filter `status` & `permitType`.
- `POST /api/disciplinary/permits`: Membuat pengajuan izin baru (Payload: `studentId`, `permitType`, `reason`, `startDate`, `endDate`, `notes`).
- `PUT /api/disciplinary/permits/[id]`: Memperbarui status perizinan (`status`, `approvedById`, `notes`).
- `DELETE /api/disciplinary/permits/[id]`: Menghapus data perizinan secara *soft delete* (`deleted_at`).

---

## 4. INTEGRASI DASHBOARD POS KEAMANAN & PIMPINAN
- Dashboard Keamanan (`/keamanan/jurnal`) dapat mencari data perizinan aktif secara realtime untuk memverifikasi keabsahan santri yang berada di pintu gerbang.
- Dashboard Pimpinan (`/pimpinan/perizinan`) dapat menyetujui atau menolak perizinan dalam 1-klik dengan umpan balik audit log otomatis.
