"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  generateBeritaAcara,
  konfirmasiPenyerahanArsip,
  setPihakKeduaPenyerahanArsip,
} from "@/actions/penyerahan-arsip";

type RecipientOption = {
  id: string;
  nama: string;
  divisi: string;
};

export function AdminPenyerahanActions({
  id,
  status,
  currentRecipientId,
  adminRecipientId,
  senderId,
  currentRecipientName,
  currentRecipientDivision,
  recipients,
  hasBeritaAcara,
}: {
  id: string;
  status: string;
  currentRecipientId: string | null;
  adminRecipientId: string;
  senderId: string;
  currentRecipientName: string | null;
  currentRecipientDivision: string | null;
  recipients: RecipientOption[];
  hasBeritaAcara: boolean;
}) {
  const router = useRouter();
  const [recipientId, setRecipientId] = useState(currentRecipientId ?? "");
  const [recipientSource, setRecipientSource] = useState<"self" | "other" | "">("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const runAction = async (
    action: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(true);
    setMessage("");
    try {
      const result = await action();
      setMessage(result.message);
      setIsError(!result.success);
      if (result.success) router.refresh();
    } catch {
      setMessage("Permintaan gagal diproses. Muat ulang halaman dan coba kembali.");
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  const canConfirm = status === "DIBUAT" || status === "MENUNGGU_VERIFIKASI";
  const isConfirmed = status === "DIKONFIRMASI";
  const recipientIsSaved = Boolean(recipientId && recipientId === currentRecipientId);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="font-semibold">Tindakan pemeriksaan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Konfirmasi hanya menandai data telah diperiksa. Status ini tidak mencatat serah-terima fisik.
      </p>

      {canConfirm && (
        <button
          type="button"
          disabled={busy}
          onClick={() => runAction(() => konfirmasiPenyerahanArsip(id))}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Konfirmasi Data
        </button>
      )}

      {isConfirmed && <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-sm">Status saat ini: <strong>Data dikonfirmasi</strong>. Artinya data sudah diperiksa Admin; status ini tidak menyatakan serah-terima fisik selesai.</p>}

      {isConfirmed && !hasBeritaAcara && (
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Identitas Pihak Kedua / penerima</p>
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input type="radio" name="recipient-source" checked={recipientSource === "self"} onChange={() => { setRecipientSource("self"); setRecipientId(adminRecipientId); }} disabled={busy} />
              <span>Gunakan akun Admin yang sedang login <span className="block text-muted-foreground">{recipients.find((recipient) => recipient.id === adminRecipientId)?.nama ?? "Nama tidak tersedia"} — {recipients.find((recipient) => recipient.id === adminRecipientId)?.divisi ?? "Divisi tidak tersedia"}</span></span>
            </label>
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input type="radio" name="recipient-source" checked={recipientSource === "other"} onChange={() => { setRecipientSource("other"); setRecipientId(""); }} disabled={busy} />
              <span>Pilih akun penerima lain</span>
            </label>
          </div>
          {recipientSource === "other" && <select
            id="pihak-kedua"
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            disabled={busy}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Pilih penerima aktif yang memiliki Divisi</option>
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.nama} — {recipient.divisi}
              </option>
            ))}
          </select>}
          {recipientId === senderId && <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">Akun penerima sama dengan akun pengirim. Pastikan ini sesuai ketentuan serah-terima sebelum menyimpan.</p>}
          {currentRecipientId && <p className="text-xs text-muted-foreground">Penerima tersimpan: {currentRecipientName || "Nama belum tercatat"}{currentRecipientDivision ? ` — ${currentRecipientDivision}` : ""}. Penerima dapat diperbarui sebelum BA diterbitkan.</p>}
          <button
            type="button"
            disabled={busy || !recipientId || !recipientSource}
            onClick={() => runAction(() => setPihakKeduaPenyerahanArsip(id, recipientId))}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Simpan Penerima
          </button>
          <p className="text-xs text-muted-foreground">
            Pastikan akun yang dipilih adalah petugas yang benar-benar menerima arsip. Pilihan tidak ditentukan otomatis.
          </p>
          <button
            type="button"
          disabled={busy || !recipientIsSaved}
            onClick={() => runAction(() => generateBeritaAcara(id))}
            className="ml-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50"
          >
            Generate Berita Acara
          </button>
        </div>
      )}

      {isConfirmed && hasBeritaAcara && (
        <p className="mt-4 text-sm text-muted-foreground">
          Berita Acara sudah tercatat. Dokumen tersebut digunakan kembali dan identitas penerima dikunci.
        </p>
      )}

      {message && (
        <p className={`mt-3 text-sm ${isError ? "text-destructive" : "text-emerald-700"}`} role="status">
          {message}
        </p>
      )}
    </section>
  );
}
