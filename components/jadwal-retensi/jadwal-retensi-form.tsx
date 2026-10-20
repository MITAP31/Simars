"use client";

import Link from "next/link";
import { ClipboardList, Clock, Info, Save } from "lucide-react";
import { useMemo, useState } from "react";

export type RetentionFormValues = {
  id?: string;
  kode_klasifikasi_id?: string;
  kode_klasifikasi_kode?: string;
  kode_klasifikasi_nama?: string;
  retensi_aktif?: number;
  satuan_retensi_aktif?: string;
  dasar_perhitungan?: string;
  keterangan_dasar?: string | null;
  retensi_inaktif?: number;
  satuan_retensi_inaktif?: string;
  keterangan_akhir?: string;
  keterangan_khusus?: string | null;
  aktif?: boolean;
};

export type ClassificationOption = {
  id: string;
  kode: string;
  nama: string;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

const KETERANGAN_AKHIR_OPTIONS = [
  {
    value: "PERMANEN",
    label: "Disimpan Permanen",
    desc: "Arsip bernilai guna permanen/statis dan akan disimpan selamanya di Arsip Nasional/Pusat Arsip.",
    summaryLabel: "Disimpan Permanen",
  },
  {
    value: "MUSNAH",
    label: "Dimusnahkan",
    desc: "Arsip menjadi kandidat pemusnahan setelah seluruh masa retensi aktif dan inaktif selesai sesuai prosedur.",
    summaryLabel: "Dimusnahkan",
  },
  {
    value: "MUSNAH_DENGAN_KETERANGAN_KHUSUS",
    label: "Perlu Peninjauan / Ada Pengecualian",
    desc: "Memerlukan peninjauan, audit, atau ada pengecualian kondisi khusus sebelum tindakan akhir dilakukan.",
    summaryLabel: "Perlu Peninjauan / Ada Pengecualian",
  },
];

const SATUAN_OPTIONS = ["Tahun", "Bulan", "Hari"];

export function JadwalRetensiForm({
  action,
  classifications = [],
  values = {},
  submitLabel,
  isEdit = false,
}: {
  action: ServerAction;
  classifications?: ClassificationOption[];
  values?: RetentionFormValues;
  submitLabel: string;
  isEdit?: boolean;
}) {
  // Controlled form states for instant live preview and summary
  const [selectedKlasifikasiId, setSelectedKlasifikasiId] = useState(
    values.kode_klasifikasi_id ?? (classifications[0]?.id || "")
  );
  const [retensiAktif, setRetensiAktif] = useState<number | string>(
    values.retensi_aktif ?? 1
  );
  const [satuanAktif, setSatuanAktif] = useState(
    values.satuan_retensi_aktif ?? "Tahun"
  );
  const [dasarPerhitungan, setDasarPerhitungan] = useState(
    values.dasar_perhitungan ?? ""
  );

  const [retensiInaktif, setRetensiInaktif] = useState<number | string>(
    values.retensi_inaktif ?? 0
  );
  const [satuanInaktif, setSatuanInaktif] = useState(
    values.satuan_retensi_inaktif ?? "Tahun"
  );

  const [keteranganAkhir, setKeteranganAkhir] = useState(
    values.keterangan_akhir ?? "PERMANEN"
  );
  const [keteranganKhusus, setKeteranganKhusus] = useState(
    values.keterangan_khusus ?? ""
  );

  // Helper calculation for summary classification name
  const currentClassification = useMemo(() => {
    if (isEdit) {
      return {
        kode: values.kode_klasifikasi_kode || "—",
        nama: values.kode_klasifikasi_nama || "—",
      };
    }
    const found = classifications.find((c) => c.id === selectedKlasifikasiId);
    return {
      kode: found?.kode || "Belum dipilih",
      nama: found?.nama || "Pilih kode klasifikasi terlebih dahulu",
    };
  }, [isEdit, values, classifications, selectedKlasifikasiId]);

  // Dynamic preview for Retensi Aktif
  const previewAktifText = useMemo(() => {
    const angka = retensiAktif === "" ? 0 : retensiAktif;
    const durasiText = `${angka} ${satuanAktif}`.trim();
    const dasar = dasarPerhitungan.trim();

    if (!dasar) {
      return durasiText;
    }

    const dasarLower = dasar.toLowerCase();
    if (dasarLower === "langsung dihitung dari tanggal arsip" || dasarLower === "langsung") {
      return `${durasiText} sejak tanggal arsip`;
    }
    if (dasarLower.startsWith("setelah") || dasarLower.startsWith("sejak") || dasarLower.startsWith("sesuai")) {
      return `${durasiText} ${dasar.charAt(0).toLowerCase() + dasar.slice(1)}`;
    }
    return `${durasiText} ${dasar}`;
  }, [retensiAktif, satuanAktif, dasarPerhitungan]);

  // Dynamic preview for Retensi Inaktif
  const previewInaktifText = useMemo(() => {
    const angka = retensiInaktif === "" ? 0 : retensiInaktif;
    return `Arsip disimpan selama ${angka} ${satuanInaktif} setelah masa retensi aktif selesai.`;
  }, [retensiInaktif, satuanInaktif]);

  // Dynamic label for Tindakan Akhir
  const nasibObj = useMemo(() => {
    return (
      KETERANGAN_AKHIR_OPTIONS.find((o) => o.value === keteranganAkhir) ||
      KETERANGAN_AKHIR_OPTIONS[0]
    );
  }, [keteranganAkhir]);

  return (
    <form action={action} className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {isEdit && values.kode_klasifikasi_id && (
        <input type="hidden" name="kode_klasifikasi_id" value={values.kode_klasifikasi_id} />
      )}

      <div className="space-y-8 p-6 sm:p-8">
        {/* ======================================================== */}
        {/* BAGIAN 1: KODE KLASIFIKASI                               */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <label htmlFor="kode_klasifikasi_id" className="block text-sm font-semibold text-foreground">
            Kode Klasifikasi
          </label>

          {isEdit ? (
            <div className="rounded-lg border bg-muted/40 p-3.5 text-sm">
              <div className="font-semibold text-primary">
                {values.kode_klasifikasi_kode}
              </div>
              <div className="text-muted-foreground mt-0.5">
                {values.kode_klasifikasi_nama}
              </div>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Kode klasifikasi pada jadwal retensi tidak dapat diubah setelah dibuat.
              </p>
            </div>
          ) : (
            <>
              <select
                id="kode_klasifikasi_id"
                name="kode_klasifikasi_id"
                required
                value={selectedKlasifikasiId}
                onChange={(e) => setSelectedKlasifikasiId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Pilih kode klasifikasi
                </option>
                {classifications.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.kode} — {item.nama}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Pilih kode klasifikasi yang akan dibuatkan jadwal retensinya.
              </p>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* BAGIAN 2: MASA RETENSI (AKTIF & INAKTIF)                 */}
        {/* ======================================================== */}
        <div className="border-t pt-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Masa Retensi
            </h2>
            <p className="text-xs text-muted-foreground">
              Tentukan periode penyimpanan dokumen berkas saat aktif digunakan maupun setelah inaktif.
            </p>
          </div>

          {/* Sub bagian: Retensi Aktif */}
          <div className="space-y-4 rounded-lg bg-muted/15 p-4 sm:p-5 border border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Retensi Aktif</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Berapa lama arsip digunakan secara aktif di unit kerja pengolah.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="retensi_aktif" className="block text-xs font-medium text-foreground mb-1.5">
                  Lama Retensi
                </label>
                <input
                  id="retensi_aktif"
                  name="retensi_aktif"
                  type="number"
                  min={0}
                  max={999}
                  required
                  value={retensiAktif}
                  onChange={(e) => setRetensiAktif(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Masukkan angka (contoh: 2)"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="satuan_retensi_aktif" className="block text-xs font-medium text-foreground mb-1.5">
                  Satuan
                </label>
                <select
                  id="satuan_retensi_aktif"
                  name="satuan_retensi_aktif"
                  value={satuanAktif}
                  onChange={(e) => setSatuanAktif(e.target.value)}
                  className={inputClass}
                >
                  {SATUAN_OPTIONS.map((satuan) => (
                    <option key={satuan} value={satuan}>
                      {satuan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dasar_perhitungan" className="block text-xs font-medium text-foreground">
                Keterangan Retensi Aktif
              </label>
              <input
                id="dasar_perhitungan"
                name="dasar_perhitungan"
                type="text"
                value={dasarPerhitungan}
                onChange={(e) => setDasarPerhitungan(e.target.value)}
                placeholder="Contoh: Setelah tidak berlaku, atau setelah tindak lanjut selesai"
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                Opsional. Catatan atau penjelasan naratif aturan JRA/SK.
              </p>
            </div>

            {/* Live Preview Retensi Aktif */}
            <div className="flex items-start gap-2 rounded-md bg-background/80 px-3.5 py-2.5 border border-primary/20 text-xs">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-primary">Preview Retensi Aktif: </span>
                <span className="font-medium text-foreground">{previewAktifText}</span>
              </div>
            </div>
          </div>

          {/* Sub bagian: Retensi Inaktif */}
          <div className="space-y-4 rounded-lg bg-muted/15 p-4 sm:p-5 border border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-foreground">Retensi Inaktif</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Berapa lama arsip disimpan di Records Center setelah masa retensi aktif selesai.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="retensi_inaktif" className="block text-xs font-medium text-foreground mb-1.5">
                  Lama Retensi
                </label>
                <input
                  id="retensi_inaktif"
                  name="retensi_inaktif"
                  type="number"
                  min={0}
                  max={999}
                  required
                  value={retensiInaktif}
                  onChange={(e) => setRetensiInaktif(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Masukkan angka (contoh: 3)"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="satuan_retensi_inaktif" className="block text-xs font-medium text-foreground mb-1.5">
                  Satuan
                </label>
                <select
                  id="satuan_retensi_inaktif"
                  name="satuan_retensi_inaktif"
                  value={satuanInaktif}
                  onChange={(e) => setSatuanInaktif(e.target.value)}
                  className={inputClass}
                >
                  {SATUAN_OPTIONS.map((satuan) => (
                    <option key={satuan} value={satuan}>
                      {satuan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Preview Retensi Inaktif */}
            <div className="flex items-start gap-2 rounded-md bg-background/80 px-3.5 py-2.5 border border-amber-500/20 text-xs">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-700">Preview Retensi Inaktif: </span>
                <span className="font-medium text-foreground">{previewInaktifText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAGIAN 3: TINDAKAN SETELAH MASA RETENSI                  */}
        {/* ======================================================== */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Tindakan Setelah Masa Retensi
            </h2>
            <p className="text-xs text-muted-foreground">
              Tentukan tindakan terhadap arsip setelah seluruh masa retensi aktif dan inaktif berakhir.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="keterangan_akhir" className="block text-xs font-medium text-foreground">
              Tindakan Akhir Arsip
            </label>
            <select
              id="keterangan_akhir"
              name="keterangan_akhir"
              value={keteranganAkhir}
              onChange={(e) => setKeteranganAkhir(e.target.value)}
              className={inputClass}
            >
              {KETERANGAN_AKHIR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">{nasibObj.desc}</p>
          </div>

          {keteranganAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="keterangan_khusus" className="block text-xs font-medium text-foreground">
                Ketentuan / Pengecualian <span className="text-destructive">*</span>
              </label>
              <textarea
                id="keterangan_khusus"
                name="keterangan_khusus"
                rows={3}
                maxLength={2000}
                required
                value={keteranganKhusus}
                onChange={(e) => setKeteranganKhusus(e.target.value)}
                placeholder="Contoh: Musnah kecuali PHK karena pensiun masuk Personal File..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Jelaskan kondisi atau jenis arsip yang memerlukan peninjauan sebelum tindakan akhir dilakukan.
              </p>
            </div>
          )}

          {/* Contextual Action Preview */}
          <div className="rounded-lg border bg-muted/20 p-4 text-xs space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              {keteranganAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" ? (
                <span className="text-amber-600 font-bold">⚠ Preview Tindakan Akhir</span>
              ) : (
                <span className="text-primary font-bold">Preview Tindakan Akhir</span>
              )}
            </div>

            {keteranganAkhir === "PERMANEN" && (
              <p className="text-muted-foreground">
                Arsip disimpan secara permanen.
              </p>
            )}

            {keteranganAkhir === "MUSNAH" && (
              <p className="text-muted-foreground">
                Arsip menjadi kandidat pemusnahan setelah seluruh masa retensi berakhir.
              </p>
            )}

            {keteranganAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && (
              <div className="space-y-2 pt-0.5">
                <p className="text-amber-800 font-medium">
                  Arsip memerlukan peninjauan sebelum tindakan akhir dilakukan.
                </p>
                <p className="text-muted-foreground">
                  Arsip tidak boleh langsung diproses secara otomatis.
                </p>
                {keteranganKhusus.trim() ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50/70 p-2.5 text-amber-900">
                    <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-800">
                      Ketentuan:
                    </span>
                    <span className="whitespace-pre-wrap">{keteranganKhusus}</span>
                  </div>
                ) : (
                  <p className="italic text-muted-foreground/70">
                    (Belum ada ketentuan/pengecualian yang ditulis)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAGIAN 4: STATUS JADWAL                                  */}
        {/* ======================================================== */}
        <div className="border-t pt-6 space-y-2">
          <label htmlFor="aktif" className="block text-sm font-semibold text-foreground">
            Status Jadwal
          </label>
          <select
            id="aktif"
            name="aktif"
            defaultValue={values.aktif === false ? "false" : "true"}
            className={inputClass}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Jadwal aktif dapat digunakan langsung sebagai aturan retensi saat pembuatan arsip baru.
          </p>
        </div>

        {/* ======================================================== */}
        {/* BAGIAN 5: RINGKASAN JADWAL RETENSI (LIVE PREVIEW CARD)    */}
        {/* ======================================================== */}
        <div className="border-t pt-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Ringkasan Jadwal Retensi
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kode Klasifikasi
                </span>
                <div className="font-bold text-primary text-base">
                  {currentClassification.kode}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentClassification.nama}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tindakan Akhir
                </span>
                <div className="font-semibold text-foreground">
                  {nasibObj.summaryLabel}
                </div>
                {keteranganAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && (
                  <p className="text-xs text-amber-700">
                    ⚠ Memerlukan peninjauan sebelum tindakan akhir
                  </p>
                )}
                {keteranganAkhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && keteranganKhusus && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Ketentuan: {keteranganKhusus}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:col-span-2 pt-1 border-t border-primary/10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Retensi Aktif
                    </span>
                    <div className="font-medium text-foreground">
                      {previewAktifText}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Retensi Inaktif
                    </span>
                    <div className="font-medium text-foreground">
                      {retensiInaktif === "" ? 0 : retensiInaktif} {satuanInaktif}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOMBOL BATAL & SIMPAN                                    */}
      {/* ======================================================== */}
      <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 p-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/master-data/jadwal-retensi"
          className="rounded-md border bg-background px-5 py-2 text-center text-sm font-medium hover:bg-muted transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Save className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors";


