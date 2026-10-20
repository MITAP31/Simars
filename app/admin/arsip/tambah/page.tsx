import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createArsip } from "@/actions/arsip";
import { ArsipFileField } from "@/components/arsip/arsip-file-field";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export default async function TambahArsipPage() {
  const [classificationCodes, divisions, storageLocations, jenisArsip] = await Promise.all([
    prisma.kode_klasifikasi.findMany({
      where: { aktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
    prisma.divisi.findMany({
      where: { aktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
    prisma.lokasi_penyimpanan.findMany({
      where: { aktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
    prisma.jenis_arsip.findMany({
      where: { aktif: true },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/arsip" className="rounded-md border p-2 hover:bg-muted" aria-label="Kembali ke daftar arsip"><ArrowLeft className="h-4 w-4" /></Link>
        <div><h1 className="text-2xl font-bold tracking-tight">Tambah Arsip</h1><p className="text-muted-foreground">Tambahkan dokumen baru ke dalam sistem arsip.</p></div>
      </div>

      <form action={createArsip} className="rounded-xl border bg-card shadow-sm">
        <input type="hidden" name="return_to" value="/admin/arsip/tambah" />
        <div className="border-b p-6"><h2 className="font-semibold">Informasi Arsip</h2><p className="text-sm text-muted-foreground">Isi metadata dokumen yang akan diarsipkan.</p></div>
        <div className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nomor Arsip"><input name="nomor_arsip" type="text" placeholder="Contoh: 001/PLN-BTM/2026" className={inputClass} required /></Field>
            <Field label="Kode Klasifikasi"><select name="kode_klasifikasi_id" defaultValue="" className={inputClass} required><option value="" disabled>Cari atau pilih kode klasifikasi</option>{classificationCodes.map((classification) => <option key={classification.id.toString()} value={classification.id.toString()}>{classification.kode} — {classification.nama}</option>)}</select></Field>
          </div>
          <Field label="Divisi"><select name="divisi_id" defaultValue="" className={inputClass}><option value="">Pilih divisi</option>{divisions.map((division) => <option key={division.id.toString()} value={division.id.toString()}>{division.kode} — {division.nama}</option>)}</select></Field>
          <Field label="Judul Arsip / Perihal"><input name="nama_arsip" type="text" placeholder="Masukkan judul arsip atau perihal dokumen" className={inputClass} required /></Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Jumlah Arsip (Lembar)"><input name="jumlah" type="number" min="1" step="1" placeholder="Contoh: 12" className={inputClass} required /></Field>
            <Field label="Jenis Arsip"><select name="jenis_arsip_id" defaultValue="" className={inputClass}><option value="">Pilih jenis arsip</option>{jenisArsip.map((jenis) => <option key={jenis.id.toString()} value={jenis.id.toString()}>{jenis.nama}</option>)}</select></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Penulis / Pengirim"><input name="penulis_pengirim" type="text" placeholder="Masukkan nama penulis atau pengirim" className={inputClass} /></Field>
            <Field label="Tahun"><input name="kurun_waktu" type="number" min="1900" max="2100" placeholder="Contoh: 2026" className={inputClass} /></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Tanggal Dokumen"><input name="tanggal_arsip" type="date" className={inputClass} required /></Field>
            <Field label="Tingkat Keaslian"><select name="tingkat_keaslian" defaultValue="" className={inputClass}><option value="" disabled>Pilih tingkat keaslian</option><option value="Asli">Asli</option><option value="Salinan">Salinan</option><option value="Fotokopi">Fotokopi</option></select></Field>
          </div>
          <Field label="Lokasi Simpan"><select name="lokasi_penyimpanan_id" defaultValue="" className={inputClass}><option value="">Cari atau pilih lokasi simpan</option>{storageLocations.map((location) => <option key={location.id.toString()} value={location.id.toString()}>{location.kode} — {location.nama}</option>)}</select></Field>
          <Field label="File Dokumen"><ArsipFileField /></Field>
        </div>
        <div className="flex justify-end gap-3 border-t p-6"><Link href="/admin/arsip" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</Link><button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Simpan Arsip</button></div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
