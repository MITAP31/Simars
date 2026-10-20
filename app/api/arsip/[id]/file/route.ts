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
      return new Response("ID arsip tidak valid.", {
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

    // 2. Verifikasi Authorization (Role)
    if (user.role !== "admin") {
      return new Response("Forbidden: Anda tidak memiliki izin untuk mengakses berkas arsip ini.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 3. Cari Arsip di Database
    const arsip = await prisma.arsip.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nama_arsip: true,
        nomor_arsip: true,
        file_arsip: true,
      },
    });

    if (!arsip || !arsip.file_arsip) {
      return new Response("Dokumen arsip tidak ditemukan atau tidak memiliki berkas.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 4. Resolusi Lokasi File Fisik & Pencegahan Path Traversal
    const storageDir = path.resolve(process.cwd(), "storage", "uploads", "arsip");
    const rawFilename = path.basename(arsip.file_arsip);
    const targetFilePath = path.resolve(storageDir, rawFilename);

    const safePrefix = storageDir.endsWith(path.sep) ? storageDir : storageDir + path.sep;
    if (!targetFilePath.startsWith(safePrefix)) {
      return new Response("Bad Request: Jalur berkas tidak valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Legacy files under public/uploads are deliberately not served here:
    // direct public URLs bypass this route's authorization checks.
    const finalFilePath = targetFilePath;
    if (!existsSync(finalFilePath)) {
      return new Response("Berkas dokumen fisik tidak ditemukan di server.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const stats = statSync(finalFilePath);
    if (!stats.isFile()) {
      return new Response("Entri bukan merupakan berkas valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 5. Penentuan MIME type dan Content-Disposition
    const extension = path.extname(rawFilename).toLowerCase();
    const mimeType = MIME_TYPES[extension] || "application/octet-stream";

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const isDownload = mode === "download";
    const dispositionType = isDownload ? "attachment" : "inline";

    const sanitizedTitle = arsip.nama_arsip.replace(/[^\w\s.-]/g, "_").trim() || "dokumen";
    const downloadFilename = `${sanitizedTitle}${extension}`;

    // 6. Header Keamanan Ketat
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set(
      "Content-Disposition",
      `${dispositionType}; filename="${encodeURIComponent(downloadFilename)}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`
    );
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Content-Length", stats.size.toString());

    // 7. Stream File
    const fileStream = createReadStream(finalFilePath);
    const webStream = Readable.toWeb(fileStream) as ReadableStream;

    return new Response(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Gagal menyajikan berkas arsip:", error);
    return new Response("Terjadi kesalahan internal server saat memproses berkas.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
