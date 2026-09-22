"use client";

import { Clock, Plus, Search } from "lucide-react";
import Link from "next/link";
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
  kode_klasifikasi: {
    id: string;
    kode: string;
    nama: string;
  };
}

interface JadwalRetensiListProps {
  initialItems: JadwalRetensiItem[];
}

export function JadwalRetensiList({
  initialItems,
}: JadwalRetensiListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return initialItems;

    const lower = searchTerm.toLowerCase();

    return initialItems.filter(
      (item) =>
        item.kode_klasifikasi.kode.toLowerCase().includes(lower) ||
        item.kode_klasifikasi.nama.toLowerCase().includes(lower) ||
        item.keterangan_akhir.toLowerCase().includes(lower) ||
        item.dasar_perhitungan.toLowerCase().includes(lower)
    );
  }, [initialItems, searchTerm]);

  const formatNasibAkhir = (nasib: string) => {
    switch (nasib) {
      case "PERMANEN":
        return {
          label: "Disimpan Permanen",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };

      case "MUSNAH":
        return {
          label: "Dimusnahkan",
          color: "bg-rose-100 text-rose-800 border-rose-200",
        };

      case "MUSNAH_DENGAN_KETERANGAN_KHUSUS":
        return {
          label: "Perlu Peninjauan",
          color: "bg-amber-100 text-amber-800 border-amber-200",
        };

      default:
        return {
          label: nasib,
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const formatDasarPerhitungan = (dasar: string) => {
    if (!dasar || !dasar.trim()) return "—";

    switch (dasar) {
      case "LANGSUNG":
        return "Dari tanggal arsip";

      case "SETELAH_TIDAK_BERLAKU":
        return "Setelah tidak berlaku";

      case "SETELAH_TAHUN_ANGGARAN_BERAKHIR":
        return "Tutup tahun anggaran";

      case "SETELAH_DIPERBAHARUI":
        return "Setelah diperbaharui";

      case "LAINNYA":
        return "Ketentuan khusus";

      default:
        return dasar;
    }
  };

  return (
    <div className="space-y-4">

      {/* Pencarian dan tombol tambah */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Pencarian */}
        <div className="w-full max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              placeholder="Cari kode, nama, atau nasib..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="h-10 w-full rounded-md border bg-background pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Hapus pencarian"
              >
                <span className="text-xs font-semibold">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Tombol tambah */}
        <Link
          href="/admin/master-data/jadwal-retensi/tambah"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal Retensi
        </Link>

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

                <th className="px-4 py-3 font-medium">
                  Kode Klasifikasi
                </th>

                <th className="px-4 py-3 font-medium">
                  Nama Dokumen
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Retensi Aktif
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Retensi Inaktif
                </th>

                <th className="px-4 py-3 font-medium">
                  Dasar Perhitungan
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Tindakan Akhir
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Status
                </th>

                <th className="w-20 px-4 py-3 text-right font-medium">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">

                      <Clock className="h-8 w-8 text-muted-foreground/60" />

                      <p className="text-sm font-medium">
                        {searchTerm
                          ? "Tidak ada jadwal retensi yang cocok dengan pencarian."
                          : "Belum ada master jadwal retensi arsip."}
                      </p>

                      {!searchTerm && (
                        <Link
                          href="/admin/master-data/jadwal-retensi/tambah"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Tambah Sekarang
                        </Link>
                      )}

                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const nasib = formatNasibAkhir(
                    item.keterangan_akhir
                  );

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >

                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-primary">
                        {item.kode_klasifikasi.kode}
                      </td>

                      <td
                        className="max-w-[200px] truncate px-4 py-3 font-medium"
                        title={item.kode_klasifikasi.nama}
                      >
                        {item.kode_klasifikasi.nama}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {item.retensi_aktif}{" "}
                          {item.satuan_retensi_aktif}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {item.retensi_inaktif}{" "}
                          {item.satuan_retensi_inaktif}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDasarPerhitungan(
                          item.dasar_perhitungan
                        )}
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
                              ? "bg-emerald-100 text-emerald-700"
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
      </div>
    </div>
  );
}