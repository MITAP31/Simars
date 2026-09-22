import { FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArsipActions } from "@/components/arsip/arsip-actions";
import { ArsipSearch } from "@/components/arsip/arsip-search";
import { prisma } from "@/lib/prisma";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatArchiveDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

export async function CategoryArchivePage({
  slug,
  query,
}: {
  slug: string;
  query?: string;
}) {
  const category = await prisma.jenis_arsip.findUnique({
    where: { slug },
    select: { id: true, nama: true },
  });

  if (!category) notFound();

  const searchQuery = typeof query === "string" ? query.trim() : "";
  const title = category.nama;

  const archives = await prisma.arsip.findMany({
    where: {
      status_arsip: "tersimpan",
      jenis_arsip_id: category.id,
      ...(searchQuery
        ? {
            OR: [
              { nomor_arsip: { contains: searchQuery, mode: "insensitive" } },
              { nama_arsip: { contains: searchQuery, mode: "insensitive" } },
              { penulis_pengirim: { contains: searchQuery, mode: "insensitive" } },
              {
                kode_klasifikasi: {
                  is: {
                    OR: [
                      { kode: { contains: searchQuery, mode: "insensitive" } },
                      { nama: { contains: searchQuery, mode: "insensitive" } },
                    ],
                  },
                },
              },
              {
                divisi: {
                  is: {
                    OR: [
                      { kode: { contains: searchQuery, mode: "insensitive" } },
                      { nama: { contains: searchQuery, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      kode_klasifikasi: { select: { kode: true } },
      divisi: { select: { kode: true, nama: true } },
      lokasi_penyimpanan: { select: { kode: true, nama: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          SIMARS / ADMIN / KATEGORI / {title}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">Kelola seluruh arsip {title.toLowerCase()}.</p>
      </div>

      <div className="flex items-center gap-3">
        <ArsipSearch placeholder={`Cari dalam kategori ${title}...`} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1350px] w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <Head>Kode Klasifikasi</Head>
                <Head>Divisi</Head>
                <Head>Judul Arsip / Perihal</Head>
                <Head>Jumlah Arsip (Lembar)</Head>
                <Head>Penulis / Pengirim</Head>
                <Head>Tahun</Head>
                <Head>Tanggal Dokumen</Head>
                <Head>Tingkat Keaslian</Head>
                <Head>File</Head>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {archives.length > 0 ? (
                archives.map((archive) => {
                  const archiveId = archive.id.toString();
                  const year = archive.tanggal_arsip?.getUTCFullYear() ?? archive.kurun_waktu ?? "—";

                  return (
                    <tr key={archiveId} className="border-b last:border-0 hover:bg-muted/30">
                      <Cell strong>{archive.kode_klasifikasi.kode}</Cell>
                      <Cell>{archive.divisi ? `${archive.divisi.kode} / ${archive.divisi.nama}` : "—"}</Cell>
                      <td className="px-5 py-4">
                        <Link href={`/admin/arsip/${archiveId}`} className="font-medium hover:underline">
                          {archive.nama_arsip}
                        </Link>
                      </td>
                      <Cell>{archive.satuan ? `${archive.jumlah} ${archive.satuan}` : archive.jumlah}</Cell>
                      <Cell>{archive.penulis_pengirim ?? "—"}</Cell>
                      <Cell>{year}</Cell>
                      <Cell muted>{formatArchiveDate(archive.tanggal_arsip)}</Cell>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            archive.tingkat_keaslian === "Asli"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {archive.tingkat_keaslian ?? "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {archive.file_arsip ? (
                          <Link
                            href={`/admin/arsip/${archiveId}/file`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            title="Lihat Pratinjau Dokumen"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Lihat File</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ArsipActions id={archiveId} name={archive.nama_arsip} hasFile={Boolean(archive.file_arsip)} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-muted-foreground">
                    {searchQuery
                      ? `Tidak ditemukan arsip pada kategori ${title} dengan pencarian "${searchQuery}".`
                      : `Belum ada arsip pada kategori ${title}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>;
}

function Cell({ children, muted, strong }: { children: React.ReactNode; muted?: boolean; strong?: boolean }) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 ${muted ? "text-muted-foreground" : ""} ${
        strong ? "font-medium" : ""
      }`}
    >
      {children}
    </td>
  );
}
