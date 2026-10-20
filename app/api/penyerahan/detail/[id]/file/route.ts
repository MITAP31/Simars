import { existsSync, statSync, createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { type NextRequest } from "next/server";

import { getCurrentUser, getUserFromToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !/^\d+$/.test(id)) {
      return new Response("ID detail penyerahan tidak valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 1. Verifikasi Authentication
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await getUserFromToken(token) : await getCurrentUser();
    if (!user) {
      return new Response("Unauthorized: Sesi tidak valid atau telah berakhir.", {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Cari Detail Penyerahan di Database
    const detail = await prisma.detail_penyerahan_arsip.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nama_arsip: true,
        file_arsip: true,
        penyerahan: {
          select: {
            user_id: true,
            divisi_id: true,
          },
        },
      },
    });

    if (!detail || !detail.file_arsip) {
      return new Response("Berkas arsip tidak ditemukan atau belum diunggah.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 3. Verifikasi Authorization: Admin, Pembuat Penyerahan, atau Rekan Satu Divisi
    const isOwner = detail.penyerahan.user_id === BigInt(user.id);
    const isSameDivisi = user.divisi_id
      ? detail.penyerahan.divisi_id === BigInt(user.divisi_id)
      : false;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isSameDivisi && !isAdmin) {
      return new Response("Forbidden: Anda tidak memiliki izin untuk mengakses berkas ini.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 4. Resolusi Lokasi Berkas Fisik & Pencegahan Path Traversal
    const storageDir = path.resolve(process.cwd(), "storage", "uploads", "arsip");
    const rawFilename = path.basename(detail.file_arsip);
    const targetFilePath = path.resolve(storageDir, rawFilename);

    const safePrefix = storageDir.endsWith(path.sep) ? storageDir : storageDir + path.sep;
    if (!targetFilePath.startsWith(safePrefix)) {
      return new Response("Bad Request: Jalur berkas tidak valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (!existsSync(targetFilePath)) {
      return new Response("Berkas dokumen fisik tidak ditemukan di server.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const stats = statSync(targetFilePath);
    if (!stats.isFile()) {
      return new Response("Entri bukan merupakan berkas valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const ext = path.extname(rawFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const isDownload = new URL(request.url).searchParams.get("mode") === "download";

    const nodeStream = createReadStream(targetFilePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(path.basename(detail.nama_arsip))}${ext}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Gagal menyajikan berkas penyerahan arsip:", error);
    return new Response("Terjadi kesalahan server internal saat mengambil berkas.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
