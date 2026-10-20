"use client";

import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { KodeKlasifikasiActions } from "@/components/pengaturan/kode-klasifikasi-actions";

export type ClassificationListItem = {
  id: string;
  kode: string;
  nama: string;
  jenis_klasifikasi: string | null;
  parent_id: string | null;
  is_induk: boolean;
  keterangan: string | null;
  aktif: boolean;
  created_at?: string;
};

type TreeNode = ClassificationListItem & {
  children: TreeNode[];
};

type FlatRow = {
  node: TreeNode;
  level: number;
  rootIndex: number;
};

export type FilterIndukType = "induk" | "all" | "has_children" | "no_children";

export type SortKey =
  | "hierarchy"
  | "kode_asc"
  | "kode_desc"
  | "nama_asc"
  | "nama_desc"
  | "status_active"
  | "status_inactive"
  | "date_desc"
  | "date_asc";

const rootsPerPage = 10;

export function KodeKlasifikasiList({
  classifications,
  initialSearch,
}: {
  classifications: ClassificationListItem[];
  initialSearch: string;
}) {
  const [query, setQuery] = useState(initialSearch);
  const [filterInduk, setFilterInduk] = useState<FilterIndukType>("induk");
  const [sortKey, setSortKey] = useState<SortKey>("hierarchy");
  const [page, setPage] = useState(1);

  // Requirement 1: DEFAULT SELALU COLLAPSE pada load / refresh / navigasi
  // Tidak disimpan di localStorage atau URL
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Bangun struktur pohon (tree)
  const rawRoots = useMemo(() => buildTree(classifications), [classifications]);

  // 2. Terapkan pengurutan (sorting) secara rekursif pada setiap tingkat hierarki
  const sortedRoots = useMemo(() => sortTree(rawRoots, sortKey), [rawRoots, sortKey]);

  // 3. Terapkan pencarian dan filter induk
  const { filtered: filteredRoots, autoExpandedIds } = useMemo(
    () => searchAndFilterTree(sortedRoots, normalizedQuery, filterInduk),
    [sortedRoots, normalizedQuery, filterInduk]
  );

  // Jika sedang mencari dan ada child yang cocok, buka hierarchy parent yang relevan
  const effectiveExpandedIds = useMemo(() => {
    if (!normalizedQuery) return expandedIds;
    const merged = new Set(expandedIds);
    for (const id of autoExpandedIds) {
      merged.add(id);
    }
    return merged;
  }, [expandedIds, normalizedQuery, autoExpandedIds]);

  // Pagination dihitung berdasarkan root nodes (induk)
  const pageCount = Math.max(1, Math.ceil(filteredRoots.length / rootsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pagedRoots = filteredRoots.slice(
    (currentPage - 1) * rootsPerPage,
    currentPage * rootsPerPage
  );
  const startRootIndex = (currentPage - 1) * rootsPerPage;

  // Flatten tree untuk rendering tabel
  const rows = useMemo(
    () => flattenTree(pagedRoots, effectiveExpandedIds, startRootIndex),
    [pagedRoots, effectiveExpandedIds, startRootIndex]
  );

  const start = filteredRoots.length === 0 ? 0 : (currentPage - 1) * rootsPerPage + 1;
  const end = Math.min(currentPage * rootsPerPage, filteredRoots.length);

  // Kumpulkan semua parent ID untuk fungsi "Buka Semua"
  const allParentIds = useMemo(() => {
    const ids: string[] = [];
    const collect = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          ids.push(node.id);
          collect(node.children);
        }
      }
    };
    collect(filteredRoots);
    return ids;
  }, [filteredRoots]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const toggle = (id: string) => {
    setExpandedIds((current) => {
      // Jika dalam mode pencarian, ambil state efektif saat ini untuk ditoggle
      const base = normalizedQuery ? new Set(effectiveExpandedIds) : new Set(current);
      if (base.has(id)) {
        base.delete(id);
      } else {
        base.add(id);
      }
      return base;
    });
  };

  const expandAll = () => setExpandedIds(new Set(allParentIds));
  const collapseAll = () => setExpandedIds(new Set());

  // Requirement 8: Reset Filter
  const handleReset = () => {
    setQuery("");
    setFilterInduk("induk");
    setSortKey("hierarchy");
    setPage(1);
    setExpandedIds(new Set());
  };

  const isFilteredOrSorted =
    Boolean(normalizedQuery) || filterInduk !== "induk" || sortKey !== "hierarchy";

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Filter, Sort, Quick Action & Reset */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Cari kode, nama, jenis, atau keterangan..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Hapus kata kunci pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Induk */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="filter-induk" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Filter:
              </label>
              <select
                id="filter-induk"
                value={filterInduk}
                onChange={(event) => {
                  setFilterInduk(event.target.value as FilterIndukType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="induk">Induk (Default)</option>
                <option value="all">Semua</option>
                <option value="has_children">Memiliki Anak</option>
                <option value="no_children">Tanpa Anak</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="sort-klasifikasi" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Urutkan:
              </label>
              <select
                id="sort-klasifikasi"
                value={sortKey}
                onChange={(event) => {
                  setSortKey(event.target.value as SortKey);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="hierarchy">Urutan Hierarki / Kode</option>
                <option value="kode_asc">Kode (A–Z)</option>
                <option value="kode_desc">Kode (Z–A)</option>
                <option value="nama_asc">Nama (A–Z)</option>
                <option value="nama_desc">Nama (Z–A)</option>
                <option value="status_active">Status: Aktif Dahulu</option>
                <option value="status_inactive">Status: Nonaktif Dahulu</option>
                <option value="date_desc">Waktu: Terbaru → Terlama</option>
                <option value="date_asc">Waktu: Terlama → Terbaru</option>
              </select>
            </div>

            {/* Quick Action: Buka / Tutup Semua */}
            <div className="hidden items-center gap-1 border-l pl-2 sm:flex sm:pl-3">
              <button
                type="button"
                onClick={expandAll}
                className="h-9 rounded-md border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Buka semua sub-kode yang memiliki anak"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="h-9 rounded-md border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Tutup semua sub-kode (kembali collapse)"
              >
                Tutup Semua
              </button>
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs sm:text-sm font-medium transition-colors ${
                isFilteredOrSorted
                  ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                  : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Kembalikan filter, urutan, pencarian, dan tree ke kondisi awal (default collapse)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data Kode Klasifikasi */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="w-16 px-5 py-3 font-medium text-muted-foreground">No</th>
                <th className="min-w-[220px] px-5 py-3 font-medium">Kode</th>
                <th className="min-w-[260px] px-5 py-3 font-medium">Nama</th>
                <th className="min-w-[150px] px-5 py-3 font-medium">Jenis Klasifikasi</th>
                <th className="min-w-[180px] px-5 py-3 font-medium">Keterangan</th>
                <th className="w-28 px-5 py-3 font-medium">Status</th>
                <th className="w-20 px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map(({ node, level, rootIndex }) => {
                  const hasChildren = node.children.length > 0;
                  const isExpanded = effectiveExpandedIds.has(node.id);

                  return (
                    <tr
                      key={node.id}
                      className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${
                        level > 0 ? "bg-muted/10" : ""
                      }`}
                    >
                      {/* Kolom No: Hanya ditampilkan pada level induk, anak dikosongkan agar nomor induk konsisten */}
                      <td className="px-5 py-4 text-muted-foreground tabular-nums">
                        {level === 0 ? rootIndex + 1 : ""}
                      </td>

                      {/* Kolom Kode dengan Indentasi & Chevron Expander */}
                      <td className="px-5 py-4 font-medium">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${level * 24}px` }}
                        >
                          {/* Chevron Expander: hanya jika node memiliki child */}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggle(node.id)}
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              aria-label={`${isExpanded ? "Tutup" : "Buka"} sub-kode ${node.kode}`}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          ) : (
                            // Spacer agar kode yang tidak punya anak tetap sejajar
                            <span className="inline-block h-6 w-6 shrink-0" />
                          )}

                          {/* Ikon konektor untuk anak yang tidak memiliki sub-anak */}
                          {!hasChildren && level > 0 && (
                            <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                          )}

                          <span
                            className={
                              level === 0
                                ? "font-semibold text-foreground tracking-tight"
                                : "text-foreground"
                            }
                          >
                            {node.kode}
                          </span>
                        </div>
                      </td>

                      {/* Kolom Nama */}
                      <td className="px-5 py-4 font-medium">
                        <span
                          className={
                            level === 0 ? "text-foreground" : "text-foreground/90 font-normal"
                          }
                        >
                          {node.nama}
                        </span>
                      </td>

                      {/* Kolom Jenis Klasifikasi */}
                      <td className="px-5 py-4 text-muted-foreground">
                        {node.jenis_klasifikasi ?? "—"}
                      </td>

                      {/* Kolom Keterangan */}
                      <td className="px-5 py-4 text-muted-foreground">
                        <span
                          className="block max-w-xs truncate"
                          title={node.keterangan ?? undefined}
                        >
                          {node.keterangan ?? "—"}
                        </span>
                      </td>

                      {/* Kolom Status */}
                      <td className="px-5 py-4">
                        <Status aktif={node.aktif} />
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-5 py-4 text-right">
                        <KodeKlasifikasiActions id={node.id} nama={node.nama} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-base font-medium text-foreground">
                        {normalizedQuery
                          ? `Tidak ditemukan kode klasifikasi untuk "${query}"`
                          : "Belum ada data kode klasifikasi."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {normalizedQuery
                          ? "Coba gunakan kata kunci lain atau klik tombol Reset di atas."
                          : "Data kode klasifikasi dapat ditambahkan melalui tombol Tambah di atas."}
                      </p>
                      {isFilteredOrSorted && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Filter & Pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer dengan ringkasan & paginasi */}
        {filteredRoots.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Menampilkan {start}–{end} dari {filteredRoots.length}{" "}
              {filterInduk === "induk" ? "induk" : "data"}
            </p>
            {pageCount > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pagination kode klasifikasi">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted text-xs sm:text-sm font-medium"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    aria-current={number === currentPage ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-md px-2 text-xs sm:text-sm font-medium ${
                      number === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  disabled={currentPage === pageCount}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted text-xs sm:text-sm font-medium"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Membangun struktur pohon dari data mentah
 */
function buildTree(items: ClassificationListItem[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>(
    items.map((item) => [item.id, { ...item, children: [] }])
  );
  const roots: TreeNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;
    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Pembanding urutan data pada setiap level
 */
function compareNodes(a: TreeNode, b: TreeNode, sortKey: SortKey): number {
  switch (sortKey) {
    case "kode_desc":
      return b.kode.localeCompare(a.kode, "id", { numeric: true, sensitivity: "base" });
    case "nama_asc":
      return a.nama.localeCompare(b.nama, "id", { sensitivity: "base" });
    case "nama_desc":
      return b.nama.localeCompare(a.nama, "id", { sensitivity: "base" });
    case "status_active": {
      if (a.aktif !== b.aktif) return a.aktif ? -1 : 1;
      return a.kode.localeCompare(b.kode, "id", { numeric: true, sensitivity: "base" });
    }
    case "status_inactive": {
      if (a.aktif !== b.aktif) return a.aktif ? 1 : -1;
      return a.kode.localeCompare(b.kode, "id", { numeric: true, sensitivity: "base" });
    }
    case "date_asc": {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (tA !== tB) return tA - tB;
      return a.kode.localeCompare(b.kode, "id", { numeric: true, sensitivity: "base" });
    }
    case "date_desc": {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return a.kode.localeCompare(b.kode, "id", { numeric: true, sensitivity: "base" });
    }
    case "hierarchy":
    case "kode_asc":
    default:
      return a.kode.localeCompare(b.kode, "id", { numeric: true, sensitivity: "base" });
  }
}

/**
 * Mengurutkan pohon secara rekursif sehingga urutan anak tetap konsisten di bawah induk
 */
function sortTree(nodes: TreeNode[], sortKey: SortKey): TreeNode[] {
  return [...nodes]
    .sort((a, b) => compareNodes(a, b, sortKey))
    .map((node) => ({
      ...node,
      children: sortTree(node.children, sortKey),
    }));
}

/**
 * Memfilter pohon berdasarkan pencarian dan jenis filter induk
 * Mengembalikan node yang lolos filter serta set ID parent yang perlu dibuka otomatis jika ada child yang cocok
 */
function searchAndFilterTree(
  nodes: TreeNode[],
  normalizedQuery: string,
  filterInduk: FilterIndukType
): { filtered: TreeNode[]; autoExpandedIds: Set<string> } {
  const autoExpanded = new Set<string>();

  const isMatch = (node: TreeNode): boolean => {
    if (!normalizedQuery) return true;
    return (
      node.kode.toLowerCase().includes(normalizedQuery) ||
      node.nama.toLowerCase().includes(normalizedQuery) ||
      (node.jenis_klasifikasi ? node.jenis_klasifikasi.toLowerCase().includes(normalizedQuery) : false) ||
      (node.keterangan ? node.keterangan.toLowerCase().includes(normalizedQuery) : false)
    );
  };

  const filterBranch = (node: TreeNode): TreeNode | null => {
    const selfMatches = isMatch(node);
    const filteredChildren: TreeNode[] = [];

    for (const child of node.children) {
      const matchingChild = filterBranch(child);
      if (matchingChild) {
        filteredChildren.push(matchingChild);
      }
    }

    if (selfMatches) {
      // Jika node ini cocok dan ada query, dan memiliki child yang cocok, buka parent ini
      if (filteredChildren.length > 0 && normalizedQuery) {
        autoExpanded.add(node.id);
      }
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      };
    }

    if (filteredChildren.length > 0) {
      // Jika child cocok tapi parent tidak langsung cocok, parent tetap dibuka agar child terlihat
      if (normalizedQuery) {
        autoExpanded.add(node.id);
      }
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  let resultRoots: TreeNode[] = [];
  if (normalizedQuery) {
    for (const root of nodes) {
      const filteredRoot = filterBranch(root);
      if (filteredRoot) {
        resultRoots.push(filteredRoot);
      }
    }
  } else {
    resultRoots = [...nodes];
  }

  // Terapkan filter induk pada level teratas (root)
  switch (filterInduk) {
    case "induk":
      resultRoots = resultRoots.filter(
        (node) => node.is_induk || node.parent_id === null || node.children.length > 0
      );
      break;
    case "has_children":
      resultRoots = resultRoots.filter((node) => node.children.length > 0);
      break;
    case "no_children":
      resultRoots = resultRoots.filter((node) => node.children.length === 0);
      break;
    case "all":
    default:
      break;
  }

  return { filtered: resultRoots, autoExpandedIds: autoExpanded };
}

/**
 * Meratakan pohon untuk ditampilkan dalam tabel baris demi baris sesuai status expand
 */
function flattenTree(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  startRootIndex: number
): FlatRow[] {
  const rows: FlatRow[] = [];

  const visit = (node: TreeNode, level: number, rootIdx: number) => {
    rows.push({ node, level, rootIndex: rootIdx });
    if (node.children.length > 0 && expandedIds.has(node.id)) {
      for (const child of node.children) {
        visit(child, level + 1, rootIdx);
      }
    }
  };

  nodes.forEach((node, index) => {
    visit(node, 0, startRootIndex + index);
  });

  return rows;
}

function Status({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        aktif ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
      }`}
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}
