-- CreateTable
CREATE TABLE "TimesTableSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tables" TEXT NOT NULL,
    "roundSeconds" INTEGER NOT NULL,
    "endedEarly" BOOLEAN NOT NULL DEFAULT false,
    "questionsAnswered" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "avgCorrectSpeedMs" INTEGER,
    "tableStats" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimesTableSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimesTableSession_studentId_createdAt_idx" ON "TimesTableSession"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "TimesTableSession" ADD CONSTRAINT "TimesTableSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

