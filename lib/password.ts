import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hash password baru menggunakan bcrypt dengan salt rounds aman
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifikasi password menggunakan bcrypt compare
 */
export async function verifyPassword(candidatePassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hash);
}

/**
 * Verifikasi password pengguna.
 * Jika akun lama masih menggunakan plaintext, verifikasi plaintext lalu otomatis
 * upgrade ke bcrypt hash di database tanpa membuat pengguna kehilangan akses.
 */
export async function verifyAndUpgradePassword(
  user: { id: bigint; password: string },
  candidatePassword: string
): Promise<boolean> {
  const isBcrypt =
    user.password.startsWith("$2a$") ||
    user.password.startsWith("$2b$") ||
    user.password.startsWith("$2y$");

  if (isBcrypt) {
    return bcrypt.compare(candidatePassword, user.password);
  }

  // Fallback transisi akun lama (Plaintext)
  if (candidatePassword === user.password) {
    try {
      const newHash = await hashPassword(candidatePassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    } catch {
      // Jika terjadi kendala update, jangan gagalkan proses login yang sah
    }
    return true;
  }

  return false;
}
