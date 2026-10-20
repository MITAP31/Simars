-- AlterTable
ALTER TABLE "user" ADD COLUMN     "divisi_id" BIGINT;

-- CreateIndex
CREATE INDEX "idx_user_divisi_id" ON "user"("divisi_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "fk_user_divisi" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
