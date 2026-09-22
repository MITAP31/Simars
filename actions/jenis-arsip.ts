"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type CategoryToast = "category-created" | "category-updated" | "category-deleted" | "category-deactivated" | "category-duplicate" | "category-invalid" | "category-error";

function categoryPath(toast: CategoryToast) {
  return `/admin/kategori?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("ID jenis arsip tidak valid.");
  return BigInt(value);
}

function parseName(formData: FormData) {
  const value = formData.get("nama");
  if (typeof value !== "string" || !value.trim()) throw new Error("Nama jenis arsip wajib diisi.");
  return value.trim();
}

function slugBase(name: string) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || "kategori";
}

async function uniqueSlug(name: string, currentId?: bigint) {
  const base = slugBase(name);
  let suffix = 1;
  let candidate = base;

  while (true) {
    const existing = await prisma.jenis_arsip.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === currentId) return candidate;

    suffix += 1;
    const suffixText = `-${suffix}`;
    candidate = `${base.slice(0, 120 - suffixText.length)}${suffixText}`;
  }
}

function parseKeterangan(formData: FormData) {
  const value = formData.get("keterangan");
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseAktif(formData: FormData) {
  const value = formData.get("aktif");
  if (value === null || value === "true") return true;
  if (value === "false") return false;
  throw new Error("Status jenis arsip tidak valid.");
}

function categoryError(error: unknown): CategoryToast {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "category-duplicate";
  if (error instanceof Error && error.message.includes("wajib diisi")) return "category-invalid";
  return "category-error";
}

function revalidateCategoryPages() {
  revalidatePath("/admin/kategori");
  revalidatePath("/admin/kategori", "layout");
  revalidatePath("/admin/arsip");
  revalidatePath("/admin/arsip/tambah");
}

export async function createJenisArsip(formData: FormData) {
  try {
    await requireAdmin();
    const nama = parseName(formData);
    await prisma.jenis_arsip.create({ data: { nama, slug: await uniqueSlug(nama), keterangan: parseKeterangan(formData), aktif: parseAktif(formData) } });
    revalidateCategoryPages();
    redirect(categoryPath("category-created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/kategori/tambah?toast=${categoryError(error)}&toastId=${Date.now()}`);
  }
}

export async function updateJenisArsip(formData: FormData) {
  let id: bigint | null = null;
  try {
    await requireAdmin();
    id = parseId(formData.get("id"));
    const existing = await prisma.jenis_arsip.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new Error("Jenis arsip tidak ditemukan.");
    const nama = parseName(formData);
    await prisma.jenis_arsip.update({ where: { id }, data: { nama, slug: await uniqueSlug(nama, id), keterangan: parseKeterangan(formData), aktif: parseAktif(formData) } });
    revalidateCategoryPages();
    redirect(categoryPath("category-updated"));
  } catch (error) {
    unstable_rethrow(error);
    const fallback = id ? `/admin/kategori/${id.toString()}/edit` : "/admin/kategori";
    redirect(`${fallback}?toast=${categoryError(error)}&toastId=${Date.now()}`);
  }
}

export async function deleteJenisArsip(formData: FormData) {
  try {
    await requireAdmin();
    const id = parseId(formData.get("id"));
    const category = await prisma.jenis_arsip.findUnique({ where: { id }, select: { id: true } });
    if (!category) throw new Error("Jenis arsip tidak ditemukan.");
    const usageCount = await prisma.arsip.count({ where: { jenis_arsip_id: id } });
    if (usageCount > 0) {
      await prisma.jenis_arsip.update({ where: { id }, data: { aktif: false } });
      revalidateCategoryPages();
      redirect(categoryPath("category-deactivated"));
    }
    await prisma.jenis_arsip.delete({ where: { id } });
    revalidateCategoryPages();
    redirect(categoryPath("category-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(categoryPath(categoryError(error)));
  }
}
