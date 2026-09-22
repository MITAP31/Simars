-- RenameColumn
ALTER TABLE "arsip" RENAME COLUMN "lokasi_id" TO "lokasi_penyimpanan_id";

-- RenameForeignKey
ALTER TABLE "arsip" RENAME CONSTRAINT "fk_arsip_lokasi" TO "fk_arsip_lokasi_penyimpanan";

-- CreateIndex
CREATE UNIQUE INDEX "lokasi_penyimpanan_kode_key" ON "lokasi_penyimpanan"("kode");
