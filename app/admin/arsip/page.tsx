import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowRight,
  FileCheck2,
  FileClock,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { ArsipActions } from "@/components/arsip/arsip-actions";
import { ArsipFilterBar } from "@/components/arsip/arsip-filter-bar";
import { ArsipPagination } from "@/components/arsip/arsip-pagination";
import { prisma } from "@/lib/prisma";
import {
  calculateRetention,
  isArchivedRetentionEnd,
  needsArchiveRetentionReview,
} from "@/lib/retensi";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatArchiveDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

export default async function ArsipPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    kategori?: string;
    jenis?: string;
    divisi?: string;
    status?: string;
    retensi?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const tabParam = params.tab === "permanen" ? "permanen" : "aktif";
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const categoryParam = params.kategori || params.jenis;
  const kategoriId =
    categoryParam && /^\d+$/.test(categoryParam) ? BigInt(categoryParam) : null;

  const divisiParam = params.divisi;
  const divisiId =
    divisiParam && /^\d+$/.test(divisiParam) ? BigInt(divisiParam) : null;

  const statusParam = typeof params.status === "string"
    ? params.status.trim()
    : typeof params.retensi === "string"
    ? params.retensi.trim()
    : "";

  const currentPage =
    typeof params.page === "string" && /^\d+$/.test(params.page)
      ? Math.max(1, parseInt(params.page, 10))
      : 1;

  const [archives, jenisArsip, divisions, totalAkhirRetensi] =
    await Promise.all([
      prisma.arsip.findMany({
        where: {
          status_arsip: "tersimpan",
          ...(kategoriId ? { jenis_arsip_id: kategoriId } : {}),
          ...(divisiId ? { divisi_id: divisiId } : {}),
          ...(query
            ? {
                OR: [
                  { nomor_arsip: { contains: query, mode: "insensitive" } },
                  { nama_arsip: { contains: query, mode: "insensitive" } },
                  { penulis_pengirim: { contains: query, mode: "insensitive" } },
                  {
                    kode_klasifikasi: {
                      is: {
                        OR: [
                          { kode: { contains: query, mode: "insensitive" } },
                          { nama: { contains: query, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                  {
                    divisi: {
                      is: {
                        OR: [
                          { kode: { contains: query, mode: "insensitive" } },
                          { nama: { contains: query, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          kode_klasifikasi: {
            select: {
              id: true,
              kode: true,
              nama: true,
              jadwal_retensi: true,
            },
          },
          divisi: { select: { id: true, kode: true, nama: true } },
          lokasi_penyimpanan: { select: { kode: true, nama: true } },
          jenis_arsip: { select: { id: true, nama: true } },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.jenis_arsip.findMany({
        where: { aktif: true },
        select: { id: true, nama: true },
        orderBy: { nama: "asc" },
      }),
      prisma.divisi.findMany({
        where: { aktif: true },
        select: { id: true, kode: true, nama: true },
        orderBy: { kode: "asc" },
      }),
      prisma.arsip.count({ where: { status_arsip: "akhir_retensi" } }),
    ]);

  // Evaluasi retensi dinamis untuk seluruh arsip tersimpan
  const currentDate = new Date();
  let countTotalNormal = 0;
  let countAktif = 0;
  let countInaktif = 0;
  let countPerluDitinjau = 0;
  let countPermanen = 0;
  let countDynamicAkhirRetensi = 0;

  for (const archive of archives) {
    const schedule = archive.kode_klasifikasi.jadwal_retensi;
    const calc =
      schedule && schedule.aktif
        ? calculateRetention({
            tanggalArsip: archive.tanggal_arsip,
            tanggalDasarKhusus: archive.tanggal_dasar_retensi,
            jadwalRetensi: schedule,
            currentDate,
          })
        : null;

    if (isArchivedRetentionEnd(calc, archive.keputusan_retensi, archive.status_arsip)) {
      countDynamicAkhirRetensi++;
      continue;
    }

    countTotalNormal++;

    const isSelesai =
      calc?.status_retensi === "SELESAI" ||
      (calc?.status_retensi as string) === "SELESAI_RETENSI";
    const isPermanen =
      (isSelesai &&
        (calc?.keterangan_akhir === "PERMANEN" ||
          archive.keputusan_retensi === "SIMPAN")) ||
      schedule?.keterangan_akhir === "PERMANEN" ||
      archive.keputusan_retensi === "SIMPAN";

    if (isPermanen) {
      countPermanen++;
    }

    if (
      needsArchiveRetentionReview(
        calc,
        archive.keputusan_retensi,
        archive.status_retensi
      )
    ) {
      countPerluDitinjau++;
    } else if (
      calc?.status_retensi === "INAKTIF" ||
      (!calc && archive.status_retensi === "INAKTIF")
    ) {
      countInaktif++;
    } else {
      countAktif++;
    }
  }

  // Filter arsip untuk tabel sesuai Tab dan Filter Status yang dipilih
  const filteredArchives = archives.filter((archive) => {
    const schedule = archive.kode_klasifikasi.jadwal_retensi;
    const calc =
      schedule && schedule.aktif
        ? calculateRetention({
            tanggalArsip: archive.tanggal_arsip,
            tanggalDasarKhusus: archive.tanggal_dasar_retensi,
            jadwalRetensi: schedule,
            currentDate,
          })
        : null;

    // 1. Kecualikan arsip yang sudah masuk kondisi Akhir Retensi (dimusnahkan)
    if (isArchivedRetentionEnd(calc, archive.keputusan_retensi, archive.status_arsip)) {
      return false;
    }

    const isSelesai =
      calc?.status_retensi === "SELESAI" ||
      (calc?.status_retensi as string) === "SELESAI_RETENSI";

    const isPermanen =
      (isSelesai &&
        (calc?.keterangan_akhir === "PERMANEN" ||
          archive.keputusan_retensi === "SIMPAN")) ||
      schedule?.keterangan_akhir === "PERMANEN" ||
      archive.keputusan_retensi === "SIMPAN";

    const isNeedsReview = needsArchiveRetentionReview(
      calc,
      archive.keputusan_retensi,
      archive.status_retensi
    );

    const isInaktif =
      calc?.status_retensi === "INAKTIF" ||
      (!calc && archive.status_retensi === "INAKTIF");

    // 2. Jika di Tab Arsip Permanen: tampilkan arsip yang hasil akhirnya PERMANEN
    if (tabParam === "permanen") {
      return isPermanen;
    }

    // 3. Jika di Tab Utama (tabParam === "aktif"):
    // Case A: Card "Perlu Ditinjau" dipilih
    if (statusParam === "perlu_tindakan") {
      return isNeedsReview;
    }

    // Case B: Card "Arsip Inaktif" dipilih
    if (statusParam === "inaktif") {
      return isInaktif && !isNeedsReview;
    }

    // Case C: Card "Arsip Aktif" dipilih
    if (statusParam === "aktif") {
      // HANYA arsip yang status retensinya aktif & masih berada dalam masa aktif.
      // Arsip inaktif, menunggu konfirmasi, PERMANEN, atau akhir retensi TIDAK BOLEH muncul.
      return !isInaktif && !isNeedsReview && !isPermanen;
    }

    // Case D: Card "Total Arsip" (default / statusParam === "semua" / statusParam === "total")
    // Tampilkan seluruh arsip operasional yang tersimpan dalam sistem.
    return true;
  });

  // Hitung pagination (10 item per halaman)
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredArchives.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedArchives = filteredArchives.slice(
    (validPage - 1) * itemsPerPage,
    validPage * itemsPerPage
  );

  // Penentuan active state HANYA untuk satu card yang sedang dipilih:
  const isTotalActive =
    tabParam !== "permanen" &&
    (!statusParam || statusParam === "semua" || statusParam === "total");
  const isAktifActive = tabParam !== "permanen" && statusParam === "aktif";
  const isInaktifActive = tabParam !== "permanen" && statusParam === "inaktif";
  const isPerluDitinjauActive =
    tabParam !== "permanen" && statusParam === "perlu_tindakan";

  // Summary Cards data
  const statCards = [
    {
      title: "Total Arsip",
      value: countTotalNormal,
      description: "Seluruh koleksi arsip",
      icon: Archive,
      href: "/admin/arsip?status=semua",
      active: isTotalActive,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      title: "Arsip Aktif",
      value: countAktif,
      description: "Dalam masa aktif",
      icon: FileCheck2,
      href: "/admin/arsip?status=aktif",
      active: isAktifActive,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Arsip Inaktif",
      value: countInaktif,
      description: "Dalam masa inaktif",
      icon: FileClock,
      href: "/admin/arsip?status=inaktif",
      active: isInaktifActive,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400",
    },
    {
      title: "Perlu Ditinjau",
      value: countPerluDitinjau,
      description: "Perlu aksi/peninjauan",
      icon: AlertTriangle,
      href: "/admin/arsip?status=perlu_tindakan",
      active: isPerluDitinjauActive,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
      highlight: countPerluDitinjau > 0,
    },
    {
      title: "Akhir Retensi",
      value: totalAkhirRetensi + countDynamicAkhirRetensi,
      description: "Menunggu pemusnahan fisik",
      icon: ArchiveRestore,
      href: "/admin/arsip/akhir-retensi",
      active: false,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400",
    },
  ];

  // Helper URL untuk berpindah tab dengan mempertahankan query & filter
  const buildTabUrl = (targetTab: "aktif" | "permanen") => {
    const p = new URLSearchParams();
    if (targetTab === "permanen") {
      p.set("tab", "permanen");
    } else {
      if (statusParam && statusParam !== "semua") {
        p.set("status", statusParam);
      }
    }
    if (query) p.set("q", query);
    if (kategoriId) p.set("kategori", kategoriId.toString());
    if (divisiId) p.set("divisi", divisiId.toString());
    return p.toString() ? `/admin/arsip?${p.toString()}` : "/admin/arsip";
  };

  return (
    <div className="space-y-6 p-6">
      {/* 1. Header Halaman */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <span>/</span>
          <span className="text-foreground">Arsip</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Arsip</h1>
            <p className="text-sm text-muted-foreground">
              Kelola seluruh dokumen dan arsip PLN Batam.
            </p>
          </div>
          <Link
            href="/admin/arsip/tambah"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Arsip
          </Link>
        </div>
      </div>

      {/* 2. 5 Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group block rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                item.active
                  ? "border-primary/60 bg-primary/[0.03] ring-1 ring-primary/40"
                  : item.highlight
                  ? "border-amber-300/80 bg-amber-50/30 dark:border-amber-800/40"
                  : "border-border/60 bg-card hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {item.highlight && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Aksi
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
                {item.value.toLocaleString("id-ID")}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 3, 4, 5, 6. Container Utama: Tab + Search/Filter + Tabel + Pagination */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        {/* Tab Daftar Arsip: [ Arsip Aktif ] [ Arsip Permanen ] */}
        <div className="flex items-center gap-6 border-b border-border/60 px-5 pt-3">
          <Link
            href={buildTabUrl("aktif")}
            className={`relative pb-3 text-sm transition-colors ${
              tabParam === "aktif"
                ? "font-semibold text-primary border-b-2 border-primary -mb-px"
                : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            Arsip Aktif
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                tabParam === "aktif"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {countAktif.toLocaleString("id-ID")}
            </span>
          </Link>

          <Link
            href={buildTabUrl("permanen")}
            className={`relative pb-3 text-sm transition-colors ${
              tabParam === "permanen"
                ? "font-semibold text-primary border-b-2 border-primary -mb-px"
                : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            Arsip Permanen
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                tabParam === "permanen"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {countPermanen.toLocaleString("id-ID")}
            </span>
          </Link>
        </div>

        {/* Search & Filter Bar: [ 🔍 Search ] [Kategori] [Divisi] [Status] [Reset] */}
        <ArsipFilterBar
          categories={jenisArsip.map((j) => ({
            id: j.id.toString(),
            nama: j.nama,
          }))}
          divisions={divisions.map((d) => ({
            id: d.id.toString(),
            kode: d.kode,
            nama: d.nama,
          }))}
          activeTab={tabParam}
          initialSearch={query}
          initialKategori={kategoriId ? kategoriId.toString() : ""}
          initialDivisi={divisiId ? divisiId.toString() : ""}
          initialStatus={statusParam}
        />

        {/* Tabel Arsip Clean: No, Nomor Arsip, Kode Klasifikasi, Nama Arsip, Jenis Arsip, Divisi, Tanggal Arsip, Status, Aksi */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                <th className="w-12 px-4 py-3 text-center">No</th>
                <th className="whitespace-nowrap px-4 py-3">Nomor Arsip</th>
                <th className="whitespace-nowrap px-4 py-3">Kode Klasifikasi</th>
                <th className="px-4 py-3 min-w-[200px]">Nama Arsip</th>
                <th className="whitespace-nowrap px-4 py-3">Jenis Arsip</th>
                <th className="whitespace-nowrap px-4 py-3">Divisi</th>
                <th className="whitespace-nowrap px-4 py-3">Tanggal Arsip</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="w-16 px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedArchives.length > 0 ? (
                paginatedArchives.map((archive, index) => {
                  const archiveId = archive.id.toString();
                  const schedule = archive.kode_klasifikasi.jadwal_retensi;
                  const retentionCalc =
                    schedule && schedule.aktif
                      ? calculateRetention({
                          tanggalArsip: archive.tanggal_arsip,
                          tanggalDasarKhusus: archive.tanggal_dasar_retensi,
                          jadwalRetensi: schedule,
                          currentDate,
                        })
                      : null;

                  const needsReview = needsArchiveRetentionReview(
                    retentionCalc,
                    archive.keputusan_retensi,
                    archive.status_retensi
                  );

                  const reviewData =
                    needsReview && retentionCalc && schedule
                      ? {
                          id: archiveId,
                          nomor_arsip: archive.nomor_arsip,
                          nama_arsip: archive.nama_arsip,
                          kode_klasifikasi: archive.kode_klasifikasi.kode,
                          nama_klasifikasi: archive.kode_klasifikasi.nama,
                          jadwal_retensi_ringkas: `${schedule.retensi_aktif} ${schedule.satuan_retensi_aktif} Aktif + ${schedule.retensi_inaktif} ${schedule.satuan_retensi_inaktif} Inaktif`,
                          dasar_perhitungan: schedule.dasar_perhitungan,
                          tanggal_mulai_aktif: formatArchiveDate(
                            retentionCalc.tanggal_mulai_aktif
                          ),
                          tanggal_selesai_aktif: formatArchiveDate(
                            retentionCalc.tanggal_selesai_aktif
                          ),
                          tanggal_selesai_inaktif: formatArchiveDate(
                            retentionCalc.tanggal_selesai_inaktif
                          ),
                          nasib_akhir: schedule.keterangan_akhir,
                          status_retensi: retentionCalc.label_status,
                        }
                      : null;

                  const isSelesai =
                    retentionCalc?.status_retensi === "SELESAI" ||
                    (retentionCalc?.status_retensi as string) === "SELESAI_RETENSI";
                  const isPermanen =
                    tabParam === "permanen" ||
                    (isSelesai &&
                      (retentionCalc?.keterangan_akhir === "PERMANEN" ||
                        archive.keputusan_retensi === "SIMPAN")) ||
                    schedule?.keterangan_akhir === "PERMANEN" ||
                    archive.keputusan_retensi === "SIMPAN";

                  const isInaktif =
                    retentionCalc?.status_retensi === "INAKTIF" ||
                    (!retentionCalc && archive.status_retensi === "INAKTIF");

                  let displayStatus: "aktif" | "inaktif" | "perlu_tindakan" | "permanen" = "aktif";
                  if (tabParam === "permanen" || isPermanen) {
                    displayStatus = "permanen";
                  } else if (needsReview) {
                    displayStatus = "perlu_tindakan";
                  } else if (isInaktif) {
                    displayStatus = "inaktif";
                  }

                  return (
                    <tr
                      key={archiveId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="w-12 px-4 py-3.5 text-center text-xs text-muted-foreground">
                        {(validPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {archive.nomor_arsip}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                          title={archive.kode_klasifikasi.nama}
                        >
                          {archive.kode_klasifikasi.kode}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-4 py-3.5">
                        <Link
                          href={`/admin/arsip/${archiveId}`}
                          className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                          title={archive.nama_arsip}
                        >
                          {archive.nama_arsip}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        {archive.jenis_arsip?.nama ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        {archive.divisi ? (
                          <span title={archive.divisi.nama}>
                            {archive.divisi.kode || archive.divisi.nama}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                        {formatArchiveDate(archive.tanggal_arsip)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <ArchiveStatusBadge status={displayStatus} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <ArsipActions
                          id={archiveId}
                          name={archive.nama_arsip}
                          hasFile={Boolean(archive.file_arsip)}
                          retentionReviewData={reviewData}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">
                        {query
                          ? `Tidak ditemukan arsip yang cocok dengan pencarian "${query}".`
                          : "Tidak ada data arsip yang sesuai dengan kriteria yang dipilih."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination */}
        <ArsipPagination
          currentPage={validPage}
          totalPages={totalPages}
          totalItems={filteredArchives.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* 7. Panel "Arsip yang Dimusnahkan" */}
      <div className="flex flex-col gap-3 rounded-xl border border-rose-200/60 bg-rose-50/30 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/30 dark:bg-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100/80 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Arsip yang Dimusnahkan
              </h3>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                {(totalAkhirRetensi + countDynamicAkhirRetensi).toLocaleString("id-ID")} arsip
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Daftar arsip yang telah melalui proses pemusnahan atau dalam tahap pemusnahan fisik.
            </p>
          </div>
        </div>
        <Link
          href="/admin/arsip/akhir-retensi"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400 dark:hover:text-rose-300"
        >
          Lihat Semua
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ArchiveStatusBadge({
  status,
}: {
  status: "aktif" | "inaktif" | "perlu_tindakan" | "permanen";
}) {
  switch (status) {
    case "permanen":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
          Permanen
        </span>
      );
    case "perlu_tindakan":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
          Perlu Ditinjau
        </span>
      );
    case "inaktif":
      return (
        <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40">
          Inaktif
        </span>
      );
    case "aktif":
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
          Aktif
        </span>
      );
  }
}
