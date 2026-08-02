# 🌟 MASTER BLUEPRINT MPHM v5.1
## #20_DEVELOPER_SAAS_DASHBOARD_AND_DYNAMIC_ROLE_MATRIX

---

## 1. PORTAL DEVELOPER SAAS (`/developer`)

### Kredensial:
- **Username**: `develzy`
- **Password**: `develzy25`
- **Cakupan Akses**: 100% Kontrol Penuh seluruh sistem dan database

### Fitur Dashboard Developer:
1. **System Health & Metrics Real-Time**: CPU server, V8 Heap Memory, DB Latency (ms), counter total record tabel (Santri, Pengurus, Users, Audit Logs, Settings).
2. **Master System Switches (Killswitches)**:
   - Maintenance Mode Global (Lock/Unlock portal umum)
   - Database Write Lock (Read-Only Mode)
   - Lock Pendaftaran & Import Excel
   - API Rate Limiter & Security Firewall
   - Mobile App & Guardian API Switch
3. **Database Inspector & Emergency Maintenance**: Live Raw Data Table Explorer, Export Backup System JSON.

---

## 2. ENGINE MATRIKS PERAN DINAMIS & HAK AKSES GRANULAR

### 6 Peran Baku Sistem:

| Kode Role | Nama Role | Workspace | Navigasi |
|---|---|---|---|
| `sek.pondok` | Sekretariat Pondok | P3HM (Emerald) | Sidebar |
| `sek.madrasah` | Sekretariat Madrasah | MPHM (Blue) | Sidebar |
| `mustahiq` | Mustahiq (Wali Kelas) | Akademik | Bottom Nav |
| `wali_santri` | Wali Santri | Guardian Portal | Bottom Nav |
| *(munawwib)* | Munawwib (Guru Mapel) | Akademik | Konfigurabel |
| *(mufattish)* | Mufattish (Pengawas Nilai) | Pengawas | Konfigurabel |

### Tipe Permission Granular Per Menu:
- **Full CRUD**: Tambah, Lihat, Ubah, Hapus
- **View Only**: Hanya Lihat Data (tombol aksi/input tersembunyi)
- **Cari-View**: Pencarian + Lihat Data saja (tanpa ekspor/impor)
- **No Access / Block**: Menu Tersembunyi

### Toggle Fitur Data Per Role:
- Export Data (PDF / Excel)
- Import Data (Excel / CSV)

---

## 3. MENU YANG DIKELOLA PER ROLE (ENABLEDMENUS)

### Sekretariat Pondok (`sek.pondok`):
`/sekretariat`, `/sekretariat/santri`, `/sekretariat/wali-santri`, `/sekretariat/rooms`, `/sekretariat/pengurus`, `/sekretariat/alumni`, `/sekretariat/perizinan`, `/sekretariat/pelanggaran`, `/sekretariat/users`, `/sekretariat/audit-log`, `/sekretariat/recycle-bin`, `/sekretariat/sop`, `/sekretariat/settings`

### Sekretariat Madrasah (`sek.madrasah`):
`/sekretariat`, `/sekretariat/santri`, `/sekretariat/kelas`, `/sekretariat/pengurus`, `/sekretariat/pengajar`, `/sekretariat/kurikulum`, `/sekretariat/penilaian`, `/sekretariat/kenaikan-kelas`, `/sekretariat/sertifikat`, `/sekretariat/raport`, `/sekretariat/ijazah`, `/sekretariat/template-dokumen`, `/sekretariat/users`, `/sekretariat/audit-log`, `/sekretariat/recycle-bin`, `/sekretariat/sop`, `/sekretariat/settings`

---

## 4. GAYA NAVIGASI DINAMIS PER AKUN / ROLE

Setiap role dapat dikonfigurasi gaya navigasinya:
- **Sidebar Utama** (`"sidebar"`): Desktop/Tablet — Pondok & Madrasah Sekretariat
- **Bottom Navigation** (`"bottom_nav"`): Mobile/Tablet — Mustahiq, Wali Santri

Dikonfigurasi via `system_role_ui_configs` di database, dieksekusi oleh `DashboardShell.tsx`.

---

## 5. KOMPONEN YANG DIHAPUS / TIDAK AKTIF

Role lama yang telah dieliminasi total dari sistem:
- `keamanan`, `mufattisy` (lama), `mundzir`, `dewan_harian`, `dewan_pleno`

Folder yang telah dihapus:
- `apps/web/src/app/(dashboard)/keamanan`
- `apps/web/src/app/(dashboard)/mufattisy`
- `apps/web/src/app/(dashboard)/pimpinan`

---

## 6. ANIMASI LOADING PREMIUM (`PremiumLoader.tsx`)

- Glassmorphism backdrop dengan dual glowing orbs (`emerald` & `blue`)
- Multi-Ring Rotating Spinner + Animated Progress Shimmer Line (Framer Motion)
- Terintegrasi ke `SkeletonLoader.tsx`, transisi rute, dan pemuatan data tabel

---

**Terakhir Diperbarui: 02 Agustus 2026 | Versi: v5.1**
