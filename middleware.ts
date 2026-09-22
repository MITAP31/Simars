import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // 1. Halaman Login
  if (pathname === "/login") {
    if (session) {
      const redirectPath = session.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // 2. Root path /
  if (pathname === "/") {
    if (session) {
      const redirectPath = session.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Area Admin (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "admin") {
      // User mencoba akses URL admin langsung -> redirect ke dashboard user
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 4. Area User (/user/*)
  if (pathname.startsWith("/user")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "user") {
      // Admin mencoba akses URL user langsung -> redirect ke dashboard admin
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/user/:path*",
  ],
};
