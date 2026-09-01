import Link from "next/link";
import { ArrowLeft, FolderPlus } from "lucide-react";

export default function TambahKategoriPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      {/* Header halaman */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/kategori"
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIMARS / ADMIN</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Tambah Kategori
          </h1>

          <p className="text-sm text-muted-foreground">
            Tambahkan kategori arsip baru ke dalam sistem.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Form header */}
        <div className="border-b bg-muted/35 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Informasi Kategori
              </h2>

              <p className="text-sm text-muted-foreground">
                Isi informasi kategori arsip yang akan dibuat.
              </p>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="space-y-6 p-6">
          {/* Nama kategori */}
          <div className="space-y-2">
            <label
              htmlFor="nama-kategori"
              className="text-sm font-medium"
            >
              Nama Kategori
            </label>

            <input
              id="nama-kategori"
              type="text"
              placeholder="Contoh: Keuangan"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              Masukkan nama kategori arsip.
            </p>
          </div>

          {/* Kode kategori */}
          <div className="space-y-2">
            <label
              htmlFor="kode-kategori"
              className="text-sm font-medium"
            >
              Kode Kategori
            </label>

            <input
              id="kode-kategori"
              type="text"
              placeholder="Contoh: KEU"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              Gunakan kode singkat untuk memudahkan identifikasi kategori.
            </p>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label
              htmlFor="deskripsi"
              className="text-sm font-medium"
            >
              Deskripsi
            </label>

            <textarea
              id="deskripsi"
              rows={4}
              placeholder="Masukkan deskripsi kategori..."
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              Jelaskan jenis dokumen yang termasuk dalam kategori ini.
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium"
            >
              Status
            </label>

            <select
              id="status"
              defaultValue="aktif"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            >
              <option value="aktif">
                Aktif
              </option>

              <option value="nonaktif">
                Nonaktif
              </option>
            </select>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/kategori"
              className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted"
            >
              Batal
            </Link>

            <button
              type="button"
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Simpan Kategori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
