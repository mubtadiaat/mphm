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
1. **Penyimpanan Object/Array**: Konfigurasi kompleks (seperti daftar tabel kustom `custom_tables_registry`, visibilitas kolom `col_vis_*`, konfigurasi menu peran `system_role_ui_configs`, daftar jabatan structural `job_titles_*`, dan parameter matematis `math_formulas`) diserialisasi menjadi JSON String murni (`JSON.stringify`) saat disimpan via `PUT /api/settings`.
2. **Deserialisasi Otomatis**: Saat dibaca via `GET /api/settings`, handler API secara otomatis mendeteksi format JSON dan melakukan `JSON.parse`, sehingga mengembalikan struktur data asli.
3. **Penyimpanan Ganda (DB ➔ LocalStorage Sync)**: Konfigurasi disimpan ke database terenkripsi, kemudian di-sync ke `localStorage` browser untuk akses instan tanpa latensi di UI.

---

## 2. MODUL KONTROL DI SYSTEM SETTINGS COCKPIT
`SystemSettingsCockpit` menyediakan 9 tab kontrol terpusat:
1. **Tampilan & Modul**: Visibilitas modul Mustahiq, Wali Santri, Pos Keamanan, dan Mufattisy.
2. **Hak Akses & Otorisasi**: Kontrol izin override catatan akhlaq, pengajuan izin wali, approval mufattisy, dan eskalasi keamanan.
3. **Parameter & Keamanan**: Mode pemeliharaan (*systemMaintenance*), enforce HTTPS, SSO Active, dan Cookie Lifetime.
4. **Tabel Kustom & Menu**: Dynamic custom tables builder (`custom_tables_registry`) persisten ke database.
5. **Manajemen Peran & UI**: Kustomisasi menu aktif per role (`system_role_ui_configs`).
6. **Jabatan Struktural**: Pengelolaan daftar jabatan Mundzir (`job_titles_mundzir`) dan Pengurus (`job_titles_pengurus`).
7. **Master Pelanggaran**: Pengelolaan kategori, tingkat keparahan (*severity*), dan poin pelanggaran.
8. **Integrasi API Wilayah**: Konfigurasi provider API wilayah Indonesia & Binderbyte API Key.
9. **Parameter Matematis**: Formula pembobotan nilai kwartal dan batas maksimum nilai akhlaq (*Holy Guard Limit*).
