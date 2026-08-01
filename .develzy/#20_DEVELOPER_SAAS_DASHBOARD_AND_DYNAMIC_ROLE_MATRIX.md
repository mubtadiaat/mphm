# #20_DEVELOPER_SAAS_DASHBOARD_AND_DYNAMIC_ROLE_MATRIX.md
*Dokumen Blueprint Dashboard Developer SaaS & Engine Matriks Peran Dinamis Granular*
*Sistem Manajemen MPHM & P3HM Lirboyo*

---

## 1. PORTAL DEVELOPER SAAS (`m.p3hm.my.id/developer` -> `/developer`)

### Kredensial Master Developer:
* **Username**: `develzy`
* **Password**: `develzy25`
* **Cakupan Akses**: 100% Kontrol Penuh atas seluruh sistem dan database aplikasi.

### Fitur Utilitas Dashboard Developer:
1. **System Health & Metrics Real-Time**:
   * Monitoring penggunaan CPU server, V8 Heap Memory, dan DB Latency (ms).
   * Counter total record tabel DB (Santri, Pengurus, Users, Audit Logs, Settings).
2. **Master System Switches (Killswitches)**:
   * 🛑 **Maintenance Mode Global** (Lock/Unlock portal umum).
   * 🔒 **Database Write Lock** (Read-Only Mode).
   * 🚫 **Lock Pendaftaran & Impor Excel**.
   * 🛡️ **API Rate Limiter & Security Firewall**.
   * 📲 **Mobile App & Guardian API Switch** (Android Guardian & Staff).
3. **Database Inspector & Emergency Maintenance**:
   * Live Raw Data Table Explorer (Santri, Pengurus, Users, Audit Logs).
   * Export Backup System JSON.

---

## 2. ENGINE MATRIKS PERAN DINAMIS & HAK AKSES GRANULAR

### Pembuatan Role Kustom (Dynamic Custom Role Creation):
* Pengguna / Developer dapat membuat role kustom baru tanpa batas (misal: *Bendahara Diniyyah*, *Pembina Asrama*, *Keamanan Gerbang*, dll).
* Setiap role memiliki ID/Kode unik, Nama Role, Deskripsi, dan Cakupan Instansi (*PONDOK*, *MADRASAH*, *ALL*).

### Matriks Otorisasi Granular Per Menu:
1. **Permission Types**:
   * 🟢 **Full CRUD** (Tambah, Lihat, Ubah, Hapus).
   * 🔵 **View Only** (Hanya Lihat Data — tombol aksi/input tersembunyi).
   * 🟡 **Cari-View** (Pencarian + Lihat Data saja — tanpa ekspor/impor/aksi).
   * 🔴 **No Access / Block** (Menu Tersembunyi).
2. **Toggle Fitur Data**:
   * `[✓] Export Data (PDF / Excel)`
   * `[✓] Import Data (Excel / CSV)`

---

## 3. PEMBERSIHAN ROLE & FOLDER TIDAK TERPAKAI

1. **Role `Keamanan`**, `Mufattisy`, `Mundzir`, `Dewan Harian`, `Dewan Pleno` telah dihapuskan dari seluruh `RoleTypes`, RBAC, dan navigasi bawaan.
2. **Folder Tidak Terpakai Dihapus Total**:
   * `apps/web/src/app/(dashboard)/keamanan`
   * `apps/web/src/app/(dashboard)/mufattisy`
   * `apps/web/src/app/(dashboard)/pimpinan`
   * `apps/web/src/app/api/keamanan`
   * `apps/web/src/app/api/mufattisy`
   * `apps/web/src/app/api/pimpinan`
   * `apps/web/src/features/keamanan`
   * `apps/web/src/features/mufattisy`
---

## 4. GAYA NAVIGASI DINAMIS PER AKUN / ROLE (SIDEBAR VS BOTTOM NAV)
1. **Fleksibilitas Instansi Menentukan Tampilan**:
   * Setiap akun / role pengguna dapat diatur gaya navigasinya secara individual: **Sidebar Utama** (Desktop/Tablet) atau **Bottom Navigation** (Mobile/Tablet).
   * Matriks konfigurasi disimpan per role/akun (`navigationStyle: "sidebar" | "bottom_nav"`) dan dieksekusi secara otomatis oleh [`DashboardShell.tsx`](file:///d:/DEVELZY/MPHM_V.02/apps/web/src/components/navigation/DashboardShell.tsx).

---

## 5. ANIMASI LOADING NYATA ULTRA-PREMIUM (`PremiumLoader.tsx`)
1. **Desain Visual Modern & Estetik**:
   * Menggunakan Glassmorphism backdrop dengan dual glowing background orbs (`emerald` & `blue`).
   * Spinning Multi-Ring (Ring dashed terluar, Ring gradien tengah, Core pulsing inner).
   * Animated Progress Shimmer Line (`Framer Motion`).
2. **Keterterapan Aplikasi**:
   * Diintegrasikan ke [`SkeletonLoader.tsx`](file:///d:/DEVELZY/MPHM_V.02/apps/web/src/components/shared/SkeletonLoader.tsx), transisi rute, serta pemuatan data tabel.
