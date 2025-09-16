/*
  Warnings:

  - Added the required column `description` to the `AssessmentTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AssessmentTemplate" ADD COLUMN     "description" TEXT NOT NULL;
