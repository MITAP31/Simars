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

import { LokasiPenyimpananActions } from "@/components/pengaturan/lokasi-penyimpanan-actions";

export type LocationListItem = {
  id: string;
  jenis_lokasi: string;
  kode: string;
  nama: string;
  parent_id: string | null;
  keterangan: string | null;
  aktif: boolean;
  created_at?: string;
};

type TreeNode = LocationListItem & {
  children: TreeNode[];
};

type FlatRow = {
  node: TreeNode;
  level: number;
  rootIndex: number;
};

export type FilterIndukType = "induk" | "all" | "has_children" | "no_children";
export type FilterStatusType = "all" | "active" | "inactive";

export type SortKeyType =
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

export function LokasiPenyimpananList({
  locations,
  initialSearch,
}: {
  locations: LocationListItem[];
  initialSearch: string;
}) {
  const [query, setQuery] = useState(initialSearch);
  const [filterInduk, setFilterInduk] = useState<FilterIndukType>("induk");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("all");
  const [sortKey, setSortKey] = useState<SortKeyType>("hierarchy");
  const [page, setPage] = useState(1);

  // Default collapse state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Bangun struktur pohon (tree)
  const rawRoots = useMemo(() => buildTree(locations), [locations]);

  // 2. Terapkan pengurutan (sorting) secara rekursif
  const sortedRoots = useMemo(
    () => sortTree(rawRoots, sortKey),
    [rawRoots, sortKey]
  );

  // 3. Terapkan pencarian, filter induk, dan filter status
  const { filtered: filteredRoots, autoExpandedIds } = useMemo(
    () =>
      searchAndFilterTree(
        sortedRoots,
        normalizedQuery,
        filterInduk,
        filterStatus
      ),
    [sortedRoots, normalizedQuery, filterInduk, filterStatus]
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

  const start =
    filteredRoots.length === 0 ? 0 : (currentPage - 1) * rootsPerPage + 1;
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
      const base = normalizedQuery
        ? new Set(effectiveExpandedIds)
        : new Set(current);
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

  const handleReset = () => {
    setQuery("");
    setFilterInduk("induk");
    setFilterStatus("all");
    setSortKey("hierarchy");
    setPage(1);
    setExpandedIds(new Set());
  };

  const isFilteredOrSorted =
    Boolean(normalizedQuery) ||
    filterInduk !== "induk" ||
    filterStatus !== "all" ||
    sortKey !== "hierarchy";

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Filter Induk, Filter Status, Sort, Quick Action & Reset */}
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
              <label
                htmlFor="filter-lokasi-induk"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Induk:
              </label>
              <select
                id="filter-lokasi-induk"
                value={filterInduk}
                onChange={(event) => {
                  setFilterInduk(event.target.value as FilterIndukType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="induk">Induk (Default)</option>
                <option value="all">Semua</option>
                <option value="has_children">Memiliki Anak</option>
                <option value="no_children">Tanpa Anak</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-lokasi-status"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Status:
              </label>
              <select
                id="filter-lokasi-status"
                value={filterStatus}
                onChange={(event) => {
                  setFilterStatus(event.target.value as FilterStatusType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <label
                htmlFor="sort-lokasi"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Urutkan:
              </label>
              <select
                id="sort-lokasi"
                value={sortKey}
                onChange={(event) => {
                  setSortKey(event.target.value as SortKeyType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
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
                className="h-9 rounded-md border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                title="Buka semua sub-lokasi yang memiliki anak"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="h-9 rounded-md border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                title="Tutup semua sub-lokasi (kembali collapse)"
              >
                Tutup Semua
              </button>
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isFilteredOrSorted
                  ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                  : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Reset pencarian, filter, dan urutan ke kondisi default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data Lokasi Penyimpanan */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <Head className="w-16">No</Head>
                <Head className="min-w-[220px]">Kode</Head>
                <Head className="min-w-[260px]">Nama Lokasi</Head>
                <Head className="min-w-[150px]">Jenis Lokasi</Head>
                <Head className="min-w-[180px]">Keterangan</Head>
                <Head className="w-28">Status</Head>
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
                      <td className="px-5 py-4 text-muted-foreground tabular-nums">
                        {level === 0 ? rootIndex + 1 : ""}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${level * 24}px` }}
                        >
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggle(node.id)}
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                              aria-label={`${
                                isExpanded ? "Tutup" : "Buka"
                              } sub-lokasi ${node.kode}`}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block h-6 w-6 shrink-0" />
                          )}

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

                      <td className="px-5 py-4 font-medium">
                        <span
                          className={
                            level === 0
                              ? "text-foreground"
                              : "text-foreground/90 font-normal"
                          }
                        >
                          {node.nama}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {node.jenis_lokasi}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        <span
                          className="block max-w-xs truncate"
                          title={node.keterangan ?? undefined}
                        >
                          {node.keterangan ?? "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Status aktif={node.aktif} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <LokasiPenyimpananActions
                          id={node.id}
                          nama={node.nama}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-base font-medium text-foreground">
                        {normalizedQuery
                          ? `Tidak ditemukan lokasi penyimpanan untuk "${query}"`
                          : "Belum ada data lokasi penyimpanan."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {normalizedQuery
                          ? "Coba gunakan kata kunci lain atau klik tombol Reset di atas."
                          : "Data lokasi penyimpanan dapat ditambahkan melalui tombol Tambah di atas."}
                      </p>
                      {isFilteredOrSorted && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
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
              <nav
                className="flex items-center gap-1"
                aria-label="Pagination lokasi penyimpanan"
              >
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted text-xs sm:text-sm font-medium cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={number === currentPage ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-md px-2 text-xs sm:text-sm font-medium cursor-pointer ${
                        number === currentPage
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  disabled={currentPage === pageCount}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted text-xs sm:text-sm font-medium cursor-pointer"
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

function buildTree(items: LocationListItem[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  for (const item of items) {
    nodes.set(item.id, { ...item, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      const parent = nodes.get(node.parent_id)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function sortTree(nodes: TreeNode[], sortKey: SortKeyType): TreeNode[] {
  const comparator = (left: TreeNode, right: TreeNode): number => {
    switch (sortKey) {
      case "kode_asc":
        return left.kode.localeCompare(right.kode, "id", { numeric: true });
      case "kode_desc":
        return right.kode.localeCompare(left.kode, "id", { numeric: true });
      case "nama_asc":
        return left.nama.localeCompare(right.nama, "id");
      case "nama_desc":
        return right.nama.localeCompare(left.nama, "id");
      case "status_active":
        if (left.aktif !== right.aktif) return left.aktif ? -1 : 1;
        return left.kode.localeCompare(right.kode, "id", { numeric: true });
      case "status_inactive":
        if (left.aktif !== right.aktif) return left.aktif ? 1 : -1;
        return left.kode.localeCompare(right.kode, "id", { numeric: true });
      case "date_desc": {
        const leftTime = new Date(left.created_at ?? 0).getTime();
        const rightTime = new Date(right.created_at ?? 0).getTime();
        return rightTime - leftTime;
      }
      case "date_asc": {
        const leftTime = new Date(left.created_at ?? 0).getTime();
        const rightTime = new Date(right.created_at ?? 0).getTime();
        return leftTime - rightTime;
      }
      case "hierarchy":
      default:
        return left.kode.localeCompare(right.kode, "id", { numeric: true });
    }
  };

  return [...nodes].sort(comparator).map((node) => ({
    ...node,
    children: sortTree(node.children, sortKey),
  }));
}

function searchAndFilterTree(
  roots: TreeNode[],
  query: string,
  filterInduk: FilterIndukType,
  filterStatus: FilterStatusType
): { filtered: TreeNode[]; autoExpandedIds: Set<string> } {
  const autoExpanded = new Set<string>();

  const matchesStatus = (node: TreeNode): boolean => {
    if (filterStatus === "active") return node.aktif === true;
    if (filterStatus === "inactive") return node.aktif === false;
    return true;
  };

  const matchesSelf = (node: TreeNode): boolean => {
    if (!matchesStatus(node)) return false;
    if (!query) return true;
    return [node.kode, node.nama, node.jenis_lokasi, node.keterangan ?? ""].some(
      (val) => val.toLowerCase().includes(query)
    );
  };

  const matchesIndukType = (node: TreeNode): boolean => {
    if (filterInduk === "has_children") return node.children.length > 0;
    if (filterInduk === "no_children") return node.children.length === 0;
    return true;
  };

  // Rekursif filter node
  const filterNode = (node: TreeNode): TreeNode | null => {
    const selfMatch = matchesSelf(node);
    const filteredChildren: TreeNode[] = [];

    for (const child of node.children) {
      const childMatch = filterNode(child);
      if (childMatch) {
        filteredChildren.push(childMatch);
      }
    }

    if (query) {
      if (filteredChildren.length > 0) {
        autoExpanded.add(node.id);
        return {
          ...node,
          children: filteredChildren,
        };
      }
      if (selfMatch) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    }

    if (!matchesStatus(node) && filteredChildren.length === 0) {
      return null;
    }

    return {
      ...node,
      children: filteredChildren,
    };
  };

  let result: TreeNode[] = [];

  for (const root of roots) {
    const filtered = filterNode(root);
    if (filtered) {
      result.push(filtered);
    }
  }

  // Terapkan filter induk mode
  if (filterInduk === "induk") {
    // Mode default: tampilkan hanya induk di level root
    result = result.filter(matchesIndukType);
  } else if (filterInduk === "all") {
    // Mode semua: ratakan seluruh node menjadi root-level independen
    const flattened: TreeNode[] = [];
    const collectAll = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (matchesSelf(n)) {
          flattened.push({ ...n, children: [] });
        }
        collectAll(n.children);
      }
    };
    collectAll(result);
    result = flattened;
  } else {
    // Mode has_children / no_children
    result = result.filter(matchesIndukType);
  }

  return { filtered: result, autoExpandedIds: autoExpanded };
}

function flattenTree(
  roots: TreeNode[],
  expandedIds: Set<string>,
  startRootIndex: number
): FlatRow[] {
  const rows: FlatRow[] = [];

  const visit = (
    node: TreeNode,
    level: number,
    rootIndex: number
  ) => {
    rows.push({ node, level, rootIndex });

    if (node.children.length > 0 && expandedIds.has(node.id)) {
      for (const child of node.children) {
        visit(child, level + 1, rootIndex);
      }
    }
  };

  roots.forEach((root, idx) => {
    visit(root, 0, startRootIndex + idx);
  });

  return rows;
}

function Head({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 font-medium text-muted-foreground ${
        className ?? ""
      }`}
    >
      {children}
    </th>
  );
}

function Status({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        aktif
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}
