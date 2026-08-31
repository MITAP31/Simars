import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function TambahArsipPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/arsip"
          className="rounded-md border p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Arsip
          </h1>

          <p className="text-muted-foreground">
            Tambahkan dokumen baru ke dalam sistem arsip.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold">Informasi Arsip</h2>

          <p className="text-sm text-muted-foreground">
            Isi informasi dokumen yang akan diarsipkan.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Nomor & Jenis */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nomor Arsip
              </label>

              <input
                type="text"
                placeholder="Contoh: 001/PLN-BTM/2026"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Jenis Arsip
              </label>

              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">Pilih jenis arsip</option>
                <option value="surat-masuk">Surat Masuk</option>
                <option value="surat-keluar">Surat Keluar</option>
                <option value="dokumen">Dokumen</option>
                <option value="laporan">Laporan</option>
                <option value="berita-acara">Berita Acara</option>
              </select>
            </div>
          </div>

          {/* Judul */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Judul Arsip
            </label>

            <input
              type="text"
              placeholder="Masukkan judul arsip"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Kategori & Tanggal */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kategori
              </label>

              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">Pilih kategori</option>
                <option value="administrasi">Administrasi</option>
                <option value="keuangan">Keuangan</option>
                <option value="kepegawaian">Kepegawaian</option>
                <option value="operasional">Operasional</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tanggal Arsip
              </label>

              <input
                type="date"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Deskripsi
            </label>

            <textarea
              rows={4}
              placeholder="Masukkan deskripsi atau keterangan arsip..."
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              File Dokumen
            </label>

            <div className="rounded-lg border border-dashed p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Pilih file dokumen
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC, DOCX, JPG, atau PNG
              </p>

              <button
                type="button"
                className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Pilih File
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <Link
            href="/arsip"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Batal
          </Link>

          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Simpan Arsip
          </button>
        </div>
      </div>
    </div>
  );
}