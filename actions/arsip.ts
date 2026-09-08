"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";

type ToastCode = "created" | "updated" | "deleted" | "restored" | "permanently-deleted" | "error";

function requiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} wajib diisi.`);
  }

  return value.trim();
}

function optionalString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseId(value: string, field: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${field} tidak valid.`);
  }

  return BigInt(value);
}

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Tanggal dokumen tidak valid.");
  }

  return date;
}

function pathWithToast(path: string, toast: ToastCode) {
  return `${path}${path.includes("?") ? "&" : "?"}toast=${toast}&toastId=${Date.now()}`;
}

function returnPath(formData: FormData, fallback: string) {
  const value = optionalString(formData, "return_to");

  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function redirectWithError(error: unknown, path: string): never {
  unstable_rethrow(error);
  redirect(pathWithToast(path, "error"));
}

async function validateReferences(kodeKlasifikasiId: bigint, lokasiId: bigint | null, jenisArsipId: bigint | null) {
  const [kodeKlasifikasi, lokasi, jenisArsip] = await Promise.all([
    prisma.kode_klasifikasi.findFirst({
      where: { id: kodeKlasifikasiId, aktif: true },
      select: { id: true },
    }),
    lokasiId
      ? prisma.lokasi_penyimpanan.findFirst({
          where: { id: lokasiId, aktif: true },
          select: { id: true },
        })
      : null,
    jenisArsipId
      ? prisma.jenis_arsip.findFirst({ where: { id: jenisArsipId, aktif: true }, select: { id: true } })
      : null,
  ]);

  if (!kodeKlasifikasi) {
    throw new Error("Kode klasifikasi tidak ditemukan atau tidak aktif.");
  }

  if (lokasiId && !lokasi) {
    throw new Error("Lokasi simpan tidak ditemukan atau tidak aktif.");
  }

  if (jenisArsipId && !jenisArsip) {
    throw new Error("Jenis arsip tidak ditemukan atau tidak aktif.");
  }
}

function parseArchiveForm(formData: FormData) {
  const nomorArsip = requiredString(formData, "nomor_arsip");
  const namaArsip = requiredString(formData, "nama_arsip");
  const kodeKlasifikasiId = parseId(
    requiredString(formData, "kode_klasifikasi_id"),
    "Kode klasifikasi",
  );
  const jumlah = Number(requiredString(formData, "jumlah"));

  if (!Number.isSafeInteger(jumlah) || jumlah < 1 || jumlah > 2_147_483_647) {
    throw new Error("Jumlah arsip harus berupa bilangan bulat minimal 1.");
  }

  const lokasiIdValue = optionalString(formData, "lokasi_id");
  const lokasiId = lokasiIdValue ? parseId(lokasiIdValue, "Lokasi simpan") : null;
  const jenisArsipIdValue = optionalString(formData, "jenis_arsip_id");
  const jenisArsipId = jenisArsipIdValue ? parseId(jenisArsipIdValue, "Jenis arsip") : null;

  return {
    nomorArsip,
    namaArsip,
    kodeKlasifikasiId,
    jumlah,
    lokasiId,
    jenisArsipId,
    kurunWaktu: optionalString(formData, "kurun_waktu"),
    tanggalArsip: parseDate(optionalString(formData, "tanggal_arsip")),
    tingkatKeaslian: optionalString(formData, "tingkat_keaslian"),
    penulisPengirim: optionalString(formData, "penulis_pengirim"),
    keterangan: optionalString(formData, "keterangan"),
  };
}

export async function createArsip(formData: FormData) {
  const fallbackPath = "/admin/arsip/tambah";

  try {
    const data = parseArchiveForm(formData);
    await validateReferences(data.kodeKlasifikasiId, data.lokasiId, data.jenisArsipId);

    await prisma.arsip.create({
      data: {
        nomor_arsip: data.nomorArsip,
        kode_klasifikasi_id: data.kodeKlasifikasiId,
        nama_arsip: data.namaArsip,
        jenis_arsip_id: data.jenisArsipId,
        jumlah: data.jumlah,
        satuan: "Lembar",
        kurun_waktu: data.kurunWaktu,
        tanggal_arsip: data.tanggalArsip,
        tingkat_keaslian: data.tingkatKeaslian,
        lokasi_id: data.lokasiId,
        penulis_pengirim: data.penulisPengirim,
      },
    });

    revalidatePath("/admin/arsip");
    redirect(pathWithToast("/admin/arsip", "created"));
  } catch (error) {
    redirectWithError(error, returnPath(formData, fallbackPath));
  }
}

export async function updateArsip(formData: FormData) {
  const fallbackPath = "/admin/arsip";

  try {
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const data = parseArchiveForm(formData);
    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      select: { id: true },
    });

    if (!arsip) {
      throw new Error("Arsip tidak ditemukan.");
    }

    await validateReferences(data.kodeKlasifikasiId, data.lokasiId, data.jenisArsipId);

    await prisma.arsip.update({
      where: { id: arsipId },
      data: {
        nomor_arsip: data.nomorArsip,
        kode_klasifikasi_id: data.kodeKlasifikasiId,
        nama_arsip: data.namaArsip,
        jenis_arsip_id: data.jenisArsipId,
        jumlah: data.jumlah,
        kurun_waktu: data.kurunWaktu,
        tanggal_arsip: data.tanggalArsip,
        tingkat_keaslian: data.tingkatKeaslian,
        lokasi_id: data.lokasiId,
        penulis_pengirim: data.penulisPengirim,
        keterangan: data.keterangan,
      },
    });

    const detailPath = `/admin/arsip/${arsipId.toString()}`;
    revalidatePath("/admin/arsip");
    revalidatePath(detailPath);
    redirect(pathWithToast(detailPath, "updated"));
  } catch (error) {
    redirectWithError(error, returnPath(formData, fallbackPath));
  }
}

export async function deleteArsip(formData: FormData) {
  const listPath = "/admin/arsip";

  try {
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      select: { id: true, status_arsip: true },
    });

    if (!arsip || arsip.status_arsip === "dihapus") {
      throw new Error("Arsip tidak dapat dihapus.");
    }

    await prisma.arsip.update({
      where: { id: arsipId },
      data: { status_arsip: "dihapus" },
    });

    revalidatePath(listPath);
    revalidatePath("/admin/arsip/tempat-sampah");
    redirect(pathWithToast(listPath, "deleted"));
  } catch (error) {
    redirectWithError(error, listPath);
  }
}

export async function restoreArsip(formData: FormData) {
  const trashPath = "/admin/arsip/tempat-sampah";

  try {
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      select: { id: true, status_arsip: true },
    });

    if (!arsip || arsip.status_arsip !== "dihapus") {
      throw new Error("Arsip tidak dapat dipulihkan.");
    }

    await prisma.arsip.update({
      where: { id: arsipId },
      data: { status_arsip: "tersimpan" },
    });

    revalidatePath("/admin/arsip");
    revalidatePath(trashPath);
    redirect(pathWithToast(trashPath, "restored"));
  } catch (error) {
    redirectWithError(error, trashPath);
  }
}

export async function permanentlyDeleteArsip(formData: FormData) {
  const trashPath = "/admin/arsip/tempat-sampah";

  try {
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      select: { id: true, status_arsip: true },
    });

    if (!arsip || arsip.status_arsip !== "dihapus") {
      throw new Error("Arsip tidak dapat dihapus permanen.");
    }

    await prisma.arsip.delete({
      where: { id: arsipId },
    });

    revalidatePath("/admin/arsip");
    revalidatePath(trashPath);
    redirect(pathWithToast(trashPath, "permanently-deleted"));
  } catch (error) {
    redirectWithError(error, trashPath);
  }
}
