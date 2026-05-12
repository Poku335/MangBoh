-- AlterTable: make userId nullable and add guest fields to Comment
ALTER TABLE "Comment" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Comment" ADD COLUMN "guestName"  TEXT;
ALTER TABLE "Comment" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "Comment" ADD COLUMN "isGuest"    BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Comment_mangaId_createdAt_idx" ON "Comment"("mangaId", "createdAt");
