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
  Home
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

// 6 Peran Resmi Sistem (#08)
export type RoleTypes = "sekretariat" | "mufattisy" | "mundzir" | "mustahiq" | "keamanan" | "wali_santri";

export const SEKRETARIAT_PONDOK_NAV: NavMenu[] = [
  { label: "Dashboard Pondok", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "Database Induk",
    items: [
      { label: "Santriwati (Pondok P3HM)", href: "/sekretariat/santri", icon: Users },
      { label: "Data Wali Santri", href: "/sekretariat/wali-santri", icon: UserCircle },
      { label: "Data Kamar & Asrama", href: "/sekretariat/rooms", icon: Home },
      { label: "Data Mundzir", href: "/sekretariat/mundzir", icon: Users },
      { label: "Data Pengurus", href: "/sekretariat/pengurus", icon: Users },
    ]
  },
  {
    group: "Kedisiplinan",
    items: [
      { label: "Pelanggaran & Takzir", href: "/sekretariat/pelanggaran", icon: ShieldAlert },
    ]
  },
  {
    group: "Al-Rabithoh & Alumni",
    items: [
      { label: "Masa Pengabdian", href: "/sekretariat/khidmah", icon: Heart },
      { label: "Data Alumni", href: "/sekretariat/alumni", icon: Archive },
    ]
  },
  {
    group: "Sistem & Utilitas",
    items: [
      { label: "Manajemen Akun (Users)", href: "/sekretariat/users", icon: Users },
      { label: "Audit Log", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

export const SEKRETARIAT_MADRASAH_NAV: NavMenu[] = [
  { label: "Dashboard Madrasah", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "Manajemen Kelas",
    items: [
      { label: "Siswi (Madrasah MPHM)", href: "/sekretariat/santri", icon: Users },
      { label: "Kelas & Rombel", href: "/sekretariat/kelas", icon: BookOpen },
    ]
  },
  {
    group: "Tenaga Pendidik",
    items: [
      { label: "Data Mufatish", href: "/sekretariat/mufattisy", icon: Users },
      { label: "Data Mustahiq", href: "/sekretariat/mustahiq", icon: Users },
    ]
  },
  {
    group: "Akademik & Penilaian",
    items: [
      { label: "Manajemen Nilai", href: "/sekretariat/penilaian", icon: ClipboardList },
      { label: "Raport", href: "/sekretariat/raport", icon: FileText },
      { label: "Kurikulum Builder", href: "/sekretariat/kurikulum", icon: ClipboardList },
      { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas", icon: Award },
    ]
  },
  {
    group: "Dokumen & Sertifikasi",
    items: [
      { label: "Sertifikat", href: "/sekretariat/sertifikat", icon: Award },
      { label: "Ijazah", href: "/sekretariat/ijazah", icon: Award },
      { label: "Dokumen & Template", href: "/sekretariat/document-template", icon: FileText },
    ]
  },
  {
    group: "Sistem & Utilitas",
    items: [
      { label: "Tahun Ajaran", href: "/sekretariat/tahun-ajaran", icon: Calendar },
      { label: "Arsip Akademik", href: "/sekretariat/arsip", icon: Archive },
      { label: "Audit Log", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

export const NAVIGATION_CONFIG: Record<RoleTypes, NavMenu[]> = {
  sekretariat: [], // Di-override oleh WorkspaceContext di Sidebar.tsx
  mufattisy: [
    { label: "Dashboard", href: "/mufattisy", icon: LayoutGrid },
    { label: "Data Santri", href: "/mufattisy/santri", icon: Users },
    { label: "Akademik", href: "/mufattisy/akademik", icon: BookOpen },
    { label: "Kedisiplinan", href: "/mufattisy/kedisiplinan", icon: ShieldAlert },
    { label: "Kenaikan Kelas", href: "/mufattisy/kenaikan-kelas", icon: Award },
    { label: "Perizinan", href: "/mufattisy/perizinan", icon: FileText },
  ],
  mundzir: [
    { label: "Dashboard", href: "/pimpinan", icon: LayoutGrid },
    { label: "Santri & Kelas", href: "/pimpinan/santri", icon: Users },
    { label: "Kehadiran", href: "/pimpinan/kehadiran", icon: Clock },
    { label: "Kedisiplinan", href: "/pimpinan/kedisiplinan", icon: ShieldAlert },
    { label: "Perizinan", href: "/pimpinan/perizinan", icon: FileText },
  ],
  mustahiq: [
    { label: "Dashboard", href: "/mustahiq", icon: LayoutGrid },
    { label: "Kelas & Santri", href: "/mustahiq/kelas", icon: BookOpen },
    { label: "Penilaian Kwartal", href: "/mustahiq/penilaian", icon: ClipboardList },
    { label: "Rekap Absensi", href: "/mustahiq/absensi", icon: Clock },
    { label: "Catatan Akhlaq", href: "/mustahiq/akhlaq", icon: Heart },
    { label: "Rekomendasi Kenaikan", href: "/mustahiq/kenaikan-kelas", icon: CheckSquare },
  ],
  keamanan: [
    { label: "Dashboard", href: "/keamanan", icon: LayoutGrid },
    { label: "Jurnal Pelanggaran", href: "/keamanan/jurnal", icon: FileText },
    { label: "Pencarian Santri", href: "/keamanan/santri", icon: Users },
  ],
  wali_santri: [
    { label: "Dashboard", href: "/guardian", icon: LayoutGrid },
    { label: "Anak Saya", href: "/guardian/children", icon: UserCircle },
    { label: "Akademik", href: "/guardian/akademik", icon: BookOpen },
    { label: "Kedisiplinan", href: "/guardian/kedisiplinan", icon: ShieldAlert },
    { label: "Kehadiran", href: "/guardian/kehadiran", icon: Clock },
  ],
};
