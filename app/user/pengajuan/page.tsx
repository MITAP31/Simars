import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPenyerahanById } from "@/actions/penyerahan-arsip";
import { isAvailableBeritaAcara } from "@/lib/penyerahan-files";
import {
  PenyerahanArsipView,
  type KlasifikasiOption,
  type LokasiOption,
  type JenisArsipOption,
  type PenyerahanListItem,
} from "@/components/user/penyerahan-arsip-view";

export const dynamic = "force-dynamic";

interface PenyerahanArsipPageProps {
  searchParams?: Promise<{ edit?: string }>;
}

export default async function PenyerahanArsipPage({
  searchParams,
}: PenyerahanArsipPageProps) {
  const user = await requireUser();
  const currentUserIdBigInt = BigInt(user.id);
  const resolvedParams = searchParams ? await searchParams : undefined;
  const editId = resolvedParams?.edit;

  const [klasifikasiRaw, lokasiRaw, jenisArsipRaw, editData, penyerahanListRaw] =
    await Promise.all([
      prisma.kode_klasifikasi.findMany({
        where: { aktif: true },
        orderBy: { kode: "asc" },
        select: { id: true, kode: true, nama: true },
      }),
      prisma.lokasi_penyimpanan.findMany({
        where: { aktif: true },
        orderBy: { kode: "asc" },
        select: { id: true, kode: true, nama: true },
      }),
      prisma.jenis_arsip.findMany({
        where: { aktif: true },
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      }),
      editId ? getPenyerahanById(editId) : Promise.resolve(null),
      user.divisi_id
        ? prisma.penyerahan_arsip.findMany({
            where: { divisi_id: BigInt(user.divisi_id) },
            include: {
              user: { select: { id: true, nama: true, username: true } },
              divisi: { select: { kode: true, nama: true } },
              pihak_kedua: { select: { nama: true, divisi: { select: { kode: true, nama: true } } } },
              details: {
                include: {
                  kode_klasifikasi: { select: { id: true, kode: true, nama: true } },
                  jenis_arsip: { select: { id: true, nama: true } },
                  lokasi_penyimpanan: { select: { id: true, kode: true, nama: true } },
                },
              },
            },
            orderBy: { created_at: "desc" },
          })
        : Promise.resolve([]),
    ]);

  const klasifikasiOptions: KlasifikasiOption[] = klasifikasiRaw.map((k) => ({
    id: k.id.toString(),
    kode: k.kode,
    nama: k.nama,
  }));

  const lokasiOptions: LokasiOption[] = lokasiRaw.map((l) => ({
    id: l.id.toString(),
    kode: l.kode,
    nama: l.nama,
  }));

  const jenisArsipOptions: JenisArsipOption[] = jenisArsipRaw.map((j) => ({
    id: j.id.toString(),
    nama: j.nama,
  }));

  const initialList: PenyerahanListItem[] = penyerahanListRaw.map((p) => {
    const firstDetail = p.details[0];
    const isOwner = p.user_id === currentUserIdBigInt;

    return {
      id: p.id.toString(),
      tanggal_penyerahan: (p.tanggal_penyerahan || p.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      tanggal_arsip_raw: firstDetail?.tanggal_arsip
        ? firstDetail.tanggal_arsip.toISOString().slice(0, 10)
        : null,
      status: p.status,
      user_id: p.user_id.toString(),
      user_nama: p.user?.nama || "Pengguna",
      is_owner: isOwner,
      can_edit: isOwner && p.status === "DIBUAT",
      nomor_berita_acara: p.nomor_berita_acara || null,
      file_berita_acara: p.file_berita_acara || null,
      berita_acara_available: isAvailableBeritaAcara(p.file_berita_acara),
      pihak_kedua_nama: p.pihak_kedua_nama || p.pihak_kedua?.nama || null,
      pihak_kedua_divisi: p.pihak_kedua?.divisi ? `${p.pihak_kedua.divisi.kode} — ${p.pihak_kedua.divisi.nama}` : null,
      divisi: p.divisi ? `${p.divisi.kode} — ${p.divisi.nama}` : null,
      detail_id: firstDetail ? firstDetail.id.toString() : "",
      kode_klasifikasi_id: firstDetail ? firstDetail.kode_klasifikasi_id.toString() : "",
      kode_klasifikasi_kode: firstDetail?.kode_klasifikasi?.kode || "-",
      kode_klasifikasi_nama: firstDetail?.kode_klasifikasi?.nama || "-",
      nama_arsip: firstDetail?.nama_arsip || "Dokumen Arsip",
      jenis_arsip_id: firstDetail?.jenis_arsip_id ? firstDetail.jenis_arsip_id.toString() : null,
      jenis_arsip_nama: firstDetail?.jenis_arsip?.nama || null,
      jumlah: firstDetail?.jumlah || 1,
      satuan: firstDetail?.satuan || "Berkas",
      penulis: firstDetail?.penulis_pengirim || null,
      kurun_waktu: firstDetail?.kurun_waktu || null,
      tingkat_keaslian: firstDetail?.tingkat_keaslian || "Asli",
      lokasi_penyimpanan_id: firstDetail?.lokasi_penyimpanan_id
        ? firstDetail.lokasi_penyimpanan_id.toString()
        : null,
      lokasi_penyimpanan_nama: firstDetail?.lokasi_penyimpanan
        ? `${firstDetail.lokasi_penyimpanan.kode} - ${firstDetail.lokasi_penyimpanan.nama}`
        : null,
      file_arsip: firstDetail?.file_arsip || null,
      keterangan: firstDetail?.keterangan || p.keterangan || null,
      extra_details_count: p.details.length > 1 ? p.details.length - 1 : 0,
      total_details_count: p.details.length,
      all_details: p.details.map((d) => ({
        id: d.id.toString(),
        nama_arsip: d.nama_arsip,
        jumlah: d.jumlah,
        satuan: d.satuan || "Berkas",
        kode_klasifikasi: d.kode_klasifikasi ? `${d.kode_klasifikasi.kode} - ${d.kode_klasifikasi.nama}` : "-",
        file_arsip: d.file_arsip,
        jenis_arsip: d.jenis_arsip?.nama || null,
        penulis: d.penulis_pengirim,
        kurun_waktu: d.kurun_waktu,
        tanggal_arsip: d.tanggal_arsip?.toLocaleDateString("id-ID") || null,
        tingkat_keaslian: d.tingkat_keaslian,
        lokasi_penyimpanan: d.lokasi_penyimpanan ? `${d.lokasi_penyimpanan.kode} — ${d.lokasi_penyimpanan.nama}` : null,
        keterangan: d.keterangan,
      })),
    };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PenyerahanArsipView
        user={{
          id: user.id,
          nama: user.nama,
          username: user.username,
          divisi_id: user.divisi_id,
          divisi: user.divisi,
        }}
        klasifikasiOptions={klasifikasiOptions}
        lokasiOptions={lokasiOptions}
        jenisArsipOptions={jenisArsipOptions}
        initialList={initialList}
        editData={editData}
      />
    </div>
  );
}
