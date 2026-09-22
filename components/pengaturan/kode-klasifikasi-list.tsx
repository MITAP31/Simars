"use client";

import { ChevronDown, ChevronLeft, ChevronRight, CornerDownRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { KodeKlasifikasiActions } from "@/components/pengaturan/kode-klasifikasi-actions";

export type ClassificationListItem = { id: string; kode: string; nama: string; jenis_klasifikasi: string | null; parent_id: string | null; keterangan: string | null; aktif: boolean };
type TreeNode = ClassificationListItem & { children: TreeNode[] };
type FlatRow = { node: TreeNode; level: number };

const rootsPerPage = 10;

export function KodeKlasifikasiList({ classifications, initialSearch }: { classifications: ClassificationListItem[]; initialSearch: string }) {
  const [query, setQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState(() => new Set(classifications.flatMap((item) => item.parent_id ? [item.parent_id] : [])));
  const normalizedQuery = query.trim().toLowerCase();
  const roots = useMemo(() => buildTree(classifications), [classifications]);
  const filteredRoots = useMemo(() => filterTree(roots, normalizedQuery), [roots, normalizedQuery]);
  const pageCount = Math.max(1, Math.ceil(filteredRoots.length / rootsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pagedRoots = filteredRoots.slice((currentPage - 1) * rootsPerPage, currentPage * rootsPerPage);
  const rows = flattenTree(pagedRoots, normalizedQuery ? new Set() : expandedIds, Boolean(normalizedQuery));
  const start = filteredRoots.length === 0 ? 0 : (currentPage - 1) * rootsPerPage + 1;
  const end = Math.min(currentPage * rootsPerPage, filteredRoots.length);

  const updateQuery = (value: string) => { setQuery(value); setPage(1); };
  const toggle = (id: string) => setExpandedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return <>
    <form className="flex max-w-xl gap-2" onSubmit={(event) => event.preventDefault()}>
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Cari kode, nama, atau jenis klasifikasi..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
    </form>

    <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1000px] w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><Head>No</Head><Head>Kode</Head><Head>Nama</Head><Head>Jenis Klasifikasi</Head><Head>Keterangan</Head><Head>Status</Head><th className="px-5 py-3 text-right font-medium">Aksi</th></tr></thead><tbody>{rows.length > 0 ? rows.map(({ node, level }, index) => <tr key={node.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-4 text-muted-foreground">{(currentPage - 1) * rootsPerPage + index + 1}</td><td className="px-5 py-4 font-medium"><div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 24}px` }}>{node.children.length > 0 ? <button type="button" onClick={() => toggle(node.id)} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`${expandedIds.has(node.id) || Boolean(normalizedQuery) ? "Tutup" : "Buka"} anak ${node.kode}`} aria-expanded={expandedIds.has(node.id) || Boolean(normalizedQuery)}>{expandedIds.has(node.id) || Boolean(normalizedQuery) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button> : <span className="w-5" />}{node.children.length === 0 && level > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />}{node.kode}</div></td><td className="px-5 py-4 font-medium">{node.nama}</td><td className="px-5 py-4">{node.jenis_klasifikasi ?? "—"}</td><td className="px-5 py-4 text-muted-foreground"><span className="block max-w-xs truncate" title={node.keterangan ?? undefined}>{node.keterangan ?? "—"}</span></td><td className="px-5 py-4"><Status aktif={node.aktif} /></td><td className="px-5 py-4 text-right"><KodeKlasifikasiActions id={node.id} nama={node.nama} /></td></tr>) : <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">{normalizedQuery ? "Kode klasifikasi tidak ditemukan." : "Belum ada Kode Klasifikasi."}</td></tr>}</tbody></table></div>
      {filteredRoots.length > 0 && <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Menampilkan {start}–{end} dari {filteredRoots.length} induk</p>{pageCount > 1 && <nav className="flex items-center gap-1" aria-label="Pagination kode klasifikasi"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined} className={`h-9 min-w-9 rounded-md px-2 font-medium ${number === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{number}</button>)}<button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">Berikutnya<ChevronRight className="h-4 w-4" /></button></nav>}</div>}
    </div>
  </>;
}

function buildTree(items: ClassificationListItem[]) {
  const nodes = new Map(items.map((item) => [item.id, { ...item, children: [] as TreeNode[] }]));
  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;
    if (parent && parent.id !== node.id) parent.children.push(node); else roots.push(node);
  }
  return sortTree(roots);
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((left, right) => left.kode.localeCompare(right.kode, "id")).map((node) => ({ ...node, children: sortTree(node.children) }));
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, query);
    const matches = [node.kode, node.nama, node.jenis_klasifikasi ?? ""].some((value) => value.toLowerCase().includes(query));
    return matches || children.length > 0 ? [{ ...node, children: matches ? node.children : children }] : [];
  });
}

function flattenTree(nodes: TreeNode[], expandedIds: Set<string>, forceExpanded: boolean) {
  const rows: FlatRow[] = [];
  const visit = (node: TreeNode, level: number) => {
    rows.push({ node, level });
    if (node.children.length > 0 && (forceExpanded || expandedIds.has(node.id))) node.children.forEach((child) => visit(child, level + 1));
  };
  nodes.forEach((node) => visit(node, 0));
  return rows;
}

function Head({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>; }
function Status({ aktif }: { aktif: boolean }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${aktif ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{aktif ? "Aktif" : "Nonaktif"}</span>; }
