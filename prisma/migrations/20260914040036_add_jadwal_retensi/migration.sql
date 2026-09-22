-- AlterTable
ALTER TABLE "arsip" ADD COLUMN     "status_retensi" VARCHAR(50),
ADD COLUMN     "tanggal_dasar_retensi" DATE,
ADD COLUMN     "tanggal_mulai_aktif" DATE,
ADD COLUMN     "tanggal_selesai_aktif" DATE,
ADD COLUMN     "tanggal_selesai_inaktif" DATE;

-- CreateTable
CREATE TABLE "jadwal_retensi" (
    "id" BIGSERIAL NOT NULL,
    "kode_klasifikasi_id" BIGINT NOT NULL,
    "retensi_aktif" INTEGER NOT NULL DEFAULT 0,
    "satuan_retensi_aktif" VARCHAR(50) NOT NULL DEFAULT 'Tahun',
    "dasar_perhitungan" VARCHAR(50) NOT NULL DEFAULT 'LANGSUNG',
    "keterangan_dasar" TEXT,
    "retensi_inaktif" INTEGER NOT NULL DEFAULT 0,
    "satuan_retensi_inaktif" VARCHAR(50) NOT NULL DEFAULT 'Tahun',
    "keterangan_akhir" VARCHAR(50) NOT NULL DEFAULT 'PERMANEN',
    "keterangan_khusus" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "jadwal_retensi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jadwal_retensi_kode_klasifikasi_id_key" ON "jadwal_retensi"("kode_klasifikasi_id");

-- AddForeignKey
ALTER TABLE "jadwal_retensi" ADD CONSTRAINT "jadwal_retensi_kode_klasifikasi_id_fkey" FOREIGN KEY ("kode_klasifikasi_id") REFERENCES "kode_klasifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokasi_penyimpanan" ADD CONSTRAINT "lokasi_penyimpanan_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lokasi_penyimpanan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
