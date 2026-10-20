"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DivisiActions } from "@/components/pengaturan/divisi-actions";

export type DivisiListItem = {
  id: string;
  kode: string;
  nama: string;
  keterangan: string | null;
  aktif: boolean;
  created_at?: string;
};

type FilterStatusType = "all" | "active" | "inactive";
type SortKeyType =
  | "nama_asc"
  | "nama_desc"
  | "kode_asc"
  | "kode_desc"
  | "date_desc"
  | "date_asc";

const itemsPerPage = 10;

export function DivisiList({
  divisions,
  initialSearch,
}: {
  divisions: DivisiListItem[];
  initialSearch: string;
}) {
  const [query, setQuery] = useState(initialSearch);
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("all");
  const [sortKey, setSortKey] = useState<SortKeyType>("nama_asc");
  const [page, setPage] = useState(1);

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Filter
  const filteredDivisions = useMemo(() => {
    return divisions.filter((division) => {
      // Status filter
      if (filterStatus === "active" && !division.aktif) return false;
      if (filterStatus === "inactive" && division.aktif) return false;

      // Query filter
      if (!normalizedQuery) return true;
      return [division.kode, division.nama, division.keterangan ?? ""].some(
        (value) => value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [divisions, normalizedQuery, filterStatus]);

  // 2. Sort
  const sortedDivisions = useMemo(() => {
    return [...filteredDivisions].sort((a, b) => {
      if (sortKey === "nama_asc") return a.nama.localeCompare(b.nama, "id");
      if (sortKey === "nama_desc") return b.nama.localeCompare(a.nama, "id");
      if (sortKey === "kode_asc") return a.kode.localeCompare(b.kode, "id");
      if (sortKey === "kode_desc") return b.kode.localeCompare(a.kode, "id");
      if (sortKey === "date_desc") {
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      }
      if (sortKey === "date_asc") {
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
      }
      return 0;
    });
  }, [filteredDivisions, sortKey]);

  // 3. Pagination
  const pageCount = Math.max(1, Math.ceil(sortedDivisions.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sortedDivisions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const start =
    sortedDivisions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, sortedDivisions.length);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleReset = () => {
    setQuery("");
    setFilterStatus("all");
    setSortKey("nama_asc");
    setPage(1);
  };

  const isFilteredOrSorted =
    Boolean(normalizedQuery) ||
    filterStatus !== "all" ||
    sortKey !== "nama_asc";

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Filter Status, Sort, Reset */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Cari kode, nama, atau keterangan divisi..."
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
            {/* Filter Status */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label
                htmlFor="filter-divisi-status"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Filter:
              </label>
              <select
                id="filter-divisi-status"
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
                htmlFor="sort-divisi"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Urutkan:
              </label>
              <select
                id="sort-divisi"
                value={sortKey}
                onChange={(event) => {
                  setSortKey(event.target.value as SortKeyType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="nama_asc">Nama (A–Z)</option>
                <option value="nama_desc">Nama (Z–A)</option>
                <option value="kode_asc">Kode (A–Z)</option>
                <option value="kode_desc">Kode (Z–A)</option>
                <option value="date_desc">Waktu: Terbaru → Terlama</option>
                <option value="date_asc">Waktu: Terlama → Terbaru</option>
              </select>
            </div>

            {/* Reset Button */}
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

      {/* Tabel Data Divisi */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <Head>No</Head>
                <Head>Kode</Head>
                <Head>Nama Divisi</Head>
                <Head>Keterangan</Head>
                <Head>Status</Head>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((division, index) => (
                  <tr
                    key={division.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4 text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{division.kode}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{division.nama}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <span
                        className="block max-w-xs truncate"
                        title={division.keterangan ?? undefined}
                      >
                        {division.keterangan ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Status aktif={division.aktif} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DivisiActions id={division.id} nama={division.nama} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-base font-medium text-foreground">
                        {normalizedQuery
                          ? `Tidak ditemukan divisi untuk "${query}"`
                          : "Belum ada data divisi."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {normalizedQuery
                          ? "Coba gunakan kata kunci lain atau klik tombol Reset di atas."
                          : "Data divisi dapat ditambahkan melalui tombol Tambah di atas."}
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
        {sortedDivisions.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Menampilkan {start}–{end} dari {sortedDivisions.length} divisi
            </p>
            {pageCount > 1 && (
              <nav
                className="flex items-center gap-1"
                aria-label="Pagination divisi"
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

function Head({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-5 py-3 font-medium">{children}</th>;
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
