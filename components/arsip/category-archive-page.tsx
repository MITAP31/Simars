import { Search } from "lucide-react";
import { notFound } from "next/navigation";

import { ArsipActions } from "@/components/arsip/arsip-actions";
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

export async function CategoryArchivePage({ slug }: { slug: string }) {
  const category = await prisma.jenis_arsip.findUnique({
    where: { slug },
    select: { id: true, nama: true },
  });

  if (!category) notFound();

  const title = category.nama;
  const archives = await prisma.arsip.findMany({
    where: {
      status_arsip: "tersimpan",
      jenis_arsip_id: category.id,
    },
    include: {
      kode_klasifikasi: { select: { kode: true } },
      lokasi_penyimpanan: { select: { kode: true, nama: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIMARS / ADMIN / KATEGORI / {title}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">Kelola seluruh arsip {title.toLowerCase()}.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Cari kode klasifikasi, judul, atau pengirim..." className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1250px] w-full text-sm">
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
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {archives.length > 0 ? archives.map((archive) => {
                const archiveId = archive.id.toString();
                const year = archive.tanggal_arsip?.getUTCFullYear() ?? archive.kurun_waktu ?? "—";

                return (
                  <tr key={archiveId} className="border-b last:border-0 hover:bg-muted/30">
                    <Cell strong>{archive.kode_klasifikasi.kode}</Cell>
                    <Cell>—</Cell>
                    <Cell strong>{archive.nama_arsip}</Cell>
                    <Cell>{archive.satuan ? `${archive.jumlah} ${archive.satuan}` : archive.jumlah}</Cell>
                    <Cell>{archive.penulis_pengirim ?? "—"}</Cell>
                    <Cell>{year}</Cell>
                    <Cell muted>{formatArchiveDate(archive.tanggal_arsip)}</Cell>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${archive.tingkat_keaslian === "Asli" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{archive.tingkat_keaslian ?? "—"}</span></td>
                    <td className="px-5 py-4 text-right"><ArsipActions id={archiveId} name={archive.nama_arsip} /></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">Belum ada arsip pada kategori {title}.</td>
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
  return <td className={`whitespace-nowrap px-5 py-4 ${muted ? "text-muted-foreground" : ""} ${strong ? "font-medium" : ""}`}>{children}</td>;
}
