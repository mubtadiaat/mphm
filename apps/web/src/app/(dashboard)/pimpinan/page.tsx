"use client";

import dynamic from "next/dynamic";

const PimpinanDashboard = dynamic(
  () => import("@/features/pimpinan/components/PimpinanDashboard").then((mod) => mod.PimpinanDashboard),
  { ssr: false }
);

export default function PimpinanDashboardPage() {
  return <PimpinanDashboard />;
}
