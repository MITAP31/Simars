import { existsSync, statSync, createReadStream } from "node:fs";
import { open as openFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { type NextRequest } from "next/server";

import { getCurrentUser, getUserFromToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !/^\d+$/.test(id)) {
      return new Response("ID penyerahan arsip tidak valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 1. Verifikasi Autentikasi
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await getUserFromToken(token) : await getCurrentUser();
    if (!user) {
      return new Response("Unauthorized: Sesi tidak valid atau telah berakhir.", {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Ambil Data Penyerahan dari Database
    const penyerahan = await prisma.penyerahan_arsip.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        user_id: true,
        divisi_id: true,
        nomor_berita_acara: true,
        file_berita_acara: true,
      },
    });

    if (!penyerahan || !penyerahan.file_berita_acara) {
      return new Response("Dokumen Berita Acara belum dibuat atau tidak ditemukan.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 3. Verifikasi Otorisasi: Pemilik Penyerahan atau Administrator
    const isOwner = penyerahan.user_id === BigInt(user.id);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return new Response("Forbidden: Anda tidak memiliki izin untuk mengakses dokumen Berita Acara ini.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 4. Resolusi Jalur File Fisik & Pencegahan Path Traversal
    const storageBaseDir = path.resolve(process.cwd(), "storage", "uploads", "arsip");
    const cleanPath = penyerahan.file_berita_acara.replace(/^\/?/, "");
    const targetFilePath = path.resolve(process.cwd(), "storage", cleanPath);

    const safePrefix = storageBaseDir.endsWith(path.sep) ? storageBaseDir : storageBaseDir + path.sep;
    if (!targetFilePath.startsWith(safePrefix)) {
      return new Response("Bad Request: Jalur berkas tidak valid.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (!existsSync(targetFilePath)) {
      return new Response("Berkas fisik Berita Acara tidak ditemukan di server.", {
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

    const signatureFile = await openFile(targetFilePath, "r");
    let signatureIsPdf = false;
    try {
      const signature = Buffer.alloc(5);
      const { bytesRead } = await signatureFile.read(signature, 0, signature.length, 0);
      signatureIsPdf = stats.size >= 5 && bytesRead === 5 && signature.toString("ascii") === "%PDF-";
    } finally {
      await signatureFile.close();
    }
    if (!signatureIsPdf) {
      return new Response("File Berita Acara tercatat tetapi bukan PDF yang valid.", {
        status: 422,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
      });
    }

    // 5. Parameter Mode (View / Download)
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const isDownload = mode === "download";

    const cleanNomor = (penyerahan.nomor_berita_acara || `BA-${penyerahan.id.toString()}`)
      .replace(/[^\w.-]/g, "_");
    const filename = `Berita_Acara_${cleanNomor}.pdf`;
    const dispositionType = isDownload ? "attachment" : "inline";

    const nodeStream = createReadStream(targetFilePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `${dispositionType}; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Gagal menyajikan dokumen Berita Acara:", error);
    return new Response("Terjadi kesalahan internal server saat memproses dokumen Berita Acara.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
