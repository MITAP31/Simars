"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const listPath = "/admin/master-data/jadwal-retensi";

type RetentionToast =
  | "retention-created"
  | "retention-updated"
  | "retention-deleted"
  | "retention-duplicate"
  | "retention-invalid"
  | "retention-in-use"
  | "retention-error";

function pathWithToast(toast: RetentionToast) {
  return `${listPath}?toast=${toast}&toastId=${Date.now()}`;
}

function parseId(value: FormDataEntryValue | null, label = "ID") {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} tidak valid.`);
  }
  return BigInt(value);
}

function parsePositiveInt(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} harus berupa angka bulat 0 atau lebih.`);
  }
  const parsed = Number.parseInt(value, 10);
  if (parsed < 0 || parsed > 999) {
    throw new Error(`${label} harus antara 0 dan 999.`);
  }
  return parsed;
}

function parseSatuan(formData: FormData, field: string, label: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    return "Tahun";
  }
  const trimmed = value.trim();
  const allowed = ["Tahun", "Bulan", "Hari"];
  if (!allowed.includes(trimmed)) {
    throw new Error(`Satuan ${label} tidak valid. Pilihan: Tahun, Bulan, Hari.`);
  }
  return trimmed;
}

function parseDasarPerhitungan(formData: FormData) {
  const value = formData.get("dasar_perhitungan");
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length > 255) {
    throw new Error("Dasar perhitungan retensi aktif maksimal 255 karakter.");
  }
  return trimmed;
}

function parseKeteranganAkhir(formData: FormData) {
  const value = formData.get("keterangan_akhir");
  const allowed = ["PERMANEN", "MUSNAH", "MUSNAH_DENGAN_KETERANGAN_KHUSUS"];
  if (typeof value !== "string" || !allowed.includes(value.trim())) {
    throw new Error("Keterangan akhir tidak valid.");
  }
  return value.trim();
}

function optionalText(formData: FormData, field: string, maxLength = 2000) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`Panjang isian ${field} maksimal ${maxLength} karakter.`);
  }
  return trimmed;
}

function parseAktif(formData: FormData) {
  const value = formData.get("aktif");
  if (value === null || value === "true") return true;
  if (value === "false") return false;
  throw new Error("Status aktif tidak valid.");
}

export async function createJadwalRetensi(formData: FormData) {
  try {
    await requireAdmin();

    const kodeKlasifikasiId = parseId(formData.get("kode_klasifikasi_id"), "Kode klasifikasi");
    const retensiAktif = parsePositiveInt(formData, "retensi_aktif", "Retensi aktif");
    const satuanRetensiAktif = parseSatuan(formData, "satuan_retensi_aktif", "retensi aktif");
    const dasarPerhitungan = parseDasarPerhitungan(formData);
    const keteranganDasar = optionalText(formData, "keterangan_dasar");
    const retensiInaktif = parsePositiveInt(formData, "retensi_inaktif", "Retensi inaktif");
    const satuanRetensiInaktif = parseSatuan(formData, "satuan_retensi_inaktif", "retensi aktif");
    const keteranganAkhir = parseKeteranganAkhir(formData);
    const keteranganKhusus = optionalText(formData, "keterangan_khusus");
    const aktif = parseAktif(formData);

    const klasifikasi = await prisma.kode_klasifikasi.findUnique({
      where: { id: kodeKlasifikasiId },
      include: { jadwal_retensi: true },
    });

    if (!klasifikasi) {
      redirect(pathWithToast("retention-invalid"));
    }

    if (klasifikasi.jadwal_retensi) {
      redirect(pathWithToast("retention-duplicate"));
    }

    await prisma.jadwal_retensi.create({
      data: {
        kode_klasifikasi_id: kodeKlasifikasiId,
        retensi_aktif: retensiAktif,
        satuan_retensi_aktif: satuanRetensiAktif,
        dasar_perhitungan: dasarPerhitungan,
        keterangan_dasar: keteranganDasar,
        retensi_inaktif: retensiInaktif,
        satuan_retensi_inaktif: satuanRetensiInaktif,
        keterangan_akhir: keteranganAkhir,
        keterangan_khusus: keteranganKhusus,
        aktif,
      },
    });

    revalidatePath(listPath);
    revalidatePath("/admin/master-data");
    revalidatePath("/admin/arsip");
    redirect(pathWithToast("retention-created"));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Gagal membuat jadwal retensi:", error);
    redirect(pathWithToast("retention-error"));
  }
}

export async function updateJadwalRetensi(formData: FormData) {
  try {
    await requireAdmin();

    const id = parseId(formData.get("id"), "ID jadwal retensi");
    const retensiAktif = parsePositiveInt(formData, "retensi_aktif", "Retensi aktif");
    const satuanRetensiAktif = parseSatuan(formData, "satuan_retensi_aktif", "retensi aktif");
    const dasarPerhitungan = parseDasarPerhitungan(formData);
    const keteranganDasar = optionalText(formData, "keterangan_dasar");
    const retensiInaktif = parsePositiveInt(formData, "retensi_inaktif", "Retensi inaktif");
    const satuanRetensiInaktif = parseSatuan(formData, "satuan_retensi_inaktif", "retensi aktif");
    const keteranganAkhir = parseKeteranganAkhir(formData);
    const keteranganKhusus = optionalText(formData, "keterangan_khusus");
    const aktif = parseAktif(formData);

    const existing = await prisma.jadwal_retensi.findUnique({
      where: { id },
    });

    if (!existing) {
      redirect(pathWithToast("retention-invalid"));
    }

    await prisma.jadwal_retensi.update({
      where: { id },
      data: {
        retensi_aktif: retensiAktif,
        satuan_retensi_aktif: satuanRetensiAktif,
        dasar_perhitungan: dasarPerhitungan,
        keterangan_dasar: keteranganDasar,
        retensi_inaktif: retensiInaktif,
        satuan_retensi_inaktif: satuanRetensiInaktif,
        keterangan_akhir: keteranganAkhir,
        keterangan_khusus: keteranganKhusus,
        aktif,
      },
    });

    revalidatePath(listPath);
    revalidatePath(`/admin/master-data/jadwal-retensi/${id.toString()}`);
    revalidatePath(`/admin/master-data/jadwal-retensi/${id.toString()}/edit`);
    revalidatePath("/admin/arsip");
    redirect(pathWithToast("retention-updated"));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Gagal memperbarui jadwal retensi:", error);
    redirect(pathWithToast("retention-error"));
  }
}

export async function deleteJadwalRetensi(formData: FormData) {
  try {
    await requireAdmin();

    const id = parseId(formData.get("id"), "ID jadwal retensi");

    const existing = await prisma.jadwal_retensi.findUnique({
      where: { id },
      select: {
        id: true,
        kode_klasifikasi_id: true,
      },
    });

    if (!existing) {
      redirect(pathWithToast("retention-invalid"));
    }

    const arsipCount = await prisma.arsip.count({
      where: {
        kode_klasifikasi_id: existing.kode_klasifikasi_id,
        status_arsip: "tersimpan",
      },
    });

    if (arsipCount > 0) {
      redirect(pathWithToast("retention-in-use"));
    }

    await prisma.jadwal_retensi.delete({
      where: { id },
    });

    revalidatePath(listPath);
    revalidatePath("/admin/master-data");
    revalidatePath("/admin/arsip");
    redirect(pathWithToast("retention-deleted"));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Gagal menghapus jadwal retensi:", error);
    redirect(pathWithToast("retention-error"));
  }
}

export async function toggleAktifJadwalRetensi(formData: FormData) {
  try {
    await requireAdmin();

    const id = parseId(formData.get("id"), "ID jadwal retensi");
    const existing = await prisma.jadwal_retensi.findUnique({
      where: { id },
      select: { id: true, aktif: true },
    });

    if (!existing) {
      redirect(pathWithToast("retention-invalid"));
    }

    await prisma.jadwal_retensi.update({
      where: { id },
      data: { aktif: !existing.aktif },
    });

    revalidatePath(listPath);
    redirect(pathWithToast("retention-updated"));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Gagal mengubah status jadwal retensi:", error);
    redirect(pathWithToast("retention-error"));
  }
}
