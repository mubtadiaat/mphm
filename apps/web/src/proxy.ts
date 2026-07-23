import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("mphm_session")?.value;
  const session = token ? verifyJWT(token) : null;

  const dashboardPrefixes = [
    "/sekretariat",
    "/mufattisy",
    "/mustahiq",
    "/pimpinan",
    "/keamanan",
    "/guardian",
  ];

  const isDashboardRoute = dashboardPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isDashboardRoute && !session) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/" && session) {
    const roleStr = String(session.role || "").trim().toLowerCase();
    let target = "/sekretariat";
    if (roleStr === "sek.pondok" || roleStr === "sek.madrasah") target = "/sekretariat";
    else if (roleStr === "mufattisy") target = "/mufattisy";
    else if (roleStr === "mundzir" || roleStr === "pimpinan") target = "/pimpinan";
    else if (roleStr === "mustahiq") target = "/mustahiq";
    else if (roleStr === "keamanan" || roleStr === "petugas keamanan") target = "/keamanan";
    else if (roleStr === "wali santri" || roleStr === "guardian") target = "/guardian";

    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
