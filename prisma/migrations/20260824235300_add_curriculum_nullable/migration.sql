
-- DropIndex
DROP INDEX "Topic_subjectId_strandSlug_yearGroup_key";

-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "curriculumId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "curriculumId" TEXT;

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearGroupLabel" TEXT NOT NULL DEFAULT 'Year',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_slug_key" ON "Curriculum"("slug");

-- CreateIndex
CREATE INDEX "Family_curriculumId_idx" ON "Family"("curriculumId");

-- CreateIndex
CREATE INDEX "Topic_curriculumId_idx" ON "Topic"("curriculumId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_strandSlug_yearGroup_curriculumId_key" ON "Topic"("subjectId", "strandSlug", "yearGroup", "curriculumId");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

