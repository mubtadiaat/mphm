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

import { RoleTypes } from "@/lib/rbac";
export type { RoleTypes };

// WORKSPACE PONDOK PESANTREN PUTRI [P3HM Lirboyo]
export const SEKRETARIAT_PONDOK_NAV: NavMenu[] = [
  { label: "Dashboard", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "DATABASE PONDOK",
    items: [
      { label: "Data Santriwati", href: "/sekretariat/santri", icon: Users },
      { label: "Wali Santri", href: "/sekretariat/wali-santri", icon: UserCircle },
      { label: "Data Asrama", href: "/sekretariat/rooms", icon: Home },
      { label: "Data Pengurus", href: "/sekretariat/pengurus", icon: Users },
      { label: "Alumni", href: "/sekretariat/alumni", icon: Archive },
    ]
  },
  {
    group: "PERIZINAN & KEDISIPLINAN",
    items: [
      { label: "Perizinan", href: "/sekretariat/perizinan", icon: Ticket },
      { label: "Pelanggaran", href: "/sekretariat/pelanggaran", icon: ShieldAlert },
    ]
  },
  {
    group: "SISTEM & UTILITAS",
    items: [
      { label: "Manajemen Akun", href: "/sekretariat/users", icon: UserCheck },
      { label: "Audit Log", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Panduan & SOP Sistem", href: "/sekretariat/sop", icon: BookOpen },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

// WORKSPACE MADRASAH PUTRI [MPHM Lirboyo]
export const SEKRETARIAT_MADRASAH_NAV: NavMenu[] = [
  { label: "Dashboard", href: "/sekretariat", icon: LayoutGrid },
  {
    group: "MANAJEMEN DATA",
    items: [
      { label: "Data Siswi", href: "/sekretariat/santri", icon: Users },
      { label: "Data Kelas (Rombel)", href: "/sekretariat/kelas", icon: BookOpen },
    ]
  },
  {
    group: "PENGAJAR & PENGURUS",
    items: [
      { label: "Data Pengurus", href: "/sekretariat/pengurus", icon: Users },
      { label: "Data Pengajar", href: "/sekretariat/pengajar", icon: UserCheck },
    ]
  },
  {
    group: "AKADEMIK & PENILAIAN",
    items: [
      { label: "Kurikulum", href: "/sekretariat/kurikulum", icon: ClipboardList },
      { label: "Penilaian", href: "/sekretariat/penilaian", icon: FileText },
      { label: "Kenaikan Kelas", href: "/sekretariat/kenaikan-kelas", icon: Award },
    ]
  },
  {
    group: "DOKUMEN SISWI",
    items: [
      { label: "Sertifikat", href: "/sekretariat/sertifikat", icon: Award },
      { label: "Raport Kwartal", href: "/sekretariat/raport", icon: FileText },
      { label: "Ijazah Kelulusan", href: "/sekretariat/ijazah", icon: Award },
      { label: "Template Dokumen", href: "/sekretariat/template-dokumen", icon: FileCode },
    ]
  },
  {
    group: "SISTEM & UTILITAS",
    items: [
      { label: "Manajemen Akun", href: "/sekretariat/users", icon: UserCheck },
      { label: "Audit Log", href: "/sekretariat/audit-log", icon: History },
      { label: "Recycling Bin", href: "/sekretariat/recycle-bin", icon: Trash2 },
      { label: "Panduan & SOP Sistem", href: "/sekretariat/sop", icon: BookOpen },
      { label: "Konfigurasi Sistem", href: "/sekretariat/settings", icon: Settings },
    ]
  }
];

export const NAVIGATION_CONFIG: Record<RoleTypes, NavMenu[]> = {
  "sek.pondok": SEKRETARIAT_PONDOK_NAV,
  "sek.madrasah": SEKRETARIAT_MADRASAH_NAV,
  mustahiq: [
    { label: "Dashboard", href: "/mustahiq", icon: LayoutGrid },
    { label: "Nilai Raport", href: "/mustahiq/penilaian", icon: ClipboardList },
    { label: "Presensi", href: "/mustahiq/absensi", icon: CheckSquare },
    { label: "Data Kelas", href: "/mustahiq/kelas", icon: Users },
    { label: "Catatan Akhlaq", href: "/mustahiq/akhlaq", icon: ShieldAlert },
    { label: "Kenaikan Kelas", href: "/mustahiq/kenaikan-kelas", icon: Award },
  ],

  wali_santri: [
    { label: "Dashboard", href: "/guardian", icon: LayoutGrid },
    { label: "Data Anak", href: "/guardian/children", icon: Users },
    { label: "Nilai Raport", href: "/guardian/akademik", icon: FileText },
    { label: "Presensi", href: "/guardian/kehadiran", icon: CheckSquare },
    { label: "Kedisiplinan", href: "/guardian/kedisiplinan", icon: ShieldAlert },
  ],
};

