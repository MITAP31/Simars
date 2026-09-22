"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_EXPIRY_DEFAULT,
  SESSION_EXPIRY_REMEMBER,
  deleteSessionCookie,
  setSessionCookie,
  signSession,
  verifyAndUpgradePassword,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  const usernameRaw = formData.get("username");
  const passwordRaw = formData.get("password");
  const rememberRaw = formData.get("remember");

  const username = typeof usernameRaw === "string" ? usernameRaw.trim() : "";
  const password = typeof passwordRaw === "string" ? passwordRaw : "";
  const remember = rememberRaw === "on" || rememberRaw === "true" || rememberRaw === "1";

  // 1. Validasi input dasar
  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  let redirectTarget: string | null = null;

  try {
    // 2. Cari user berdasarkan username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    // 3. User tidak ditemukan -> pesan umum (anti username enumeration)
    if (!user) {
      return { error: "Username atau password salah." };
    }

    // 4. Periksa apakah akun aktif
    if (!user.aktif) {
      return { error: "Akun Anda tidak aktif. Silakan hubungi administrator." };
    }

    // 5. Verifikasi password dengan bcrypt (dan upgrade jika masih plaintext legacy)
    const isPasswordValid = await verifyAndUpgradePassword(
      { id: user.id, password: user.password },
      password
    );

    if (!isPasswordValid) {
      return { error: "Username atau password salah." };
    }

    // 6. Tentukan durasi sesi (Remember Me vs Default)
    const maxAgeSeconds = remember ? SESSION_EXPIRY_REMEMBER : SESSION_EXPIRY_DEFAULT;

    // 7. Buat token bertanda tangan kriptografis HMAC-SHA256
    const token = await signSession(
      {
        userId: user.id.toString(),
        username: user.username,
        role: user.role,
      },
      maxAgeSeconds
    );

    // 8. Pasang HttpOnly cookie
    await setSessionCookie(token, maxAgeSeconds);

    // 9. Arahkan ke dashboard sesuai role
    redirectTarget = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Terjadi kesalahan pada sistem. Silakan coba lagi." };
  }

  if (redirectTarget) {
    redirect(redirectTarget);
  }
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect("/login");
}
