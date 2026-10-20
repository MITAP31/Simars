"use client";

import { Loader2, RotateCcw, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface OptionItem {
  id: string;
  nama: string;
  kode?: string;
}

interface ArsipFilterBarProps {
  categories: OptionItem[];
  divisions: OptionItem[];
  activeTab: "aktif" | "permanen";
  initialSearch?: string;
  initialKategori?: string;
  initialDivisi?: string;
  initialStatus?: string;
}

export function ArsipFilterBar({
  categories,
  divisions,
  activeTab,
  initialSearch = "",
  initialKategori = "",
  initialDivisi = "",
  initialStatus = "",
}: ArsipFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialSearch);
  const [selectedKategori, setSelectedKategori] = useState(initialKategori);
  const [selectedDivisi, setSelectedDivisi] = useState(initialDivisi);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  // Debounce search timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL query params change externally
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setSelectedKategori(searchParams.get("kategori") ?? searchParams.get("jenis") ?? "");
    setSelectedDivisi(searchParams.get("divisi") ?? "");
    setSelectedStatus(searchParams.get("status") ?? searchParams.get("retensi") ?? "");
  }, [searchParams]);

  const applyFilters = (updated: {
    q?: string;
    kategori?: string;
    divisi?: string;
    status?: string;
  }) => {
    const qVal = updated.q !== undefined ? updated.q : query;
    const katVal = updated.kategori !== undefined ? updated.kategori : selectedKategori;
    const divVal = updated.divisi !== undefined ? updated.divisi : selectedDivisi;
    const statVal = updated.status !== undefined ? updated.status : selectedStatus;

    const params = new URLSearchParams();

    if (activeTab === "permanen") {
      params.set("tab", "permanen");
    }

    const trimmed = qVal.trim();
    if (trimmed) params.set("q", trimmed);
    if (katVal) params.set("kategori", katVal);
    if (divVal) params.set("divisi", divVal);
    if (statVal && statVal !== "semua") {
      params.set("status", statVal);
    } else if (statVal === "semua") {
      params.set("status", "semua");
    }

    startTransition(() => {
      const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(target, { scroll: false });
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters({ q: val });
    }, 350);
  };

  const handleClearQuery = () => {
    setQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFilters({ q: "" });
  };

  const handleReset = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setSelectedKategori("");
    setSelectedDivisi("");
    setSelectedStatus("");

    const params = new URLSearchParams();
    if (activeTab === "permanen") {
      params.set("tab", "permanen");
    }

    startTransition(() => {
      const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(target, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    query.trim() ||
      selectedKategori ||
      selectedDivisi ||
      (selectedStatus && selectedStatus !== "semua")
  );

  const displayStatusValue =
    selectedStatus === "semua" || !selectedStatus ? "semua" : selectedStatus;

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 bg-card">
      {/* 🔍 Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        {isPending ? (
          <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        ) : (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (debounceRef.current) clearTimeout(debounceRef.current);
              applyFilters({ q: query });
            }
          }}
          placeholder="Cari nomor arsip, judul, kode, divisi, atau pengirim..."
          className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-8 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/70"
        />
        {query && (
          <button
            type="button"
            onClick={handleClearQuery}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter controls: [Kategori] [Divisi] [Status] [Reset] */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Kategori Filter */}
        <select
          value={selectedKategori}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedKategori(val);
            applyFilters({ kategori: val });
          }}
          className="h-9 max-w-[170px] truncate rounded-lg border border-border/70 bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          aria-label="Filter Kategori"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nama}
            </option>
          ))}
        </select>

        {/* Divisi Filter */}
        <select
          value={selectedDivisi}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedDivisi(val);
            applyFilters({ divisi: val });
          }}
          className="h-9 max-w-[170px] truncate rounded-lg border border-border/70 bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          aria-label="Filter Divisi"
        >
          <option value="">Semua Divisi</option>
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>
              {div.kode ? `${div.kode} - ${div.nama}` : div.nama}
            </option>
          ))}
        </select>

        {/* Status Filter: HANYA jika di tab Arsip Aktif */}
        {activeTab === "aktif" && (
          <select
            value={displayStatusValue}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStatus(val);
              applyFilters({ status: val });
            }}
            className="h-9 max-w-[160px] truncate rounded-lg border border-border/70 bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            aria-label="Filter Status"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Status: Aktif</option>
            <option value="inaktif">Status: Inaktif</option>
            <option value="perlu_tindakan">Status: Perlu Ditinjau</option>
          </select>
        )}

        {/* Reset Filter Button */}
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          title="Reset semua filter"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
