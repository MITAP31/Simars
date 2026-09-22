"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function text(formData: FormData, field: string, label: string, maxLength: number, required = false) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    if (required) throw new Error(`${label} wajib diisi.`);
    return null;
  }
  const result = value.trim();
  if (result.length > maxLength) throw new Error(`${label} maksimal ${maxLength} karakter.`);
  return result;
}

export async function updatePengaturanSistem(formData: FormData) {
  try {
    await requireAdmin();
    const namaInstansi = text(formData, "nama_instansi", "Nama instansi", 255, true)!;
    const namaSistem = text(formData, "nama_sistem", "Nama sistem", 100, true)!;
    const deskripsi = text(formData, "deskripsi", "Deskripsi", 2000);
    const tema = formData.get("tema");
    if (tema !== "terang" && tema !== "gelap" && tema !== "sistem") throw new Error("Tema tidak valid.");
    const notifikasiAktif = formData.get("notifikasi_aktif") === "true";
    await prisma.pengaturan_sistem.upsert({ where: { id: 1 }, update: { nama_instansi: namaInstansi, nama_sistem: namaSistem, deskripsi, tema, notifikasi_aktif: notifikasiAktif }, create: { id: 1, nama_instansi: namaInstansi, nama_sistem: namaSistem, deskripsi, tema, notifikasi_aktif: notifikasiAktif } });
    revalidatePath("/", "layout");
    revalidatePath("/admin/pengaturan");
    redirect(`/admin/pengaturan?toast=settings-updated&toastId=${Date.now()}`);
  } catch (error) {
    unstable_rethrow(error);
    const toast = error instanceof Error && (error.message.includes("wajib") || error.message.includes("maksimal") || error.message.includes("Tema")) ? "settings-invalid" : "settings-error";
    redirect(`/admin/pengaturan?toast=${toast}&toastId=${Date.now()}`);
  }
}
