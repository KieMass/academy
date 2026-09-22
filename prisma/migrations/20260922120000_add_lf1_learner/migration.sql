-- CreateEnum
CREATE TYPE "Lf1TestMode" AS ENUM ('PRACTICE', 'MOCK');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'LEARNER';

-- CreateTable
CREATE TABLE "LearnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lf1TestSession" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "mode" "Lf1TestMode" NOT NULL,
    "outcome" INTEGER,
    "questionIds" TEXT NOT NULL,
    "answers" TEXT NOT NULL DEFAULT '{}',
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER,
    "timeLimitSeconds" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Lf1TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lf1Answer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "outcome" INTEGER NOT NULL,
    "selectedIndex" INTEGER,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lf1Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "LearnerProfile"("userId");

-- CreateIndex
CREATE INDEX "Lf1TestSession_learnerId_startedAt_idx" ON "Lf1TestSession"("learnerId", "startedAt");

-- CreateIndex
CREATE INDEX "Lf1Answer_learnerId_outcome_idx" ON "Lf1Answer"("learnerId", "outcome");

-- CreateIndex
CREATE UNIQUE INDEX "Lf1Answer_sessionId_questionId_key" ON "Lf1Answer"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lf1TestSession" ADD CONSTRAINT "Lf1TestSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lf1Answer" ADD CONSTRAINT "Lf1Answer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Lf1TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lf1Answer" ADD CONSTRAINT "Lf1Answer_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

