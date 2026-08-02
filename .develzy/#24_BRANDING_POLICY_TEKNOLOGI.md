# 🌟 MASTER BLUEPRINT MPHM v5.1
## #24_BRANDING_POLICY_TEKNOLOGI — Penyamaran Nama Vendor

---

## 1. LATAR BELAKANG

Seluruh nama vendor teknologi backend (server database, penyimpanan media, ORM) wajib disembunyikan dari pengguna akhir untuk menjaga privasi infrastruktur teknis sistem.

---

## 2. TABEL PENYAMARAN RESMI

| Nama Vendor / Teknologi Asli | Terminologi Resmi di UI Sistem | Catatan |
|---|---|---|
| Cloudinary | **Database** | Untuk teks toast, error message, loading indicator |
| Cloud Storage | **Database** | Untuk deskripsi modul & panduan |
| Neon DB | **Database** | Untuk pesan toast sinkronisasi |
| PostgreSQL | **Database** | Untuk deskripsi teknis yang terlihat user |
| Prisma ORM | *(tidak ditampilkan ke user)* | Hanya di kode internal |
| Vercel | *(tidak ditampilkan ke user)* | Hanya di dokumentasi internal |

---

## 3. ATURAN IMPLEMENTASI

### Boleh menggunakan nama vendor di:
- Komentar kode (`// Upload to Cloudinary`)
- Nama variabel internal (`const cloudinaryRes`, `const cloudinaryData`)
- File konfigurasi environment (`.env.local`, `prisma.config.ts`)
- File API route handler internal
- Dokumentasi blueprint di folder `.develzy`

### DILARANG menggunakan nama vendor di:
- Teks pesan toast (sukses/gagal) yang terlihat pengguna
- Label, deskripsi, dan tooltip di antarmuka
- Loading indicator dan status messages
- Panduan SOP di halaman `/sekretariat/sop`
- Judul modul di Konfigurasi Sistem
- Error messages yang ditampilkan ke user

---

## 4. CONTOH IMPLEMENTASI BENAR

```tsx
// BENAR ✅ — Teks yang terlihat user
toast("Berhasil diunggah & disimpan ke Database!", "success");
throw new Error("Gagal mengunggah berkas ke Database.");
<span>Memproses RemoveBG & Simpan HD ke Database...</span>

// BENAR ✅ — Kode internal (tidak terlihat user)
// 3. Upload file to Cloudinary
const cloudinaryRes = await fetch(`https://api.cloudinary.com/...`);
const cloudinaryData = await cloudinaryRes.json();
```

```tsx
// SALAH ❌ — Teks yang terlihat user
toast("Berhasil diunggah ke Cloudinary!", "success");
throw new Error("Gagal upload ke Cloud Storage.");
<span>Uploading HD ke Cloudinary...</span>
```

---

## 5. FILE YANG PERLU DIPERHATIKAN

File-file yang berpotensi mengekspos nama vendor ke user dan sudah dibersihkan:
- `SystemSettingsCockpit.tsx` ✅
- `KurikulumTab.tsx` ✅
- `SOPGuideTab.tsx` ✅
- `DocumentTemplateBuilder.tsx` — Label "Cloud Storage" sudah bersih ✅
- `SantriTab.tsx`, `SiswiTab.tsx` — Error message sudah generik ✅

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
