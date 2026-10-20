"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  createPenyerahanArsip,
  updatePenyerahanArsip,
  deletePenyerahanArsip,
} from "@/actions/penyerahan-arsip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DocumentPreviewButton } from "@/components/penyerahan/document-preview-dialog";

export type KlasifikasiOption = {
  id: string;
  kode: string;
  nama: string;
};

export type LokasiOption = {
  id: string;
  kode: string;
  nama: string;
};

export type JenisArsipOption = {
  id: string;
  nama: string;
};

export type UserInfo = {
  id: string;
  nama: string;
  username: string;
  divisi_id: string | null;
  divisi: {
    id: string;
    kode: string;
    nama: string;
  } | null;
};

export type DetailItemInfo = {
  id: string;
  nama_arsip: string;
  jumlah: number;
  satuan: string;
  kode_klasifikasi: string;
  file_arsip: string | null;
  jenis_arsip?: string | null;
  penulis?: string | null;
  kurun_waktu?: string | null;
  tanggal_arsip?: string | null;
  tingkat_keaslian?: string | null;
  lokasi_penyimpanan?: string | null;
  keterangan?: string | null;
};

export type PenyerahanListItem = {
  id: string;
  tanggal_penyerahan: string;
  tanggal_arsip_raw?: string | null;
  status: string;
  user_id: string;
  user_nama: string;
  is_owner: boolean;
  can_edit: boolean;
  nomor_berita_acara?: string | null;
  file_berita_acara?: string | null;
  berita_acara_available?: boolean;
  pihak_kedua_nama?: string | null;
  pihak_kedua_divisi?: string | null;
  detail_id: string;
  kode_klasifikasi_id: string;
  kode_klasifikasi_kode: string;
  kode_klasifikasi_nama: string;
  nama_arsip: string;
  jenis_arsip_id: string | null;
  jenis_arsip_nama: string | null;
  jumlah: number;
  satuan: string;
  penulis: string | null;
  kurun_waktu: string | null;
  tingkat_keaslian: string;
  lokasi_penyimpanan_id: string | null;
  lokasi_penyimpanan_nama: string | null;
  file_arsip: string | null;
  divisi?: string | null;
  keterangan: string | null;
  extra_details_count: number;
  total_details_count?: number;
  all_details?: DetailItemInfo[];
};

export type EditData = {
  id: string;
  status: string;
  user_id: string;
  is_owner: boolean;
  can_edit: boolean;
  tanggal_penyerahan: string;
  divisi: string;
  keterangan: string;
  detail: {
    id: string;
    kode_klasifikasi_id: string;
    nama_arsip: string;
    jenis_arsip_id: string;
    jumlah: number;
    satuan: string;
    penulis: string;
    kurun_waktu: string;
    tanggal_arsip: string;
    tingkat_keaslian: string;
    lokasi_penyimpanan_id: string;
    file_arsip: string | null;
  } | null;
};

function getPenyerahanStatusLabel(status: string) {
  if (status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI") return "Menunggu pemeriksaan";
  if (status === "DIKONFIRMASI") return "Data dikonfirmasi";
  if (status === "SELESAI") return "Selesai";
  return status;
}

export function PenyerahanArsipView({
  user,
  klasifikasiOptions,
  lokasiOptions,
  jenisArsipOptions,
  initialList = [],
  editData,
}: {
  user: UserInfo;
  klasifikasiOptions: KlasifikasiOption[];
  lokasiOptions: LokasiOption[];
  jenisArsipOptions: JenisArsipOption[];
  initialList?: PenyerahanListItem[];
  editData?: EditData | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode View: 'list' (Tampilan Awal) | 'create' (Form Baru) | 'edit' (Form Edit)
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">(
    editData && editData.can_edit ? "edit" : "list"
  );

  // List Data & Filter Search State
  const [items, setItems] = useState<PenyerahanListItem[]>(initialList);
  const [selectedDetail, setSelectedDetail] = useState<PenyerahanListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setItems(initialList);
  }, [initialList]);

  // Editing Penyerahan Context
  const [editingPenyerahanId, setEditingPenyerahanId] = useState<string | null>(
    editData?.id || null
  );

  // Form State (11 fields detail arsip sesuai schema database)
  const [kodeKlasifikasiId, setKodeKlasifikasiId] = useState(
    editData?.detail?.kode_klasifikasi_id || ""
  );
  const [judulArsip, setJudulArsip] = useState(
    editData?.detail?.nama_arsip || ""
  );
  const [jenisArsipId, setJenisArsipId] = useState(
    editData?.detail?.jenis_arsip_id || ""
  );
  const [jumlah, setJumlah] = useState(
    editData?.detail ? String(editData.detail.jumlah) : "1"
  );
  const [satuan, setSatuan] = useState(
    editData?.detail?.satuan || "Berkas"
  );
  const [penulis, setPenulis] = useState(
    editData?.detail?.penulis || ""
  );
  const [kurunWaktu, setKurunWaktu] = useState(
    editData?.detail?.kurun_waktu || ""
  );
  const [tanggalArsip, setTanggalArsip] = useState(
    editData?.detail?.tanggal_arsip || new Date().toISOString().slice(0, 10)
  );
  const [tingkatKeaslian, setTingkatKeaslian] = useState(
    editData?.detail?.tingkat_keaslian || "Asli"
  );
  const [lokasiPenyimpananId, setLokasiPenyimpananId] = useState(
    editData?.detail?.lokasi_penyimpanan_id || ""
  );
  const [keterangan, setKeterangan] = useState(
    editData?.keterangan || ""
  );

  // Soft File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileArsip, setExistingFileArsip] = useState<string | null>(
    editData?.detail?.file_arsip || null
  );
  const [existingDetailId, setExistingDetailId] = useState<string | null>(
    editData?.detail?.id || null
  );
  const [hapusFileLama, setHapusFileLama] = useState(false);

  // Feedback Notifications
  const [successInfo, setSuccessInfo] = useState<{ message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<PenyerahanListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Berita Acara Generating State

  const userDivisiLabel = user.divisi
    ? `${user.divisi.kode} - ${user.divisi.nama}`
    : "Belum ditentukan";

  const handleResetForm = () => {
    setEditingPenyerahanId(null);
    setKodeKlasifikasiId("");
    setJudulArsip("");
    setJenisArsipId("");
    setJumlah("1");
    setSatuan("Berkas");
    setPenulis("");
    setKurunWaktu("");
    setTanggalArsip(new Date().toISOString().slice(0, 10));
    setTingkatKeaslian("Asli");
    setLokasiPenyimpananId("");
    setKeterangan("");
    setSelectedFile(null);
    setExistingFileArsip(null);
    setExistingDetailId(null);
    setHapusFileLama(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrorMessage(null);
  };

  const handleCancelForm = () => {
    handleResetForm();
    setViewMode("list");
  };

  const handleStartCreate = () => {
    handleResetForm();
    setViewMode("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartEdit = (item: PenyerahanListItem) => {
    handleResetForm();
    setEditingPenyerahanId(item.id);
    setKodeKlasifikasiId(item.kode_klasifikasi_id);
    setJudulArsip(item.nama_arsip);
    setJenisArsipId(item.jenis_arsip_id || "");
    setJumlah(String(item.jumlah || 1));
    setSatuan(item.satuan || "Berkas");
    setPenulis(item.penulis || "");
    setKurunWaktu(item.kurun_waktu || "");
    setTanggalArsip(item.tanggal_arsip_raw || new Date().toISOString().slice(0, 10));
    setTingkatKeaslian(item.tingkat_keaslian || "Asli");
    setLokasiPenyimpananId(item.lokasi_penyimpanan_id || "");
    setKeterangan(item.keterangan || "");
    setExistingFileArsip(item.file_arsip || null);
    setExistingDetailId(item.detail_id || null);
    setViewMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 10 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    if (!ext || !allowed.includes(ext)) {
      setErrorMessage("Tipe file tidak didukung. Gunakan format PDF, DOC, DOCX, JPG, JPEG, atau PNG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setHapusFileLama(false);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingFile = () => {
    setExistingFileArsip(null);
    setHapusFileLama(true);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user.divisi_id) {
      setErrorMessage("Divisi belum ditentukan pada akun Anda. Silakan hubungi Administrator.");
      return;
    }

    if (!kodeKlasifikasiId) {
      setErrorMessage("Silakan pilih Kode Klasifikasi terlebih dahulu.");
      return;
    }

    if (!judulArsip.trim()) {
      setErrorMessage("Judul Arsip wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("kode_klasifikasi_id", kodeKlasifikasiId);
      formData.append("nama_arsip", judulArsip.trim());
      if (jenisArsipId) formData.append("jenis_arsip_id", jenisArsipId);
      formData.append("jumlah", jumlah);
      formData.append("satuan", satuan.trim() || "Berkas");
      if (penulis.trim()) formData.append("penulis_pengirim", penulis.trim());
      if (kurunWaktu.trim()) formData.append("kurun_waktu", kurunWaktu.trim());
      if (tanggalArsip) formData.append("tanggal_arsip", tanggalArsip);
      formData.append("tingkat_keaslian", tingkatKeaslian);
      if (lokasiPenyimpananId) formData.append("lokasi_penyimpanan_id", lokasiPenyimpananId);
      if (keterangan.trim()) formData.append("keterangan", keterangan.trim());

      if (selectedFile) {
        formData.append("file_arsip", selectedFile);
      }

      if (viewMode === "edit" && editingPenyerahanId) {
        formData.append("id", editingPenyerahanId);
        if (hapusFileLama) {
          formData.append("hapus_file", "true");
        }
        const result = await updatePenyerahanArsip(formData);

        if (!result.success) {
          setErrorMessage(result.message);
          setIsSubmitting(false);
          return;
        }

        setSuccessInfo({
          message: "Perubahan penyerahan arsip berhasil disimpan.",
        });

        handleResetForm();
        setViewMode("list");
        router.refresh();
      } else {
        const result = await createPenyerahanArsip(formData);

        if (!result.success) {
          setErrorMessage(result.message);
          setIsSubmitting(false);
          return;
        }

        setSuccessInfo({
          message: "Penyerahan berhasil disimpan.",
        });

        handleResetForm();
        setViewMode("list");
        router.refresh();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan formulir."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePenyerahanArsip(itemToDelete.id);
      if (!res.success) {
        setErrorMessage(res.message);
        setIsDeleting(false);
        setItemToDelete(null);
        return;
      }

      setSuccessInfo({
        message: "Penyerahan arsip berhasil dihapus.",
      });

      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
      setIsDeleting(false);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus penyerahan arsip.");
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // Filter list data berdasarkan pencarian
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.nama_arsip.toLowerCase().includes(q) ||
      item.kode_klasifikasi_kode.toLowerCase().includes(q) ||
      item.kode_klasifikasi_nama.toLowerCase().includes(q) ||
      item.user_nama.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Notifikasi Sukses & Error */}
      {successInfo && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-xs animate-in fade-in-0 duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">{successInfo.message}</p>
              <p className="mt-0.5 text-[11px] text-emerald-700">
                Status transaksi: <strong>DIBUAT</strong>. Berkas fisik dapat diserahkan ke tim kearsipan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessInfo(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-xs animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 1: TAMPILAN AWAL DAFTAR (LIST)                  */}
      {/* ==================================================== */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Header Halaman List */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>SIMARS</span>
              <span>/</span>
              <span className="text-foreground">Penyerahan Arsip</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Penyerahan Arsip
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kelola data penyerahan arsip Anda.
                </p>
              </div>

              {/* Tombol + Penyerahan Arsip (Tepat 1 icon Plus) */}
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Penyerahan Arsip
              </button>
            </div>
          </div>

          {/* Section Tabel Daftar Penyerahan */}
          <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
            {/* Toolbar Pencarian */}
            <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari arsip atau kode klasifikasi..."
                  className="w-full rounded-lg border border-border/70 bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Pencarian
                </button>
              )}
            </div>

            {/* Tabel Penyerahan Arsip: No. | Arsip | Tanggal | Berkas Digital | Status | Aksi */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">No.</th>
                    <th className="px-4 py-3">Arsip</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Berkas Digital</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Berita Acara</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="font-medium text-xs">
                          {searchQuery
                            ? "Tidak ada data penyerahan yang sesuai dengan pencarian."
                            : "Belum ada data penyerahan arsip dari divisi Anda."}
                        </p>
                        {!searchQuery && (
                          <button
                            type="button"
                            onClick={handleStartCreate}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Buat Penyerahan Pertama
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr key={item.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          <p className="font-semibold text-foreground truncate" title={item.nama_arsip}>
                            {item.nama_arsip}
                            {item.extra_details_count > 0 && (
                              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                                (+{item.extra_details_count} berkas lainnya)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.kode_klasifikasi_kode} - {item.kode_klasifikasi_nama}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {item.tanggal_penyerahan}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.file_arsip ? (
                            <DocumentPreviewButton title={item.nama_arsip} url={`/api/penyerahan/detail/${item.detail_id}/file`} downloadUrl={`/api/penyerahan/detail/${item.detail_id}/file?mode=download`} fileName={item.file_arsip.split("/").pop() || item.nama_arsip} label="Lihat File" className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 underline underline-offset-2" />
                          ) : (
                            <span className="text-muted-foreground/60 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                            {getPenyerahanStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {item.file_berita_acara && item.berita_acara_available && item.is_owner ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <DocumentPreviewButton title="Berita Acara Penyerahan Arsip" url={`/api/penyerahan/${item.id}/berita-acara`} downloadUrl={`/api/penyerahan/${item.id}/berita-acara?mode=download`} fileName="Berita_Acara.pdf" label="Lihat Berita Acara" className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-100" />
                              <a
                                href={`/api/penyerahan/${item.id}/berita-acara?mode=download`}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100 shadow-2xs"
                                title="Download Berita Acara PDF"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/70 italic">{item.file_berita_acara ? "File Berita Acara tidak tersedia atau tidak valid" : "Berita Acara belum tersedia"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDetail(item)}
                              className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-2xs cursor-pointer"
                            >
                              <Eye className="h-3 w-3" /> Detail
                            </button>
                            {item.is_owner && item.status === "DIBUAT" && !item.file_berita_acara && <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-2xs cursor-pointer"
                                title="Edit Penyerahan"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(item)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100 shadow-2xs cursor-pointer"
                                title="Hapus Penyerahan"
                              >
                                <Trash2 className="h-3 w-3" />
                                Hapus
                              </button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: FORMULIR PENYERAHAN ARSIP (CREATE / EDIT)    */}
      {/* Saat mode ini aktif: TIDAK ADA LIST DI BAWAH FORM     */}
      {/* ==================================================== */}
      {(viewMode === "create" || viewMode === "edit") && (
        <div className="space-y-6">
          {/* Header Halaman Form */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>SIMARS</span>
              <span>/</span>
              <button
                type="button"
                onClick={handleCancelForm}
                className="hover:underline hover:text-foreground cursor-pointer"
              >
                Penyerahan Arsip
              </button>
              <span>/</span>
              <span className="text-foreground font-semibold">
                {viewMode === "edit" ? "Edit" : "Formulir"}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {viewMode === "edit" ? "Edit Penyerahan Arsip" : "Formulir Penyerahan Arsip"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lengkapi informasi arsip yang akan diserahkan ke bagian kearsipan.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card Utama */}
          <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="border-b border-border/60 bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {viewMode === "edit" ? "Informasi Penyerahan Arsip" : "Formulir Penyerahan Arsip"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lengkapi informasi arsip yang akan diserahkan ke bagian kearsipan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                title="Batal dan Kembali ke Daftar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
              {/* Form Inputs (Sesuai field actual database) */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Field 1 & 2: Kode Klasifikasi & Divisi */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      1. Kode Klasifikasi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={kodeKlasifikasiId}
                      onChange={(e) => setKodeKlasifikasiId(e.target.value)}
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="" disabled>
                        -- Pilih Kode Klasifikasi --
                      </option>
                      {klasifikasiOptions.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.kode} - {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      2. Divisi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={userDivisiLabel}
                        className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground font-medium cursor-not-allowed select-none"
                      />
                      <Building2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {!user.divisi_id && (
                      <p className="text-[11px] text-amber-600">
                        Divisi belum ditentukan pada akun Anda.
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 3 & 4: Judul Arsip & Jenis Arsip */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      3. Judul Arsip <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={judulArsip}
                      onChange={(e) => setJudulArsip(e.target.value)}
                      placeholder="Contoh: Berkas Laporan Pertanggungjawaban Semester I"
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      4. Jenis Arsip
                    </label>
                    <select
                      value={jenisArsipId}
                      onChange={(e) => setJenisArsipId(e.target.value)}
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">-- Pilih Jenis Arsip (Opsional) --</option>
                      {jenisArsipOptions.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 5 & 6: Jumlah Arsip + Satuan & Penulis / Pengirim */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      5. Jumlah Arsip & Satuan
                    </label>
                    <div className="grid grid-cols-[90px_1fr] gap-2">
                      <input
                        type="number"
                        min="1"
                        value={jumlah}
                        onChange={(e) => setJumlah(e.target.value)}
                        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <select
                        value={satuan}
                        onChange={(e) => setSatuan(e.target.value)}
                        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="Berkas">Berkas</option>
                        <option value="Lembar">Lembar</option>
                        <option value="Buku">Buku</option>
                        <option value="Dokumen">Dokumen</option>
                        <option value="Jilid">Jilid</option>
                        <option value="Box">Box</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      6. Penulis / Pengirim
                    </label>
                    <input
                      type="text"
                      value={penulis}
                      onChange={(e) => setPenulis(e.target.value)}
                      placeholder="Contoh: Bagian Keuangan / PT PLN Batam"
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Field 7, 8, 9: Kurun Waktu, Tanggal, Tingkat Keaslian */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      7. Kurun Waktu
                    </label>
                    <input
                      type="text"
                      value={kurunWaktu}
                      onChange={(e) => setKurunWaktu(e.target.value)}
                      placeholder="Contoh: 2024 - 2026"
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      8. Tanggal Arsip
                    </label>
                    <input
                      type="date"
                      value={tanggalArsip}
                      onChange={(e) => setTanggalArsip(e.target.value)}
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      9. Tingkat Keaslian
                    </label>
                    <select
                      value={tingkatKeaslian}
                      onChange={(e) => setTingkatKeaslian(e.target.value)}
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="Asli">Asli</option>
                      <option value="Salinan">Salinan</option>
                      <option value="Copy">Copy</option>
                      <option value="Tembusan">Tembusan</option>
                    </select>
                  </div>
                </div>

                {/* Field 10: Lokasi Penyimpanan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    10. Lokasi Penyimpanan
                  </label>
                  <select
                    value={lokasiPenyimpananId}
                    onChange={(e) => setLokasiPenyimpananId(e.target.value)}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Pilih Lokasi Penyimpanan (Opsional) --</option>
                    {lokasiOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.kode} - {l.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 11: Upload Soft File Arsip */}
                <div className="space-y-2 rounded-xl border border-border/80 bg-muted/10 p-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      11. Berkas Digital / Soft File
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Unggah salinan dokumen digital (PDF, Word, atau Gambar — Maksimal 10 MB).
                    </p>
                  </div>

                  {existingFileArsip && existingDetailId && !selectedFile && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs text-sky-950">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-sky-700" />
                        <span className="truncate font-medium">
                          Berkas tersimpan ({existingFileArsip.split("/").pop()})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <DocumentPreviewButton title="Berkas digital" url={`/api/penyerahan/detail/${existingDetailId}/file`} downloadUrl={`/api/penyerahan/detail/${existingDetailId}/file?mode=download`} fileName={existingFileArsip.split("/").pop() || "Berkas arsip"} label="Lihat" className="text-[11px] font-semibold text-sky-700 underline underline-offset-2" />
                        <button
                          type="button"
                          onClick={handleRemoveExistingFile}
                          className="rounded p-1 text-rose-600 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                          title="Hapus berkas ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-950">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate font-medium">{selectedFile.name}</span>
                        <span className="text-[10px] text-emerald-700">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-medium text-emerald-800 hover:underline cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSelectedFile}
                          className="rounded p-1 text-rose-600 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                          title="Batalkan pilihan berkas"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    !existingFileArsip && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/50 p-4 text-center cursor-pointer transition hover:border-primary/60 hover:bg-muted/30"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-xs font-medium text-foreground">
                          Pilih berkas dari komputer
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          PDF, DOC, DOCX, JPG, JPEG, atau PNG (Maks. 10 MB)
                        </p>
                      </div>
                    )
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Field 12: Keterangan (Opsional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    12. Keterangan
                  </label>
                  <textarea
                    rows={2}
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Tambahkan catatan atau keterangan tambahan jika diperlukan..."
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                {/* Tombol Aksi Formulir: Batal & Simpan Penyerahan */}
                <div className="flex items-center justify-end gap-2.5 border-t border-border/60 pt-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCancelForm}
                    className="rounded-lg border border-border/70 bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="h-4 w-4" />
                        {viewMode === "edit" ? "Simpan Perubahan" : "Simpan Penyerahan"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Sidebar Petunjuk: Sebelum Menyerahkan */}
              <aside className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 space-y-3.5 h-fit">
                <div className="flex items-center gap-2 text-sky-900">
                  <Info className="h-4 w-4 text-sky-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Sebelum Menyerahkan
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-sky-950/80 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-sky-600 shrink-0" />
                    <span>Pastikan informasi arsip sudah lengkap dan akurat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-sky-600 shrink-0" />
                    <span>Periksa kembali kode klasifikasi agar sesuai dengan isi dokumen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-sky-600 shrink-0" />
                    <span>Pastikan dokumen fisik dalam kondisi baik, rapi, dan mudah dibaca.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-sky-600 shrink-0" />
                    <span>Lampirkan berkas soft file digital untuk memudahkan pencatatan arsip.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-sky-600 shrink-0" />
                    <span>Setelah tersimpan (status DIBUAT), bawa berkas fisik ke tim kearsipan.</span>
                  </li>
                </ul>
              </aside>
            </div>
          </section>
        </div>
      )}

      {/* ==================================================== */}
      {/* DIALOG KONFIRMASI HAPUS PENYERAHAN                   */}
      {/* ==================================================== */}
      {itemToDelete && (
        <ConfirmationDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => {
            if (!open) setItemToDelete(null);
          }}
          title="Hapus Penyerahan Arsip?"
          description={`Penyerahan ini ("${itemToDelete.nama_arsip}") akan dihapus dari daftar penyerahan Anda. Data yang sudah dihapus tidak dapat dipulihkan.`}
          confirmLabel={isDeleting ? "Menghapus..." : "Hapus"}
          action={handleConfirmDelete}
          id={itemToDelete.id}
          variant="destructive"
        />
      )}

      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDetail(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="penyerahan-detail-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div><h2 id="penyerahan-detail-title" className="font-semibold">Detail Penyerahan Arsip</h2><p className="mt-1 text-xs text-muted-foreground">ID {selectedDetail.id} · {selectedDetail.tanggal_penyerahan}</p></div>
              <button type="button" onClick={() => setSelectedDetail(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Tutup detail"><X className="h-4 w-4" /></button>
            </header>
            <div className="space-y-5 overflow-y-auto p-5">
              <section className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 font-medium">{getPenyerahanStatusLabel(selectedDetail.status)}</p></div>
                <div><p className="text-xs text-muted-foreground">Pengirim</p><p className="mt-1 font-medium">{selectedDetail.user_nama}</p></div>
                <div><p className="text-xs text-muted-foreground">Divisi</p><p className="mt-1 font-medium">{selectedDetail.divisi || "—"}</p></div>
                {selectedDetail.status === "DIKONFIRMASI" && <div><p className="text-xs text-muted-foreground">Penerima</p><p className="mt-1 font-medium">{selectedDetail.pihak_kedua_nama || "Penerima belum tercatat"}{selectedDetail.pihak_kedua_divisi ? ` · ${selectedDetail.pihak_kedua_divisi}` : ""}</p></div>}
                {selectedDetail.keterangan && <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Keterangan penyerahan</p><p className="mt-1 whitespace-pre-wrap">{selectedDetail.keterangan}</p></div>}
              </section>
              <section className="space-y-3">
                <h3 className="font-semibold">Detail arsip ({selectedDetail.total_details_count ?? 1})</h3>
                {(selectedDetail.all_details?.length ? selectedDetail.all_details : [{ id: selectedDetail.detail_id, nama_arsip: selectedDetail.nama_arsip, jumlah: selectedDetail.jumlah, satuan: selectedDetail.satuan, kode_klasifikasi: `${selectedDetail.kode_klasifikasi_kode} — ${selectedDetail.kode_klasifikasi_nama}`, file_arsip: selectedDetail.file_arsip }]).map((detail) => (
                  <article key={detail.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs text-muted-foreground">{detail.kode_klasifikasi}</p><h4 className="mt-1 font-medium">{detail.nama_arsip}</h4></div><p className="text-sm">{detail.jumlah} {detail.satuan}</p></div>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">Jenis arsip</dt><dd>{detail.jenis_arsip || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Penulis / pengirim</dt><dd>{detail.penulis || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Kurun waktu</dt><dd>{detail.kurun_waktu || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Tanggal arsip</dt><dd>{detail.tanggal_arsip || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Tingkat keaslian</dt><dd>{detail.tingkat_keaslian || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Lokasi penyimpanan</dt><dd>{detail.lokasi_penyimpanan || "—"}</dd></div>
                      {detail.keterangan && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Keterangan</dt><dd className="whitespace-pre-wrap">{detail.keterangan}</dd></div>}
                    </dl>
                    {detail.file_arsip && <DocumentPreviewButton title={detail.nama_arsip} url={`/api/penyerahan/detail/${detail.id}/file`} downloadUrl={`/api/penyerahan/detail/${detail.id}/file?mode=download`} fileName={detail.file_arsip.split("/").pop() || detail.nama_arsip} label="Lihat lampiran digital" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" />}
                  </article>
                ))}
              </section>
            </div>
            <footer className="flex justify-end border-t border-border/60 bg-muted/20 px-5 py-3"><button type="button" onClick={() => setSelectedDetail(null)} className="rounded-lg border border-border/70 bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted">Tutup</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
