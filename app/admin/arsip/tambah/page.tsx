import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export default function TambahArsipPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/arsip" className="rounded-md border p-2 hover:bg-muted" aria-label="Kembali ke daftar arsip"><ArrowLeft className="h-4 w-4" /></Link>
        <div><h1 className="text-2xl font-bold tracking-tight">Tambah Arsip</h1><p className="text-muted-foreground">Tambahkan dokumen baru ke dalam sistem arsip.</p></div>
      </div>

      <form className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6"><h2 className="font-semibold">Informasi Arsip</h2><p className="text-sm text-muted-foreground">Isi metadata dokumen yang akan diarsipkan.</p></div>
        <div className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Kode Klasifikasi"><input type="text" placeholder="Contoh: KP.01.02" className={inputClass} /></Field>
            <Field label="Divisi"><input type="text" placeholder="Contoh: Divisi Keuangan" className={inputClass} /></Field>
          </div>
          <Field label="Judul Arsip / Perihal"><input type="text" placeholder="Masukkan judul arsip atau perihal dokumen" className={inputClass} /></Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Jumlah Arsip (Lembar)"><input type="number" min="1" placeholder="Contoh: 12" className={inputClass} /></Field>
            <Field label="Jenis Arsip"><select defaultValue="" className={inputClass}><option value="" disabled>Pilih jenis arsip</option><option value="surat-masuk">Surat Masuk</option><option value="surat-keluar">Surat Keluar</option><option value="laporan">Laporan</option><option value="dokumen">Dokumen</option><option value="berita-acara">Berita Acara</option></select></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Penulis / Pengirim"><input type="text" placeholder="Masukkan nama penulis atau pengirim" className={inputClass} /></Field>
            <Field label="Tahun"><input type="number" min="1900" max="2100" placeholder="Contoh: 2026" className={inputClass} /></Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Tanggal Dokumen"><input type="date" className={inputClass} /></Field>
            <Field label="Tingkat Keaslian"><select defaultValue="" className={inputClass}><option value="" disabled>Pilih tingkat keaslian</option><option value="asli">Asli</option><option value="salinan">Salinan</option><option value="fotokopi">Fotokopi</option></select></Field>
          </div>
          <Field label="Lokasi Simpan"><input type="text" placeholder="Contoh: Gedung Arsip, Rak A-02, Box 05" className={inputClass} /></Field>
          <Field label="File Dokumen"><div className="rounded-lg border border-dashed p-8 text-center"><Upload className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Pilih file dokumen</p><p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, atau PNG</p><label className="mt-4 inline-flex cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Pilih File<input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" /></label></div></Field>
        </div>
        <div className="flex justify-end gap-3 border-t p-6"><Link href="/admin/arsip" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Batal</Link><button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Simpan Arsip</button></div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
