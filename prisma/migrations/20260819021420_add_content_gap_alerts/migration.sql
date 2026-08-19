-- CreateEnum
CREATE TYPE "ContentGapStatus" AS ENUM ('PENDING', 'DISMISSED');

-- CreateTable
CREATE TABLE "ContentGapAlert" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "ContentGapStatus" NOT NULL DEFAULT 'PENDING',
    "questionCount" INTEGER NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "ContentGapAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentGapAlert_topicId_createdAt_idx" ON "ContentGapAlert"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentGapAlert_status_idx" ON "ContentGapAlert"("status");

-- AddForeignKey
ALTER TABLE "ContentGapAlert" ADD CONSTRAINT "ContentGapAlert_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
