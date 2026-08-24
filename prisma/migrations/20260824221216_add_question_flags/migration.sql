-- CreateEnum
CREATE TYPE "QuestionFlagStatus" AS ENUM ('PENDING_PARENT_REVIEW', 'PENDING_ADMIN_REVIEW', 'DISMISSED_BY_PARENT', 'DISMISSED_BY_ADMIN', 'REMOVED');

-- CreateTable
CREATE TABLE "QuestionFlag" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "studentAnswer" TEXT,
    "status" "QuestionFlagStatus" NOT NULL DEFAULT 'PENDING_PARENT_REVIEW',
    "reviewedByParentId" TEXT,
    "parentNotes" TEXT,
    "parentReviewedAt" TIMESTAMP(3),
    "reviewedByAdminId" TEXT,
    "adminNotes" TEXT,
    "adminReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionFlag_questionId_idx" ON "QuestionFlag"("questionId");

-- CreateIndex
CREATE INDEX "QuestionFlag_studentId_idx" ON "QuestionFlag"("studentId");

-- CreateIndex
CREATE INDEX "QuestionFlag_status_idx" ON "QuestionFlag"("status");

-- AddForeignKey
ALTER TABLE "QuestionFlag" ADD CONSTRAINT "QuestionFlag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ContentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionFlag" ADD CONSTRAINT "QuestionFlag_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
