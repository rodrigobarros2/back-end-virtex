/*
  Warnings:

  - Made the column `olt` on table `OltOutput` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OltOutput" ALTER COLUMN "olt" SET NOT NULL;
