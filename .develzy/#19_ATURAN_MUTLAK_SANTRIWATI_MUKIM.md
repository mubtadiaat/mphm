# #19_ATURAN_MUTLAK_SANTRIWATI_MUKIM.md
*Dokumen Kebijakan Penarikan Data & Status Keasramaan Siswi Madrasah*
*Sistem Manajemen MPHM & P3HM Lirboyo*

---

## 1. ATURAN PENARIKAN DATA MADRASAH VS INPUT LANGSUNG

Sesuai kebijakan resmi sistem: **Seluruh entitas di Madrasah (MPHM) bersumber melalui Penarikan Data dari Pondok (P3HM)**, dengan **2 Pengecualian Spesifik**:

```text
SISTEM INTEGRASI MADRASAH (MPHM)
├── 📥 MANDATORI TARIK DATA PONDOK (P3HM):
│   ├── 🏛️ Siswi Santri Pondok Mubtadi-aat
│   └── 👥 Data Pengurus Madrasah
│
└── 📝 BISA INPUT LANGSUNG / MANUAL DI MADRASAH (PENGECUALIAN):
    ├── 📖 Mustahiq & 🔄 Munawwib (Tenaga Pengajar Diniyyah)
    └── 🏡 Siswi Unit Asrama Lain (Darussa'adah, Ar-Risalah, Al-Mahrusiyah, Dalem, dll)
```

---

## 2. RINCIAN ALUR KELOLA DATA

### 2.1. Siswi Madrasah (MPHM)
1. **Kategori `🏛️ Santri Pondok Mubtadi-aat`**:
   * **Mandatori Tarik Data**: Harus memilih dari database Santriwati Pondok (P3HM). Biodata, NIK, Wali, dan No Kamar terisi otomatis 100%.
2. **Kategori `🏡 Unit Asrama Lain`**:
   * **Bisa Input Langsung**: Karena berdomisili di unit asrama luar P3HM (seperti PP Darussa'adah, PP Ar-Risalah, Dalem Gus/Yai), biodata dapat didaftarkan langsung di Madrasah.

### 2.2. Pengurus & Tenaga Pengajar
1. **Data Pengurus (`👥 Data Pengurus`)**:
   * **Mandatori Tarik Data**: Mengambil dari Master Pengurus Pondok (P3HM).
2. **Tenaga Pengajar (`📖 Mustahiq` & `🔄 Munawwib`)**:
   * **Pengecualian Input Langsung**: Dapat diinput langsung di Sekretariat Madrasah untuk memfasilitasi pengajar Diniyyah/Guru Mapel yang fokus pada kegiatan belajar mengajar.

---

## 3. STATUS KEASRAMAAN MUTLAK (100% MUKIM)

1. **Seluruh Santriwati & Siswi Berstatus MUKIM**:
   * Setiap siswi yang terdaftar di MPHM secara mutlak berstatus MUKIM (baik di P3HM Mubtadi-aat maupun di Unit Asrama Lain).
2. **Hapus Opsi Non-Mukim / Kalong**:
   * Opsi dan filter `Non-Mukim / Kalong / Luar Pondok` ditiadakan dari sistem.
