import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, FolderArchive, Layers, Pencil, Plus, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}

function getPenyerahanStatusLabel(status: string) {
  if (status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI") return "Menunggu pemeriksaan";
  if (status === "DIKONFIRMASI") return "Data dikonfirmasi";
  if (status === "SELESAI") return "Selesai";
  return status;
}

export default async function UserDashboardPage() {
  const user = await requireUser();
  const userDivisi = user.divisi ? `${user.divisi.kode} - ${user.divisi.nama}` : "Divisi PLN Batam";
  const divisiIdBigInt = user.divisi_id ? BigInt(user.divisi_id) : null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Ambil data statistik riil berdasarkan transaksi penyerahan divisi user
  const [totalBerkas, penyerahanBulanIni, totalPenyerahan, recentPenyerahan] =
    divisiIdBigInt
      ? await Promise.all([
          // 1. Card Total: Menghitung total fisik berkas arsip dari detail penyerahan divisi
          prisma.detail_penyerahan_arsip
            .aggregate({
              where: {
                penyerahan: {
                  divisi_id: divisiIdBigInt,
                },
              },
              _sum: {
                jumlah: true,
              },
              _count: {
                id: true,
              },
            })
            .then((agg) => (agg._count.id === 0 ? 0 : (agg._sum.jumlah ?? agg._count.id))),

          // 2. Card Penyerahan Bulan Ini: Menghitung transaksi penyerahan pada bulan berjalan
          prisma.penyerahan_arsip.count({
            where: {
              divisi_id: divisiIdBigInt,
              created_at: { gte: startOfMonth },
            },
          }),

          // 3. Card Total Penyerahan: Menghitung jumlah seluruh transaksi penyerahan divisi
          prisma.penyerahan_arsip.count({
            where: {
              divisi_id: divisiIdBigInt,
            },
          }),

          // 4. Daftar Penyerahan Terbaru: 5 transaksi penyerahan terakhir divisi user
          prisma.penyerahan_arsip.findMany({
            where: {
              divisi_id: divisiIdBigInt,
            },
            include: {
              divisi: { select: { kode: true, nama: true } },
              details: {
                include: {
                  kode_klasifikasi: { select: { kode: true, nama: true } },
                },
              },
            },
            orderBy: { created_at: "desc" },
            take: 5,
          }),
        ])
      : [0, 0, 0, []];

  const stats = [
    {
      label: "Total Berkas",
      value: totalBerkas.toLocaleString("id-ID"),
      note: "Total fisik berkas arsip yang diajukan divisi Anda.",
      icon: FileText,
      color: "sky",
    },
    {
      label: "Penyerahan Bulan Ini",
      value: penyerahanBulanIni.toLocaleString("id-ID"),
      note: "Transaksi penyerahan pada bulan berjalan.",
      icon: Layers,
      color: "amber",
    },
    {
      label: "Total Penyerahan",
      value: totalPenyerahan.toLocaleString("id-ID"),
      note: "Total transaksi penyerahan dari divisi Anda.",
      icon: FolderArchive,
      color: "emerald",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>SIMARS</span>
          <span>/</span>
          <span className="text-foreground">User</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas penyerahan arsip {userDivisi}.
        </p>
      </div>

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#075985] via-[#0e7490] to-[#155e75] p-6 text-white shadow-lg shadow-cyan-950/15 sm:p-8">
        <div className="absolute -right-10 -top-14 h-56 w-56 rounded-full border-[24px] border-white/10" />
        <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-cyan-300/10" />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-50">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Selamat datang kembali, {user.nama}
          </p>
          <h2 className="mt-4 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Kelola penyerahan arsip dengan lebih mudah.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-cyan-50/85">
            Serahkan, pantau, dan kelola seluruh arsip divisi Anda dalam satu ruang kerja kearsipan.
          </p>
          <Link
            href="/user/pengajuan"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-xs transition hover:bg-slate-50 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Penyerahan Arsip
          </Link>
        </div>
      </section>

      {/* 3 Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-xl border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm ${
              color === "sky"
                ? "border-sky-200/80 border-t-4 border-t-sky-500"
                : color === "amber"
                ? "border-amber-200/80 border-t-4 border-t-amber-400"
                : "border-emerald-200/80 border-t-4 border-t-emerald-500"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <span
                className={`rounded-lg p-2 ${
                  color === "sky"
                    ? "bg-sky-100 text-sky-700"
                    : color === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${
                color === "sky"
                  ? "text-sky-700"
                  : color === "amber"
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </section>

      {/* Penyerahan Terbaru */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Penyerahan Terbaru</h2>
            <p className="text-xs text-muted-foreground">Aktivitas penyerahan arsip terbaru dari divisi Anda.</p>
          </div>
          <Link
            href="/user/riwayat"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Lihat semua riwayat <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border/40">
          {recentPenyerahan.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada riwayat penyerahan arsip dari divisi Anda.
            </div>
          ) : (
            recentPenyerahan.map((penyerahan) => {
              const mainDetail = penyerahan.details[0];
              const totalBerkasInPenyerahan = penyerahan.details.reduce(
                (sum, d) => sum + (d.jumlah || 1),
                0
              );
              const judulUtama = mainDetail ? mainDetail.nama_arsip : "Penyerahan Arsip";
              const extraCount =
                penyerahan.details.length > 1
                  ? ` (+${penyerahan.details.length - 1} berkas lainnya)`
                  : "";
              const klasifikasiText = mainDetail?.kode_klasifikasi
                ? `${mainDetail.kode_klasifikasi.kode} - ${mainDetail.kode_klasifikasi.nama}`
                : "Dokumen Penyerahan";

              return (
                <div
                  key={penyerahan.id.toString()}
                  className="flex flex-col gap-3 p-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {judulUtama}
                          {extraCount}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(penyerahan.tanggal_penyerahan ?? penyerahan.created_at)}
                        </span>
                        <span>•</span>
                        <span>{klasifikasiText}</span>
                        {penyerahan.divisi && (
                          <>
                            <span>•</span>
                            <span>{penyerahan.divisi.nama}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium text-foreground">
                          {totalBerkasInPenyerahan} Berkas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        penyerahan.status === "DIBUAT" || penyerahan.status === "MENUNGGU_VERIFIKASI"
                          ? "bg-sky-50 text-sky-700 border border-sky-200/60"
                          : penyerahan.status === "DIKONFIRMASI"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {getPenyerahanStatusLabel(penyerahan.status)}
                    </span>
                    {penyerahan.user_id === BigInt(user.id) && penyerahan.status === "DIBUAT" && (
                      <Link
                        href={`/user/pengajuan?edit=${penyerahan.id.toString()}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-2xs"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
