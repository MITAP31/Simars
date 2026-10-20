"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const listPath = "/admin/pengguna";

type UserToast =
  | "user-created"
  | "user-updated"
  | "user-deleted"
  | "user-activated"
  | "user-deactivated"
  | "user-password-reset"
  | "user-self-deactivate-forbidden"
  | "user-self-delete-forbidden"
  | "user-last-admin-forbidden"
  | "user-duplicate-username"
  | "user-duplicate-email"
  | "user-password-mismatch"
  | "user-password-short"
  | "user-divisi-invalid"
  | "user-invalid"
  | "user-error";

function pathWithToast(toast: UserToast) {
  return `${listPath}?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("ID pengguna tidak valid.");
  return BigInt(value);
}

function parseNama(formData: FormData) {
  const value = formData.get("nama");
  if (typeof value !== "string" || !value.trim()) throw new Error("Nama lengkap wajib diisi.");
  const nama = value.trim();
  if (nama.length > 255) throw new Error("Nama lengkap maksimal 255 karakter.");
  return nama;
}

function parseUsername(formData: FormData) {
  const value = formData.get("username");
  if (typeof value !== "string" || !value.trim()) throw new Error("Username wajib diisi.");
  const username = value.trim().toLowerCase();
  if (username.length < 3) throw new Error("Username minimal 3 karakter.");
  if (username.length > 100) throw new Error("Username maksimal 100 karakter.");
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new Error("Username hanya boleh mengandung huruf, angka, titik, strip, dan garis bawah.");
  }
  return username;
}

function parseEmail(formData: FormData) {
  const value = formData.get("email");
  if (typeof value !== "string" || !value.trim()) return null;
  const email = value.trim().toLowerCase();
  if (email.length > 255) throw new Error("Email maksimal 255 karakter.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Format email tidak valid.");
  }
  return email;
}

function parseRole(formData: FormData) {
  const value = formData.get("role");
  if (value !== "admin" && value !== "user") {
    throw new Error("Role pengguna tidak valid.");
  }
  return value;
}

function parseAktif(formData: FormData) {
  const value = formData.get("aktif");
  if (value === null || value === "true" || value === "on") return true;
  if (value === "false") return false;
  throw new Error("Status pengguna tidak valid.");
}

function parsePasswordAndConfirm(formData: FormData) {
  const password = formData.get("password");
  const konfirmasi = formData.get("konfirmasi_password");
  if (typeof password !== "string" || !password) throw new Error("Password wajib diisi.");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");
  if (typeof konfirmasi !== "string" || password !== konfirmasi) {
    throw new Error("Konfirmasi password tidak sama.");
  }
  return password;
}

async function parseDivisiId(formData: FormData): Promise<bigint | null> {
  const value = formData.get("divisi_id");
  if (value === null || value === undefined) return null;
  const str = typeof value === "string" ? value.trim() : "";
  if (!str || str === "" || str === "null" || str === "none") return null;

  if (!/^\d+$/.test(str)) {
    throw new Error("ID divisi tidak valid.");
  }

  const divisiId = BigInt(str);
  const existingDivisi = await prisma.divisi.findUnique({
    where: { id: divisiId },
    select: { id: true },
  });

  if (!existingDivisi) {
    throw new Error("Divisi tidak ditemukan.");
  }

  return divisiId;
}

function userError(error: unknown): UserToast {
  if (error instanceof Error) {
    if (error.message.includes("Username sudah digunakan")) return "user-duplicate-username";
    if (error.message.includes("Email sudah digunakan")) return "user-duplicate-email";
    if (error.message.includes("minimal 8 karakter")) return "user-password-short";
    if (error.message.includes("Konfirmasi password tidak sama")) return "user-password-mismatch";
    if (error.message.includes("Divisi tidak ditemukan") || error.message.includes("ID divisi tidak valid")) {
      return "user-divisi-invalid";
    }
    if (
      error.message.includes("wajib diisi") ||
      error.message.includes("tidak valid") ||
      error.message.includes("maksimal")
    ) {
      return "user-invalid";
    }
  }
  return "user-error";
}

function revalidateUserPages() {
  revalidatePath(listPath);
  revalidatePath(listPath, "layout");
}

export async function createUser(formData: FormData) {
  try {
    await requireAdmin();
    const nama = parseNama(formData);
    const username = parseUsername(formData);
    const email = parseEmail(formData);
    const role = parseRole(formData);
    const divisi_id = await parseDivisiId(formData);
    const password = parsePasswordAndConfirm(formData);
    const aktif = parseAktif(formData);

    // Cek username duplikat
    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
    if (existingUsername) throw new Error("Username sudah digunakan.");

    // Cek email duplikat jika email diisi
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });
      if (existingEmail) throw new Error("Email sudah digunakan.");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        nama,
        username,
        email,
        role,
        divisi_id,
        password: hashedPassword,
        aktif,
      },
    });

    revalidateUserPages();
    redirect(pathWithToast("user-created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/pengguna/tambah?toast=${userError(error)}&toastId=${Date.now()}`);
  }
}

export async function updateUser(formData: FormData) {
  let id: bigint | null = null;
  try {
    const currentAdmin = await requireAdmin();
    id = parseId(formData.get("id"));

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) throw new Error("Pengguna tidak ditemukan.");

    const nama = parseNama(formData);
    const username = parseUsername(formData);
    const email = parseEmail(formData);
    const role = parseRole(formData);
    const divisi_id = await parseDivisiId(formData);
    const aktif = parseAktif(formData);

    // Proteksi: Tidak boleh mendegradasi role admin terakhir atau menonaktifkannya
    if (existingUser.role === "admin") {
      const totalActiveAdmins = await prisma.user.count({
        where: { role: "admin", aktif: true },
      });

      // Jika user yang diedit saat ini aktif, dan role akan diubah ke 'user' atau dinonaktifkan
      if (existingUser.aktif && (role !== "admin" || !aktif)) {
        if (totalActiveAdmins <= 1) {
          redirect(pathWithToast("user-last-admin-forbidden"));
        }
      }

      // Admin tidak boleh menonaktifkan akun dirinya sendiri
      if (currentAdmin.id === id.toString() && !aktif) {
        redirect(pathWithToast("user-self-deactivate-forbidden"));
      }
    }

    // Cek username duplikat (selain user ini)
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        NOT: { id },
      },
      select: { id: true },
    });
    if (existingUsername) throw new Error("Username sudah digunakan.");

    // Cek email duplikat (selain user ini)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          NOT: { id },
        },
        select: { id: true },
      });
      if (existingEmail) throw new Error("Email sudah digunakan.");
    }

    await prisma.user.update({
      where: { id },
      data: {
        nama,
        username,
        email,
        role,
        divisi_id,
        aktif,
      },
    });

    revalidateUserPages();
    redirect(pathWithToast("user-updated"));
  } catch (error) {
    unstable_rethrow(error);
    const fallback = id ? `/admin/pengguna/${id.toString()}/edit` : listPath;
    redirect(`${fallback}?toast=${userError(error)}&toastId=${Date.now()}`);
  }
}

export async function toggleUserStatus(formData: FormData) {
  try {
    const currentAdmin = await requireAdmin();
    const id = parseId(formData.get("id"));

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, aktif: true },
    });
    if (!targetUser) throw new Error("Pengguna tidak ditemukan.");

    const newAktif = !targetUser.aktif;

    // Jika ingin menonaktifkan user
    if (!newAktif) {
      // 1. Tidak boleh menonaktifkan akun diri sendiri
      if (currentAdmin.id === id.toString()) {
        redirect(pathWithToast("user-self-deactivate-forbidden"));
      }

      // 2. Tidak boleh menonaktifkan admin terakhir
      if (targetUser.role === "admin") {
        const totalActiveAdmins = await prisma.user.count({
          where: { role: "admin", aktif: true },
        });
        if (totalActiveAdmins <= 1) {
          redirect(pathWithToast("user-last-admin-forbidden"));
        }
      }
    }

    await prisma.user.update({
      where: { id },
      data: { aktif: newAktif },
    });

    revalidateUserPages();
    redirect(pathWithToast(newAktif ? "user-activated" : "user-deactivated"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(userError(error)));
  }
}

export async function resetUserPassword(formData: FormData) {
  try {
    await requireAdmin();
    const id = parseId(formData.get("id"));

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!targetUser) throw new Error("Pengguna tidak ditemukan.");

    const password = parsePasswordAndConfirm(formData);
    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    revalidateUserPages();
    redirect(pathWithToast("user-password-reset"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(userError(error)));
  }
}

export async function deleteUser(input: FormData | string | bigint) {
  try {
    const currentAdmin = await requireAdmin();
    let id: bigint;
    if (typeof input === "bigint") {
      id = input;
    } else if (typeof input === "string") {
      id = parseId(input);
    } else if (input instanceof FormData) {
      id = parseId(input.get("id"));
    } else {
      throw new Error("ID pengguna tidak valid.");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, aktif: true, username: true, nama: true },
    });
    if (!targetUser) throw new Error("Pengguna tidak ditemukan.");

    // 1. Proteksi: Tidak boleh menghapus akun sendiri
    if (currentAdmin.id === id.toString()) {
      redirect(pathWithToast("user-self-delete-forbidden"));
    }

    // 2. Proteksi: Tidak boleh menghapus admin aktif terakhir
    if (targetUser.role === "admin" && targetUser.aktif) {
      const totalActiveAdmins = await prisma.user.count({
        where: { role: "admin", aktif: true },
      });
      if (totalActiveAdmins <= 1) {
        redirect(pathWithToast("user-last-admin-forbidden"));
      }
    }

    // Eksekusi hard delete (relasi divisi menggunakan onDelete: SetNull, arsip tidak memiliki FK user)
    await prisma.user.delete({
      where: { id },
    });

    revalidateUserPages();
    redirect(pathWithToast("user-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(userError(error)));
  }
}