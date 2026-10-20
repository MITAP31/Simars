"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { JadwalRetensiActions } from "./jadwal-retensi-actions";

export interface JadwalRetensiItem {
  id: string;
  kode_klasifikasi_id: string;
  retensi_aktif: number;
  satuan_retensi_aktif: string;
  retensi_inaktif: number;
  satuan_retensi_inaktif: string;
  keterangan_akhir: string;
  dasar_perhitungan: string;
  keterangan_dasar?: string | null;
  keterangan_khusus?: string | null;
  aktif: boolean;
  created_at?: string;
  kode_klasifikasi: {
    id: string;
    kode: string;
    nama: string;
  };
}

interface JadwalRetensiListProps {
  initialItems: JadwalRetensiItem[];
}

type SortKeyType =
  | "kode_asc"
  | "kode_desc"
  | "nama_asc"
  | "nama_desc"
  | "date_desc"
  | "date_asc";

const itemsPerPage = 10;

export function JadwalRetensiList({ initialItems }: JadwalRetensiListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatusNasib, setFilterStatusNasib] = useState("all");
  const [filterDasar, setFilterDasar] = useState("all");
  const [sortKey, setSortKey] = useState<SortKeyType>("kode_asc");
  const [page, setPage] = useState(1);

  const normalizedQuery = searchTerm.trim().toLowerCase();

  // 1. Filter
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Filter Status / Nasib
      if (filterStatusNasib === "active" && !item.aktif) return false;
      if (filterStatusNasib === "inactive" && item.aktif) return false;
      if (
        filterStatusNasib !== "all" &&
        filterStatusNasib !== "active" &&
        filterStatusNasib !== "inactive" &&
        item.keterangan_akhir !== filterStatusNasib
      ) {
        return false;
      }

      // Filter Dasar Perhitungan
      if (filterDasar !== "all" && item.dasar_perhitungan !== filterDasar) {
        return false;
      }

      // Search Query
      if (!normalizedQuery) return true;
      return (
        item.kode_klasifikasi.kode.toLowerCase().includes(normalizedQuery) ||
        item.kode_klasifikasi.nama.toLowerCase().includes(normalizedQuery) ||
        item.keterangan_akhir.toLowerCase().includes(normalizedQuery) ||
        item.dasar_perhitungan.toLowerCase().includes(normalizedQuery) ||
        (item.keterangan_dasar ?? "").toLowerCase().includes(normalizedQuery) ||
        (item.keterangan_khusus ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [initialItems, normalizedQuery, filterStatusNasib, filterDasar]);

  // 2. Sort
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortKey === "kode_asc") {
        return a.kode_klasifikasi.kode.localeCompare(
          b.kode_klasifikasi.kode,
          "id"
        );
      }
      if (sortKey === "kode_desc") {
        return b.kode_klasifikasi.kode.localeCompare(
          a.kode_klasifikasi.kode,
          "id"
        );
      }
      if (sortKey === "nama_asc") {
        return a.kode_klasifikasi.nama.localeCompare(
          b.kode_klasifikasi.nama,
          "id"
        );
      }
      if (sortKey === "nama_desc") {
        return b.kode_klasifikasi.nama.localeCompare(
          a.kode_klasifikasi.nama,
          "id"
        );
      }
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
  }, [filteredItems, sortKey]);

  // 3. Pagination
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const currentPage = Math.min(page, pageCount);
  const items = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const start = sortedItems.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, sortedItems.length);

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatusNasib("all");
    setFilterDasar("all");
    setSortKey("kode_asc");
    setPage(1);
  };

  const isFilteredOrSorted =
    Boolean(normalizedQuery) ||
    filterStatusNasib !== "all" ||
    filterDasar !== "all" ||
    sortKey !== "kode_asc";

  const formatNasibAkhir = (nasib: string) => {
    switch (nasib) {
      case "PERMANEN":
        return {
          label: "Disimpan Permanen",
          color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
        };
      case "MUSNAH":
        return {
          label: "Dimusnahkan",
          color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
        };
      case "MUSNAH_DENGAN_KETERANGAN_KHUSUS":
        return {
          label: "Perlu Peninjauan",
          color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        };
      default:
        return {
          label: nasib,
          color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Filter Status/Nasib, Filter Dasar, Sort, Reset */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Cari kode, nama dokumen, atau keterangan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border bg-background pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Hapus kata kunci pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Status & Nasib */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label
                htmlFor="filter-status-nasib"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Filter:
              </label>
              <select
                id="filter-status-nasib"
                value={filterStatusNasib}
                onChange={(e) => {
                  setFilterStatusNasib(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="all">Semua Status & Tindakan</option>
                <option value="active">Status: Aktif</option>
                <option value="inactive">Status: Nonaktif</option>
                <option value="PERMANEN">Tindakan: Disimpan Permanen</option>
                <option value="MUSNAH">Tindakan: Dimusnahkan</option>
                <option value="MUSNAH_DENGAN_KETERANGAN_KHUSUS">
                  Tindakan: Perlu Peninjauan
                </option>
              </select>
            </div>

            {/* Filter Dasar Perhitungan */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-dasar"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Dasar:
              </label>
              <select
                id="filter-dasar"
                value={filterDasar}
                onChange={(e) => {
                  setFilterDasar(e.target.value);
                  setPage(1);
                }}
                className="h-9 max-w-[170px] truncate rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="all">Semua Dasar</option>
                <option value="LANGSUNG">Langsung</option>
                <option value="SETELAH_TIDAK_BERLAKU">
                  Setelah Tidak Berlaku
                </option>
                <option value="SETELAH_TAHUN_ANGGARAN_BERAKHIR">
                  Setelah Tahun Anggaran
                </option>
                <option value="SETELAH_DIPERBAHARUI">Setelah Diperbaharui</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <label
                htmlFor="sort-jadwal"
                className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              >
                Urutkan:
              </label>
              <select
                id="sort-jadwal"
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value as SortKeyType);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2.5 py-1 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="kode_asc">Kode (A–Z)</option>
                <option value="kode_desc">Kode (Z–A)</option>
                <option value="nama_asc">Nama (A–Z)</option>
                <option value="nama_desc">Nama (Z–A)</option>
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

      {/* Tabel */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="w-12 px-4 py-3 text-center font-medium text-muted-foreground">
                  No
                </th>
                <th className="px-4 py-3 font-medium">Kode Klasifikasi</th>
                <th className="px-4 py-3 font-medium">Nama Dokumen</th>
                <th className="px-4 py-3 text-center font-medium">
                  Retensi Aktif
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  Retensi Inaktif
                </th>
                <th className="px-4 py-3 font-medium">
                  Keterangan Retensi Aktif
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  Tindakan Akhir
                </th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="w-20 px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-sm font-medium">
                        {normalizedQuery || isFilteredOrSorted
                          ? "Tidak ada jadwal retensi yang cocok dengan kriteria pencarian/filter."
                          : "Belum ada master jadwal retensi arsip."}
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
              ) : (
                items.map((item, index) => {
                  const nasib = formatNasibAkhir(item.keterangan_akhir);

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-primary">
                        {item.kode_klasifikasi.kode}
                      </td>

                      <td
                        className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground"
                        title={item.kode_klasifikasi.nama}
                      >
                        {item.kode_klasifikasi.nama}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {item.retensi_aktif} {item.satuan_retensi_aktif}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          {item.retensi_inaktif} {item.satuan_retensi_inaktif}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {item.dasar_perhitungan || "—"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${nasib.color}`}
                        >
                          {nasib.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.aktif
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <JadwalRetensiActions
                          id={item.id}
                          kode={item.kode_klasifikasi.kode}
                          nama={item.kode_klasifikasi.nama}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer dengan ringkasan & paginasi */}
        {sortedItems.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Menampilkan {start}–{end} dari {sortedItems.length} jadwal retensi
            </p>
            {pageCount > 1 && (
              <nav
                className="flex items-center gap-1"
                aria-label="Pagination jadwal retensi"
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