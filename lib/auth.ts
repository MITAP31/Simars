import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_DEFAULT,
  SESSION_EXPIRY_REMEMBER,
  getCookieConfig,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";
import {
  hashPassword,
  verifyPassword,
  verifyAndUpgradePassword,
} from "@/lib/password";

export type SafeUser = {
  id: string;
  nama: string;
  username: string;
  email: string | null;
  role: string;
  aktif: boolean;
  created_at: Date;
  updated_at: Date;
};

export {
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_DEFAULT,
  SESSION_EXPIRY_REMEMBER,
  signSession,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  verifyAndUpgradePassword,
};

/**
 * Menyimpan token sesi ke dalam HttpOnly cookie pada response
 */
export async function setSessionCookie(token: string, maxAgeSeconds: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getCookieConfig(maxAgeSeconds));
}

/**
 * Menghapus cookie sesi dari browser
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getCookieConfig(0),
    maxAge: 0,
  });
}

/**
 * Membaca dan memverifikasi token sesi dari cookie saat ini
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Memvalidasi sesi langsung terhadap database PostgreSQL:
 * 1. Verifikasi tanda tangan dan expiration sesi.
 * 2. Ambil user dari database berdasarkan userId.
 * 3. Pastikan akun user masih ada dan aktif (aktif = true).
 * 4. Jika user tidak ditemukan atau nonaktif, otomatis hapus cookie sesi dan kembalikan null.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session || !session.userId) {
    return null;
  }

  if (!/^\d+$/.test(session.userId)) {
    await deleteSessionCookie();
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(session.userId) },
    });

    if (!user || !user.aktif) {
      await deleteSessionCookie();
      return null;
    }

    return {
      id: user.id.toString(),
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: user.role,
      aktif: user.aktif,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Memastikan pengguna memiliki sesi aktif dan valid di database.
 * Jika tidak, melempar redirect ke /login.
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?toast=session_expired");
  }
  return user;
}

/**
 * Memastikan pengguna adalah Admin yang aktif.
 * Jika belum login -> redirect ke /login.
 * Jika role adalah user biasa -> redirect ke /user/dashboard.
 */
export async function requireAdmin(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?toast=session_expired");
  }

  if (user.role !== "admin") {
    redirect("/user/dashboard");
  }

  return user;
}

/**
 * Memastikan pengguna adalah User biasa yang aktif.
 * Jika belum login -> redirect ke /login.
 * Jika role adalah admin -> redirect ke /admin/dashboard.
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?toast=session_expired");
  }

  if (user.role !== "user") {
    redirect("/admin/dashboard");
  }

  return user;
}
