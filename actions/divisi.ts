"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const listPath = "/admin/master-data/divisi";

type DivisiToast = "division-created" | "division-updated" | "division-deleted" | "division-in-use" | "division-duplicate" | "division-invalid" | "division-error";

function pathWithToast(toast: DivisiToast) {
  return `${listPath}?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("ID divisi tidak valid.");
  return BigInt(value);
}

function requiredText(formData: FormData, field: string, label: string, maxLength: number) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} wajib diisi.`);
  const normalized = field === "kode" ? value.trim().toUpperCase() : value.trim();
  if (normalized.length > maxLength) throw new Error(`${label} maksimal ${maxLength} karakter.`);
  return normalized;
}

function optionalText(formData: FormData, field: string, maxLength: number) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${field} terlalu panjang.`);
  return normalized;
}

function parseAktif(formData: FormData) {
  const value = formData.get("aktif");
  if (value === null || value === "true") return true;
  if (value === "false") return false;
  throw new Error("Status divisi tidak valid.");
}

function parseData(formData: FormData) {
  return {
    kode: requiredText(formData, "kode", "Kode Divisi", 50),
    nama: requiredText(formData, "nama", "Nama Divisi", 255),
    keterangan: optionalText(formData, "keterangan", 5000),
    aktif: parseAktif(formData),
  };
}

function divisiError(error: unknown): DivisiToast {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "division-duplicate";
  if (error instanceof Error && error.message.includes("Kode divisi sudah digunakan")) return "division-duplicate";
  if (error instanceof Error && (error.message.includes("wajib diisi") || error.message.includes("maksimal") || error.message.includes("terlalu panjang") || error.message.includes("Status"))) return "division-invalid";
  return "division-error";
}

function revalidateDivisiPages() {
  revalidatePath(listPath);
  revalidatePath("/admin/master-data", "layout");
  revalidatePath("/admin/arsip");
  revalidatePath("/admin/arsip/tambah");
}

export async function createDivisi(formData: FormData) {
  try {
    await requireAdmin();
    const data = parseData(formData);
    const existing = await prisma.divisi.findUnique({ where: { kode: data.kode }, select: { id: true } });
    if (existing) throw new Error("Kode divisi sudah digunakan.");
    await prisma.divisi.create({ data });
    revalidateDivisiPages();
    redirect(pathWithToast("division-created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${listPath}/tambah?toast=${divisiError(error)}&toastId=${Date.now()}`);
  }
}

export async function updateDivisi(formData: FormData) {
  let id: bigint | null = null;
  try {
    await requireAdmin();
    id = parseId(formData.get("id"));
    const data = parseData(formData);
    const existing = await prisma.divisi.findUnique({ where: { kode: data.kode }, select: { id: true } });
    if (existing && existing.id !== id) throw new Error("Kode divisi sudah digunakan.");
    await prisma.divisi.update({ where: { id }, data });
    revalidateDivisiPages();
    redirect(pathWithToast("division-updated"));
  } catch (error) {
    unstable_rethrow(error);
    const fallback = id ? `${listPath}/${id.toString()}/edit` : listPath;
    redirect(`${fallback}?toast=${divisiError(error)}&toastId=${Date.now()}`);
  }
}

export async function deleteDivisi(formData: FormData) {
  try {
    await requireAdmin();
    const id = parseId(formData.get("id"));
    const [division, archiveCount] = await Promise.all([
      prisma.divisi.findUnique({ where: { id }, select: { id: true } }),
      prisma.arsip.count({ where: { divisi_id: id } }),
    ]);
    if (!division) throw new Error("Divisi tidak ditemukan.");
    if (archiveCount > 0) {
      revalidateDivisiPages();
      redirect(pathWithToast("division-in-use"));
    }
    await prisma.divisi.delete({ where: { id } });
    revalidateDivisiPages();
    redirect(pathWithToast("division-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(divisiError(error)));
  }
}
