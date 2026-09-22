import { AlertTriangle, Archive, ArchiveRestore, FileCheck2, FileClock, FileText, Plus } from "lucide-react";
import Link from "next/link";

import { ArsipActions } from "@/components/arsip/arsip-actions";
import { ArsipSearch } from "@/components/arsip/arsip-search";
import { prisma } from "@/lib/prisma";
import { calculateRetention, isArchivedRetentionEnd, needsArchiveRetentionReview } from "@/lib/retensi";

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
  searchParams: Promise<{ jenis?: string; q?: string; retensi?: string }>;
}) {
  const { jenis, q, retensi } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const jenisArsipId = jenis && /^\d+$/.test(jenis) ? BigInt(jenis) : null;
  const filterRetensi = typeof retensi === "string" ? retensi.trim() : "";

  const [archives, jenisArsip, totalAkhirRetensi] = await Promise.all([
    prisma.arsip.findMany({
      where: {
        status_arsip: "tersimpan",
        ...(jenisArsipId ? { jenis_arsip_id: jenisArsipId } : {}),
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
        divisi: { select: { kode: true, nama: true } },
        lokasi_penyimpanan: { select: { kode: true, nama: true } },
        jenis_arsip: { select: { nama: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.jenis_arsip.findMany({
      where: { aktif: true },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
    prisma.arsip.count({ where: { status_arsip: "dihapus" } }),
  ]);

  // Evaluasi retensi dinamis:
  // 1. Arsip yang sudah selesai retensi dengan nasib "Dimusnahkan" dipindahkan ke "Arsip Akhir Retensi"
  //    sehingga TIDAK BOLEH muncul lagi di daftar Arsip normal.
  // 2. Arsip normal, aktif, inaktif, "Perlu Peninjauan", dan "Disimpan Permanen" tetap muncul di daftar ini.
  // 3. Filter retensi opsional jika diakses dari notifikasi atau filter menu
  const currentDate = new Date();
  const filteredArchives = archives.filter((archive) => {
    const schedule = archive.kode_klasifikasi.jadwal_retensi;
    const calc = schedule && schedule.aktif
      ? calculateRetention({
          tanggalArsip: archive.tanggal_arsip,
          tanggalDasarKhusus: archive.tanggal_dasar_retensi,
          jadwalRetensi: schedule,
          currentDate,
        })
      : null;

    // Kecualikan arsip yang sudah masuk kondisi Akhir Retensi (SELESAI_RETENSI + Dimusnahkan)
    if (isArchivedRetentionEnd(calc)) {
      return false;
    }

    if (!filterRetensi) return true;

    if (filterRetensi === "perlu_tindakan") {
      return needsArchiveRetentionReview(calc, archive.status_retensi);
    }
    if (filterRetensi === "aktif") {
      return calc?.status_retensi === "AKTIF";
    }
    if (filterRetensi === "inaktif") {
      return calc?.status_retensi === "INAKTIF";
    }
    if (filterRetensi === "permanen") {
      return calc?.status_retensi === "SELESAI_RETENSI" && calc.keterangan_akhir === "PERMANEN";
    }
    return true;
  });

  // Hitung summary metrics dari seluruh arsip tersimpan
  let countAktif = 0;
  let countInaktif = 0;
  let countPerluDitinjau = 0;
  let countTotalNormal = 0;

  for (const archive of archives) {
    const schedule = archive.kode_klasifikasi.jadwal_retensi;
    const calc = schedule && schedule.aktif
      ? calculateRetention({
          tanggalArsip: archive.tanggal_arsip,
          tanggalDasarKhusus: archive.tanggal_dasar_retensi,
          jadwalRetensi: schedule,
          currentDate,
        })
      : null;

    if (isArchivedRetentionEnd(calc)) {
      continue;
    }

    countTotalNormal++;
    if (needsArchiveRetentionReview(calc, archive.status_retensi)) {
      countPerluDitinjau++;
    } else if (calc?.status_retensi === "INAKTIF" || (!calc && archive.status_retensi === "INAKTIF")) {
      countInaktif++;
    } else {
      countAktif++;
    }
  }

  const statCards = [
    {
      title: "Total Arsip",
      value: countTotalNormal,
      description: "Arsip operasional",
      icon: Archive,
      href: "/admin/arsip",
      active: !filterRetensi,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      title: "Arsip Aktif",
      value: countAktif,
      description: "Dalam masa aktif",
      icon: FileCheck2,
      href: "/admin/arsip?retensi=aktif",
      active: filterRetensi === "aktif",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Arsip Inaktif",
      value: countInaktif,
      description: "Dalam masa inaktif",
      icon: FileClock,
      href: "/admin/arsip?retensi=inaktif",
      active: filterRetensi === "inaktif",
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400",
    },
    {
      title: "Perlu Ditinjau",
      value: countPerluDitinjau,
      description: "Perlu aksi/peninjauan",
      icon: AlertTriangle,
      href: "/admin/arsip?retensi=perlu_tindakan",
      active: filterRetensi === "perlu_tindakan",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
      highlight: countPerluDitinjau > 0,
    },
    {
      title: "Akhir Retensi",
      value: totalAkhirRetensi,
      description: "Arsip di penampungan",
      icon: ArchiveRestore,
      href: "/admin/arsip/tempat-sampah",
      active: false,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Arsip</h1>
          <p className="text-muted-foreground">Kelola seluruh dokumen dan arsip PLN Batam.</p>
        </div>
        <Link
          href="/admin/arsip/tambah"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Arsip
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group block rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                item.active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : item.highlight
                  ? "border-amber-300 bg-amber-50/40 dark:border-amber-800/50"
                  : "border-border/70 bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {item.highlight && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Aksi
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{item.value.toLocaleString("id-ID")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Komponen Pencarian Arsip */}
      <div className="flex items-center gap-3">
        <ArsipSearch />
      </div>

      {/* Filter Jenis/Kategori Arsip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={query ? `/admin/arsip?q=${encodeURIComponent(query)}` : "/admin/arsip"}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            !jenisArsipId ? "bg-primary text-primary-foreground shadow-xs" : "border hover:bg-muted"
          }`}
        >
          Semua
        </Link>
        {jenisArsip.map((type) => {
          const typeId = type.id.toString();
          const isSelected = jenisArsipId === type.id;
          const href = query
            ? `/admin/arsip?jenis=${typeId}&q=${encodeURIComponent(query)}`
            : `/admin/arsip?jenis=${typeId}`;

          return (
            <Link
              key={typeId}
              href={href}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm transition-colors ${
                isSelected ? "bg-primary font-medium text-primary-foreground shadow-xs" : "border hover:bg-muted"
              }`}
            >
              {type.nama}
            </Link>
          );
        })}
      </div>

      {/* Tabel Data Arsip */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1550px] w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <Head>No</Head>
                <Head>Kode Klasifikasi</Head>
                <Head>Divisi</Head>
                <Head>Judul Arsip / Perihal</Head>
                <Head>Jumlah Arsip (Lembar)</Head>
                <Head>Jenis Arsip</Head>
                <Head>Penulis / Pengirim</Head>
                <Head>Tahun</Head>
                <Head>Tanggal Dokumen</Head>
                <Head>Tingkat Keaslian</Head>
                <Head>Lokasi Simpan</Head>
                <Head>File</Head>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchives.length > 0 ? (
                filteredArchives.map((archive, index) => {
                  const archiveId = archive.id.toString();
                  const location = archive.lokasi_penyimpanan
                    ? `${archive.lokasi_penyimpanan.kode} / ${archive.lokasi_penyimpanan.nama}`
                    : "—";
                  const year = archive.tanggal_arsip?.getUTCFullYear() ?? archive.kurun_waktu ?? "—";

                  const schedule = archive.kode_klasifikasi.jadwal_retensi;
                  const retentionCalc = schedule && schedule.aktif
                    ? calculateRetention({
                        tanggalArsip: archive.tanggal_arsip,
                        tanggalDasarKhusus: archive.tanggal_dasar_retensi,
                        jadwalRetensi: schedule,
                      })
                    : null;

                  const needsReview = needsArchiveRetentionReview(retentionCalc, archive.status_retensi);
                  const reviewData = needsReview && retentionCalc && schedule ? {
                    id: archiveId,
                    nomor_arsip: archive.nomor_arsip,
                    nama_arsip: archive.nama_arsip,
                    kode_klasifikasi: archive.kode_klasifikasi.kode,
                    nama_klasifikasi: archive.kode_klasifikasi.nama,
                    jadwal_retensi_ringkas: `${schedule.retensi_aktif} ${schedule.satuan_retensi_aktif} Aktif + ${schedule.retensi_inaktif} ${schedule.satuan_retensi_inaktif} Inaktif`,
                    dasar_perhitungan: schedule.dasar_perhitungan,
                    tanggal_mulai_aktif: formatArchiveDate(retentionCalc.tanggal_mulai_aktif),
                    tanggal_selesai_aktif: formatArchiveDate(retentionCalc.tanggal_selesai_aktif),
                    tanggal_selesai_inaktif: formatArchiveDate(retentionCalc.tanggal_selesai_inaktif),
                    nasib_akhir: schedule.keterangan_akhir,
                    status_retensi: retentionCalc.label_status,
                  } : null;

                  return (
                    <tr key={archiveId} className="border-b last:border-0 hover:bg-muted/30">
                      <Cell muted>{index + 1}</Cell>
                      <Cell strong>{archive.kode_klasifikasi.kode}</Cell>
                      <Cell>{archive.divisi ? `${archive.divisi.kode} / ${archive.divisi.nama}` : "—"}</Cell>
                      <td className="px-5 py-4">
                        <Link href={`/admin/arsip/${archiveId}`} className="font-medium hover:underline">
                          {archive.nama_arsip}
                        </Link>
                      </td>
                      <Cell>{archive.satuan ? `${archive.jumlah} ${archive.satuan}` : archive.jumlah}</Cell>
                      <Cell>{archive.jenis_arsip?.nama ?? "—"}</Cell>
                      <Cell>{archive.penulis_pengirim ?? "—"}</Cell>
                      <Cell>{year}</Cell>
                      <Cell muted>{formatArchiveDate(archive.tanggal_arsip)}</Cell>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            archive.tingkat_keaslian === "Asli"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {archive.tingkat_keaslian ?? "—"}
                        </span>
                      </td>
                      <Cell muted>{location}</Cell>
                      <td className="whitespace-nowrap px-5 py-4">
                        {archive.file_arsip ? (
                          <Link
                            href={`/admin/arsip/${archiveId}/file`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            title="Lihat Pratinjau Dokumen"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Lihat File</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
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
                  <td colSpan={13} className="px-5 py-10 text-center text-muted-foreground">
                    {query
                      ? `Tidak ditemukan arsip yang cocok dengan pencarian "${query}".`
                      : "Belum ada dokumen arsip tersimpan."}
                  </td>
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
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 ${muted ? "text-muted-foreground" : ""} ${
        strong ? "font-medium" : ""
      }`}
    >
      {children}
    </td>
  );
}
