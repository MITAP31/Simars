"use client";

import { useState } from "react";
import {
  Archive,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Paperclip,
  PackageOpen,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { DocumentPreviewButton } from "@/components/penyerahan/document-preview-dialog";

export type RiwayatItem = {
  id: string;
  detail_id: string;
  // Header penyerahan
  tanggal_penyerahan: string;
  status: string;
  divisi: string;
  // Detail arsip
  nama_arsip: string;
  kode_klasifikasi: string;
  jenis_arsip: string;
  jumlah: number;
  satuan: string;
  penulis: string;
  kurun_waktu: string;
  tanggal_arsip: string;
  tingkat_keaslian: string;
  lokasi_penyimpanan: string;
  file_arsip: string | null;
  extra_details_count: number;
};

export type RiwayatStats = {
  totalPenyerahan: number;
  penyerahanBulanIni: number;
  totalArsipDiserahkan: number;
};

function getStatusLabel(status: string) {
  if (status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI") return "Menunggu pemeriksaan";
  if (status === "DIKONFIRMASI") return "Data dikonfirmasi";
  if (status === "SELESAI") return "Selesai";
  return status;
}

export function RiwayatPenyerahanView({
  stats,
  items,
}: {
  stats: RiwayatStats;
  items: RiwayatItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<RiwayatItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.nama_arsip.toLowerCase().includes(query) ||
      item.kode_klasifikasi.toLowerCase().includes(query) ||
      item.jenis_arsip.toLowerCase().includes(query) ||
      item.penulis.toLowerCase().includes(query) ||
      item.lokasi_penyimpanan.toLowerCase().includes(query) ||
      item.kurun_waktu.toLowerCase().includes(query)
    );
  });

  const statCards = [
    {
      label: "Total Penyerahan",
      value: stats.totalPenyerahan.toLocaleString("id-ID"),
      note: "Jumlah penyerahan arsip yang tercatat.",
      icon: FileText,
      color: "sky",
    },
    {
      label: "Penyerahan Bulan Ini",
      value: stats.penyerahanBulanIni.toLocaleString("id-ID"),
      note: "Arsip yang diserahkan pada bulan berjalan.",
      icon: Layers,
      color: "amber",
    },
    {
      label: "Total Berkas Diserahkan",
      value: stats.totalArsipDiserahkan.toLocaleString("id-ID"),
      note: "Total kuantitas fisik dokumen yang diserahkan.",
      icon: PackageOpen,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>SIMARS</span>
          <span>/</span>
          <span className="text-foreground">Riwayat Penyerahan</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Riwayat Penyerahan
        </h1>
        <p className="text-sm text-muted-foreground">
          Lihat riwayat penyerahan arsip yang telah Anda buat.
        </p>
      </div>

      {/* 2. 3 Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, note, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-xl border bg-card p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm ${
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
                className={`rounded-lg p-2.5 ${
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

      {/* 3. Tabel Riwayat Penyerahan */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Daftar Riwayat Penyerahan
            </h2>
            <p className="text-xs text-muted-foreground">
              Daftar arsip yang pernah diserahkan ke bagian kearsipan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan arsip, kode, atau penulis..."
                className="w-full rounded-lg border border-border/70 bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:w-64"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Arsip</th>
                <th className="px-5 py-3">Kode Klasifikasi</th>
                <th className="px-5 py-3">Tanggal Penyerahan</th>
                <th className="px-5 py-3 text-center">Jumlah</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Archive className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      Belum ada data riwayat penyerahan
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      {searchQuery
                        ? "Tidak ada arsip yang cocok dengan kata kunci pencarian Anda."
                        : "Seluruh arsip yang pernah Anda serahkan akan tercatat dalam daftar ini."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-foreground max-w-sm truncate">
                            {item.nama_arsip}
                            {item.extra_details_count > 0 && (
                              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                                (+{item.extra_details_count} berkas lainnya)
                              </span>
                            )}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {item.kode_klasifikasi}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {item.tanggal_penyerahan}
                    </td>
                    <td className="px-5 py-3.5 text-center text-muted-foreground whitespace-nowrap">
                      {item.jumlah} {item.satuan}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye className="h-3 w-3" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Modal Detail Penyerahan Arsip */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Detail Riwayat Penyerahan Arsip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-5 text-xs">
              {/* Status penyerahan */}
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Status</span>
                <span>
                  <span className="inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
                    {getStatusLabel(selectedItem.status)}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Kode Klasifikasi</span>
                <span className="font-medium text-foreground">
                  {selectedItem.kode_klasifikasi}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Judul Arsip</span>
                <span className="font-semibold text-foreground">
                  {selectedItem.nama_arsip}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Jenis Arsip</span>
                <span className="text-foreground">{selectedItem.jenis_arsip}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Divisi</span>
                <span className="font-medium text-foreground">
                  {selectedItem.divisi}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="text-foreground">{selectedItem.jumlah}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Satuan</span>
                <span className="text-foreground">{selectedItem.satuan}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Penulis / Pengirim</span>
                <span className="text-foreground">{selectedItem.penulis}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Kurun Waktu</span>
                <span className="text-foreground">{selectedItem.kurun_waktu}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Tanggal Arsip</span>
                <span className="text-foreground">{selectedItem.tanggal_arsip}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Tingkat Keaslian</span>
                <span className="text-foreground">{selectedItem.tingkat_keaslian}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Lokasi Penyimpanan</span>
                <span className="text-foreground">
                  {selectedItem.lokasi_penyimpanan}
                </span>
              </div>
              <div
                className={`grid grid-cols-[140px_1fr] gap-2 ${selectedItem.file_arsip && selectedItem.detail_id ? "border-b border-border/40 pb-2" : ""}`}
              >
                <span className="text-muted-foreground">Tanggal Penyerahan</span>
                <span className="text-foreground">
                  {selectedItem.tanggal_penyerahan}
                </span>
              </div>
              {/* Berkas Digital — hanya tampil jika ada file */}
              {selectedItem.file_arsip && selectedItem.detail_id && (
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Berkas Digital</span>
                  <span>
                    <DocumentPreviewButton title={selectedItem.nama_arsip} url={`/api/penyerahan/detail/${selectedItem.detail_id}/file`} downloadUrl={`/api/penyerahan/detail/${selectedItem.detail_id}/file?mode=download`} fileName={selectedItem.file_arsip.split("/").pop() || selectedItem.nama_arsip} label="Lihat File" className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 underline underline-offset-2" />
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border/60 bg-muted/20 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg border border-border/70 bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer shadow-2xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
