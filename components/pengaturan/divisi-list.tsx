"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DivisiActions } from "@/components/pengaturan/divisi-actions";

export type DivisiListItem = { id: string; kode: string; nama: string; keterangan: string | null; aktif: boolean };

const itemsPerPage = 10;

export function DivisiList({ divisions, initialSearch }: { divisions: DivisiListItem[]; initialSearch: string }) {
  const [query, setQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDivisions = useMemo(() => divisions.filter((division) => [division.kode, division.nama, division.keterangan ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery))), [divisions, normalizedQuery]);
  const pageCount = Math.max(1, Math.ceil(filteredDivisions.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredDivisions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const start = filteredDivisions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, filteredDivisions.length);

  const updateQuery = (value: string) => { setQuery(value); setPage(1); };

  return <>
    <form className="flex max-w-xl gap-2" onSubmit={(event) => event.preventDefault()}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Cari kode atau nama divisi..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div></form>
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><Head>No</Head><Head>Kode</Head><Head>Nama Divisi</Head><Head>Keterangan</Head><Head>Status</Head><th className="px-5 py-3 text-right font-medium">Aksi</th></tr></thead><tbody>{pageItems.length > 0 ? pageItems.map((division, index) => <tr key={division.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-4 text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</td><td className="px-5 py-4 font-medium">{division.kode}</td><td className="px-5 py-4 font-medium">{division.nama}</td><td className="px-5 py-4 text-muted-foreground"><span className="block max-w-xs truncate" title={division.keterangan ?? undefined}>{division.keterangan ?? "—"}</span></td><td className="px-5 py-4"><Status aktif={division.aktif} /></td><td className="px-5 py-4 text-right"><DivisiActions id={division.id} nama={division.nama} /></td></tr>) : <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{normalizedQuery ? "Divisi tidak ditemukan." : "Belum ada divisi."}</td></tr>}</tbody></table></div>
      {filteredDivisions.length > 0 && <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Menampilkan {start}–{end} dari {filteredDivisions.length} divisi</p>{pageCount > 1 && <nav className="flex items-center gap-1" aria-label="Pagination divisi"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined} className={`h-9 min-w-9 rounded-md px-2 font-medium ${number === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{number}</button>)}<button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Berikutnya<ChevronRight className="h-4 w-4" /></button></nav>}</div>}
    </div>
  </>;
}

function Head({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>; }
function Status({ aktif }: { aktif: boolean }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${aktif ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{aktif ? "Aktif" : "Nonaktif"}</span>; }
