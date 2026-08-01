import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Developer Master Control Cockpit — MPHM & P3HM",
  description: "Portal Pengendalian Master System & Database Developer 100% (m.p3hm.my.id/developer)",
};

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950">
      {children}
    </div>
  );
}
