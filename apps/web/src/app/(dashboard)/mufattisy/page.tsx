"use client";

import dynamic from "next/dynamic";

const MufattisyDashboard = dynamic(
  () => import("@/features/mufattisy/components/MufattisyDashboard").then((mod) => mod.MufattisyDashboard),
  { ssr: false }
);

export default function MufattisyDashboardPage() {
  return <MufattisyDashboard />;
}
