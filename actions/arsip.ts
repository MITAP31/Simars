"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateRetention, needsArchiveRetentionReview, RETENTION_DECISION_PERMANEN } from "@/lib/retensi";

type ToastCode = "created" | "updated" | "deleted" | "restored" | "retention-permanent" | "retention-destroyed" | "retention-review-error" | "error";

const MAX_ARCHIVE_FILE_SIZE = 10 * 1024 * 1024;
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "arsip");
const allowedArchiveFiles = new Map([
  [".pdf", ["application/pdf"]],
  [".doc", ["application/msword"]],
  [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".png", ["image/png"]],
]);

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

type ExistingReferences = {
  kodeKlasifikasiId?: bigint;
  lokasiId?: bigint | null;
  jenisArsipId?: bigint | null;
  divisiId?: bigint | null;
};

async function validateReferences(kodeKlasifikasiId: bigint, lokasiId: bigint | null, jenisArsipId: bigint | null, divisiId: bigint | null, existing: ExistingReferences = {}) {
  const [kodeKlasifikasi, lokasi, jenisArsip, divisi] = await Promise.all([
    prisma.kode_klasifikasi.findFirst({
      where: { id: kodeKlasifikasiId, OR: [{ aktif: true }, { id: existing.kodeKlasifikasiId ?? BigInt(-1) }] },
      select: { id: true },
    }),
    lokasiId
      ? prisma.lokasi_penyimpanan.findFirst({
          where: { id: lokasiId, OR: [{ aktif: true }, { id: existing.lokasiId ?? BigInt(-1) }] },
          select: { id: true },
        })
      : null,
    jenisArsipId
      ? prisma.jenis_arsip.findFirst({ where: { id: jenisArsipId, OR: [{ aktif: true }, { id: existing.jenisArsipId ?? BigInt(-1) }] }, select: { id: true } })
      : null,
    divisiId
      ? prisma.divisi.findFirst({ where: { id: divisiId, OR: [{ aktif: true }, { id: existing.divisiId ?? BigInt(-1) }] }, select: { id: true } })
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

  if (divisiId && !divisi) {
    throw new Error("Divisi tidak ditemukan atau tidak aktif.");
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

  const lokasiIdValue = optionalString(formData, "lokasi_penyimpanan_id");
  const lokasiId = lokasiIdValue ? parseId(lokasiIdValue, "Lokasi simpan") : null;
  const divisiIdValue = optionalString(formData, "divisi_id");
  const divisiId = divisiIdValue ? parseId(divisiIdValue, "Divisi") : null;
  const jenisArsipIdValue = optionalString(formData, "jenis_arsip_id");
  const jenisArsipId = jenisArsipIdValue ? parseId(jenisArsipIdValue, "Jenis arsip") : null;

  return {
    nomorArsip,
    namaArsip,
    kodeKlasifikasiId,
    jumlah,
    lokasiId,
    divisiId,
    jenisArsipId,
    kurunWaktu: optionalString(formData, "kurun_waktu"),
    tanggalArsip: parseDate(optionalString(formData, "tanggal_arsip")),
    tingkatKeaslian: optionalString(formData, "tingkat_keaslian"),
    penulisPengirim: optionalString(formData, "penulis_pengirim"),
    keterangan: optionalString(formData, "keterangan"),
    file: formData.get("file_arsip"),
  };
}

async function saveArchiveFile(value: FormDataEntryValue | null) {
  if (value === null || (typeof value === "string" && !value)) return null;
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > MAX_ARCHIVE_FILE_SIZE) throw new Error("Ukuran file maksimal 10 MB.");

  const extension = path.extname(value.name).toLowerCase();
  const allowedMimeTypes = allowedArchiveFiles.get(extension);
  if (!allowedMimeTypes || (value.type && value.type !== "application/octet-stream" && !allowedMimeTypes.includes(value.type))) {
    throw new Error("Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, JPEG, atau PNG.");
  }

  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await value.arrayBuffer()), { flag: "wx" });
  return `/uploads/arsip/${filename}`;
}

export async function createArsip(formData: FormData) {
  const fallbackPath = "/admin/arsip/tambah";

  try {
    await requireAdmin();
    const data = parseArchiveForm(formData);
    await validateReferences(data.kodeKlasifikasiId, data.lokasiId, data.jenisArsipId, data.divisiId);
    const fileArsip = await saveArchiveFile(data.file);

    // Cari jadwal retensi untuk kode klasifikasi yang dipilih
    const klasifikasi = await prisma.kode_klasifikasi.findUnique({
      where: { id: data.kodeKlasifikasiId },
      include: { jadwal_retensi: true },
    });

    const retention =
      klasifikasi?.jadwal_retensi && klasifikasi.jadwal_retensi.aktif
        ? calculateRetention({
            tanggalArsip: data.tanggalArsip,
            jadwalRetensi: klasifikasi.jadwal_retensi,
          })
        : null;

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
        divisi_id: data.divisiId,
        lokasi_penyimpanan_id: data.lokasiId,
        penulis_pengirim: data.penulisPengirim,
        keterangan: data.keterangan,
        file_arsip: fileArsip,
        status_retensi: retention?.status_retensi ?? null,
        tanggal_dasar_retensi: retention?.tanggal_dasar_retensi ?? null,
        tanggal_mulai_aktif: retention?.tanggal_mulai_aktif ?? null,
        tanggal_selesai_aktif: retention?.tanggal_selesai_aktif ?? null,
        tanggal_selesai_inaktif: retention?.tanggal_selesai_inaktif ?? null,
      },
    });

    revalidatePath("/admin/arsip");
    redirect(pathWithToast("/admin/arsip", "created"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(returnPath(formData, fallbackPath), "retention-review-error"));
  }
}

export async function updateArsip(formData: FormData) {
  const fallbackPath = "/admin/arsip";

  try {
    await requireAdmin();
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const data = parseArchiveForm(formData);
    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      select: {
        id: true,
        kode_klasifikasi_id: true,
        lokasi_penyimpanan_id: true,
        jenis_arsip_id: true,
        divisi_id: true,
        tanggal_arsip: true,
      },
    });

    if (!arsip) {
      throw new Error("Arsip tidak ditemukan.");
    }

    await validateReferences(data.kodeKlasifikasiId, data.lokasiId, data.jenisArsipId, data.divisiId, {
      kodeKlasifikasiId: arsip.kode_klasifikasi_id,
      lokasiId: arsip.lokasi_penyimpanan_id,
      jenisArsipId: arsip.jenis_arsip_id,
      divisiId: arsip.divisi_id,
    });
    const fileArsip = await saveArchiveFile(data.file);

    // Hitung ulang retensi:
    // Cek jadwal retensi untuk kode klasifikasi baru/saat ini
    const klasifikasi = await prisma.kode_klasifikasi.findUnique({
      where: { id: data.kodeKlasifikasiId },
      include: { jadwal_retensi: true },
    });

    const retention =
      klasifikasi?.jadwal_retensi && klasifikasi.jadwal_retensi.aktif
        ? calculateRetention({
            tanggalArsip: data.tanggalArsip,
            jadwalRetensi: klasifikasi.jadwal_retensi,
          })
        : null;

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
        divisi_id: data.divisiId,
        lokasi_penyimpanan_id: data.lokasiId,
        penulis_pengirim: data.penulisPengirim,
        keterangan: data.keterangan,
        status_retensi: retention?.status_retensi ?? null,
        tanggal_dasar_retensi: retention?.tanggal_dasar_retensi ?? null,
        tanggal_mulai_aktif: retention?.tanggal_mulai_aktif ?? null,
        tanggal_selesai_aktif: retention?.tanggal_selesai_aktif ?? null,
        tanggal_selesai_inaktif: retention?.tanggal_selesai_inaktif ?? null,
        ...(fileArsip ? { file_arsip: fileArsip } : {}),
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
    await requireAdmin();
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
    await requireAdmin();
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

/** Menyimpan keputusan untuk arsip yang telah selesai retensi dan perlu ditinjau. */
export async function reviewRetentionArsip(formData: FormData) {
  const fallbackPath = "/admin/arsip";

  try {
    await requireAdmin();
    const arsipId = parseId(requiredString(formData, "id"), "ID arsip");
    const keputusan = requiredString(formData, "keputusan");
    if (keputusan !== "permanen" && keputusan !== "pemusnahan") throw new Error("Keputusan retensi tidak valid.");

    const arsip = await prisma.arsip.findUnique({
      where: { id: arsipId },
      include: { kode_klasifikasi: { include: { jadwal_retensi: true } } },
    });
    const schedule = arsip?.kode_klasifikasi.jadwal_retensi;
    const retention = arsip && schedule?.aktif
      ? calculateRetention({ tanggalArsip: arsip.tanggal_arsip, tanggalDasarKhusus: arsip.tanggal_dasar_retensi, jadwalRetensi: schedule })
      : null;

    if (!arsip || arsip.status_arsip !== "tersimpan" || !needsArchiveRetentionReview(retention, arsip.status_retensi)) {
      throw new Error("Arsip tidak memenuhi syarat peninjauan retensi.");
    }

    await prisma.arsip.update({
      where: { id: arsipId },
      data: keputusan === "permanen"
        ? { status_retensi: RETENTION_DECISION_PERMANEN }
        : { status_arsip: "dihapus", status_retensi: "SELESAI_RETENSI_DIMUSNAHKAN" },
    });

    const returnTo = returnPath(formData, fallbackPath);
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/arsip");
    revalidatePath("/admin/arsip/tempat-sampah");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/arsip/${arsipId.toString()}`);
    redirect(pathWithToast(returnTo, keputusan === "permanen" ? "retention-permanent" : "retention-destroyed"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(pathWithToast(returnPath(formData, fallbackPath), "retention-review-error"));
  }
}
