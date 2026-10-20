import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  refreshSessionToken,
  getCookieConfig,
} from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block legacy files that may still exist beneath public/. They must only be
  // served through authenticated API routes after an explicit migration.
  if (pathname === "/uploads/arsip" || pathname.startsWith("/uploads/arsip/")) {
    return new Response(null, { status: 404 });
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // 1. Halaman Login
  if (pathname === "/login") {
    if (session) {
      const redirectPath = session.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    const response = NextResponse.next();
    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  // 2. Root path /
  if (pathname === "/") {
    if (session) {
      const redirectPath = session.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Area Protected: Admin (/admin/*) & User (/user/*)
  const isAdminPath = pathname.startsWith("/admin");
  const isUserPath = pathname.startsWith("/user");

  if (isAdminPath || isUserPath) {
    if (!session) {
      // Sesi tidak ada, expired (idle > 30 min / absolute > 8 jam), atau dibatalkan
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("toast", "session_expired");
      const redirectRes = NextResponse.redirect(loginUrl);
      if (token) {
        redirectRes.cookies.delete(SESSION_COOKIE_NAME);
      }
      return redirectRes;
    }

    // Validasi otorisasi role
    if (isAdminPath && session.role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    if (isUserPath && session.role !== "user") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    const response = NextResponse.next();

    // Proteksi Tombol Back & bfcache browser:
    // Mencegah browser menampilkan halaman terlindungi dari memori cache setelah logout
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Sliding Idle Window: Perbarui lastActive jika telah ada aktivitas user >= 60 detik
    const now = Math.floor(Date.now() / 1000);
    if (now - session.lastActive >= 60 && now < session.exp) {
      try {
        const refreshedToken = await refreshSessionToken(session, now);
        response.cookies.set(SESSION_COOKIE_NAME, refreshedToken, getCookieConfig());
      } catch {
        // Jika gagal refresh, tetap lanjutkan respons
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/user/:path*",
    "/uploads/arsip",
    "/uploads/arsip/:path*",
  ],
};