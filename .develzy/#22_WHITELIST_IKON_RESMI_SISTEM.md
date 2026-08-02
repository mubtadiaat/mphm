# 🌟 MASTER BLUEPRINT MPHM v5.1
## #22_WHITELIST_IKON_RESMI_SISTEM — Kebijakan Ikon UI/UX

---

## 1. DAFTAR 10 IKON YANG DIIZINKAN

| Ikon | Nama | Fungsi Resmi dalam Sistem |
|---|---|---|
| ✅ | Centang Hijau | Berhasil, aktif, selesai, atau konfirmasi |
| 🔄 | Panah Putar | Sinkronisasi, pembaruan, muat ulang, atau proses perubahan data |
| ❌ | Silang Merah | Kesalahan, pembatalan, penolakan, atau penghapusan |
| 📌 | Pin | Informasi penting, penanda, atau data utama — digunakan untuk Mustahiq |
| 📖 | Buku | Data, informasi, dokumentasi, atau referensi — digunakan untuk Munawwib dan header |
| 🔒 | Kunci Terkunci | Data terkunci, hak akses terbatas, atau fitur yang tidak dapat diubah |
| 🔓 | Kunci Terbuka | Data terbuka, hak akses tersedia, atau fitur yang dapat diubah |
| ⏳ | Pasir Waktu | Proses berlangsung, menunggu, atau status pending (Boyong Pending) |
| 📥 | Kotak Masuk | Penarikan, impor, atau pengambilan data (Tarik Data Pondok, Ploting) |
| ✨ | Bintang Kilap | Fitur baru, peningkatan, atau penyempurnaan sistem (Notice Banner Ketentuan) |

---

## 2. IKON YANG DILARANG KERAS

Seluruh ikon di luar daftar di atas **DILARANG KERAS** digunakan di sistem. Contoh ikon terlarang:
- 🚚 (Truk), 🌴 (Palem), 🥞 (Pancake), 🎓 (Toga), 🏠 (Rumah), 🚗 (Mobil), 🎯 (Target), 🔥 (Api), ⭐ (Bintang), 🏆 (Trofi)

---

## 3. PEDOMAN PENGGUNAAN PER KONTEKS

### Tombol Aksi:
- Tombol **Simpan/Konfirmasi** → ✅
- Tombol **Tarik Data / Import** → 📥
- Tombol **Sinkronisasi** → 🔄
- Tombol **Batal / Hapus** → ❌

### Badge Status:
- Status **AKTIF** → ✅
- Status **BOYONG PENDING** → ⏳
- Status **TERKUNCI** → 🔒
- Status **TERBUKA** → 🔓

### Header Banner & Navigasi:
- Icon kelompok menu Data → 📖
- Icon kelompok menu Pengurus → 📌
- Icon kelompok menu Konfigurasi → 🔒

### Notice Banner (Info):
- Info ketentuan baru atau fitur penting → ✨

---

## 4. IMPLEMENTASI DI CODEBASE

Kebijakan ini diterapkan di seluruh file komponen:
- `SantriTab.tsx`, `SiswiTab.tsx`
- `PengajarTab.tsx`, `PengurusTab.tsx`
- `DataKelasGrid.tsx`
- `KurikulumTab.tsx`, `ManajemenNilaiTab.tsx`
- `GuidedEmptyState.tsx`
- `SOPGuideTab.tsx`
- `SystemSettingsCockpit.tsx`

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
