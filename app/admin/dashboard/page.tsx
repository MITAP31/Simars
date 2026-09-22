import { AlertTriangle, ArchiveRestore, ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FilePlus2, Files, PencilLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { calculateRetention, isArchivedRetentionEnd, needsArchiveRetentionReview } from "@/lib/retensi";

export const dynamic = "force-dynamic";

const displayDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const shortDate = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "Asia/Jakarta" });

type TrendSeries = { label: string; color: string; values: number[] };

function endOfMonth(date: Date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999)); }
function sameDate(left: Date, right: Date) { return Math.abs(left.getTime() - right.getTime()) < 1_000; }
function point(value: number, index: number, length: number, maxValue: number) {
  const x = length > 1 ? 42 + (index * 542) / (length - 1) : 313;
  return { x, y: 184 - (value / maxValue) * 150 };
}
function path(values: number[], maxValue: number) {
  const points = values.map((value, index) => point(value, index, values.length, maxValue));
  if (points.length < 3) return points.map((item, index) => `${index ? "L" : "M"}${item.x.toFixed(2)},${item.y.toFixed(2)}`).join(" ");

  return points.reduce((result, current, index) => {
    if (index === 0) return `M${current.x.toFixed(2)},${current.y.toFixed(2)}`;
    const previous = points[index - 1];
    const beforePrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? current;
    const controlOne = { x: previous.x + (current.x - beforePrevious.x) / 6, y: previous.y + (current.y - beforePrevious.y) / 6 };
    const controlTwo = { x: current.x - (next.x - previous.x) / 6, y: current.y - (next.y - previous.y) / 6 };
    return `${result} C${controlOne.x.toFixed(2)},${controlOne.y.toFixed(2)} ${controlTwo.x.toFixed(2)},${controlTwo.y.toFixed(2)} ${current.x.toFixed(2)},${current.y.toFixed(2)}`;
  }, "");
}

export default async function DashboardPage() {
  const currentDate = new Date();
  const [archives, finalRetentionCount, recentArchives] = await Promise.all([
    prisma.arsip.findMany({ select: { id: true, nomor_arsip: true, nama_arsip: true, status_arsip: true, status_retensi: true, tanggal_arsip: true, tanggal_dasar_retensi: true, created_at: true, updated_at: true, kode_klasifikasi: { select: { jadwal_retensi: true } } } }),
    prisma.arsip.count({ where: { status_arsip: "dihapus" } }),
    prisma.arsip.findMany({ select: { id: true, nama_arsip: true, status_arsip: true, created_at: true, updated_at: true }, orderBy: { updated_at: "desc" }, take: 5 }),
  ]);

  const classify = (archive: (typeof archives)[number], date: Date) => {
    if (archive.status_arsip === "dihapus") return "end" as const;
    const schedule = archive.kode_klasifikasi.jadwal_retensi;
    const retention = schedule?.aktif ? calculateRetention({ tanggalArsip: archive.tanggal_arsip, tanggalDasarKhusus: archive.tanggal_dasar_retensi, jadwalRetensi: schedule, currentDate: date }) : null;
    if (needsArchiveRetentionReview(retention, archive.status_retensi)) return "review" as const;
    if (isArchivedRetentionEnd(retention) || retention?.status_retensi === "SELESAI_RETENSI") return "end" as const;
    if (retention?.status_retensi === "INAKTIF" || (!retention && archive.status_retensi === "INAKTIF")) return "inactive" as const;
    return "active" as const;
  };

  const currentCounts = { active: 0, inactive: 0, review: 0, end: 0 };
  for (const archive of archives) currentCounts[classify(archive, currentDate)]++;
  const operationalArchiveCount = currentCounts.active + currentCounts.inactive + currentCounts.review;
  const statusTotal = Object.values(currentCounts).reduce((sum, value) => sum + value, 0);

  const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - (5 - index), 1)); return { date, label: monthFormatter.format(date), end: endOfMonth(date) }; });
  const trendByMonth = months.map((month) => {
    const result = { newArchives: 0, active: 0, inactive: 0, end: 0 };
    for (const archive of archives) {
      if (archive.created_at >= month.date && archive.created_at <= month.end) result.newArchives++;
      if (archive.created_at > month.end) continue;
      const category = classify(archive, month.end);
      if (category === "active") result.active++;
      else if (category === "inactive") result.inactive++;
      else if (category === "end") result.end++;
    }
    return result;
  });
  const trendSeries: TrendSeries[] = [
    { label: "Arsip Baru", color: "#2386d1", values: trendByMonth.map((item) => item.newArchives) },
    { label: "Arsip Aktif", color: "#19a987", values: trendByMonth.map((item) => item.active) },
    { label: "Arsip Inaktif", color: "#f6ad20", values: trendByMonth.map((item) => item.inactive) },
    { label: "Arsip Akhir Retensi", color: "#e95883", values: trendByMonth.map((item) => item.end) },
  ];
  const maxTrendValue = Math.max(1, ...trendSeries.flatMap((item) => item.values));
  const statusSegments = [
    { label: "Aktif", value: currentCounts.active, color: "#1cab88" }, { label: "Inaktif", value: currentCounts.inactive, color: "#f5ac20" },
    { label: "Perlu Ditinjau", value: currentCounts.review, color: "#9b59b6" }, { label: "Akhir Retensi", value: currentCounts.end, color: "#ec4f7d" },
  ];
  let offset = 0;
  const donutSegments = statusSegments.map((segment) => { const dash = statusTotal ? (segment.value / statusTotal) * 100 : 0; const result = { ...segment, dash, offset: -offset }; offset += dash; return result; });
  const statCards = [
    { title: "Total Arsip", value: operationalArchiveCount, description: "arsip tersimpan", icon: Files, href: "/admin/arsip", tone: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
    { title: "Perlu Ditinjau", value: currentCounts.review, description: "arsip perlu tindakan", icon: Clock3, href: "/admin/arsip?retensi=perlu_tindakan", tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { title: "Arsip Akhir Retensi", value: finalRetentionCount, description: "di area akhir retensi", icon: ArchiveRestore, href: "/admin/arsip/tempat-sampah", tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" },
    { title: "Arsip Aktif", value: currentCounts.active, description: "masih dalam masa aktif", icon: CheckCircle2, href: "/admin/arsip?retensi=aktif", tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  ];

  return <div className="space-y-5 p-5 sm:p-6 lg:p-8">
    <section className="relative overflow-hidden rounded-2xl border border-sky-200 bg-sky-100 p-5 shadow-sm dark:border-sky-900 dark:bg-sky-950/30 sm:p-6"><div className="absolute -right-8 -top-10 h-44 w-44 opacity-[0.09] sm:h-52 sm:w-52"><Image src="/pln-batam-mark-dark.svg" alt="" fill sizes="208px" className="object-contain" priority /></div><div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-sky-200 dark:bg-card dark:ring-sky-900"><Image src="/pln-batam-mark-dark.svg" alt="Logo PLN Batam" fill sizes="56px" className="object-contain p-2" priority /></div><div><h1 className="text-xl font-bold tracking-tight sm:text-2xl">Selamat datang, Administrator</h1><p className="mt-1 text-sm text-muted-foreground">Berikut adalah ringkasan informasi kearsipan SIMARS hari ini.</p></div></div><div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-xs sm:self-auto dark:bg-card/80"><CalendarDays className="h-4 w-4 text-primary" />{displayDate.format(currentDate)}</div></div></section>

    <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map((card) => { const Icon = card.icon; return <Link key={card.title} href={card.href} className="group flex min-h-[178px] h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between"><div className={`rounded-2xl p-3 ${card.tone}`}><Icon className="h-5 w-5" /></div><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" /></div><p className="mt-4 text-sm font-medium text-muted-foreground">{card.title}</p><p className="mt-1 text-3xl font-bold tracking-tight">{card.value.toLocaleString("id-ID")}</p><p className="mt-auto pt-1 text-xs text-muted-foreground">{card.description}</p></Link>; })}</section>

    <section className="grid gap-5 xl:grid-cols-12"><div className="rounded-2xl border border-sky-100 bg-card p-5 shadow-sm xl:col-span-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold tracking-tight">Tren Arsip</h2><p className="mt-1 text-xs text-muted-foreground">Status dihitung dengan engine retensi pada akhir tiap bulan.</p></div><span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-semibold text-primary dark:border-sky-900 dark:bg-sky-950/30"><CalendarDays className="h-3.5 w-3.5" />6 Bulan Terakhir</span></div><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">{trendSeries.map((series) => <span key={series.label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />{series.label}</span>)}</div><div className="mt-5"><svg viewBox="0 0 626 234" className="h-60 w-full sm:h-64" role="img" aria-label="Grafik tren arsip enam bulan terakhir"><defs><linearGradient id="active-area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#19a987" stopOpacity="0.2" /><stop offset="1" stopColor="#19a987" stopOpacity="0" /></linearGradient></defs>{[0, 1, 2, 3, 4].map((line) => { const y = 34 + line * 37.5; return <g key={line}><line x1="42" x2="584" y1={y} y2={y} stroke="#dbeaf3" strokeWidth="1" /><text x="28" y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{Math.round(maxTrendValue - (maxTrendValue / 4) * line)}</text></g>; })}{months.map((month, index) => { const x = 42 + (index * 542) / (months.length - 1); return <line key={month.label} x1={x} x2={x} y1="34" y2="184" stroke="#edf4f8" strokeWidth="1" />; })}<path d={`${path(trendSeries[1].values, maxTrendValue)} L584,184 L42,184 Z`} fill="url(#active-area)" />{trendSeries.map((series) => <g key={series.label}><path d={path(series.values, maxTrendValue)} fill="none" stroke={series.color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />{series.values.map((value, index) => { const p = point(value, index, series.values.length, maxTrendValue); return <circle key={`${series.label}-${index}`} cx={p.x} cy={p.y} r="3.8" fill={series.color} stroke="white" strokeWidth="1.8" />; })}</g>)}{months.map((month, index) => <text key={month.label} x={42 + (index * 542) / (months.length - 1)} y="216" textAnchor="middle" className="fill-muted-foreground text-[10px]">{month.label}</text>)}</svg></div></div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs xl:col-span-3"><h2 className="font-semibold">Status Retensi</h2><p className="mt-1 text-xs text-muted-foreground">Distribusi arsip saat ini</p><div className="mt-5 flex items-center justify-center"><div className="relative h-40 w-40"><svg viewBox="0 0 42 42" className="h-full w-full -rotate-90"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />{donutSegments.map((segment) => <circle key={segment.label} cx="21" cy="21" r="15.9155" fill="none" stroke={segment.color} strokeWidth="6" strokeDasharray={`${segment.dash} ${100 - segment.dash}`} strokeDashoffset={segment.offset} />)}</svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{statusTotal.toLocaleString("id-ID")}</span><span className="text-[10px] text-muted-foreground">Total Arsip</span></div></div></div><div className="mt-5 space-y-3">{statusSegments.map((segment) => <div key={segment.label} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />{segment.label}</span><span className="font-semibold">{segment.value.toLocaleString("id-ID")} <span className="font-normal text-muted-foreground">({statusTotal ? Math.round((segment.value / statusTotal) * 100) : 0}%)</span></span></div>)}</div></div>

      <div className="rounded-2xl border border-border/70 bg-card shadow-xs xl:col-span-2"><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-semibold">Aktivitas Terbaru</h2><Link href="/admin/arsip" className="text-xs font-semibold text-primary hover:underline">Lihat semua</Link></div><div className="divide-y">{recentArchives.length ? recentArchives.map((archive) => { const isNew = sameDate(archive.created_at, archive.updated_at); const isFinal = archive.status_arsip === "dihapus"; const Icon = isFinal ? ArchiveRestore : isNew ? FilePlus2 : PencilLine; const label = isFinal ? "Arsip di area akhir retensi" : isNew ? "Arsip baru ditambahkan" : "Arsip diperbarui"; return <Link key={archive.id.toString()} href={`/admin/arsip/${archive.id.toString()}`} className="flex gap-3 px-5 py-4 transition-colors hover:bg-muted/40"><span className={`self-center shrink-0 rounded-xl p-2 ${isFinal ? "bg-rose-50 text-rose-600" : isNew ? "bg-sky-50 text-sky-600" : "bg-violet-50 text-violet-600"}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs font-semibold">{label}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{archive.nama_arsip}</span><span className="mt-1 block text-[10px] text-muted-foreground">{shortDate.format(archive.updated_at)}</span></span></Link>; }) : <p className="px-5 py-10 text-center text-sm text-muted-foreground">Belum ada aktivitas arsip.</p>}</div></div></section>

    <section className="relative overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-r from-sky-50 via-white to-cyan-50 p-5 shadow-xs dark:border-sky-950 dark:from-sky-950/30 dark:via-card dark:to-cyan-950/20"><div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm"><AlertTriangle className="h-6 w-6" /></div><div><h2 className="font-semibold">Arsip Perlu Ditinjau</h2><p className="mt-1 text-sm text-muted-foreground">Terdapat {currentCounts.review.toLocaleString("id-ID")} arsip yang telah selesai masa retensinya dan memerlukan keputusan akhir.</p></div></div><Link href="/admin/arsip?retensi=perlu_tindakan" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">Lihat Detail <ArrowRight className="h-4 w-4" /></Link></div></section>
  </div>;
}
