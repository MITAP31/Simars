import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  RiwayatPenyerahanView,
  type RiwayatItem,
  type RiwayatStats,
} from "@/components/user/riwayat-penyerahan-view";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date | null | undefined) {
  return date ? dateFormatter.format(date) : "—";
}

export default async function RiwayatPenyerahanPage() {
  const user = await requireUser();
  const currentUserIdBigInt = BigInt(user.id);

  const now = new Date();
  // Awal bulan berjalan (UTC) untuk filter tanggal_penyerahan
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  // ============================================================
  // SUMBER DATA: penyerahan_arsip milik user yang sedang login
  // Scope: user_id = currentUserId (BUKAN divisi_id)
  // ============================================================
  const [totalPenyerahan, penyerahanBulanIni, sumKuantitas, penyerahanList] =
    await Promise.all([
      // 1. Total penyerahan milik user ini
      prisma.penyerahan_arsip.count({
        where: { user_id: currentUserIdBigInt },
      }),

      // 2. Penyerahan bulan berjalan milik user ini
      prisma.penyerahan_arsip.count({
        where: {
          user_id: currentUserIdBigInt,
          tanggal_penyerahan: { gte: startOfMonth },
        },
      }),

      // 3. SUM jumlah berkas dari detail seluruh penyerahan milik user ini
      prisma.detail_penyerahan_arsip.aggregate({
        where: {
          penyerahan: { user_id: currentUserIdBigInt },
        },
        _sum: { jumlah: true },
      }),

      // 4. List penyerahan milik user ini beserta detail & relasi
      prisma.penyerahan_arsip.findMany({
        where: { user_id: currentUserIdBigInt },
        include: {
          divisi: { select: { kode: true, nama: true } },
          details: {
            include: {
              kode_klasifikasi: { select: { kode: true, nama: true } },
              jenis_arsip: { select: { nama: true } },
              lokasi_penyimpanan: { select: { kode: true, nama: true } },
            },
            orderBy: { id: "asc" },
          },
        },
        orderBy: { tanggal_penyerahan: "desc" },
      }),
    ]);

  const totalArsipDiserahkan =
    typeof sumKuantitas._sum.jumlah === "number" && sumKuantitas._sum.jumlah > 0
      ? sumKuantitas._sum.jumlah
      : 0;

  const stats: RiwayatStats = {
    totalPenyerahan,
    penyerahanBulanIni,
    totalArsipDiserahkan,
  };

  // ============================================================
  // MAPPING: 1 penyerahan = 1 baris di tabel (data dari first detail)
  // Jika penyerahan punya banyak detail, extra_details_count > 0
  // ============================================================
  const items: RiwayatItem[] = penyerahanList.map((p) => {
    const firstDetail = p.details[0];

    return {
      id: p.id.toString(),
      detail_id: firstDetail ? firstDetail.id.toString() : "",
      // Header penyerahan
      tanggal_penyerahan: formatDate(p.tanggal_penyerahan),
      status: p.status,
      divisi: p.divisi ? `${p.divisi.kode} - ${p.divisi.nama}` : "-",
      // Detail arsip (dari detail_penyerahan_arsip)
      nama_arsip: firstDetail?.nama_arsip || "Dokumen Arsip",
      kode_klasifikasi: firstDetail?.kode_klasifikasi
        ? `${firstDetail.kode_klasifikasi.kode} - ${firstDetail.kode_klasifikasi.nama}`
        : "-",
      jenis_arsip: firstDetail?.jenis_arsip?.nama || "-",
      jumlah: firstDetail?.jumlah ?? 1,
      satuan: firstDetail?.satuan || "Berkas",
      penulis: firstDetail?.penulis_pengirim || "-",
      kurun_waktu: firstDetail?.kurun_waktu || "-",
      tanggal_arsip: formatDate(firstDetail?.tanggal_arsip ?? null),
      tingkat_keaslian: firstDetail?.tingkat_keaslian || "Asli",
      lokasi_penyimpanan: firstDetail?.lokasi_penyimpanan
        ? `${firstDetail.lokasi_penyimpanan.kode} - ${firstDetail.lokasi_penyimpanan.nama}`
        : "-",
      file_arsip: firstDetail?.file_arsip || null,
      // Jumlah detail lainnya (jika penyerahan memiliki lebih dari 1 detail)
      extra_details_count: p.details.length > 1 ? p.details.length - 1 : 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <RiwayatPenyerahanView stats={stats} items={items} />
    </div>
  );
}
