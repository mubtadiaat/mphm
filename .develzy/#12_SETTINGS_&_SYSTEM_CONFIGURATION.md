# 🌟 MASTER BLUEPRINT MPHM v4.5 (COCKPIT CONFIGURATION ENGINE)
## #12_SETTINGS_&_SYSTEM_CONFIGURATION

Modul Konfigurasi & Parameter Sistem (`SystemSettingsCockpit`) bertanggung jawab atas kontrol operasional global yang memengaruhi seluruh modul di MPHM Enterprise. Seluruh konfigurasi disimpan secara persisten di basis data pada tabel `system_settings` dan disinkronisasi melalui API `/api/settings` (GET & PUT).

---

## 1. ARSITEKTUR PERSISTENSI DATABASE & SERIALISASI JSON
Seluruh pengaturan sistem disimpan dalam format Key-Value pada tabel `system_settings`:

```prisma
model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @default(now()) @map("updated_at")

  @@map("system_settings")
}
```

### Aturan Serialisasi JSON (JSON Serialization Standard):
1. **Penyimpanan Object/Array**: Konfigurasi kompleks (seperti daftar tabel kustom `custom_tables_registry`, visibilitas kolom `col_vis_*`, konfigurasi menu peran `system_role_ui_configs`, daftar jabatan struktural `job_titles_*`, dan parameter matematis `math_formulas`) diserialisasi menjadi JSON String murni (`JSON.stringify`) saat disimpan via `PUT /api/settings`.
2. **Deserialisasi Otomatis**: Saat dibaca via `GET /api/settings`, handler API secara otomatis mendeteksi format JSON dan melakukan `JSON.parse`, sehingga mengembalikan struktur data asli.
3. **Penyimpanan Ganda (DB ➔ LocalStorage Sync)**: Konfigurasi disimpan ke database terenkripsi, kemudian di-sync ke `localStorage` browser untuk akses instan tanpa latensi di UI.

---

## 2. RE-ARCHITECTED USER-FRIENDLY COCKPIT (4 KATEGORI & 10 SUB-TAB)
`SystemSettingsCockpit.tsx` dikelompokkan ke dalam 4 kategori navigasi yang ramah bagi sekretaris baru:

### A. MODUL & OTORISASI
1. **Tampilan & Modul (`visibility`)**: Visibilitas modul operasional (Mustahiq, Wali Santri, Keamanan, Mufattisy).
2. **Hak Akses & Otorisasi (`permissions`)**: Izin khusus seperti override nilai, pengajuan perizinan wali, dan eskalasi.

### B. PERAN & HIRARKI
3. **Peran & Tampilan UI (`roles`)**: Navigasi khusus dan penyesuaian UI per role (`system_role_ui_configs`).
4. **Jabatan Struktural (`job_titles`)**: Pengelolaan daftar jabatan Pengurus Pondok, Pengurus Madrasah, Mundzir, dan Mustahiq.

### C. ATURAN & INTEGRASI
5. **Parameter & Sesi Keamanan (`security`)**: Status pemeliharaan sistem (*maintenance mode*), Enforce HTTPS, SSO, dan Cookie Lifetime.
6. **API Wilayah Indonesia (`region_api`)**: Konfigurasi API Wilayah Kemendagri & Binderbyte API Key.
7. **Master Pelanggaran & Takzir (`master_pelanggaran`)**: Kategori pelanggaran, poin kedisiplinan, dan tindakan takzir.
8. **Parameter Matematis & KKM (`math_formula`)**: Formula pembobotan nilai kwartal dan KKM Diniyyah.
9. **Tabel Kustom Dynamic (`custom_tables`)**: Pembuat tabel data tambahan yang tersimpan persisten.

### D. PEMELIHARAAN DATA
10. **Pembersihan Data Masal (`purge_data`)**: Pembersihan data berkala dan reset log.

---

## 3. STANDAR ANTARMUKA USER-FRIENDLY (GUIDE CARDS & STATUS BADGES)
- **`FriendlyGuideCard`**: Setiap sub-tab dilengkapi kartu petunjuk penggunaan berbahasa Indonesia yang jelas, ringkas, dan disertai langkah-langkah praktis.
- **`FriendlySwitch`**: Sakelar kontrol dilengkapi lencana indikator status tebal yang kontras: `[ AKTIF ]` (Hijau) dan `[ NON-AKTIF ]` (Zinc Grey).
- **Banner Eksekusi Terpusat**: Tombol **"Simpan Seluruh Konfigurasi"** dipasang di bagian atas layar dengan animasi *spin loading* saat melakukan sinkronisasi database.
