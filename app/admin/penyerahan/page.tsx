import Link from "next/link";
import { Inbox } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isAvailableBeritaAcara } from "@/lib/penyerahan-files";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function statusLabel(status: string) {
  if (status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI") return "Menunggu pemeriksaan";
  if (status === "DIKONFIRMASI") return "Data dikonfirmasi";
  if (status === "SELESAI") return "Selesai";
  return status;
}

export default async function AdminPenyerahanPage() {
  await requireAdmin();
  const penyerahanList = await prisma.penyerahan_arsip.findMany({
    include: {
      user: { select: { nama: true } },
      divisi: { select: { kode: true, nama: true } },
      details: {
        select: { id: true, nama_arsip: true, jumlah: true, satuan: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: [{ tanggal_penyerahan: "desc" }, { id: "desc" }],
  });

  return (
      <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Penyerahan Arsip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Periksa data penyerahan yang dikirim User dan lanjutkan ke penerbitan Berita Acara.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {penyerahanList.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="mb-3 rounded-full bg-muted p-4 text-muted-foreground"><Inbox className="h-8 w-8" /></div>
            <h2 className="font-semibold">Belum ada data penyerahan</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Data yang dikirim User akan muncul di sini untuk diperiksa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Penyerah</th>
                  <th className="px-5 py-3 font-medium">Divisi</th>
                  <th className="px-5 py-3 font-medium">Arsip</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Berita Acara</th>
                  <th className="px-5 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {penyerahanList.map((item) => {
                  const firstDetail = item.details[0];
                  return (
                    <tr key={item.id.toString()} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-5 py-4">{dateFormatter.format(item.tanggal_penyerahan)}</td>
                      <td className="px-5 py-4 font-medium">{item.user.nama}</td>
                      <td className="px-5 py-4">{item.divisi.kode} — {item.divisi.nama}</td>
                      <td className="px-5 py-4">
                        <span className="font-medium">{firstDetail?.nama_arsip ?? "Tanpa rincian"}</span>
                        {item.details.length > 1 && <span className="ml-1 text-xs text-muted-foreground">(+{item.details.length - 1} rincian)</span>}
                      </td>
                      <td className="px-5 py-4"><span className="inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium">{statusLabel(item.status)}</span></td>
                      <td className="px-5 py-4">
                        {item.file_berita_acara && isAvailableBeritaAcara(item.file_berita_acara) ? (
                          <span className="text-sm text-emerald-700">Tersedia</span>
                        ) : <span className="text-sm text-muted-foreground">{item.file_berita_acara ? "File tidak tersedia / tidak valid" : "Belum tersedia"}</span>}
                      </td>
                      <td className="px-5 py-4 text-center align-middle">
                        <Link className="inline-flex items-center justify-center font-medium text-primary hover:underline" href={`/admin/penyerahan/${item.id.toString()}`}>
                          Periksa detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
