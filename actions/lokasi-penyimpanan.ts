"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const listPath = "/admin/master-data/lokasi-penyimpanan";

type LocationToast = "location-created" | "location-updated" | "location-deleted" | "location-in-use" | "location-has-children" | "location-hierarchy-invalid" | "location-duplicate" | "location-invalid" | "location-error";

function pathWithToast(toast: LocationToast) {
  return `${listPath}?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("ID lokasi penyimpanan tidak valid.");
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
  throw new Error("Status lokasi penyimpanan tidak valid.");
}

function parseIsInduk(formData: FormData) {
  return formData.get("is_induk") === "true";
}

async function parseParentId(formData: FormData, currentId?: bigint) {
  const value = formData.get("parent_id");
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("Lokasi induk tidak valid.");

  const parentId = BigInt(value);
  if (parentId === currentId) throw new Error("Lokasi penyimpanan tidak dapat menjadi induk dirinya sendiri.");

  const parent = await prisma.lokasi_penyimpanan.findUnique({ where: { id: parentId }, select: { id: true } });
  if (!parent) throw new Error("Lokasi induk tidak ditemukan.");

  if (currentId) {
    const locations = await prisma.lokasi_penyimpanan.findMany({ select: { id: true, parent_id: true } });
    const parents = new Map(locations.map((location) => [location.id.toString(), location.parent_id]));
    let ancestorId: bigint | null = parent.id;
    const visited = new Set<string>();
    while (ancestorId !== null && !visited.has(ancestorId.toString())) {
      if (ancestorId === currentId) throw new Error("Lokasi induk tidak boleh merupakan turunan dari lokasi ini.");
      visited.add(ancestorId.toString());
      ancestorId = parents.get(ancestorId.toString()) ?? null;
    }
  }

  return parentId;
}

async function parseData(formData: FormData, currentId?: bigint) {
  return {
    jenis_lokasi: requiredText(formData, "jenis_lokasi", "Jenis lokasi", 50),
    kode: requiredText(formData, "kode", "Kode lokasi", 50),
    nama: requiredText(formData, "nama", "Nama lokasi", 255),
    parent_id: await parseParentId(formData, currentId),
    is_induk: parseIsInduk(formData),
    keterangan: optionalText(formData, "keterangan", 5000),
    aktif: parseAktif(formData),
  };
}

function locationError(error: unknown): LocationToast {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "location-duplicate";
  if (error instanceof Error && error.message.includes("Kode lokasi sudah digunakan")) return "location-duplicate";
  if (error instanceof Error && error.message.includes("masih memiliki anak")) return "location-hierarchy-invalid";
  if (error instanceof Error && (error.message.includes("wajib diisi") || error.message.includes("maksimal") || error.message.includes("terlalu panjang") || error.message.includes("Status") || error.message.includes("induk") || error.message.includes("Induk"))) return "location-invalid";
  return "location-error";
}

function revalidateLocationPages() {
  revalidatePath(listPath);
  revalidatePath("/admin/master-data", "layout");
  revalidatePath("/admin/arsip");
  revalidatePath("/admin/arsip/tambah");
}

export async function createLokasiPenyimpanan(formData: FormData) {
  try {
    await requireAdmin();
    const data = await parseData(formData);
    const existing = await prisma.lokasi_penyimpanan.findUnique({ where: { kode: data.kode }, select: { id: true } });
    if (existing) throw new Error("Kode lokasi sudah digunakan.");
    await prisma.lokasi_penyimpanan.create({ data });
    revalidateLocationPages();
    redirect(pathWithToast("location-created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${listPath}/tambah?toast=${locationError(error)}&toastId=${Date.now()}`);
  }
}

export async function updateLokasiPenyimpanan(formData: FormData) {
  let id: bigint | null = null;
  try {
    await requireAdmin();
    id = parseId(formData.get("id"));
    const data = await parseData(formData, id);
    if (!data.is_induk) {
      const childCount = await prisma.lokasi_penyimpanan.count({ where: { parent_id: id } });
      if (childCount > 0) throw new Error("Lokasi penyimpanan ini masih memiliki anak dan tidak dapat diubah menjadi bukan induk.");
    }
    const existing = await prisma.lokasi_penyimpanan.findUnique({ where: { kode: data.kode }, select: { id: true } });
    if (existing && existing.id !== id) throw new Error("Kode lokasi sudah digunakan.");
    await prisma.lokasi_penyimpanan.update({ where: { id }, data });
    revalidateLocationPages();
    redirect(pathWithToast("location-updated"));
  } catch (error) {
    unstable_rethrow(error);
    const fallback = id ? `${listPath}/${id.toString()}/edit` : listPath;
    redirect(`${fallback}?toast=${locationError(error)}&toastId=${Date.now()}`);
  }
}

export async function deleteLokasiPenyimpanan(formData: FormData) {
  try {
    await requireAdmin();
    const id = parseId(formData.get("id"));
    const [location, archiveCount, childCount] = await Promise.all([
      prisma.lokasi_penyimpanan.findUnique({ where: { id }, select: { id: true } }),
      prisma.arsip.count({ where: { lokasi_penyimpanan_id: id } }),
      prisma.lokasi_penyimpanan.count({ where: { parent_id: id } }),
    ]);
    if (!location) throw new Error("Lokasi penyimpanan tidak ditemukan.");
    if (archiveCount > 0) {
      revalidateLocationPages();
      redirect(pathWithToast("location-in-use"));
    }
    if (childCount > 0) {
      revalidateLocationPages();
      redirect(pathWithToast("location-has-children"));
    }
    await prisma.lokasi_penyimpanan.delete({ where: { id } });
    revalidateLocationPages();
    redirect(pathWithToast("location-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(locationError(error)));
  }
}
