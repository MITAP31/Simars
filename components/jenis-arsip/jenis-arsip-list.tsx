"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { JenisArsipActions } from "@/components/jenis-arsip/jenis-arsip-actions";

type Category = { id: string; nama: string; slug: string; keterangan: string | null; aktif: boolean; jumlahArsip: number };
const itemsPerPage = 10;

export function JenisArsipList({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => categories.filter((category) => [category.nama, category.keterangan ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery))), [categories, normalizedQuery]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const start = filtered.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, filtered.length);
  const updateQuery = (value: string) => { setQuery(value); setPage(1); };

  return <><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Cari nama atau keterangan kategori..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div><div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><Head>No</Head><Head>Nama Jenis Arsip</Head><Head>Keterangan</Head><Head>Status</Head><Head>Jumlah Arsip</Head><th className="px-5 py-3 font-medium">Aksi</th></tr></thead><tbody>{items.length ? items.map((category, index) => <tr key={category.id} className="border-b last:border-0 transition-colors hover:bg-muted/30"><td className="px-5 py-4 text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</td><td className="max-w-xs px-5 py-4"><Link href={`/admin/arsip?jenis=${category.id}`} className="block truncate font-medium hover:underline">{category.nama}</Link></td><td className="max-w-sm px-5 py-4 text-muted-foreground"><span className="block max-w-xs truncate" title={category.keterangan ?? undefined}>{category.keterangan ?? "—"}</span></td><td className="px-5 py-4"><Status aktif={category.aktif} /></td><td className="px-5 py-4 text-muted-foreground">{category.jumlahArsip} arsip</td><td className="px-5 py-4"><JenisArsipActions id={category.id} nama={category.nama} slug={category.slug} /></td></tr>) : <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{normalizedQuery ? "Kategori tidak ditemukan." : "Belum ada jenis arsip."}</td></tr>}</tbody></table></div>{filtered.length > 0 && <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Menampilkan {start}–{end} dari {filtered.length} kategori</p>{pageCount > 1 && <nav className="flex items-center gap-1" aria-label="Pagination kategori"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined} className={`h-9 min-w-9 rounded-md px-2 font-medium ${number === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{number}</button>)}<button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Berikutnya<ChevronRight className="h-4 w-4" /></button></nav>}</div>}</div></>;
}

function Head({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>; }
function Status({ aktif }: { aktif: boolean }) { return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${aktif ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{aktif ? "Aktif" : "Nonaktif"}</span>; }
