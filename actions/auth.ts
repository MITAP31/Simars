"use server";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  deleteSessionCookie,
  revokeSessionToken,
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

  const username = typeof usernameRaw === "string" ? usernameRaw.trim() : "";
  const password = typeof passwordRaw === "string" ? passwordRaw : "";

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

    // 6. Buat token bertanda tangan kriptografis HMAC-SHA256 (Absolute timeout 8 jam, Idle timeout 30 menit)
    const token = await signSession({
      userId: user.id.toString(),
      username: user.username,
      role: user.role,
      divisiId: user.divisi_id ? user.divisi_id.toString() : null,
    });

    // 7. Pasang HttpOnly Browser Session Cookie (tanpa persistent maxAge agar berakhir saat browser ditutup)
    await setSessionCookie(token);

    // 8. Arahkan ke dashboard sesuai role yang sudah ada
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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // 1. Batalkan token sesi di server (revocation) sehingga tidak dapat dipakai lagi
  if (token) {
    await revokeSessionToken(token);
  }

  // 2. Hapus cookie sesi dari browser
  await deleteSessionCookie();

  // 3. Arahkan kembali ke halaman login
  redirect("/login");
}