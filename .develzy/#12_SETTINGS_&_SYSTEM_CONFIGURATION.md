# 🌟 MASTER BLUEPRINT MPHM v4.5 (COCKPIT CONFIGURATION ENGINE)
## #12_SETTINGS_&_SYSTEM_CONFIGURATION

Modul Konfigurasi & Parameter Sistem (`SystemSettingsCockpit`) bertanggung jawab atas kontrol operasional global yang memengaruhi seluruh modul di MPHM Enterprise. Pengaturan dipusatkan di tabel database `system_settings` dan API `/api/settings`.

---

## 1. ARSITEKTUR KEY-VALUE & EVENT DISTRIBUTION
Pengaturan sistem disimpan dalam format Key-Value pada tabel `system_settings`:

```prisma
model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @default(now()) @map("updated_at")

  @@map("system_settings")
}
```

Ketika pengaturan disimpan melalui `SystemSettingsCockpit`, perubahan didistribusikan secara realtime via custom events (`role_configs_changed`, `region_settings_changed`, `job_titles_changed`).

---

## 2. MODUL KONTROL DI SYSTEM SETTINGS COCKPIT
`SystemSettingsCockpit` menyediakan 9 tab kontrol terpusat:
1. **Tampilan & Modul**: Visibilitas modul Mustahiq, Wali Santri, Pos Keamanan, dan Mufattisy.
2. **Hak Akses & Otorisasi**: Kontrol izin override catatan akhlaq, pengajuan izin wali, approval mufattisy, dan eskalasi keamanan.
3. **Parameter & Keamanan**: Mode pemeliharaan (*systemMaintenance*), enforce HTTPS, SSO Active, dan Cookie Lifetime.
4. **Tabel Kustom & Menu**: Dynamic custom tables builder (`custom_tables_registry`).
5. **Manajemen Peran & UI**: Kustomisasi menu aktif per role (`system_role_ui_configs`).
6. **Jabatan Struktural**: Pengelolaan daftar jabatan Mundzir (`job_titles_mundzir`) dan Pengurus (`job_titles_pengurus`).
7. **Master Pelanggaran**: Pengelolaan kategori, tingkat keparahan (*severity*), dan poin pelanggaran.
8. **Integrasi API Wilayah**: Konfigurasi provider API wilayah Indonesia & Binderbyte API Key.
9. **Parameter Matematis**: Formula pembobotan nilai kwartal dan batas maksimum nilai akhlaq (*Holy Guard Limit*).
