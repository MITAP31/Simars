import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Download, Eye, FileIcon, FileText, FileX, ImageIcon, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { calculateRetention, needsArchiveRetentionReview } from "@/lib/retensi";

import { DetailTinjauRetensiButton } from "@/components/arsip/detail-tinjau-retensi-button";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}

function getFileTypeBadge(ext: string) {
  if (ext === ".pdf") {
    return {
      label: "PDF",
      typeText: "Dokumen PDF",
      icon: <FileText className="h-6 w-6 text-red-600" />,
      bg: "bg-red-50 border-red-200",
    };
  }
  if (ext === ".doc" || ext === ".docx") {
    return {
      label: "Word",
      typeText: "Dokumen Microsoft Word",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200",
    };
  }
  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    return {
      label: ext.replace(".", "").toUpperCase(),
      typeText: "Berkas Gambar",
      icon: <ImageIcon className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200",
    };
  }
  return {
    label: "File",
    typeText: "Berkas Dokumen",
    icon: <FileIcon className="h-6 w-6 text-muted-foreground" />,
    bg: "bg-muted border-border",
  };
}

export default async function DetailArsipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const arsip = await prisma.arsip.findUnique({
    where: { id: BigInt(id) },
    include: {
      kode_klasifikasi: {
        include: {
          jadwal_retensi: true,
        },
      },
      divisi: true,
      lokasi_penyimpanan: true,
      jenis_arsip: true,
    },
  });

  if (!arsip) {
    notFound();
  }

  const location = arsip.lokasi_penyimpanan
    ? `${arsip.lokasi_penyimpanan.kode} — ${arsip.lokasi_penyimpanan.nama}`
    : "—";

  // Perhitungan dinamis jika ada Jadwal Retensi
  const schedule = arsip.kode_klasifikasi.jadwal_retensi;
  const dynamicRetention = schedule && schedule.aktif
    ? calculateRetention({
        tanggalArsip: arsip.tanggal_arsip,
        tanggalDasarKhusus: arsip.tanggal_dasar_retensi,
        jadwalRetensi: schedule,
      })
    : null;

  const displayTanggalDasar = arsip.tanggal_dasar_retensi ?? dynamicRetention?.tanggal_dasar_retensi ?? null;
  const displayMulaiAktif = arsip.tanggal_mulai_aktif ?? dynamicRetention?.tanggal_mulai_aktif ?? null;
  const displaySelesaiAktif = arsip.tanggal_selesai_aktif ?? dynamicRetention?.tanggal_selesai_aktif ?? null;
  const displaySelesaiInaktif = arsip.tanggal_selesai_inaktif ?? dynamicRetention?.tanggal_selesai_inaktif ?? null;

  const rawStatus = arsip.status_retensi ?? dynamicRetention?.status_retensi ?? null;
  const isSelesai = rawStatus === "SELESAI" || rawStatus === "SELESAI_RETENSI" || arsip.status_retensi === "SELESAI_RETENSI_PERMANEN" || arsip.status_retensi === "SELESAI_RETENSI_DIMUSNAHKAN";
  const displayStatusRetensi = isSelesai ? "SELESAI" : rawStatus;
  const displayNasibAkhir = schedule?.keterangan_akhir;
  const keputusan = arsip.keputusan_retensi;

  const isPerluPeninjauan = needsArchiveRetentionReview(dynamicRetention, arsip.keputusan_retensi, arsip.status_retensi);

  const reviewData =
    isPerluPeninjauan && schedule
      ? {
          id: arsip.id.toString(),
          nomor_arsip: arsip.nomor_arsip,
          nama_arsip: arsip.nama_arsip,
          kode_klasifikasi: arsip.kode_klasifikasi.kode,
          nama_klasifikasi: arsip.kode_klasifikasi.nama,
          jadwal_retensi_ringkas: `${schedule.retensi_aktif} ${schedule.satuan_retensi_aktif} Aktif + ${schedule.retensi_inaktif} ${schedule.satuan_retensi_inaktif} Inaktif`,
          dasar_perhitungan: schedule.dasar_perhitungan,
          tanggal_mulai_aktif: formatDate(displayMulaiAktif),
          tanggal_selesai_aktif: formatDate(displaySelesaiAktif),
          tanggal_selesai_inaktif: formatDate(displaySelesaiInaktif),
          nasib_akhir: schedule.keterangan_akhir,
          status_retensi: "Selesai Retensi (Perlu Peninjauan)",
        }
      : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/arsip" className="rounded-md border p-2 hover:bg-muted" aria-label="Kembali ke daftar arsip">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Arsip</h1>
          <p className="text-muted-foreground">Informasi lengkap dokumen arsip.</p>
        </div>
        <Link href={`/admin/arsip/${arsip.id.toString()}/edit`} className="ml-auto flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          <Pencil className="h-4 w-4" />
          Edit Arsip
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6"><h2 className="font-semibold">Informasi Arsip</h2></div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InformationField label="Nomor Arsip" value={arsip.nomor_arsip} />
          <InformationField label="Jenis Arsip" value={arsip.jenis_arsip?.nama ?? "—"} />
          <InformationField label="Kode Klasifikasi" value={`${arsip.kode_klasifikasi.kode} — ${arsip.kode_klasifikasi.nama}`} />
          <InformationField label="Divisi" value={arsip.divisi ? `${arsip.divisi.kode} — ${arsip.divisi.nama}` : "—"} />
          <InformationField label="Tanggal Arsip" value={formatDate(arsip.tanggal_arsip)} />
          <InformationField label="Judul Arsip" value={arsip.nama_arsip} prominent />
          <InformationField label="Penulis / Pengirim" value={arsip.penulis_pengirim ?? "—"} />
          <InformationField label="Jumlah Arsip" value={arsip.satuan ? `${arsip.jumlah} ${arsip.satuan}` : arsip.jumlah.toString()} />
          <InformationField label="Kurun Waktu" value={arsip.kurun_waktu ?? "—"} />
          <InformationField label="Tingkat Keaslian" value={arsip.tingkat_keaslian ?? "—"} />
          <InformationField label="Lokasi Simpan" value={location} />
          <InformationField label="Keterangan" value={arsip.keterangan ?? "—"} fullWidth />
          <div>
            <p className="text-sm text-muted-foreground">Status Arsip</p>
            <span className="mt-2 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {arsip.status_arsip === "akhir_retensi"
                ? "Akhir Retensi"
                : arsip.status_arsip === "dihapus"
                ? "Dihapus"
                : "Tersimpan"}
            </span>
          </div>
          <InformationField label="ID Arsip" value={arsip.id.toString()} />
          <InformationField label="Dibuat pada" value={formatDateTime(arsip.created_at)} />
          <InformationField label="Diperbarui pada" value={formatDateTime(arsip.updated_at)} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Informasi Retensi</h2>
          </div>
          <div className="flex items-center gap-2.5">
            {reviewData && <DetailTinjauRetensiButton data={reviewData} />}
            {displayStatusRetensi ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  displayStatusRetensi === "AKTIF"
                    ? "bg-emerald-100 text-emerald-800"
                    : displayStatusRetensi === "INAKTIF"
                    ? "bg-amber-100 text-amber-800"
                    : displayNasibAkhir === "PERMANEN" || keputusan === "SIMPAN" || arsip.status_retensi === "SELESAI_RETENSI_PERMANEN"
                    ? "bg-blue-100 text-blue-800"
                    : displayNasibAkhir === "MUSNAH" || keputusan === "MUSNAH" || arsip.status_retensi === "SELESAI_RETENSI_DIMUSNAHKAN" || arsip.status_arsip === "akhir_retensi"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {displayStatusRetensi === "AKTIF"
                  ? "Retensi Aktif"
                  : displayStatusRetensi === "INAKTIF"
                  ? "Retensi Inaktif"
                  : displayNasibAkhir === "PERMANEN"
                  ? "Selesai (Disimpan Permanen)"
                  : keputusan === "SIMPAN" || arsip.status_retensi === "SELESAI_RETENSI_PERMANEN"
                  ? "Selesai (Disimpan - Keputusan Admin)"
                  : displayNasibAkhir === "MUSNAH"
                  ? "Selesai (Arsip Akhir Retensi)"
                  : keputusan === "MUSNAH" || arsip.status_retensi === "SELESAI_RETENSI_DIMUSNAHKAN" || arsip.status_arsip === "akhir_retensi"
                  ? "Selesai (Akhir Retensi - Keputusan Admin)"
                  : "Selesai (Perlu Review Admin)"}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Tidak Ada Jadwal Retensi
              </span>
            )}
          </div>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Status Retensi</p>
            <p className="mt-1 font-semibold text-foreground">
              {displayStatusRetensi === "AKTIF"
                ? "Retensi Aktif"
                : displayStatusRetensi === "INAKTIF"
                ? "Retensi Inaktif"
                : displayStatusRetensi === "SELESAI"
                ? displayNasibAkhir === "PERMANEN"
                  ? "Selesai Retensi (Disimpan Permanen)"
                  : keputusan === "SIMPAN" || arsip.status_retensi === "SELESAI_RETENSI_PERMANEN"
                  ? "Selesai Retensi (Tetap Disimpan)"
                  : displayNasibAkhir === "MUSNAH"
                  ? "Selesai Retensi (Arsip Akhir Retensi)"
                  : keputusan === "MUSNAH" || arsip.status_retensi === "SELESAI_RETENSI_DIMUSNAHKAN" || arsip.status_arsip === "akhir_retensi"
                  ? "Selesai Retensi (Arsip Akhir Retensi)"
                  : "Selesai Retensi (Perlu Peninjauan)"
                : "—"}
            </p>
          </div>
          {keputusan && (
            <InformationField
              label="Keputusan Review Retensi"
              value={keputusan === "SIMPAN" ? "SIMPAN (Tetap Disimpan)" : "MUSNAH (Arsip Akhir Retensi)"}
            />
          )}
          <InformationField
            label="Mulai Retensi"
            value={formatDate(displayMulaiAktif)}
          />
          <InformationField
            label="Selesai Masa Aktif"
            value={formatDate(displaySelesaiAktif)}
          />
          <InformationField
            label="Selesai Masa Inaktif"
            value={formatDate(displaySelesaiInaktif)}
          />
          <InformationField
            label="Nasib Akhir Master"
            value={
              displayNasibAkhir === "PERMANEN"
                ? "Disimpan Permanen"
                : displayNasibAkhir === "MUSNAH"
                ? "Dimusnahkan"
                : displayNasibAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS"
                ? `Musnah dengan Keterangan Khusus${schedule?.keterangan_khusus ? ` (${schedule.keterangan_khusus})` : ""}`
                : "—"
            }
          />
          <InformationField
            label="Jadwal Retensi"
            value={
              schedule
                ? `${schedule.retensi_aktif} ${schedule.satuan_retensi_aktif} Aktif + ${schedule.retensi_inaktif} ${schedule.satuan_retensi_inaktif} Inaktif`
                : "Tidak ada jadwal retensi aktif"
            }
          />
          <InformationField
            label="Keterangan Retensi Aktif"
            value={schedule?.dasar_perhitungan || "—"}
            fullWidth
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6"><h2 className="font-semibold">File Dokumen</h2></div>
        {arsip.file_arsip ? (() => {
          const fileName = arsip.file_arsip.split("/").pop() ?? "Dokumen Arsip";
          const fileExt = getFileExtension(fileName);
          const typeDetails = getFileTypeBadge(fileExt);

          return (
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${typeDetails.bg} shadow-xs`}>
                  {typeDetails.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{fileName}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      File tersedia
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {typeDetails.typeText} {fileExt ? `(${fileExt.toUpperCase()})` : ""} · Berkas digital tersimpan
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/arsip/${arsip.id.toString()}/file`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Lihat File
                </Link>
                <a
                  href={`/api/arsip/${arsip.id.toString()}/file?mode=download`}
                  download
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Unduh
                </a>
              </div>
            </div>
          );
        })() : (
          <div className="flex items-center gap-3 p-6 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileX className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Belum ada file dokumen</p>
              <p className="text-xs text-muted-foreground">Tidak ada file atau lampiran berkas yang diunggah pada arsip ini.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InformationField({ label, value, prominent = false, fullWidth = false }: { label: string; value: string; prominent?: boolean; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={prominent ? "mt-1 text-lg font-semibold" : "mt-1 font-medium"}>{value}</p>
    </div>
  );
}
