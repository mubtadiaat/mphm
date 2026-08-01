# #18_RESTRUKTURISASI_PENGURUS_DAN_TENAGA_PENGAJAR.md
*Dokumen Aturan Kebijakan & Arsitektur Pengurus serta Tenaga Pengajar*
*Sistem Manajemen MPHM & P3HM Lirboyo*

---

## 1. ATURAN INTEGRASI DATA PENGURUS VS TENAGA PENGAJAR

1. **`Data Pengurus` (Mandatori Tarik Data dari Pondok P3HM)**:
   * Seluruh master biodata dan pendaftaran entitas Pengurus terpusat 100% di **Pondok Pesantren (P3HM)**.
   * Pada penugasan Pengurus Madrasah, Sekretariat Madrasah **TIDAK MENGETIK ULANG** biodata, melainkan menggunakan tombol **`🔍 Tarik Data dari Pengurus Pondok (P3HM)`**.
2. **Tenaga Pengajar (`Mustahiq` & `Munawwib`) (Pengecualian: Input Langsung)**:
   * Sesuai aturan khusus, **Tenaga Pengajar (Mustahiq & Munawwib) Dikecualikan dari keharusan Tarik Data Pondok**.
   * Sekretariat Madrasah dapat mendaftarkan/menginput data Mustahiq (Guru Diniyyah / Wali Kelas) dan Munawwib (Guru Mapel) secara langsung di Madrasah.

---

## 2. PENYEDERHANAAN STRUKTUR & MENU NAVIGASI

### 2.1. Istilah / Kategori yang Dihapuskan ❌
Sesuai instruksi kebijakan terbaru, kategori berikut **dihapus dari menu navigasi, konfigurasi sistem, dan role terpisah**:
* ❌ `Dewan Harian`
* ❌ `Dewan Pleno`
* ❌ `Mufattisy`
* ❌ `Mundzir`

### 2.2. Kategori yang Dipertahankan & Disederhanakan ✅
Hanya ada 3 menu utama dalam kelompok **Pengurus & Tenaga Pengajar**:

```text
TENAGA PENGAJAR & PENGURUS
├── 👥 Data Pengurus      --> Mandatori Tarik Data dari Pondok P3HM (Ketua, Sekretaris, Bendahara, dll)
├── 📖 Mustahiq           --> Guru Diniyyah Utama / Wali Kelas (Bisa Input Langsung di Madrasah)
└── 🔄 Munawwib          --> Guru Mapel / Pengajar Diniyyah (Bisa Input Langsung di Madrasah)
```

---

## 3. MODEL JABATAN DINAMIS PADA MENU PENGURUS

Dalam `Data Pengurus`, variasi posisi dikelola secara dinamis via **Tag Jabatan / Sub-Jabatan**:

```typescript
// Model struktur Pengurus (Prisma / API)
model PengurusProfile {
  id            String   @id @default(cuid())
  sourcePondokId String? // ID Pengurus Induk Pondok (jika ditarik ke Madrasah)
  fullName      String
  phone         String?
  jabatan       String   // Contoh: "Ketua", "Sekretaris", "Bendahara", "Pengasuhan"
  lingkup       String   // "PONDOK" | "MADRASAH" | "KEDUA_DUANYA"
  status        String   // "AKTIF" | "NON_AKTIF"
}
```
