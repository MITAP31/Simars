import { Plus } from "lucide-react";
import Link from "next/link";

import { JenisArsipActions } from "@/components/jenis-arsip/jenis-arsip-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Layout kolom tabel
// Kolom dibuat lebih rapat agar tidak terlalu banyak ruang kosong.
const columnLayout =
  "grid-cols-[minmax(220px,1fr)_minmax(240px,1.4fr)_100px_130px_150px]";

export default async function KategoriPage() {
  const jenisArsip = await prisma.jenis_arsip.findMany({
    include: {
      _count: {
        select: {
          arsip: true,
        },
      },
    },
    orderBy: {
      nama: "asc",
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* =========================
          HEADER
      ========================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Jenis Arsip
          </h1>

          <p className="text-muted-foreground">
            Kelola jenis arsip yang tersedia pada sistem.
          </p>
        </div>

        <Link
          href="/admin/kategori/tambah"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Link>
      </div>

      {/* =========================
          TABLE
      ========================== */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[900px] text-sm">

            {/* =========================
                TABLE HEADER
            ========================== */}
            <div className="border-b bg-muted/50">
              <div
                className={`grid ${columnLayout} items-center px-6`}
              >
                {/* Nama */}
                <div className="py-3 font-medium">
                  Nama Jenis Arsip
                </div>

                {/* Keterangan */}
                <div className="py-3 font-medium">
                  Keterangan
                </div>

                {/* Status */}
                <div className="py-3 font-medium">
                  Status
                </div>

                {/* Jumlah */}
                <div className="py-3 font-medium">
                  Jumlah Arsip
                </div>

                {/* Aksi */}
                <div className="py-3 font-medium">
                  Aksi
                </div>
              </div>
            </div>

            {/* =========================
                TABLE BODY
            ========================== */}
            {jenisArsip.length > 0 ? (
              jenisArsip.map((jenis) => (
                <div
                  key={jenis.id.toString()}
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`grid ${columnLayout} items-center px-6`}
                  >
                    {/* =====================
                        NAMA JENIS ARSIP
                    ====================== */}
                    <div className="min-w-0 py-4 pr-4">
                      <Link href={`/admin/arsip?jenis=${jenis.id.toString()}`} className="block truncate font-medium hover:underline">
                        {jenis.nama}
                      </Link>
                    </div>

                    {/* =====================
                        KETERANGAN
                    ====================== */}
                    <div className="min-w-0 py-4 pr-4 text-muted-foreground">
                      <div className="truncate" title={jenis.keterangan ?? undefined}>
                        {jenis.keterangan ?? "—"}
                      </div>
                    </div>

                    {/* =====================
                        STATUS
                    ====================== */}
                    <div className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          jenis.aktif
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {jenis.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {/* =====================
                        JUMLAH ARSIP
                    ====================== */}
                    <div className="py-4 text-muted-foreground">
                      {jenis._count.arsip} arsip
                    </div>

                    {/* =====================
                        AKSI
                    ====================== */}
                    <div className="py-4">
                      <JenisArsipActions
                        id={jenis.id.toString()}
                        nama={jenis.nama}
                        slug={jenis.slug}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* =========================
                 EMPTY STATE
              ========================== */
              <div className="px-5 py-10 text-center text-muted-foreground">
                Belum ada jenis arsip.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
