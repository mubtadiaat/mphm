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
    let targetLogin = "/";
    if (pathname.startsWith("/sekretariat")) {
      targetLogin = "/loginsekr";
    } else if (pathname.startsWith("/guardian")) {
      targetLogin = "/loginguardiant";
    } else if (
      pathname.startsWith("/mufattisy") ||
      pathname.startsWith("/mustahiq") ||
      pathname.startsWith("/pimpinan") ||
      pathname.startsWith("/keamanan")
    ) {
      targetLogin = "/loginStaff";
    }

    const loginUrl = new URL(targetLogin, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const loginPages = ["/loginsekr", "/loginguardiant", "/loginStaff"];
  const isLoginPage = loginPages.includes(pathname);

  if ((pathname === "/" || isLoginPage) && session) {
    const roleStr = String(session.role || "").trim().toLowerCase();
    let target = "/sekretariat";
    if (roleStr === "sek.pondok" || roleStr === "sek.madrasah" || roleStr === "admin" || roleStr === "superadmin" || roleStr === "sekretariat") target = "/sekretariat";
    else if (roleStr === "mufattisy") target = "/mufattisy";
    else if (roleStr === "mundzir" || roleStr === "pimpinan") target = "/pimpinan";
    else if (roleStr === "mustahiq") target = "/mustahiq";
    else if (roleStr === "keamanan" || roleStr === "petugas keamanan") target = "/keamanan";
    else if (roleStr === "wali santri" || roleStr === "wali.santri" || roleStr === "guardian") target = "/guardian";

    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
