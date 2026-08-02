# 🌟 MASTER BLUEPRINT MPHM v5.1
## #19_ATURAN_MUTLAK_SANTRIWATI_MUKIM — Dikotomi Kewenangan P3HM vs MPHM

---

## 1. ATURAN MUTLAK KEASRAMAAN: 100% MUKIM

Seluruh santriwati/siswi yang terdaftar di sistem WAJIB berstatus **MUKIM** (tinggal di asrama). Opsi **Non-Mukim / Kalong** telah dihapus total dari sistem dan tidak boleh dimunculkan kembali.

---

## 2. ATURAN PENARIKAN DATA MADRASAH VS INPUT LANGSUNG

```
SISTEM INTEGRASI MADRASAH (MPHM)
├── MANDATORI TARIK DATA PONDOK (P3HM):
│   ├── Siswi Santri Pondok Mubtadi-aat
│   └── Data Pengurus Madrasah (identitas saja, jabatan mandiri)
│
└── BISA INPUT LANGSUNG / MANUAL DI MADRASAH (PENGECUALIAN):
    ├── Mustahiq & Munawwib (Tenaga Pengajar Diniyyah)
    └── Siswi Unit Asrama Lain (Darussa'adah, Ar-Risalah, Al-Mahrusiyah, Dalem, dll)
```

---

## 3. KATEGORI SUMBER DATA SISWI MADRASAH

| Kategori Siswi | Sumber Data | Form di Madrasah |
|---|---|---|
| Santri Pondok Mubtadi-aat | Tarik dari database Pondok P3HM | **TERKUNCI** — identitas & alamat auto-filled |
| Unit Asrama Lain | Input manual di Madrasah | **TERBUKA** — isi semua field manual |

---

## 4. FORM AUTO-LOCKING DATA PONDOK PADA MADRASAH

Saat mendaftarkan Siswi yang berasal dari Pondok di Madrasah:
- Field Identitas Pribadi & Alamat: **TERKUNCI** (`disabled`)
- Banner resmi: **FORM IDENTITAS & ALAMAT TERKUNCI RESMI DARI PONDOK P3HM** (dengan ikon 🔒)
- Field yang TERBUKA untuk Madrasah: Jenjang & Kelas Diniyyah, NISN

---

## 5. ALUR STATUS SANTRIWATI / SISWI

| Status | Kewenangan |
|---|---|
| **AKTIF** | Status default |
| **CUTI** | Madrasah: Mandiri, langsung berlaku, tanpa persetujuan Pondok |
| **BOYONG (Pending)** ⏳ | Madrasah mengajukan → wajib disetujui Pondok P3HM |
| **BOYONG (Resmi)** ✅ | Setelah Pondok menyetujui pengajuan Boyong dari Madrasah |
| **LULUS / ALUMNI** | Ditetapkan oleh Madrasah setelah proses kenaikan kelas akhir |

---

## 6. KEWENANGAN PENGURUS

| Data Pengurus | Kewenangan |
|---|---|
| Identitas dasar Pengurus | Tarik dari Pondok P3HM (mandatori) |
| Jabatan Pengurus di Pondok | 14 Jabatan Baku, kelola mandiri Pondok |
| Jabatan Pengurus di Madrasah | 11 Jabatan Baku, kelola mandiri Madrasah |

---

## 7. DIKOTOMI WARNA WORKSPACE

| Instansi | Tema Warna | CSS Class |
|---|---|---|
| Pondok P3HM | Emerald / Teal | `from-emerald-700 via-teal-700 to-emerald-900` |
| Madrasah MPHM | Blue / Indigo / Purple | `from-blue-600 via-indigo-600 to-purple-600` |

Seluruh elemen UI (header banner, tab aktif, badge, tombol aksen) mengikuti warna workspace aktif yang dideteksi dari `useWorkspace()` hook.

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
