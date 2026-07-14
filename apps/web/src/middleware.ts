import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, favicon, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Read session_token cookie
  const sessionToken = request.cookies.get("session_token")?.value;

  // 3. Define protected route prefixes
  const protectedPrefixes = [
    "/sekretariat",
    "/mufattisy",
    "/pimpinan",
    "/mustahiq",
    "/keamanan",
    "/guardian",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 4. Protected route without token → redirect to login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. Login page with token → allow (frontend will validate via /api/auth/me)
  // Tidak melakukan redirect otomatis dari login karena token bisa expired.
  // Biarkan frontend menangani redirect setelah validasi session.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
