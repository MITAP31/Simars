import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateArsip } from "@/actions/arsip";
import { ArsipFileField } from "@/components/arsip/arsip-file-field";
import { prisma } from "@/lib/prisma";

const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function formatDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditArsipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const arsipId = BigInt(id);
  const arsip = await prisma.arsip.findUnique({
    where: { id: arsipId },
  });

  if (!arsip) {
    notFound();
  }

  const [classificationCodes, divisions, storageLocations, jenisArsip] = await Promise.all([
    prisma.kode_klasifikasi.findMany({
      where: { aktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
    prisma.divisi.findMany({
      where: { OR: [{ aktif: true }, ...(arsip.divisi_id ? [{ id: arsip.divisi_id }] : [])] },
      select: { id: true, kode: true, nama: true, aktif: true },
      orderBy: { kode: "asc" },
    }),
    prisma.lokasi_penyimpanan.findMany({
      where: { OR: [{ aktif: true }, ...(arsip.lokasi_penyimpanan_id ? [{ id: arsip.lokasi_penyimpanan_id }] : [])] },
      select: { id: true, kode: true, nama: true, aktif: true },
      orderBy: { kode: "asc" },
    }),
    prisma.jenis_arsip.findMany({
      where: { aktif: true },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  const detailPath = `/admin/arsip/${arsip.id.toString()}`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href={detailPath} className="rounded-md border p-2 hover:bg-muted" aria-label="Kembali ke detail arsip">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Arsip</h1>
          <p className="text-muted-foreground">Perbarui informasi dokumen arsip.</p>
        </div>
      </div>

      <form action={updateArsip} className="rounded-xl border bg-card shadow-sm">
        <input type="hidden" name="id" value={arsip.id.toString()} />
        <input type="hidden" name="return_to" value={`/admin/arsip/${arsip.id.toString()}/edit`} />
        <div className="border-b p-6">
          <h2 className="font-semibold">Informasi Arsip</h2>
          <p className="text-sm text-muted-foreground">Perbarui metadata dokumen yang diarsipkan.</p>
        </div>
        <div className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nomor Arsip"><input name="nomor_arsip" type="text" defaultValue={arsip.nomor_arsip} className={inputClass} required /></Field>
            <Field label="Kode Klasifikasi"><select name="kode_klasifikasi_id" defaultValue={arsip.kode_klasifikasi_id.toString()} className={inputClass} required><option value="" disabled>Pilih kode klasifikasi</option>{classificationCodes.map((classification) => <option key={classification.id.toString()} value={classification.id.toString()}>{classification.kode} — {classification.nama}</option>)}</select></Field>
          </div>
          <Field label="Divisi"><select name="divisi_id" defaultValue={arsip.divisi_id?.toString() ?? ""} className={inputClass}><option value="">Pilih divisi</option>{divisions.map((division) => <option key={division.id.toString()} value={division.id.toString()} disabled={!division.aktif && division.id !== arsip.divisi_id}>{division.kode} — {division.nama}{!division.aktif ? " (Nonaktif)" : ""}</option>)}</select></Field>
          <Field label="Judul Arsip / Perihal"><input name="nama_arsip" type="text" defaultValue={arsip.nama_arsip} className={inputClass} required /></Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Jumlah Arsip (Lembar)"><input name="jumlah" type="number" min="1" step="1" defaultValue={arsip.jumlah} className={inputClass} required /></Field>
            <Field label="Jenis Arsip"><select name="jenis_arsip_id" defaultValue={arsip.jenis_arsip_id?.toString() ?? ""} className={inputClass}><option value="">Pilih jenis arsip</option>{jenisArsip.map((jenis) => <option key={jenis.id.toString()} value={jenis.id.toString()}>{jenis.nama}</option>)}</select></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Penulis / Pengirim"><input name="penulis_pengirim" type="text" defaultValue={arsip.penulis_pengirim ?? ""} className={inputClass} /></Field>
            <Field label="Tahun"><input name="kurun_waktu" type="number" min="1900" max="2100" defaultValue={arsip.kurun_waktu ?? ""} className={inputClass} /></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Tanggal Dokumen"><input name="tanggal_arsip" type="date" defaultValue={formatDateInput(arsip.tanggal_arsip)} className={inputClass} required /></Field>
            <Field label="Tingkat Keaslian"><select name="tingkat_keaslian" defaultValue={arsip.tingkat_keaslian ?? ""} className={inputClass}><option value="">Pilih tingkat keaslian</option><option value="Asli">Asli</option><option value="Salinan">Salinan</option><option value="Fotokopi">Fotokopi</option></select></Field>
          </div>
          <Field label="Lokasi Simpan"><select name="lokasi_penyimpanan_id" defaultValue={arsip.lokasi_penyimpanan_id?.toString() ?? ""} className={inputClass}><option value="">Pilih lokasi simpan</option>{storageLocations.map((location) => <option key={location.id.toString()} value={location.id.toString()} disabled={!location.aktif && location.id !== arsip.lokasi_penyimpanan_id}>{location.kode} — {location.nama}{!location.aktif ? " (Nonaktif)" : ""}</option>)}</select></Field>
          <Field label="Keterangan"><textarea name="keterangan" defaultValue={arsip.keterangan ?? ""} className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label="File Dokumen"><ArsipFileField existingFile={arsip.file_arsip} arsipId={arsip.id.toString()} /></Field>
        </div>
        <div className="flex justify-end gap-3 border-t p-6"><Link href={detailPath} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</Link><button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Simpan Perubahan</button></div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
