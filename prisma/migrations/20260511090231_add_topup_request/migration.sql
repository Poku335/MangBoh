-- CreateTable
CREATE TABLE "TopupRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "slipPath" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,

    CONSTRAINT "TopupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopupRequest_userId_idx" ON "TopupRequest"("userId");

-- CreateIndex
CREATE INDEX "TopupRequest_status_idx" ON "TopupRequest"("status");

-- AddForeignKey
ALTER TABLE "TopupRequest" ADD CONSTRAINT "TopupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
