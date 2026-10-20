export type RetentionUnit = "Tahun" | "Bulan" | "Hari" | string;

export interface JadwalRetensiInput {
  retensi_aktif: number;
  satuan_retensi_aktif: RetentionUnit;
  dasar_perhitungan?: string | null;
  keterangan_dasar?: string | null;
  retensi_inaktif: number;
  satuan_retensi_inaktif: RetentionUnit;
  keterangan_akhir: string;
  keterangan_khusus?: string | null;
  aktif?: boolean | null;
}

export type StatusRetensi = "AKTIF" | "INAKTIF" | "SELESAI";

export interface RetentionCalculationResult {
  tanggal_dasar_retensi: Date | null;
  tanggal_mulai_aktif: Date | null;
  tanggal_selesai_aktif: Date | null;
  tanggal_selesai_inaktif: Date | null;
  status_retensi: StatusRetensi;
  keterangan_akhir: string;
  label_status: string;
  is_completed: boolean;
}

/**
 * Menambahkan durasi ke tanggal kalender secara aman tanpa estimasi 365 hari.
 * Menangani leap year (kabisat) dan perbedaan jumlah hari dalam bulan.
 */
export function addRetentionDuration(
  startDate: Date,
  amount: number,
  unit: RetentionUnit
): Date {
  const result = new Date(startDate.getTime());
  const normalizedUnit = (unit || "Tahun").trim().toLowerCase();

  if (amount <= 0) {
    return result;
  }

  if (normalizedUnit === "hari") {
    result.setUTCDate(result.getUTCDate() + amount);
    return result;
  }

  if (normalizedUnit === "bulan") {
    const targetMonth = result.getUTCMonth() + amount;
    const originalDay = result.getUTCDate();

    result.setUTCMonth(targetMonth);

    // Jika terjadi overflow hari (misal 31 Jan + 1 bulan = Maret), mundurkan ke hari terakhir bulan target
    if (result.getUTCDate() !== originalDay) {
      result.setUTCDate(0);
    }
    return result;
  }

  // Default atau "tahun"
  const targetYear = result.getUTCFullYear() + amount;
  const originalDay = result.getUTCDate();
  const originalMonth = result.getUTCMonth();

  result.setUTCFullYear(targetYear);

  // Penanganan kabisat (29 Februari ke tahun non-kabisat)
  if (result.getUTCMonth() !== originalMonth) {
    result.setUTCDate(0);
  } else if (result.getUTCDate() !== originalDay) {
    result.setUTCDate(0);
  }

  return result;
}

/**
 * Helper untuk normalisasi tanggal ke batas awal hari UTC (00:00:00.000Z)
 * agar perbandingan tanggal adil tanpa terpengaruh jam/menit.
 */
export function normalizeDateToUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
}

/**
 * Engine perhitungan retensi arsip.
 * Mengembalikan tanggal dasar, tanggal mulai/selesai aktif, tanggal selesai inaktif,
 * serta status retensi (AKTIF | INAKTIF | SELESAI) berdasarkan tanggal evaluasi.
 */
export function calculateRetention({
  tanggalArsip,
  tanggalDasarKhusus,
  jadwalRetensi,
  currentDate = new Date(),
}: {
  tanggalArsip: Date | null | undefined;
  tanggalDasarKhusus?: Date | null | undefined;
  jadwalRetensi: JadwalRetensiInput | null | undefined;
  currentDate?: Date;
}): RetentionCalculationResult | null {
  if (!jadwalRetensi) {
    return null;
  }

  // 1. Tentukan tanggal dasar retensi:
  // - Prioritaskan tanggalDasarKhusus jika diberikan oleh admin/sistem
  // - Jika tidak ada: fallback ke tanggalArsip
  const baseDate = tanggalDasarKhusus
    ? normalizeDateToUTC(tanggalDasarKhusus)
    : tanggalArsip
    ? normalizeDateToUTC(tanggalArsip)
    : null;

  if (!baseDate) {
    return null;
  }

  // 2. Tanggal mulai masa aktif
  const tanggalMulaiAktif = new Date(baseDate.getTime());

  // 3. Tanggal selesai masa aktif
  const tanggalSelesaiAktif = addRetentionDuration(
    tanggalMulaiAktif,
    jadwalRetensi.retensi_aktif,
    jadwalRetensi.satuan_retensi_aktif
  );

  // 4. Tanggal selesai masa inaktif (dihitung setelah selesai aktif)
  const tanggalSelesaiInaktif = addRetentionDuration(
    tanggalSelesaiAktif,
    jadwalRetensi.retensi_inaktif,
    jadwalRetensi.satuan_retensi_inaktif
  );

  // 5. Tentukan status retensi saat ini (hanya AKTIF | INAKTIF | SELESAI)
  const evalDate = normalizeDateToUTC(currentDate);

  let statusRetensi: StatusRetensi = "AKTIF";
  let labelStatus = "Retensi Aktif";
  let isCompleted = false;

  if (evalDate.getTime() <= tanggalSelesaiAktif.getTime()) {
    statusRetensi = "AKTIF";
    labelStatus = "Retensi Aktif";
  } else if (evalDate.getTime() <= tanggalSelesaiInaktif.getTime()) {
    statusRetensi = "INAKTIF";
    labelStatus = "Retensi Inaktif";
  } else {
    // Masa aktif dan masa inaktif telah berakhir
    statusRetensi = "SELESAI";
    labelStatus = "Selesai Retensi";
    isCompleted = true;
  }

  return {
    tanggal_dasar_retensi: baseDate,
    tanggal_mulai_aktif: tanggalMulaiAktif,
    tanggal_selesai_aktif: tanggalSelesaiAktif,
    tanggal_selesai_inaktif: tanggalSelesaiInaktif,
    status_retensi: statusRetensi,
    keterangan_akhir: jadwalRetensi.keterangan_akhir,
    label_status: labelStatus,
    is_completed: isCompleted,
  };
}

/**
 * Memeriksa apakah arsip memerlukan peninjauan oleh admin:
 * Yaitu ketika status_retensi = SELESAI, hasil akhir = MUSNAH_DENGAN_KETERANGAN_KHUSUS,
 * dan belum pernah diambil keputusan SIMPAN / MUSNAH oleh admin.
 */
export function needsArchiveRetentionReview(
  retention: RetentionCalculationResult | null | undefined,
  keputusanRetensi?: string | null | undefined,
  statusRetensi?: string | null | undefined
): boolean {
  if (!retention) return false;
  const isSelesai = retention.status_retensi === "SELESAI" || (retention.status_retensi as string) === "SELESAI_RETENSI";
  if (!isSelesai) return false;

  if (retention.keterangan_akhir !== "MUSNAH_DENGAN_KETERANGAN_KHUSUS") {
    return false;
  }

  // Jika sudah ada keputusan eksplisit SIMPAN atau MUSNAH
  if (keputusanRetensi === "SIMPAN" || keputusanRetensi === "MUSNAH") {
    return false;
  }

  // Dukungan backward-compatibility jika ada data legacy
  if (statusRetensi === "SELESAI_RETENSI_PERMANEN" || statusRetensi === "SELESAI_RETENSI_DIMUSNAHKAN") {
    return false;
  }

  return true;
}

/**
 * Memeriksa apakah arsip masuk ke area "Arsip Akhir Retensi":
 * 1. Jika status_arsip = "akhir_retensi", ATAU
 * 2. Jika status_retensi = SELESAI dan:
 *    - keterangan_akhir = "MUSNAH", ATAU
 *    - keterangan_akhir = "MUSNAH_DENGAN_KETERANGAN_KHUSUS" dengan keputusanRetensi = "MUSNAH"
 * (Kecuali jika arsip berstatus dihapus / status_arsip = "dihapus")
 */
export function isArchivedRetentionEnd(
  retention: RetentionCalculationResult | null | undefined,
  keputusanRetensi?: string | null | undefined,
  statusArsip?: string | null | undefined
): boolean {
  if (statusArsip === "dihapus") {
    return false;
  }
  if (statusArsip === "akhir_retensi") {
    return true;
  }
  if (!retention) {
    return false;
  }

  const isSelesai = retention.status_retensi === "SELESAI" || (retention.status_retensi as string) === "SELESAI_RETENSI";
  if (!isSelesai) {
    return false;
  }

  if (retention.keterangan_akhir === "MUSNAH") {
    return true;
  }

  if (retention.keterangan_akhir === "MUSNAH_DENGAN_KETERANGAN_KHUSUS" && keputusanRetensi === "MUSNAH") {
    return true;
  }

  return false;
}

export type RetentionNotificationItem = {
  id: string;
  nomor_arsip: string;
  nama_arsip: string;
  kode_klasifikasi: string;
  keterangan_akhir: string;
  tanggal_selesai_inaktif: Date | null;
  needs_action: boolean;
};
