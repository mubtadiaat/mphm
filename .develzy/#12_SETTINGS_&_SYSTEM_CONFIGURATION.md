# 🌟 MASTER BLUEPRINT MPHM v5.1
## #12_SETTINGS_&_SYSTEM_CONFIGURATION — Cockpit 10 Master Modules

---

## 1. ARSITEKTUR PERSISTENSI DATABASE

Seluruh pengaturan sistem disimpan di tabel `system_settings` (format key-value):

```prisma
model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @default(now()) @map("updated_at")

  @@map("system_settings")
}
```

**Standar Serialisasi JSON:**
1. Object/Array kompleks di-`JSON.stringify` saat `PUT /api/settings`.
2. Saat dibaca via `GET /api/settings`, handler API melakukan `JSON.parse` otomatis.
3. Konfigurasi tersimpan ke database terenkripsi, lalu di-sync ke `localStorage` browser.

---

## 2. 10 MASTER CONTROL MODULES (LIVE & AKTIF)

Setiap modul tersambung penuh ke database via API `PUT /api/settings`:

### Modul 1 — Dikotomi Workspace & Hak Akses Instansi
- Toggle: `allowMadrasahCutiMandiri` (default: `true`)
- Toggle: `allowPondokBoyongApproval` (default: `true`)
- Toggle: `lockPondokIdentityFields` (default: `true`)

### Modul 2 — Kalender Akademik & Kwartal Freeze Lock Engine
- `activeTahunAjaran`: String (contoh: `"2026/2027"`)
- `activeKwartal`: Number (1–4)
- `kwartal1Locked`, `kwartal2Locked`, `kwartal3Locked`, `kwartal4Locked`: Boolean

### Modul 3 — Formulasi Nilai & Kriteria Kenaikan Kelas
- `weightHarian`: Number (%) — default: 30
- `weightKwartal`: Number (%) — default: 40
- `weightSyafai`: Number (%) — default: 30
- `minPassingScore`: Number — default: 70 (KKTP)
- `maxRedSubjects`: Number — default: 2 (Maks mapel merah naik kelas)

### Modul 4 — Matriks Hak Akses 6 User
- `system_role_ui_configs`: JSON Object → CustomRoleMatrixManager
- 6 Peran Baku: `sek.pondok`, `sek.madrasah`, `mustahiq`, `munawwib`, `mufattish`, `wali_santri`

### Modul 5 — Stempel & TTD Digital Resmi (HD Auto RemoveBG)
- Upload File (PNG/JPG) → Canvas RemoveBG otomatis → Simpan ke Database
- `pengasuhSignatureUrl`, `kepalaMadrasahSignatureUrl`, `mufattishSignatureUrl`, `officialStampUrl`
- Preview gambar pada latar checker pattern (penanda transparansi)

### Modul 6 — Master Kedisiplinan & Poin Sanksi
- Terintegrasi langsung dengan komponen `MasterPelanggaranTab`
- Data tersimpan di tabel khusus pelanggaran di database

### Modul 7 — Struktur Jabatan Pengurus & Pengajar
- `structural_job_positions`: Array JSON
- Filter per instansi: `MADRASAH` (11 jabatan) atau `PONDOK` (14 jabatan)

### Modul 8 — WhatsApp Gateway & Notifikasi Wali Santri
- `fonnteApiKey`: String (token gateway)
- `whatsappTemplateRapor`, `whatsappTemplateBoyong`, `whatsappTemplateAbsensi`: String template

### Modul 9 — API Data Wilayah Indonesia
- `regionApiSource`: `"cahyadsn"` | `"binderbyte"` | `"kemendagri"`
- `binderbyteApiKey`: String (hanya aktif jika `regionApiSource === "binderbyte"`)

### Modul 10 — Keamanan Sistem, Backup & Emergency Lock
- `systemMaintenance`: Boolean (Emergency Maintenance Lock)
- `enforceHttps`: Boolean
- `cookieLifetime`: Number (hari)
- `autoBackupInterval`: `"daily"` | `"weekly"` | `"manual"`

---

## 3. KOMPONEN UI COCKPIT

### FriendlyGuideCard
Setiap modul dilengkapi kartu petunjuk penggunaan dengan ikon `✨` dan deskripsi berbahasa Indonesia.

### FriendlySwitch
Sakelar kontrol dengan badge status: `AKTIF` (Emerald) / `NON-AKTIF` (Zinc) atau kustom (`TERKUNCI` / `TERBUKA`).

### SignatureImageUploader
Komponen upload TTD/Stempel yang:
1. Menerima file PNG/JPG dari user
2. Memproses RemoveBG via Canvas API (menghapus latar putih → PNG transparan HD)
3. Upload ke server via `/api/media/signature`
4. Menampilkan preview pada checker pattern

### CustomRoleMatrixManager
Matriks otorisasi granular untuk 6 peran baku dengan toggle akses per menu.

---

## 4. TOMBOL SIMPAN TERPUSAT

Tombol **"Simpan Konfigurasi Terpusat"** di banner header:
- Memanggil `PUT /api/settings` dengan payload JSON seluruh konfigurasi
- Menampilkan `Loader2` spin saat proses berlangsung
- Menampilkan banner sukses (3 detik) setelah berhasil
- Men-sync ke `localStorage` & mengirim window events untuk update realtime

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
