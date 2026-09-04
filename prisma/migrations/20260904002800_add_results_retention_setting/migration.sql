-- CreateEnum
CREATE TYPE "RetentionMode" AS ENUM ('ASSIGNMENT_COUNT', 'DAYS');

-- CreateTable
CREATE TABLE "ResultsRetentionSetting" (
    "id" TEXT NOT NULL,
    "mode" "RetentionMode" NOT NULL DEFAULT 'ASSIGNMENT_COUNT',
    "value" INTEGER NOT NULL DEFAULT 20,
    "lastPurgedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultsRetentionSetting_pkey" PRIMARY KEY ("id")
);
