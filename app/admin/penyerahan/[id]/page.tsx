import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminPenyerahanActions } from "@/components/penyerahan/admin-penyerahan-actions";
import { DocumentPreviewButton } from "@/components/penyerahan/document-preview-dialog";
import { isAvailableBeritaAcara } from "@/lib/penyerahan-files";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function statusLabel(status: string) {
  if (status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI") return "Menunggu pemeriksaan";
  if (status === "DIKONFIRMASI") return "Data dikonfirmasi";
  if (status === "SELESAI") return "Selesai";
  return status;
}

export default async function AdminPenyerahanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const penyerahan = await prisma.penyerahan_arsip.findUnique({
    where: { id: BigInt(id) },
    include: {
      user: { select: { nama: true, username: true } },
      divisi: { select: { kode: true, nama: true } },
      pihak_kedua: {
        select: { id: true, nama: true, aktif: true, divisi: { select: { kode: true, nama: true } } },
      },
      details: {
        include: {
          kode_klasifikasi: { select: { kode: true, nama: true } },
          jenis_arsip: { select: { nama: true } },
          lokasi_penyimpanan: { select: { kode: true, nama: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!penyerahan) notFound();
  const beritaAcaraAvailable = isAvailableBeritaAcara(penyerahan.file_berita_acara);

  const recipients = await prisma.user.findMany({
    where: { aktif: true, divisi_id: { not: null } },
    select: {
      id: true,
      nama: true,
      divisi: { select: { kode: true, nama: true } },
    },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link href="/admin/penyerahan" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar penyerahan
      </Link>

      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Penyerahan Arsip</h1>
          <p className="mt-1 text-sm text-muted-foreground">ID {penyerahan.id.toString()} · dibuat oleh {penyerahan.user.nama} (@{penyerahan.user.username})</p>
        </div>
        <span className="w-fit rounded-full border bg-muted px-3 py-1 text-sm font-medium">{statusLabel(penyerahan.status)}</span>
      </header>

      <section className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm sm:grid-cols-3">
        <div><p className="text-xs text-muted-foreground">Tanggal pada penyerahan</p><p className="mt-1 font-medium">{dateFormatter.format(penyerahan.tanggal_penyerahan)}</p></div>
        <div><p className="text-xs text-muted-foreground">Divisi penyerah</p><p className="mt-1 font-medium">{penyerahan.divisi.kode} — {penyerahan.divisi.nama}</p></div>
        <div><p className="text-xs text-muted-foreground">Pihak Kedua tersimpan</p><p className="mt-1 font-medium">{penyerahan.pihak_kedua_nama || penyerahan.pihak_kedua?.nama || "Belum ditetapkan"}</p><p className="text-xs text-muted-foreground">{penyerahan.pihak_kedua?.divisi ? `${penyerahan.pihak_kedua.divisi.kode} — ${penyerahan.pihak_kedua.divisi.nama}` : "Divisi penerima belum tersedia"}</p></div>
        {penyerahan.keterangan && <div className="sm:col-span-3"><p className="text-xs text-muted-foreground">Keterangan</p><p className="mt-1 whitespace-pre-wrap">{penyerahan.keterangan}</p></div>}
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Rincian arsip ({penyerahan.details.length})</h2></div>
        {penyerahan.details.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Tidak ada rincian arsip.</p>
        ) : (
          <div className="divide-y">
            {penyerahan.details.map((detail, index) => (
              <article key={detail.id.toString()} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="text-xs text-muted-foreground">Rincian {index + 1} · {detail.kode_klasifikasi.kode} — {detail.kode_klasifikasi.nama}</p><h3 className="mt-1 font-semibold">{detail.nama_arsip}</h3></div>
                  <p className="text-sm font-medium">{detail.jumlah} {detail.satuan || "Berkas"}</p>
                </div>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className="text-xs text-muted-foreground">Jenis arsip</dt><dd>{detail.jenis_arsip?.nama || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Penulis / pengirim</dt><dd>{detail.penulis_pengirim || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Kurun waktu</dt><dd>{detail.kurun_waktu || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Tanggal arsip</dt><dd>{detail.tanggal_arsip ? dateFormatter.format(detail.tanggal_arsip) : "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Tingkat keaslian</dt><dd>{detail.tingkat_keaslian || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Lokasi penyimpanan</dt><dd>{detail.lokasi_penyimpanan ? `${detail.lokasi_penyimpanan.kode} — ${detail.lokasi_penyimpanan.nama}` : "—"}</dd></div>
                </dl>
                {detail.file_arsip && <DocumentPreviewButton title={detail.nama_arsip} url={`/api/penyerahan/detail/${detail.id.toString()}/file`} downloadUrl={`/api/penyerahan/detail/${detail.id.toString()}/file?mode=download`} fileName={detail.file_arsip.split("/").pop() || detail.nama_arsip} label="Lihat lampiran digital · Unduh" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" />}
                {detail.keterangan && <p className="whitespace-pre-wrap text-sm"><span className="text-muted-foreground">Keterangan: </span>{detail.keterangan}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Berita Acara</h2>
        {penyerahan.file_berita_acara ? <>
          <p className="mt-1 text-sm text-muted-foreground">Nomor: {penyerahan.nomor_berita_acara || "Tidak tercatat"}</p>
          {!penyerahan.pihak_kedua_id && !penyerahan.pihak_kedua_nama && (
            <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Dokumen ini sudah ada sebelum alur pemeriksaan baru dan identitas Pihak Kedua tidak tersimpan di database. File dipertahankan apa adanya; periksa dokumen dan ikuti prosedur koreksi resmi sebelum menggunakannya.
            </p>
          )}
          {beritaAcaraAvailable ? <div className="mt-3 flex flex-wrap gap-3">
            <DocumentPreviewButton title="Berita Acara Penyerahan Arsip" url={`/api/penyerahan/${penyerahan.id.toString()}/berita-acara`} downloadUrl={`/api/penyerahan/${penyerahan.id.toString()}/berita-acara?mode=download`} fileName="Berita_Acara.pdf" label="Lihat Berita Acara" />
            <Link className="text-sm font-medium text-primary hover:underline" href={`/api/penyerahan/${penyerahan.id.toString()}/berita-acara?mode=download`}>Unduh PDF</Link>
          </div> : <p className="mt-3 text-sm text-amber-700">Metadata Berita Acara tersimpan, tetapi file tidak ditemukan atau bukan PDF valid. Dokumen tidak dibuat ulang.</p>}
        </> : <p className="mt-1 text-sm text-muted-foreground">Berita Acara belum tersedia.</p>}
      </section>

      <AdminPenyerahanActions
        id={penyerahan.id.toString()}
        status={penyerahan.status}
        currentRecipientId={penyerahan.pihak_kedua_id?.toString() ?? null}
        adminRecipientId={admin.id}
        senderId={penyerahan.user_id.toString()}
        currentRecipientName={penyerahan.pihak_kedua_nama || penyerahan.pihak_kedua?.nama || null}
        currentRecipientDivision={penyerahan.pihak_kedua?.divisi ? `${penyerahan.pihak_kedua.divisi.kode} — ${penyerahan.pihak_kedua.divisi.nama}` : null}
        recipients={recipients.map((recipient) => ({
          id: recipient.id.toString(),
          nama: recipient.nama,
          divisi: recipient.divisi ? `${recipient.divisi.kode} — ${recipient.divisi.nama}` : "",
        }))}
        hasBeritaAcara={Boolean(penyerahan.file_berita_acara)}
      />
    </div>
  );
}
