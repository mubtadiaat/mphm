# 🌟 MASTER BLUEPRINT MPHM v5.1
## #21_DIKOTOMI_KEWENANGAN_P3HM_VS_MPHM — Aturan Mutlak Pemisahan Wewenang

Dokumen ini adalah referensi resmi pemisahan kewenangan antara dua instansi dalam satu sistem.

---

## 1. TABEL DIKOTOMI KEWENANGAN LENGKAP

| Domain | Pondok P3HM (Emerald) | Madrasah MPHM (Blue) |
|---|---|---|
| **Identitas Santriwati** | Pengelola Tunggal (Single Source of Truth) | Hanya bisa Tarik Data |
| **Kamar & Asrama** | Kewenangan Penuh | — |
| **Wali Santri** | Kewenangan Penuh | — |
| **Status BOYONG** | Pemegang Approval Resmi | Hanya bisa Mengajukan (Pending) |
| **Status CUTI** | — | Mandiri, Langsung Berlaku |
| **Status AKTIF** | — | Penetapan bersama |
| **Rombel / Kelas Diniyyah** | — | Kewenangan Penuh |
| **Mustahiq (Wali Kelas)** | — | Input Mandiri |
| **Munawwib (Guru Mapel)** | — | Input Mandiri |
| **Kurikulum & Mapel** | — | Kewenangan Penuh |
| **Penilaian 4 Kwartal** | — | Alur 4 Tahap (Mustahiq → Mufattish → TTD → Lock) |
| **Raport Kwartal** | — | Kewenangan Penuh |
| **Ijazah Kelulusan** | — | Kewenangan Penuh |
| **Kenaikan Kelas** | — | Kewenangan Penuh |
| **Perizinan Pulang** | Kewenangan Penuh | — |
| **Pelanggaran & Poin Sanksi** | Kewenangan Penuh | — |
| **Pengurus Pondok** | 14 Jabatan Baku | — |
| **Pengurus Madrasah** | — | 11 Jabatan Baku |

---

## 2. ALUR STATUS BOYONG (INTER-INSTANSI)

```
Madrasah MPHM
    |
    |-- [Pengajuan Boyong] --> Status: BOYONG_PENDING ⏳
    |
    v
Pondok P3HM (Review)
    |
    |-- [Setujui] --> Status: BOYONG RESMI ✅
    |
    |-- [Tolak]   --> Status: AKTIF (kembali ke semula)
```

---

## 3. KONFIGURASI TOGGLE (MODUL 1 — SISTEM SETTINGS)

Toggle yang mengatur dikotomi ini tersimpan di database (`system_settings`):

| Key | Default | Deskripsi |
|---|---|---|
| `allowMadrasahCutiMandiri` | `true` | Madrasah boleh tetapkan Cuti tanpa approval Pondok |
| `allowPondokBoyongApproval` | `true` | Boyong wajib disetujui Pondok |
| `lockPondokIdentityFields` | `true` | Identitas siswi dari Pondok terkunci di form Madrasah |

---

## 4. IMPLEMENTASI TEKNIS DI CODEBASE

- **`useWorkspace()` hook**: Mendeteksi workspace aktif (`"pondok"` | `"madrasah"`)
- **`isPondok` flag**: Digunakan di seluruh komponen untuk conditional rendering
- **`WorkspaceContext`**: Context provider global di `DashboardShell.tsx`
- **RBAC `rbac.ts`**: `enabledMenus[]` per role menentukan menu yang dapat diakses
- **Navigation Config**: `SEKRETARIAT_PONDOK_NAV` & `SEKRETARIAT_MADRASAH_NAV` di `navigation.config.ts`

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
