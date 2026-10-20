-- CreateTable
CREATE TABLE "penyerahan_arsip" (
    "id" BIGSERIAL NOT NULL,
    "nomor_penyerahan" VARCHAR(100) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "divisi_id" BIGINT NOT NULL,
    "tanggal_penyerahan" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    "pihak_pertama_id" BIGINT,
    "pihak_pertama_nama" VARCHAR(255),
    "pihak_kedua_id" BIGINT,
    "pihak_kedua_nama" VARCHAR(255),
    "sumber_penyerahan" VARCHAR(100),
    "nomor_berita_acara" VARCHAR(100),
    "file_berita_acara" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "penyerahan_arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_penyerahan_arsip" (
    "id" BIGSERIAL NOT NULL,
    "penyerahan_id" BIGINT NOT NULL,
    "kode_klasifikasi_id" BIGINT NOT NULL,
    "nama_arsip" VARCHAR(255) NOT NULL,
    "jenis_arsip_id" BIGINT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "satuan" VARCHAR(50) DEFAULT 'Berkas',
    "penulis_pengirim" VARCHAR(255),
    "kurun_waktu" VARCHAR(100),
    "tanggal_arsip" DATE,
    "tingkat_keaslian" VARCHAR(50) DEFAULT 'Asli',
    "lokasi_penyimpanan_id" BIGINT,
    "file_arsip" TEXT,
    "keterangan" TEXT,
    "arsip_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "detail_penyerahan_arsip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "penyerahan_arsip_nomor_penyerahan_key" ON "penyerahan_arsip"("nomor_penyerahan");

-- CreateIndex
CREATE INDEX "penyerahan_arsip_user_id_idx" ON "penyerahan_arsip"("user_id");

-- CreateIndex
CREATE INDEX "penyerahan_arsip_divisi_id_idx" ON "penyerahan_arsip"("divisi_id");

-- CreateIndex
CREATE INDEX "penyerahan_arsip_status_idx" ON "penyerahan_arsip"("status");

-- CreateIndex
CREATE INDEX "detail_penyerahan_arsip_penyerahan_id_idx" ON "detail_penyerahan_arsip"("penyerahan_id");

-- CreateIndex
CREATE INDEX "detail_penyerahan_arsip_kode_klasifikasi_id_idx" ON "detail_penyerahan_arsip"("kode_klasifikasi_id");

-- CreateIndex
CREATE INDEX "detail_penyerahan_arsip_arsip_id_idx" ON "detail_penyerahan_arsip"("arsip_id");

-- AddForeignKey
ALTER TABLE "penyerahan_arsip" ADD CONSTRAINT "penyerahan_arsip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penyerahan_arsip" ADD CONSTRAINT "penyerahan_arsip_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penyerahan_arsip" ADD CONSTRAINT "penyerahan_arsip_pihak_pertama_id_fkey" FOREIGN KEY ("pihak_pertama_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penyerahan_arsip" ADD CONSTRAINT "penyerahan_arsip_pihak_kedua_id_fkey" FOREIGN KEY ("pihak_kedua_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detail_penyerahan_arsip" ADD CONSTRAINT "detail_penyerahan_arsip_penyerahan_id_fkey" FOREIGN KEY ("penyerahan_id") REFERENCES "penyerahan_arsip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penyerahan_arsip" ADD CONSTRAINT "detail_penyerahan_arsip_kode_klasifikasi_id_fkey" FOREIGN KEY ("kode_klasifikasi_id") REFERENCES "kode_klasifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penyerahan_arsip" ADD CONSTRAINT "detail_penyerahan_arsip_jenis_arsip_id_fkey" FOREIGN KEY ("jenis_arsip_id") REFERENCES "jenis_arsip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penyerahan_arsip" ADD CONSTRAINT "detail_penyerahan_arsip_lokasi_penyimpanan_id_fkey" FOREIGN KEY ("lokasi_penyimpanan_id") REFERENCES "lokasi_penyimpanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penyerahan_arsip" ADD CONSTRAINT "detail_penyerahan_arsip_arsip_id_fkey" FOREIGN KEY ("arsip_id") REFERENCES "arsip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
