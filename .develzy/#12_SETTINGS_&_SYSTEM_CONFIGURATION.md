🌟 MASTER BLUEPRINT MPHM v4.0 (EKSPANSI FINAL)
BAB XII: SETTINGS & SYSTEM CONFIGURATION

Modul ini bertanggung jawab atas parameter operasional global yang memengaruhi seluruh logika bisnis di sistem. Modul Settings dipusatkan di tabel `system_settings` dan rute `settings.ts`.

1. ARSITEKTUR KEY-VALUE STORE
Karena pengaturan sistem sering berubah dan jumlah kolom tidak bisa ditebak, database tidak menggunakan kolom statis. Sistem menggunakan arsitektur Key-Value.

Skema Drizzle (packages/db/src/schema/settings.ts):
```typescript
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(), // Contoh: 'activeAcademicYear', 'systemMaintenance'
  value: text("value"), // Disimpan sebagai JSON string
  updatedAt: timestamp("updated_at").default(sql`now()`),
});
```

2. PENGATURAN TAHUN AJARAN (ACADEMIC YEAR)
Pengaturan paling krusial di seluruh sistem adalah `activeAcademicYear`.
- Nilai dari key ini digunakan sebagai parameter default (fallback) jika frontend tidak mengirimkan `academicYearId`.
- Hal ini menjamin bahwa seluruh data transaksional otomatis mengarah ke Tahun Ajaran yang sedang berjalan.

3. FLAG OPERASIONAL GLOBAL
Beberapa kunci (key) lain yang mungkin dikelola:
- `isScoreInputLocked`: Mengunci input nilai bagi Wali Kelas pada akhir Kuartal.
- `showMustahiqScores`: Flag untuk menampilkan/menyembunyikan nilai kepada Mustahiq di kondisi tertentu.
- `maintenanceMode`: Menampilkan halaman pemeliharaan di Frontend jika diaktifkan.

4. UI/UX SISTEM PENGATURAN
Hanya akun dengan role `Super Admin` atau `Sekretariat` yang dapat mengakses form konfigurasi global. Antarmuka menggunakan toggle modern dan pemilih JSON visual untuk mempermudah konfigurasi. Setiap perubahan pada konfigurasi global ini akan dicatat ke dalam sistem Audit Log.
