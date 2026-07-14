"use client";
import { use } from "react";
import { DynamicCustomTableTab } from "@/features/sekretariat/components/DynamicCustomTableTab";

export default function CustomTablePage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { slug } = params;
  
  if (!slug.startsWith("custom-")) {
    return <div>Halaman tidak ditemukan.</div>;
  }
  
  const tableKey = slug.replace("custom-", "");
  return <DynamicCustomTableTab tableKey={tableKey} role="sekretariat" />;
}
