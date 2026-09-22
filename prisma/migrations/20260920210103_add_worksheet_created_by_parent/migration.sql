-- AlterTable
ALTER TABLE "Worksheet" ADD COLUMN     "createdByParentId" TEXT;

-- CreateIndex
CREATE INDEX "Worksheet_createdByParentId_idx" ON "Worksheet"("createdByParentId");

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_createdByParentId_fkey" FOREIGN KEY ("createdByParentId") REFERENCES "ParentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

