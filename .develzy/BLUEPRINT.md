# 🌟 MASTER BLUEPRINT MPHM v5.1
## BLUEPRINT.md — Quick Reference Card (Ringkasan Cepat)

**Versi**: 5.1 LIVE PRODUCTION
**Domain**: `https://m.p3hm.my.id`
**Repository**: `mubtadiaat/mphm` (branch: `main`)
**Terakhir Diperbarui**: 02 Agustus 2026

---

## 🏛️ INSTANSI & WORKSPACE

| Instansi | Workspace | Tema | Kewenangan Utama |
|---|---|---|---|
| Pondok P3HM Lirboyo | `pondok` | Emerald | Identitas Santriwati, Asrama, Boyong Approval, Perizinan, Pelanggaran |
| Madrasah MPHM Lirboyo | `madrasah` | Blue/Indigo | Rombel, Kurikulum, Penilaian, Raport, Ijazah, Cuti Mandiri |

---

## 👤 ROLE & AKSES

| Role | Workspace | Navigasi | Menu Utama |
|---|---|---|---|
| `sek.pondok` | Pondok | Sidebar Emerald | Data Santriwati, Asrama, Perizinan, Pelanggaran, Settings |
| `sek.madrasah` | Madrasah | Sidebar Blue | Data Siswi, Kelas, Pengajar, Kurikulum, Penilaian, Rapor, Settings |
| `mustahiq` | Akademik | Bottom Nav | Nilai Rapor, Presensi, Data Kelas |
| `wali_santri` | Guardian | Bottom Nav | Data Anak, Nilai, Presensi, Kedisiplinan |

---

## 🔧 KONFIGURASI SISTEM (10 MODUL)

1. Dikotomi Workspace — Hak Akses Instansi
2. Kalender Akademik & Freeze Kwartal (1-4)
3. Formulasi Nilai & KKTP Kenaikan Kelas
4. Matriks Hak Akses 6 User
5. TTD Digital & Stempel (Upload → RemoveBG → Database)
6. Master Kedisiplinan & Poin Sanksi
7. Jabatan Pengurus (14 Pondok + 11 Madrasah)
8. WhatsApp Gateway (Fonnte + Template Pesan)
9. API Data Wilayah (Cahyadsn / Binderbyte / Kemendagri)
10. Keamanan & Auto-Backup Database

---

## ✅ WHITELIST 10 IKON RESMI

`✅ 🔄 ❌ 📌 📖 🔒 🔓 ⏳ 📥 ✨`

**DILARANG**: Semua ikon emoji di luar daftar ini.

---

## 🏷️ TERMINOLOGI TEKNIS

- Nama vendor (Database, Penyimpanan Cloud, dll) → Cukup sebut **"Database"**
- Tidak boleh menyebut nama vendor teknis di teks UI yang terlihat pengguna

---

## 🔑 DEVELOPER COCKPIT

- URL: `https://m.p3hm.my.id/developer`
- Login: `develzy` / `develzy25`

---

## 📖 PANDUAN SOP SISTEM

- URL: `/sekretariat/sop`
- Konten dinamis: berbeda untuk Pondok & Madrasah
- Tampil di sidebar: Kelompok SISTEM & UTILITAS (kedua workspace)

---

## 📁 STRUKTUR FOLDER PENTING

```
apps/web/src/
├── app/(dashboard)/sekretariat/
│   ├── santri/          — Data Siswi/Santriwati
│   ├── kelas/           — Data Kelas Diniyyah
│   ├── pengajar/        — Data Pengajar
│   ├── pengurus/        — Data Pengurus
│   ├── kurikulum/       — Kurikulum & Mapel
│   ├── penilaian/       — Manajemen Nilai
│   ├── raport/          — Raport Kwartal
│   ├── sop/             — Panduan & SOP Sistem [BARU]
│   └── settings/        — Konfigurasi Sistem (10 Modul)
├── components/shared/
│   ├── SystemSettingsCockpit.tsx
│   ├── GuidedEmptyState.tsx
│   ├── CustomRoleMatrixManager.tsx
│   └── DocumentTemplateBuilder.tsx
├── features/sekretariat/components/
│   ├── SOPGuideTab.tsx              [BARU]
│   ├── SantriTab.tsx / SiswiTab.tsx
│   ├── PengajarTab.tsx / PengurusTab.tsx
│   ├── KurikulumTab.tsx
│   ├── ManajemenNilaiTab.tsx
│   └── MasterPelanggaranTab.tsx
└── config/
    ├── navigation.config.ts          — Konfigurasi menu sidebar
    └── jobPositions.config.ts        — Jabatan baku pengurus
```
