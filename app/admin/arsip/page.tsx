import { Plus, Search } from "lucide-react";
import Link from "next/link";

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

export default async function ArsipPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams;
  const jenisArsipId = jenis && /^\d+$/.test(jenis) ? BigInt(jenis) : null;
  const [archives, jenisArsip] = await Promise.all([
    prisma.arsip.findMany({
      where: {
        status_arsip: "tersimpan",
        ...(jenisArsipId ? { jenis_arsip_id: jenisArsipId } : {}),
      },
      include: {
        kode_klasifikasi: { select: { kode: true } },
        lokasi_penyimpanan: { select: { kode: true, nama: true } },
        jenis_arsip: { select: { nama: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.jenis_arsip.findMany({ where: { aktif: true }, select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
  ]);

  return <div className="space-y-6 p-6">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Arsip</h1><p className="text-muted-foreground">Kelola seluruh dokumen dan arsip.</p></div><Link href="/admin/arsip/tambah" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Tambah Arsip</Link></div>
    <div className="flex items-center gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="Cari kode klasifikasi, judul, divisi, atau pengirim..." className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" /></div></div>
    <div className="flex gap-2 overflow-x-auto"><Link href="/admin/arsip" className={`rounded-md px-4 py-2 text-sm font-medium ${!jenisArsipId ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>Semua</Link>{jenisArsip.map((type) => <Link key={type.id.toString()} href={`/admin/arsip?jenis=${type.id.toString()}`} className={`whitespace-nowrap rounded-md px-4 py-2 text-sm ${jenisArsipId === type.id ? "bg-primary font-medium text-primary-foreground" : "border hover:bg-muted"}`}>{type.nama}</Link>)}</div>
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1500px] w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><Head>Kode Klasifikasi</Head><Head>Divisi</Head><Head>Judul Arsip / Perihal</Head><Head>Jumlah Arsip (Lembar)</Head><Head>Jenis Arsip</Head><Head>Penulis / Pengirim</Head><Head>Tahun</Head><Head>Tanggal Dokumen</Head><Head>Tingkat Keaslian</Head><Head>Lokasi Simpan</Head><th className="px-5 py-3 text-right font-medium">Aksi</th></tr></thead><tbody>{archives.map((archive) => {
      const archiveId = archive.id.toString();
      const location = archive.lokasi_penyimpanan
        ? `${archive.lokasi_penyimpanan.kode} / ${archive.lokasi_penyimpanan.nama}`
        : "—";
      const year = archive.tanggal_arsip?.getUTCFullYear() ?? archive.kurun_waktu ?? "—";

      return <tr key={archiveId} className="border-b last:border-0 hover:bg-muted/30"><Cell strong>{archive.kode_klasifikasi.kode}</Cell><Cell>—</Cell><td className="px-5 py-4"><Link href={`/admin/arsip/${archiveId}`} className="font-medium hover:underline">{archive.nama_arsip}</Link></td><Cell>{archive.satuan ? `${archive.jumlah} ${archive.satuan}` : archive.jumlah}</Cell><Cell>{archive.jenis_arsip?.nama ?? "—"}</Cell><Cell>{archive.penulis_pengirim ?? "—"}</Cell><Cell>{year}</Cell><Cell muted>{formatArchiveDate(archive.tanggal_arsip)}</Cell><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${archive.tingkat_keaslian === "Asli" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{archive.tingkat_keaslian ?? "—"}</span></td><Cell muted>{location}</Cell><td className="px-5 py-4 text-right"><ArsipActions id={archiveId} name={archive.nama_arsip} /></td></tr>;
    })}</tbody></table></div></div>
  </div>;
}

function Head({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>; }
function Cell({ children, muted, strong }: { children: React.ReactNode; muted?: boolean; strong?: boolean }) { return <td className={`whitespace-nowrap px-5 py-4 ${muted ? "text-muted-foreground" : ""} ${strong ? "font-medium" : ""}`}>{children}</td>; }
