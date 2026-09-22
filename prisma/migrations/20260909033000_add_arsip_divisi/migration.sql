-- AlterTable
ALTER TABLE "arsip" ADD COLUMN "divisi_id" BIGINT;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "fk_arsip_divisi" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
