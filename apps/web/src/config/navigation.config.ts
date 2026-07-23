import { 
  LayoutGrid, 
  Users, 
  BookOpen, 
  ClipboardList, 
  ShieldAlert, 
  FileText, 
  UserCircle,
  Settings,
  Award,
  History,
  Clock,
  CheckSquare,
  Archive,
  Trash2,
  Home,
  Ticket,
  FileCode,
  UserCheck
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
export type RoleTypes = "sek.pondok" | "sek.madrasah" | "mufattisy" | "mundzir" | "mustahiq" | "keamanan" | "wali_santri";

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
  "sek.pondok": SEKRETARIAT_PONDOK_NAV,
  "sek.madrasah": SEKRETARIAT_MADRASAH_NAV,
  mufattisy: [
    { label: "Dashboard", href: "/mufattisy", icon: LayoutGrid },
    { label: "Inspeksi Santri", href: "/mufattisy/santri", icon: Users },
    { label: "Akademik", href: "/mufattisy/akademik", icon: BookOpen },
    { label: "Kedisiplinan", href: "/mufattisy/kedisiplinan", icon: ShieldAlert },
    { label: "Kenaikan Kelas", href: "/mufattisy/kenaikan-kelas", icon: ClipboardList },
    { label: "Perizinan", href: "/mufattisy/perizinan", icon: Ticket },
  ],
  mundzir: [
    { label: "Dashboard", href: "/pimpinan", icon: LayoutGrid },
    { label: "Data Santri", href: "/pimpinan/santri", icon: Users },
    { label: "Kehadiran", href: "/pimpinan/kehadiran", icon: Clock },
    { label: "Kedisiplinan", href: "/pimpinan/kedisiplinan", icon: ShieldAlert },
    { label: "Perizinan", href: "/pimpinan/perizinan", icon: Ticket },
  ],
  mustahiq: [
    { label: "Dashboard", href: "/mustahiq", icon: LayoutGrid },
    { label: "Nilai Raport", href: "/mustahiq/penilaian", icon: ClipboardList },
    { label: "Presensi", href: "/mustahiq/absensi", icon: CheckSquare },
    { label: "Data Kelas", href: "/mustahiq/kelas", icon: Users },
  ],
  keamanan: [
    { label: "Dashboard", href: "/keamanan", icon: LayoutGrid },
    { label: "Jurnal", href: "/keamanan/jurnal", icon: ShieldAlert },
    { label: "Cari Santri", href: "/keamanan/santri", icon: Users },
  ],
  wali_santri: [
    { label: "Dashboard", href: "/guardian", icon: LayoutGrid },
    { label: "Data Anak", href: "/guardian/children", icon: Users },
    { label: "Nilai Raport", href: "/guardian/akademik", icon: FileText },
    { label: "Presensi", href: "/guardian/kehadiran", icon: CheckSquare },
    { label: "Kedisiplinan", href: "/guardian/kedisiplinan", icon: ShieldAlert },
  ],
};
