import { 
  LayoutGrid, 
  Users, 
  BookOpen, 
  ClipboardList, 
  ShieldAlert, 
  FileText, 
  UserCircle,
  Settings,
  Calendar,
  Award,
  History,
  Clock,
  Heart,
  CheckSquare,
  Archive,
  Trash2,
  Home,
  Ticket,
  FileCode,
  UserCheck,
  FolderOpen
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

export type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export type NavMenu = NavItem | NavGroup;

// Peran Resmi Sistem (#08)
export type RoleTypes = "sekretariat" | "sek.pondok" | "sek.madrasah" | "mufattisy" | "mundzir" | "mustahiq" | "keamanan" | "wali_santri";

// WORKSPACE PONDOK PESANTREN PUTRI [P3HM Lirboyo]
export const SEKRETARIAT_PONDOK_NAV: NavMenu[] = [
  { label: "Dashboard Pondok", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "A. DATABASE PONDOK",
    items: [
      { label: "Santriwati (P3HM)", href: "/sekretariat/santri", icon: Users },
      { label: "Wali Santri (Smart KK)", href: "/sekretariat/wali-santri", icon: UserCircle },
      { label: "Data Asrama (Blok & Kamar)", href: "/sekretariat/rooms", icon: Home },
      { label: "Pengurus (Penasihat, Harian, Pleno)", href: "/sekretariat/pengurus", icon: Users },
      { label: "Alumni Pondok", href: "/sekretariat/alumni", icon: Archive },
    ]
  },
  {
    group: "B. KEAMANAN & PENGASUHAN",
    items: [
      { label: "Perizinan Santri", href: "/sekretariat/perizinan", icon: Ticket },
      { label: "Pelanggaran & Takzir", href: "/sekretariat/pelanggaran", icon: ShieldAlert },
    ]
  },
  {
    group: "SISTEM & UTILITAS",
    items: [
      { label: "Manajemen Akun (Users)", href: "/sekretariat/users", icon: UserCheck },
      { label: "Audit Log 24 Jam", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

// WORKSPACE MADRASAH PUTRI [MPHM Lirboyo]
export const SEKRETARIAT_MADRASAH_NAV: NavMenu[] = [
  { label: "Dashboard Madrasah", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "A. MANAJEMEN DATA",
    items: [
      { label: "Data Siswi (MPHM)", href: "/sekretariat/santri", icon: Users },
      { label: "Rombel / Kelas", href: "/sekretariat/kelas", icon: BookOpen },
    ]
  },
  {
    group: "B. TENAGA PENGAJAR & PENGURUS",
    items: [
      { label: "Dewan Harian", href: "/sekretariat/pengurus-madrasah", icon: Users },
      { label: "Mundzir", href: "/sekretariat/mundzir", icon: Users },
      { label: "Mufattisy", href: "/sekretariat/mufattisy", icon: Users },
      { label: "Mustahiq", href: "/sekretariat/mustahiq", icon: Users },
      { label: "Dewan Pleno", href: "/sekretariat/dewan-pleno", icon: Users },
    ]
  },
  {
    group: "C. AKADEMIK & PENILAIAN",
    items: [
      { label: "Kurikulum & Mapel Diniyyah", href: "/sekretariat/kurikulum", icon: ClipboardList },
      { label: "Manajemen Nilai", href: "/sekretariat/penilaian", icon: FileText },
      { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas", icon: Award },
    ]
  },
  {
    group: "D. DOKUMEN SISWI",
    items: [
      { label: "Sertifikat", href: "/sekretariat/sertifikat", icon: Award },
      { label: "Raport Kwartal Diniyyah", href: "/sekretariat/raport", icon: FileText },
      { label: "Ijazah Kelulusan", href: "/sekretariat/ijazah", icon: Award },
      { label: "Template Dokumen", href: "/sekretariat/template-dokumen", icon: FileCode },
    ]
  },
  {
    group: "SISTEM & UTILITAS",
    items: [
      { label: "Manajemen Akun (Users)", href: "/sekretariat/users", icon: UserCheck },
      { label: "Audit Log 24 Jam", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

export const NAVIGATION_CONFIG: Record<RoleTypes, NavMenu[]> = {
  sekretariat: SEKRETARIAT_MADRASAH_NAV,
  "sek.pondok": SEKRETARIAT_PONDOK_NAV,
  "sek.madrasah": SEKRETARIAT_MADRASAH_NAV,
  mufattisy: [
    { label: "Dashboard Mufattisy", href: "/mufattisy", icon: LayoutGrid },
    { label: "Pengawasan Santri", href: "/mufattisy/santri", icon: Users },
    { label: "Monitoring Akademik", href: "/mufattisy/akademik", icon: BookOpen },
    { label: "Pengawasan Kedisiplinan", href: "/mufattisy/kedisiplinan", icon: ShieldAlert },
    { label: "Verifikasi Kenaikan Kelas", href: "/mufattisy/kenaikan-kelas", icon: ClipboardList },
    { label: "Perizinan & Keluar Masuk", href: "/mufattisy/perizinan", icon: Ticket },
  ],
  mundzir: [
    { label: "Dashboard Mundzir", href: "/pimpinan", icon: LayoutGrid },
    { label: "Bimbingan & Data Santri", href: "/pimpinan/santri", icon: Users },
    { label: "Monitoring Kehadiran", href: "/pimpinan/kehadiran", icon: Clock },
    { label: "Pencatatan Kedisiplinan", href: "/pimpinan/kedisiplinan", icon: ShieldAlert },
    { label: "Perizinan Pulang/Sambangan", href: "/pimpinan/perizinan", icon: Ticket },
  ],
  mustahiq: [
    { label: "Dashboard Mustahiq", href: "/mustahiq", icon: LayoutGrid },
    { label: "Input Nilai Raport Kwartal", href: "/mustahiq/penilaian", icon: ClipboardList },
    { label: "Presensi Santri Realtime", href: "/mustahiq/absensi", icon: CheckSquare },
    { label: "Detail Siswi Pengampuan", href: "/mustahiq/kelas", icon: Users },
  ],
  keamanan: [
    { label: "Dashboard Keamanan", href: "/keamanan", icon: LayoutGrid },
    { label: "Jurnal Pelanggaran & Catatan", href: "/keamanan/jurnal", icon: ShieldAlert },
    { label: "Pencarian Data Santri", href: "/keamanan/santri", icon: Users },
  ],
  wali_santri: [
    { label: "Portal Utama Wali", href: "/guardian", icon: LayoutGrid },
    { label: "Daftar Anak Santri", href: "/guardian/children", icon: Users },
    { label: "Nilai & Akademik Anak", href: "/guardian/akademik", icon: FileText },
    { label: "Presensi Realtime Anak", href: "/guardian/kehadiran", icon: CheckSquare },
    { label: "Catatan Kedisiplinan", href: "/guardian/kedisiplinan", icon: ShieldAlert },
  ],
};
