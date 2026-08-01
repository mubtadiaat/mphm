# #17_ENTERPRISE_PWA_&_CROSS_PLATFORM_WEB.md
*Dokumen Standar Arsitektur Web Cross-Platform & Progressive Web App (PWA)*
*Sistem Manajemen MPHM & P3HM Lirboyo*

---

## 1. DEDIKASI FOKUS WEBSITES & PWA STANDALONE

Sistem Manajemen MPHM & P3HM Lirboyo terfokus **100% pada Unified Enterprise Web Application** (`apps/web`) berbasis **Next.js 15 App Router**, **React 19**, **TypeScript**, dan **TailwindCSS**, yang di-deploy ke **Vercel** (`https://m.p3hm.my.id`).

### 🎯 Tujuan Utama Arsitektur PWA:
* **Satu Codebase Terpadu (Single Codebase)**: Memastikan 100% fitur, menu, otorisasi RBAC, audit log, perizinan, dan penilaian terpusat di `apps/web`.
* **Kemudahan Instalasi (1-Click PWA Installation)**: Pengguna di PC Desktop Windows, Laptop, maupun HP Android/iOS dapat menginstal aplikasi langsung dari browser Chrome/Edge/Safari dengan 1 klik menjadi **Aplikasi Standalone (Tanpa URL Bar)**.
* **Performa Tinggi & Tanpa Maintenance Overhead**: Mengeliminasi kebutuhan kompilasi `.exe` atau `.apk` terpisah yang rentan konflik versi SDK atau OS.
* **Pembaruan Realtime Otomatis**: Setiap perbaikan atau rilis baru di server langsung aktif di seluruh perangkat pengguna secara instan tanpa perlu download/install manual.

---

## 2. DUKUNGAN MULTI-DEVICE & RESPONSIVE DESIGN SYSTEM

| Perangkat / Platform | Mode Layar | Antarmuka UI & Navigasi |
| :--- | :--- | :--- |
| **PC Desktop Windows / Laptop** | Wide Screen (Width >= 1024px) | Collapsible Navigation Sidebar Kiri + Multi-Column Data Grid |
| **Tablet / iPad** | Medium Screen (768px <= Width < 1024px) | Compact Sidebar + Horizontal Scrollable Data Grid |
| **HP Android / Smartphone** | Mobile Screen (Width < 768px) | Bottom Navigation Bar + Responsive Action Cards |

---

## 3. INSTALASI PROGRESSIVE WEB APP (PWA)

1. **Windows PC / Laptop**:
   - Buka `https://m.p3hm.my.id` di Google Chrome atau Microsoft Edge.
   - Klik tombol **"Install App"** di bilah alamat browser.
   - Software akan langsung terpasang di Desktop Windows & Start Menu sebagai **Aplikasi Desktop Mandiri**.

2. **HP Android / iOS**:
   - Buka `https://m.p3hm.my.id` di Chrome atau Safari.
   - Klik **"Tambahkan ke Layar Utama" / "Add to Home Screen"**.
   - Aplikasi akan tampil dengan ikon emas resmi instansi P3HM & MPHM Lirboyo di daftar aplikasi HP.
