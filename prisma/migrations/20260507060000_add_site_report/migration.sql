-- CreateTable
CREATE TABLE "SiteReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL DEFAULT 'AI Agent System',
    "summary" JSONB NOT NULL,
    "frontendIssues" JSONB NOT NULL,
    "backendIssues" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "SiteReport_pkey" PRIMARY KEY ("id")
);
