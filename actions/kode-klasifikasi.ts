"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";

const listPath = "/admin/pengaturan/kode-klasifikasi";

type ClassificationToast =
  | "classification-created"
  | "classification-updated"
  | "classification-deleted"
  | "classification-duplicate"
  | "classification-invalid"
  | "classification-in-use"
  | "classification-hierarchy-invalid"
  | "classification-error";

function pathWithToast(toast: ClassificationToast) {
  return `${listPath}?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("ID kode klasifikasi tidak valid.");
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
  throw new Error("Status kode klasifikasi tidak valid.");
}

function parseIsInduk(formData: FormData) {
  return formData.get("is_induk") === "true";
}

async function parseParentId(formData: FormData, currentId?: bigint) {
  const value = formData.get("parent_id");
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("Induk klasifikasi tidak valid.");

  const parentId = BigInt(value);
  if (parentId === currentId) throw new Error("Kode klasifikasi tidak dapat menjadi induk dirinya sendiri.");

  const parent = await prisma.kode_klasifikasi.findUnique({ where: { id: parentId }, select: { id: true } });
  if (!parent) throw new Error("Induk klasifikasi tidak ditemukan.");

  if (currentId) {
    const classifications = await prisma.kode_klasifikasi.findMany({ select: { id: true, parent_id: true } });
    const parents = new Map(classifications.map((classification) => [classification.id.toString(), classification.parent_id]));
    let ancestorId: bigint | null = parent.id;
    const visited = new Set<string>();
    while (ancestorId !== null && !visited.has(ancestorId.toString())) {
      if (ancestorId === currentId) throw new Error("Induk klasifikasi tidak boleh merupakan anak dari kode ini.");
      visited.add(ancestorId.toString());
      ancestorId = parents.get(ancestorId.toString()) ?? null;
    }
  }

  return parentId;
}

async function parseData(formData: FormData, currentId?: bigint) {
  return {
    kode: requiredText(formData, "kode", "Kode", 50),
    nama: requiredText(formData, "nama", "Nama", 255),
    jenis_klasifikasi: optionalText(formData, "jenis_klasifikasi", 50),
    keterangan: optionalText(formData, "keterangan", 5000),
    aktif: parseAktif(formData),
    is_induk: parseIsInduk(formData),
    parent_id: await parseParentId(formData, currentId),
  };
}

function classificationError(error: unknown): ClassificationToast {
  if (error instanceof Error && error.message.includes("Kode sudah digunakan")) return "classification-duplicate";
  if (error instanceof Error && error.message.includes("masih memiliki anak")) return "classification-hierarchy-invalid";
  if (error instanceof Error && (error.message.includes("wajib diisi") || error.message.includes("maksimal") || error.message.includes("Induk") || error.message.includes("induk"))) return "classification-invalid";
  return "classification-error";
}

function revalidateClassificationPages() {
  revalidatePath(listPath);
  revalidatePath("/admin/pengaturan", "layout");
  revalidatePath("/admin/arsip");
  revalidatePath("/admin/arsip/tambah");
}

export async function createKodeKlasifikasi(formData: FormData) {
  try {
    const data = await parseData(formData);
    const existing = await prisma.kode_klasifikasi.findFirst({ where: { kode: data.kode }, select: { id: true } });
    if (existing) throw new Error("Kode sudah digunakan.");
    await prisma.kode_klasifikasi.create({ data });
    revalidateClassificationPages();
    redirect(pathWithToast("classification-created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${listPath}/tambah?toast=${classificationError(error)}&toastId=${Date.now()}`);
  }
}

export async function updateKodeKlasifikasi(formData: FormData) {
  let id: bigint | null = null;
  try {
    id = parseId(formData.get("id"));
    const data = await parseData(formData, id);
    if (!data.is_induk) {
      const childCount = await prisma.kode_klasifikasi.count({ where: { parent_id: id } });
      if (childCount > 0) throw new Error("Kode klasifikasi ini masih memiliki anak dan tidak dapat diubah menjadi bukan induk.");
    }
    const existing = await prisma.kode_klasifikasi.findFirst({ where: { kode: data.kode }, select: { id: true } });
    if (existing && existing.id !== id) throw new Error("Kode sudah digunakan.");
    await prisma.kode_klasifikasi.update({ where: { id }, data });
    revalidateClassificationPages();
    redirect(pathWithToast("classification-updated"));
  } catch (error) {
    unstable_rethrow(error);
    const fallback = id ? `${listPath}/${id.toString()}/edit` : listPath;
    redirect(`${fallback}?toast=${classificationError(error)}&toastId=${Date.now()}`);
  }
}

export async function deleteKodeKlasifikasi(formData: FormData) {
  try {
    const id = parseId(formData.get("id"));
    const [classification, archiveCount, childCount] = await Promise.all([
      prisma.kode_klasifikasi.findUnique({ where: { id }, select: { id: true } }),
      prisma.arsip.count({ where: { kode_klasifikasi_id: id } }),
      prisma.kode_klasifikasi.count({ where: { parent_id: id } }),
    ]);
    if (!classification) throw new Error("Kode klasifikasi tidak ditemukan.");
    if (archiveCount > 0 || childCount > 0) {
      revalidateClassificationPages();
      redirect(pathWithToast("classification-in-use"));
    }
    await prisma.kode_klasifikasi.delete({ where: { id } });
    revalidateClassificationPages();
    redirect(pathWithToast("classification-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(classificationError(error)));
  }
}
