import { cookies } from "next/headers";
import { RoleTypes } from "../../config/navigation.config";
import { DashboardShell } from "../../components/navigation/DashboardShell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read session token from cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  
  let role: RoleTypes = "mufattisy"; 

  if (sessionToken) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Cookie: `session_token=${sessionToken.value}`
        },
        cache: "no-store"
      });
      if (response.ok) {
        const body = await response.json();
        const backendRole = body?.data?.role;
        // Map backendRole to RoleTypes
        if (backendRole === "Sekretariat") role = "sekretariat";
        else if (backendRole === "Mufattisy") role = "mufattisy";
        else if (backendRole === "Mundzir") role = "mundzir";
        else if (backendRole === "Mustahiq") role = "mustahiq";
        else if (backendRole === "Petugas Keamanan") role = "keamanan";
        else if (backendRole === "Wali Santri") role = "wali_santri";
      }
    } catch (e) {
      console.error("Failed to fetch user session in layout:", e);
    }
  }

  return (
    <DashboardShell role={role}>
      {children}
    </DashboardShell>
  );
}
