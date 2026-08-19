/*
  Warnings:

  - Made the column `familyId` on table `ParentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ParentProfile" ALTER COLUMN "familyId" SET NOT NULL;
