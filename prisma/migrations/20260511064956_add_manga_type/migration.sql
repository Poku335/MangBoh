-- CreateEnum
CREATE TYPE "MangaType" AS ENUM ('MANGA', 'MANHWA', 'MANHUA');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN     "type" "MangaType" NOT NULL DEFAULT 'MANHWA';

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
