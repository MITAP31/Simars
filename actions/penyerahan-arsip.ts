"use server";

import { randomUUID } from "node:crypto";
import { mkdir, open, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { generateBeritaAcaraPdf, type BeritaAcaraData } from "@/lib/berita-acara-pdf";

export type CreatePenyerahanInput = {
  kodeKlasifikasiId: string;
  namaArsip: string;
  jenisArsipId?: string | null;
  jumlah?: number | string | null;
  satuan?: string | null;
  penulis?: string | null;
  kurunWaktu?: string | null;
  tanggalArsip?: string | null;
  tingkatKeaslian?: string | null;
  lokasiPenyimpananId?: string | null;
  keterangan?: string | null;
  fileArsip?: File | null;
};

export type CreatePenyerahanResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    detail_id: string;
    nama_arsip: string;
    status: string;
    tanggal_penyerahan: string;
    file_arsip?: string | null;
  };
};

export type UpdatePenyerahanInput = {
  id: string | number;
  kodeKlasifikasiId: string;
  namaArsip: string;
  jenisArsipId?: string | null;
  jumlah?: number | string | null;
  satuan?: string | null;
  penulis?: string | null;
  kurunWaktu?: string | null;
  tanggalArsip?: string | null;
  tingkatKeaslian?: string | null;
  lokasiPenyimpananId?: string | null;
  keterangan?: string | null;
  fileArsip?: File | null;
  hapusFile?: boolean;
};

export type UpdatePenyerahanResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    detail_id: string;
    nama_arsip: string;
    status: string;
    tanggal_penyerahan: string;
    file_arsip?: string | null;
  };
};

const MAX_ARCHIVE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const uploadDirectory = path.join(process.cwd(), "storage", "uploads", "arsip");
const beritaAcaraDirectory = path.join(uploadDirectory, "berita-acara");
const allowedArchiveFiles = new Map([
  [".pdf", ["application/pdf"]],
  [".doc", ["application/msword"]],
  [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".png", ["image/png"]],
]);

function parseId(value: string | number | bigint | null | undefined, label: string): bigint {
  if (value === null || value === undefined || value === "") {
    throw new Error(`${label} wajib diisi.`);
  }
  if (typeof value === "bigint") return value;
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) {
    throw new Error(`${label} tidak valid.`);
  }
  return BigInt(str);
}

function parseOptionalId(value: string | number | bigint | null | undefined): bigint | null {
  if (!value) return null;
  if (typeof value === "bigint") return value;
  const str = String(value).trim();
  if (!str || !/^\d+$/.test(str)) return null;
  return BigInt(str);
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== trimmed) {
    throw new Error("Format tanggal dokumen arsip tidak valid.");
  }
  return date;
}

/**
 * Menyimpan berkas soft file arsip ke storage privat sistem SIMARS
 */
async function saveDetailFile(value: FormDataEntryValue | File | null | undefined): Promise<string | null> {
  if (value === null || value === undefined || (typeof value === "string" && !value)) return null;
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > MAX_ARCHIVE_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 10 MB.");
  }

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

/**
 * Menghapus berkas fisik dari storage privat
 */
async function deletePhysicalFile(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;
  try {
    const cleanPath = filePath.replace(/^\/?/, "");
    const targetFilePath = path.resolve(process.cwd(), "storage", cleanPath);
    const safePrefix = path.resolve(process.cwd(), "storage", "uploads", "arsip");
    if (targetFilePath.startsWith(safePrefix)) {
      await unlink(targetFilePath);
    }
  } catch {
    // Abaikan jika file tidak ditemukan
  }
}

type StoredPdfState = "valid" | "missing" | "invalid";

async function inspectStoredBeritaAcara(filePath: string | null): Promise<StoredPdfState> {
  if (!filePath) return "missing";

  const cleanPath = filePath.replace(/^\/?/, "");
  const targetFilePath = path.resolve(process.cwd(), "storage", cleanPath);
  const safePrefix = path.resolve(process.cwd(), "storage", "uploads", "arsip") + path.sep;
  if (!targetFilePath.startsWith(safePrefix)) return "invalid";

  let file;
  try {
    file = await open(targetFilePath, "r");
    const stats = await file.stat();
    if (!stats.isFile() || stats.size < 5) return "invalid";
    const signature = Buffer.alloc(5);
    const { bytesRead } = await file.read(signature, 0, signature.length, 0);
    return bytesRead === 5 && signature.toString("ascii") === "%PDF-" ? "valid" : "invalid";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT" ? "missing" : "invalid";
  } finally {
    await file?.close().catch(() => undefined);
  }
}

/**
 * Server Action: createPenyerahanArsip
 *
 * Menerima data formulir penyerahan arsip dari User dan menyimpannya secara atomik
 * ke tabel penyerahan_arsip (header) dan detail_penyerahan_arsip (detail).
 * Soft file arsip disimpan pada detail_penyerahan_arsip.file_arsip.
 *
 * Status transaksi: "DIBUAT".
 * arsip_id tetap NULL (tidak membuat data arsip resmi sebelum diproses tim arsip).
 *
 * Sumber kebenaran user_id dan divisi_id HANYA berasal dari sesi login server (requireUser).
 */
export async function createPenyerahanArsip(
  input: CreatePenyerahanInput | FormData
): Promise<CreatePenyerahanResponse> {
  let savedFilePath: string | null = null;

  try {
    // 1. Otorisasi Pengguna (Role: User)
    const currentUser = await requireUser();

    if (!currentUser.divisi_id || !currentUser.divisi) {
      return {
        success: false,
        message:
          "Divisi belum ditentukan pada akun Anda. Silakan hubungi Administrator untuk menetapkan Divisi sebelum membuat formulir penyerahan arsip.",
      };
    }

    const userId = BigInt(currentUser.id);
    const divisiId = BigInt(currentUser.divisi_id);
    const divisiKode = currentUser.divisi.kode;
    const divisiNama = currentUser.divisi.nama;

    // 2. Normalisasi Input (mendukung Object maupun FormData)
    let rawKodeKlasifikasiId: string | number | undefined;
    let rawNamaArsip: string | undefined;
    let rawJenisArsipId: string | number | null | undefined;
    let rawJumlah: number | string | null | undefined;
    let rawSatuan: string | null | undefined;
    let rawPenulis: string | null | undefined;
    let rawKurunWaktu: string | null | undefined;
    let rawTanggalArsip: string | null | undefined;
    let rawTingkatKeaslian: string | null | undefined;
    let rawLokasiPenyimpananId: string | number | null | undefined;
    let rawKeterangan: string | null | undefined;
    let rawFile: FormDataEntryValue | File | null = null;

    if (input instanceof FormData) {
      rawKodeKlasifikasiId = (input.get("kode_klasifikasi_id") as string) || undefined;
      rawNamaArsip = (input.get("nama_arsip") as string) || (input.get("judul_arsip") as string) || undefined;
      rawJenisArsipId = (input.get("jenis_arsip_id") as string) || null;
      rawJumlah = (input.get("jumlah") as string) || "1";
      rawSatuan = (input.get("satuan") as string) || "Berkas";
      rawPenulis = (input.get("penulis_pengirim") as string) || (input.get("penulis") as string) || null;
      rawKurunWaktu = (input.get("kurun_waktu") as string) || null;
      rawTanggalArsip = (input.get("tanggal_arsip") as string) || null;
      rawTingkatKeaslian = (input.get("tingkat_keaslian") as string) || "Asli";
      rawLokasiPenyimpananId = (input.get("lokasi_penyimpanan_id") as string) || null;
      rawKeterangan = (input.get("keterangan") as string) || null;
      rawFile = input.get("file_arsip") || input.get("file");
    } else {
      rawKodeKlasifikasiId = input.kodeKlasifikasiId;
      rawNamaArsip = input.namaArsip;
      rawJenisArsipId = input.jenisArsipId;
      rawJumlah = input.jumlah;
      rawSatuan = input.satuan;
      rawPenulis = input.penulis;
      rawKurunWaktu = input.kurunWaktu;
      rawTanggalArsip = input.tanggalArsip;
      rawTingkatKeaslian = input.tingkatKeaslian;
      rawLokasiPenyimpananId = input.lokasiPenyimpananId;
      rawKeterangan = input.keterangan;
      rawFile = input.fileArsip ?? null;
    }

    // 3. Validasi Field Wajib
    if (!rawNamaArsip || !rawNamaArsip.trim()) {
      return {
        success: false,
        message: "Judul Arsip wajib diisi.",
      };
    }
    const namaArsip = rawNamaArsip.trim();
    if (namaArsip.length > 255) {
      return {
        success: false,
        message: "Judul Arsip maksimal 255 karakter.",
      };
    }

    const kodeKlasifikasiId = parseId(rawKodeKlasifikasiId, "Kode klasifikasi");
    const jenisArsipId = parseOptionalId(rawJenisArsipId);
    const lokasiPenyimpananId = parseOptionalId(rawLokasiPenyimpananId);

    const jumlahInt = Number(rawJumlah ?? 1);
    if (!Number.isSafeInteger(jumlahInt) || jumlahInt < 1) {
      return {
        success: false,
        message: "Jumlah arsip minimal 1.",
      };
    }

    const satuan = (rawSatuan?.trim() || "Berkas").slice(0, 50);
    const penulisPengirim = rawPenulis?.trim() ? rawPenulis.trim().slice(0, 255) : null;
    const kurunWaktu = rawKurunWaktu?.trim() ? rawKurunWaktu.trim().slice(0, 100) : null;
    const tingkatKeaslian = (rawTingkatKeaslian?.trim() || "Asli").slice(0, 50);
    const tanggalArsip = parseDate(rawTanggalArsip);
    const keterangan = rawKeterangan?.trim() || null;

    // 4. Validasi Relasi Master Data
    const [klasifikasi, jenisArsip, lokasi] = await Promise.all([
      prisma.kode_klasifikasi.findFirst({
        where: { id: kodeKlasifikasiId, aktif: true },
        select: { id: true, kode: true, nama: true },
      }),
      jenisArsipId
        ? prisma.jenis_arsip.findFirst({
            where: { id: jenisArsipId, aktif: true },
            select: { id: true },
          })
        : null,
      lokasiPenyimpananId
        ? prisma.lokasi_penyimpanan.findFirst({
            where: { id: lokasiPenyimpananId, aktif: true },
            select: { id: true },
          })
        : null,
    ]);

    if (!klasifikasi) {
      return {
        success: false,
        message: "Kode klasifikasi tidak ditemukan atau sedang tidak aktif.",
      };
    }

    if (jenisArsipId && !jenisArsip) {
      return {
        success: false,
        message: "Jenis arsip yang dipilih tidak valid atau sudah nonaktif.",
      };
    }

    if (lokasiPenyimpananId && !lokasi) {
      return {
        success: false,
        message: "Lokasi penyimpanan yang dipilih tidak valid atau sudah nonaktif.",
      };
    }

    // 5. Upload File Fisik (jika disertakan)
    if (rawFile) {
      savedFilePath = await saveDetailFile(rawFile);
    }

    // 6. Eksekusi Atomic Transaction (Header + Detail)
    const result = await prisma.$transaction(async (tx) => {
      // Simpan Header transaksi dengan status "DIBUAT"
      const header = await tx.penyerahan_arsip.create({
        data: {
          user_id: userId,
          divisi_id: divisiId,
          tanggal_penyerahan: new Date(),
          status: "DIBUAT",
          pihak_pertama_id: userId,
          pihak_pertama_nama: currentUser.nama,
          sumber_penyerahan: `${divisiKode} - ${divisiNama}`,
          keterangan: keterangan,
        },
      });

      // Simpan Detail arsip (soft file tersimpan di detail_penyerahan_arsip.file_arsip)
      const detail = await tx.detail_penyerahan_arsip.create({
        data: {
          penyerahan_id: header.id,
          kode_klasifikasi_id: kodeKlasifikasiId,
          nama_arsip: namaArsip,
          jenis_arsip_id: jenisArsipId,
          jumlah: jumlahInt,
          satuan: satuan,
          penulis_pengirim: penulisPengirim,
          kurun_waktu: kurunWaktu,
          tanggal_arsip: tanggalArsip,
          tingkat_keaslian: tingkatKeaslian,
          lokasi_penyimpanan_id: lokasiPenyimpananId,
          keterangan: keterangan,
          file_arsip: savedFilePath,
          arsip_id: null, // Tetap NULL saat user submit
        },
      });

      return { header, detail };
    });

    // 7. Cache Revalidation
    revalidatePath("/user/pengajuan");
    revalidatePath("/user/riwayat");
    revalidatePath("/user/dashboard");

    return {
      success: true,
      message: "Penyerahan berhasil disimpan.",
      data: {
        id: result.header.id.toString(),
        detail_id: result.detail.id.toString(),
        nama_arsip: result.detail.nama_arsip,
        status: result.header.status,
        tanggal_penyerahan: result.header.tanggal_penyerahan.toISOString().slice(0, 10),
        file_arsip: result.detail.file_arsip,
      },
    };
  } catch (error) {
    if (savedFilePath) {
      await deletePhysicalFile(savedFilePath);
    }
    console.error("Gagal membuat penyerahan arsip:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat menyimpan penyerahan arsip.",
    };
  }
}

/**
 * Server Action: updatePenyerahanArsip
 *
 * Mengubah data penyerahan arsip milik user yang sedang login.
 * Ownership dicek ketat di server-side: penyerahan_arsip.user_id === currentUser.id.
 * Hanya penyerahan dengan status "DIBUAT" yang dapat diubah.
 */
export async function updatePenyerahanArsip(
  input: UpdatePenyerahanInput | FormData
): Promise<UpdatePenyerahanResponse> {
  let newSavedFilePath: string | null = null;
  let oldFilePathToDelete: string | null = null;

  try {
    const currentUser = await requireUser();
    const currentUserId = BigInt(currentUser.id);

    // Normalisasi Input
    let idRaw: string | number | undefined;
    let rawKodeKlasifikasiId: string | number | undefined;
    let rawNamaArsip: string | undefined;
    let rawJenisArsipId: string | number | null | undefined;
    let rawJumlah: number | string | null | undefined;
    let rawSatuan: string | null | undefined;
    let rawPenulis: string | null | undefined;
    let rawKurunWaktu: string | null | undefined;
    let rawTanggalArsip: string | null | undefined;
    let rawTingkatKeaslian: string | null | undefined;
    let rawLokasiPenyimpananId: string | number | null | undefined;
    let rawKeterangan: string | null | undefined;
    let rawFile: FormDataEntryValue | File | null = null;
    let hapusFile = false;

    if (input instanceof FormData) {
      idRaw = (input.get("id") as string) || (input.get("penyerahan_id") as string) || undefined;
      rawKodeKlasifikasiId = (input.get("kode_klasifikasi_id") as string) || undefined;
      rawNamaArsip = (input.get("nama_arsip") as string) || (input.get("judul_arsip") as string) || undefined;
      rawJenisArsipId = (input.get("jenis_arsip_id") as string) || null;
      rawJumlah = (input.get("jumlah") as string) || "1";
      rawSatuan = (input.get("satuan") as string) || "Berkas";
      rawPenulis = (input.get("penulis_pengirim") as string) || (input.get("penulis") as string) || null;
      rawKurunWaktu = (input.get("kurun_waktu") as string) || null;
      rawTanggalArsip = (input.get("tanggal_arsip") as string) || null;
      rawTingkatKeaslian = (input.get("tingkat_keaslian") as string) || "Asli";
      rawLokasiPenyimpananId = (input.get("lokasi_penyimpanan_id") as string) || null;
      rawKeterangan = (input.get("keterangan") as string) || null;
      rawFile = input.get("file_arsip") || input.get("file");
      hapusFile = input.get("hapus_file") === "true";
    } else {
      idRaw = input.id;
      rawKodeKlasifikasiId = input.kodeKlasifikasiId;
      rawNamaArsip = input.namaArsip;
      rawJenisArsipId = input.jenisArsipId;
      rawJumlah = input.jumlah;
      rawSatuan = input.satuan;
      rawPenulis = input.penulis;
      rawKurunWaktu = input.kurunWaktu;
      rawTanggalArsip = input.tanggalArsip;
      rawTingkatKeaslian = input.tingkatKeaslian;
      rawLokasiPenyimpananId = input.lokasiPenyimpananId;
      rawKeterangan = input.keterangan;
      rawFile = input.fileArsip ?? null;
      hapusFile = input.hapusFile ?? false;
    }

    const penyerahanId = parseId(idRaw, "ID Penyerahan");

    const existing = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanId },
      include: { details: true },
    });

    if (!existing) {
      return { success: false, message: "Data penyerahan arsip tidak ditemukan." };
    }

    // Ownership check server-side
    if (existing.user_id !== currentUserId) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah penyerahan arsip milik pengguna lain.",
      };
    }

    if (existing.status !== "DIBUAT") {
      return {
        success: false,
        message: `Penyerahan tidak dapat diubah karena status saat ini adalah "${existing.status}".`,
      };
    }

    if (existing.file_berita_acara) {
      return {
        success: false,
        message: "Penyerahan memiliki Berita Acara tersimpan dan tidak dapat diubah. Hubungi Administrator jika dokumen perlu dikoreksi.",
      };
    }

    const detailItem = existing.details[0];
    if (!detailItem) {
      return { success: false, message: "Detail penyerahan arsip tidak ditemukan." };
    }

    // Validasi Field Wajib
    if (!rawNamaArsip || !rawNamaArsip.trim()) {
      return { success: false, message: "Judul Arsip wajib diisi." };
    }
    const namaArsip = rawNamaArsip.trim();
    if (namaArsip.length > 255) {
      return { success: false, message: "Judul Arsip maksimal 255 karakter." };
    }

    const kodeKlasifikasiId = parseId(rawKodeKlasifikasiId, "Kode klasifikasi");
    const jenisArsipId = parseOptionalId(rawJenisArsipId);
    const lokasiPenyimpananId = parseOptionalId(rawLokasiPenyimpananId);

    const jumlahInt = Number(rawJumlah ?? 1);
    if (!Number.isSafeInteger(jumlahInt) || jumlahInt < 1) {
      return { success: false, message: "Jumlah arsip minimal 1." };
    }

    const satuan = (rawSatuan?.trim() || "Berkas").slice(0, 50);
    const penulisPengirim = rawPenulis?.trim() ? rawPenulis.trim().slice(0, 255) : null;
    const kurunWaktu = rawKurunWaktu?.trim() ? rawKurunWaktu.trim().slice(0, 100) : null;
    const tingkatKeaslian = (rawTingkatKeaslian?.trim() || "Asli").slice(0, 50);
    const tanggalArsip = parseDate(rawTanggalArsip);
    const keterangan = rawKeterangan?.trim() || null;

    // Validasi Relasi Master Data
    const [klasifikasi, jenisArsip, lokasi] = await Promise.all([
      prisma.kode_klasifikasi.findFirst({
        where: { id: kodeKlasifikasiId, aktif: true },
        select: { id: true },
      }),
      jenisArsipId
        ? prisma.jenis_arsip.findFirst({
            where: { id: jenisArsipId, aktif: true },
            select: { id: true },
          })
        : null,
      lokasiPenyimpananId
        ? prisma.lokasi_penyimpanan.findFirst({
            where: { id: lokasiPenyimpananId, aktif: true },
            select: { id: true },
          })
        : null,
    ]);

    if (!klasifikasi) {
      return { success: false, message: "Kode klasifikasi tidak ditemukan atau sedang tidak aktif." };
    }
    if (jenisArsipId && !jenisArsip) {
      return { success: false, message: "Jenis arsip yang dipilih tidak valid atau sudah nonaktif." };
    }
    if (lokasiPenyimpananId && !lokasi) {
      return { success: false, message: "Lokasi penyimpanan yang dipilih tidak valid atau sudah nonaktif." };
    }

    // Resolusi Berkas Soft File
    let finalFileArsip = detailItem.file_arsip;

    if (rawFile && rawFile instanceof File && rawFile.size > 0) {
      newSavedFilePath = await saveDetailFile(rawFile);
      finalFileArsip = newSavedFilePath;
      if (detailItem.file_arsip) {
        oldFilePathToDelete = detailItem.file_arsip;
      }
    } else if (hapusFile) {
      finalFileArsip = null;
      if (detailItem.file_arsip) {
        oldFilePathToDelete = detailItem.file_arsip;
      }
    }

    // Eksekusi Atomic Transaction Update
    const result = await prisma.$transaction(async (tx) => {
      const headerUpdate = await tx.penyerahan_arsip.updateMany({
        where: {
          id: penyerahanId,
          user_id: currentUserId,
          status: "DIBUAT",
          file_berita_acara: null,
        },
        data: {
          keterangan: keterangan,
          updated_at: new Date(),
        },
      });

      if (headerUpdate.count !== 1) {
        throw new Error("Status penyerahan berubah atau Berita Acara telah diterbitkan. Muat ulang halaman sebelum melanjutkan.");
      }

      const updatedHeader = await tx.penyerahan_arsip.findUniqueOrThrow({
        where: { id: penyerahanId },
      });

      const updatedDetail = await tx.detail_penyerahan_arsip.update({
        where: { id: detailItem.id },
        data: {
          kode_klasifikasi_id: kodeKlasifikasiId,
          nama_arsip: namaArsip,
          jenis_arsip_id: jenisArsipId,
          jumlah: jumlahInt,
          satuan: satuan,
          penulis_pengirim: penulisPengirim,
          kurun_waktu: kurunWaktu,
          tanggal_arsip: tanggalArsip,
          tingkat_keaslian: tingkatKeaslian,
          lokasi_penyimpanan_id: lokasiPenyimpananId,
          keterangan: keterangan,
          file_arsip: finalFileArsip,
          updated_at: new Date(),
        },
      });

      return { header: updatedHeader, detail: updatedDetail };
    });

    if (oldFilePathToDelete) {
      await deletePhysicalFile(oldFilePathToDelete);
    }
    revalidatePath("/user/pengajuan");
    revalidatePath("/user/riwayat");
    revalidatePath("/user/dashboard");

    return {
      success: true,
      message: `Perubahan penyerahan arsip "${result.detail.nama_arsip}" berhasil disimpan.`,
      data: {
        id: result.header.id.toString(),
        detail_id: result.detail.id.toString(),
        nama_arsip: result.detail.nama_arsip,
        status: result.header.status,
        tanggal_penyerahan: result.header.tanggal_penyerahan.toISOString().slice(0, 10),
        file_arsip: result.detail.file_arsip,
      },
    };
  } catch (error) {
    if (newSavedFilePath) {
      await deletePhysicalFile(newSavedFilePath);
    }
    console.error("Gagal memperbarui penyerahan arsip:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat memperbarui penyerahan arsip.",
    };
  }
}

/**
 * Server Action: deletePenyerahanArsip
 *
 * Menghapus penyerahan arsip milik user sendiri.
 * Ownership dicek ketat di server-side: penyerahan_arsip.user_id === currentUser.id.
 * Hanya penyerahan dengan status "DIBUAT" yang dapat dihapus.
 * Cascade deletion ke detail_penyerahan_arsip dan pembersihan file fisik di storage.
 */
export async function deletePenyerahanArsip(
  id: string | number | bigint
): Promise<{ success: boolean; message: string }> {
  try {
    const currentUser = await requireUser();
    const currentUserId = BigInt(currentUser.id);
    const penyerahanId = parseId(id, "ID Penyerahan");

    const penyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanId },
      include: {
        details: true,
      },
    });

    if (!penyerahan) {
      return {
        success: false,
        message: "Data penyerahan arsip tidak ditemukan.",
      };
    }

    // Server-side ownership check
    if (penyerahan.user_id !== currentUserId) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus penyerahan arsip milik pengguna lain.",
      };
    }

    if (penyerahan.status !== "DIBUAT") {
      return {
        success: false,
        message: `Penyerahan tidak dapat dihapus karena status saat ini adalah "${penyerahan.status}".`,
      };
    }

    if (penyerahan.file_berita_acara) {
      return {
        success: false,
        message: "Penyerahan memiliki Berita Acara tersimpan dan tidak dapat dihapus.",
      };
    }

    const filesToDelete: string[] = [];
    for (const d of penyerahan.details) {
      if (d.file_arsip) {
        filesToDelete.push(d.file_arsip);
      }
    }
    const deleted = await prisma.penyerahan_arsip.deleteMany({
      where: {
        id: penyerahanId,
        user_id: currentUserId,
        status: "DIBUAT",
        file_berita_acara: null,
      },
    });

    if (deleted.count !== 1) {
      return {
        success: false,
        message: "Status penyerahan berubah atau Berita Acara telah diterbitkan. Muat ulang halaman sebelum melanjutkan.",
      };
    }

    for (const filePath of filesToDelete) {
      await deletePhysicalFile(filePath);
    }

    revalidatePath("/user/pengajuan");
    revalidatePath("/user/riwayat");
    revalidatePath("/user/dashboard");

    return {
      success: true,
      message: "Penyerahan arsip berhasil dihapus.",
    };
  } catch (error) {
    console.error("Gagal menghapus penyerahan arsip:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat menghapus penyerahan arsip.",
    };
  }
}

/**
 * Mengambil detail penyerahan arsip spesifik berdasarkan ID untuk keperluan Edit Form
 * dengan validasi akses: pemilik penyerahan, rekan satu divisi, atau admin.
 */
export async function getPenyerahanById(id: string | number | bigint) {
  try {
    const currentUser = await requireUser();
    const currentUserId = BigInt(currentUser.id);
    const penyerahanId = parseId(id, "ID Penyerahan");

    const penyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanId },
      include: {
        divisi: { select: { kode: true, nama: true } },
        details: {
          include: {
            kode_klasifikasi: { select: { id: true, kode: true, nama: true } },
            jenis_arsip: { select: { id: true, nama: true } },
            lokasi_penyimpanan: { select: { id: true, kode: true, nama: true } },
          },
        },
      },
    });

    if (!penyerahan) return null;

    const isOwner = penyerahan.user_id === currentUserId;
    const isSameDivisi = currentUser.divisi_id
      ? penyerahan.divisi_id === BigInt(currentUser.divisi_id)
      : false;

    if (!isOwner && !isSameDivisi && currentUser.role !== "admin") {
      return null;
    }

    const detailItem = penyerahan.details[0] || null;

    return {
      id: penyerahan.id.toString(),
      status: penyerahan.status,
      user_id: penyerahan.user_id.toString(),
      is_owner: isOwner,
      can_edit: isOwner && penyerahan.status === "DIBUAT",
      tanggal_penyerahan: penyerahan.tanggal_penyerahan.toISOString().slice(0, 10),
      divisi: penyerahan.divisi ? `${penyerahan.divisi.kode} - ${penyerahan.divisi.nama}` : "-",
      keterangan: penyerahan.keterangan || "",
      detail: detailItem
        ? {
            id: detailItem.id.toString(),
            kode_klasifikasi_id: detailItem.kode_klasifikasi_id.toString(),
            nama_arsip: detailItem.nama_arsip,
            jenis_arsip_id: detailItem.jenis_arsip_id ? detailItem.jenis_arsip_id.toString() : "",
            jumlah: detailItem.jumlah,
            satuan: detailItem.satuan || "Berkas",
            penulis: detailItem.penulis_pengirim || "",
            kurun_waktu: detailItem.kurun_waktu || "",
            tanggal_arsip: detailItem.tanggal_arsip
              ? detailItem.tanggal_arsip.toISOString().slice(0, 10)
              : "",
            tingkat_keaslian: detailItem.tingkat_keaslian || "Asli",
            lokasi_penyimpanan_id: detailItem.lokasi_penyimpanan_id
              ? detailItem.lokasi_penyimpanan_id.toString()
              : "",
            file_arsip: detailItem.file_arsip,
          }
        : null,
    };
  } catch {
    return null;
  }
}

/** Admin confirms that the submitted metadata has been reviewed. */
export async function konfirmasiPenyerahanArsip(
  idInput: string | number | bigint,
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();

  try {
    const id = parseId(idInput, "ID Penyerahan");
    const penyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!penyerahan) return { success: false, message: "Data penyerahan arsip tidak ditemukan." };
    if (penyerahan.status === "DIKONFIRMASI") {
      return { success: false, message: "Data ini sudah dikonfirmasi sebelumnya." };
    }
    if (penyerahan.status !== "DIBUAT" && penyerahan.status !== "MENUNGGU_VERIFIKASI") {
      return { success: false, message: `Status ${penyerahan.status} tidak dapat dikonfirmasi.` };
    }

    const updated = await prisma.penyerahan_arsip.updateMany({
      where: { id, status: penyerahan.status },
      data: { status: "DIKONFIRMASI", updated_at: new Date() },
    });
    if (updated.count !== 1) {
      return { success: false, message: "Status penyerahan berubah. Muat ulang halaman sebelum melanjutkan." };
    }

    revalidatePath("/admin/penyerahan");
    revalidatePath(`/admin/penyerahan/${id.toString()}`);
    revalidatePath("/user/pengajuan");
    revalidatePath("/user/riwayat");
    revalidatePath("/user/dashboard");
    return { success: true, message: "Data penyerahan dikonfirmasi. Konfirmasi ini tidak mencatat serah-terima fisik." };
  } catch {
    return { success: false, message: "Gagal mengonfirmasi data penyerahan." };
  }
}

/** Store the explicitly selected recipient using the existing party fields. */
export async function setPihakKeduaPenyerahanArsip(
  idInput: string | number | bigint,
  recipientIdInput: string | number | bigint,
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();

  try {
    const id = parseId(idInput, "ID Penyerahan");
    const recipientId = parseId(recipientIdInput, "Penerima arsip");
    const [penyerahan, recipient] = await Promise.all([
      prisma.penyerahan_arsip.findUnique({
        where: { id },
        select: { status: true, file_berita_acara: true, pihak_kedua_id: true },
      }),
      prisma.user.findFirst({
        where: { id: recipientId, aktif: true, divisi_id: { not: null } },
        select: { id: true, nama: true },
      }),
    ]);

    if (!penyerahan) return { success: false, message: "Data penyerahan arsip tidak ditemukan." };
    if (penyerahan.status !== "DIKONFIRMASI") {
      return { success: false, message: "Penerima hanya dapat ditetapkan setelah data dikonfirmasi." };
    }
    if (penyerahan.file_berita_acara) {
      return { success: false, message: "Identitas penerima dikunci karena Berita Acara sudah tercatat." };
    }
    if (!recipient) {
      return { success: false, message: "Pilih akun aktif yang memiliki Divisi sebagai penerima arsip." };
    }
    if (penyerahan.pihak_kedua_id === recipient.id) {
      return { success: true, message: "Penerima ini sudah tercatat." };
    }

    const updated = await prisma.penyerahan_arsip.updateMany({
      where: { id, status: "DIKONFIRMASI", file_berita_acara: null },
      data: {
        pihak_kedua_id: recipient.id,
        pihak_kedua_nama: recipient.nama,
        updated_at: new Date(),
      },
    });
    if (updated.count !== 1) {
      return { success: false, message: "Data berubah atau Berita Acara telah diterbitkan. Muat ulang halaman." };
    }

    revalidatePath(`/admin/penyerahan/${id.toString()}`);
    return { success: true, message: "Penerima arsip telah disimpan." };
  } catch {
    return { success: false, message: "Gagal menyimpan penerima arsip." };
  }
}

/**
 * Server Action: generateBeritaAcara
 * Membuat dokumen Berita Acara otomatis dari database, menyimpannya di storage privat,
 * dan memperbarui field nomor_berita_acara & file_berita_acara pada penyerahan_arsip.
 */
export async function generateBeritaAcara(
  penyerahanIdInput: string | number | bigint
): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    nomor_berita_acara: string;
    file_berita_acara: string;
  };
}> {
  await requireAdmin();

  let createdFilePath: string | null = null;
  try {
    const penyerahanId = parseId(penyerahanIdInput, "ID Penyerahan");

    const penyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id: penyerahanId },
      include: {
        user: { select: { id: true, nama: true } },
        divisi: { select: { id: true, kode: true, nama: true } },
        pihak_kedua: {
          select: {
            nama: true,
            divisi: { select: { kode: true, nama: true } },
          },
        },
        details: {
          include: {
            kode_klasifikasi: { select: { id: true, kode: true, nama: true } },
            jenis_arsip: { select: { id: true, nama: true } },
            lokasi_penyimpanan: { select: { id: true, kode: true, nama: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!penyerahan) {
      return { success: false, message: "Data penyerahan arsip tidak ditemukan." };
    }

    if (penyerahan.file_berita_acara) {
      const storedPdfState = await inspectStoredBeritaAcara(penyerahan.file_berita_acara);
      if (storedPdfState === "valid") {
        return {
          success: true,
          message: "Berita Acara yang sudah tersimpan digunakan kembali.",
          data: {
            id: penyerahan.id.toString(),
            nomor_berita_acara: penyerahan.nomor_berita_acara || "",
            file_berita_acara: penyerahan.file_berita_acara,
          },
        };
      }
      return {
        success: false,
        message: storedPdfState === "missing"
          ? "Metadata Berita Acara tersedia tetapi file tidak ditemukan. Dokumen lama dipertahankan; hubungi Administrator sistem untuk pemulihan."
          : "File Berita Acara tercatat tetapi bukan PDF yang valid. Dokumen lama dipertahankan; hubungi Administrator sistem untuk pemeriksaan.",
      };
    }

    if (penyerahan.status !== "DIKONFIRMASI") {
      return {
        success: false,
        message: `Berita Acara hanya dapat dibuat setelah data dikonfirmasi (status saat ini: ${penyerahan.status}).`,
      };
    }

    if (!penyerahan.pihak_kedua_id || !penyerahan.pihak_kedua?.nama || !penyerahan.pihak_kedua.divisi) {
      return {
        success: false,
        message: "Tetapkan penerima arsip yang sebenarnya dengan Divisi pada halaman Admin sebelum membuat Berita Acara.",
      };
    }

    const filePrefix = `ba-${penyerahan.id.toString()}-`;
    let unlinkedFiles: string[] = [];
    try {
      unlinkedFiles = (await readdir(beritaAcaraDirectory)).filter(
        (filename) => filename.startsWith(filePrefix) && filename.toLowerCase().endsWith(".pdf"),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (unlinkedFiles.length > 0) {
      return {
        success: false,
        message: "Ada file Berita Acara lama tanpa metadata database yang cocok. File dipertahankan; periksa dokumen lama sebelum menerbitkan yang baru.",
      };
    }

    if (!penyerahan.details || penyerahan.details.length === 0) {
      return {
        success: false,
        message: "Penyerahan arsip tidak memiliki rincian berkas arsip terlampir.",
      };
    }

    // Tentukan Nomor Berita Acara sesuai format: ......./BA/DD-MM-YYYY
    const tglBA = penyerahan.tanggal_penyerahan || new Date();
    const dd = String(tglBA.getDate()).padStart(2, "0");
    const mm = String(tglBA.getMonth() + 1).padStart(2, "0");
    const yyyy = String(tglBA.getFullYear());
    const tanggalFormatted = `${dd}-${mm}-${yyyy}`;
    const nomorBA = `......./BA/${tanggalFormatted}`;

    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    const formatDivisi = (kode?: string | null, nama?: string | null) => {
      const cleanKode = kode?.trim() || "";
      const cleanNama = nama?.trim() || "";
      if (!cleanKode) return cleanNama || "[Divisi belum tersedia]";
      if (!cleanNama || cleanNama.toLowerCase().includes(cleanKode.toLowerCase())) return cleanNama || cleanKode;
      return `${cleanKode} - ${cleanNama}`;
    };
    const unitDivisi = formatDivisi(penyerahan.divisi?.kode, penyerahan.divisi?.nama);

    // Lokasi penyimpanan adalah relasi pada setiap detail. Baca master lokasi
    // untuk merangkai parent-child sampai akar tanpa mengasumsikan kedalaman.
    const lokasiRows = await prisma.lokasi_penyimpanan.findMany({
      select: { id: true, nama: true, parent_id: true },
    });
    const lokasiById = new Map(lokasiRows.map((lokasi) => [lokasi.id.toString(), lokasi]));
    const getJalurLokasi = (lokasiId: bigint | null): string => {
      if (!lokasiId) return "-";
      const parts: string[] = [];
      const visited = new Set<string>();
      let current = lokasiById.get(lokasiId.toString());
      while (current && !visited.has(current.id.toString())) {
        const id = current.id.toString();
        visited.add(id);
        const nama = current.nama.trim();
        if (nama && parts[parts.length - 1]?.toLowerCase() !== nama.toLowerCase()) parts.push(nama);
        current = current.parent_id ? lokasiById.get(current.parent_id.toString()) : undefined;
      }
      return parts.reverse().join(" - ") || "-";
    };

    const pdfData: BeritaAcaraData = {
      nomorBeritaAcara: nomorBA,
      tanggalPenyerahan: penyerahan.tanggal_penyerahan,
      pihakPertama: {
        nama: penyerahan.user?.nama || "[Nama user belum tersedia]",
        jabatan: null, // JANGAN mengarang jabatan (tidak ada field jabatan di schema User)
        unit: unitDivisi,
      },
      pihakKedua: {
        nama: penyerahan.pihak_kedua_nama || penyerahan.pihak_kedua?.nama || null,
        jabatan: null,
        unit: penyerahan.pihak_kedua?.divisi
          ? formatDivisi(penyerahan.pihak_kedua.divisi.kode, penyerahan.pihak_kedua.divisi.nama)
          : null,
      },
      details: penyerahan.details.map((d, index) => ({
        no: index + 1,
        kodeKlasifikasi: d.kode_klasifikasi ? `${d.kode_klasifikasi.kode} - ${d.kode_klasifikasi.nama}` : "-",
        namaArsip: d.nama_arsip,
        jumlah: d.jumlah,
        satuan: d.satuan || "Berkas",
        penulis: d.penulis_pengirim || "-",
        kurunWaktu: d.kurun_waktu || "-",
        tanggalArsip: d.tanggal_arsip ? dateFormatter.format(d.tanggal_arsip) : "-",
        tingkatKeaslian: d.tingkat_keaslian || "Asli",
        lokasiPenyimpanan: getJalurLokasi(d.lokasi_penyimpanan_id),
      })),
    };

    const pdfBytes = await generateBeritaAcaraPdf(pdfData);

    await mkdir(beritaAcaraDirectory, { recursive: true });

    const filename = `ba-${penyerahan.id.toString()}-${randomUUID().slice(0, 8)}.pdf`;
    const targetDiskPath = path.join(beritaAcaraDirectory, filename);
    await writeFile(targetDiskPath, Buffer.from(pdfBytes), { flag: "wx" });
    createdFilePath = `/uploads/arsip/berita-acara/${filename}`;

    // Only one concurrent Generate request can claim an empty document slot.
    const stored = await prisma.penyerahan_arsip.updateMany({
      where: {
        id: penyerahan.id,
        status: "DIKONFIRMASI",
        pihak_kedua_id: penyerahan.pihak_kedua_id,
        file_berita_acara: null,
      },
      data: {
        nomor_berita_acara: nomorBA,
        file_berita_acara: createdFilePath,
        updated_at: new Date(),
      },
    });

    if (stored.count !== 1) {
      await deletePhysicalFile(createdFilePath);
      createdFilePath = null;
      const current = await prisma.penyerahan_arsip.findUnique({
        where: { id: penyerahan.id },
        select: { nomor_berita_acara: true, file_berita_acara: true },
      });
      if (current?.file_berita_acara && (await inspectStoredBeritaAcara(current.file_berita_acara)) === "valid") {
        return {
          success: true,
          message: "Berita Acara yang sudah tersimpan digunakan kembali.",
          data: {
            id: penyerahan.id.toString(),
            nomor_berita_acara: current.nomor_berita_acara || "",
            file_berita_acara: current.file_berita_acara,
          },
        };
      }
      return { success: false, message: "Data berubah ketika PDF dibuat. Muat ulang sebelum mencoba kembali." };
    }

    revalidatePath("/admin/penyerahan");
    revalidatePath(`/admin/penyerahan/${penyerahan.id.toString()}`);
    revalidatePath("/user/pengajuan");
    revalidatePath("/user/riwayat");
    revalidatePath("/user/dashboard");

    return {
      success: true,
      message: "Berita Acara berhasil dibuat dan disimpan.",
      data: {
        id: penyerahan.id.toString(),
        nomor_berita_acara: nomorBA,
        file_berita_acara: createdFilePath,
      },
    };
  } catch (error) {
    if (createdFilePath) {
      await deletePhysicalFile(createdFilePath);
    }
    console.error("Gagal membuat Berita Acara:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan internal saat membuat Berita Acara.",
    };
  }
}
