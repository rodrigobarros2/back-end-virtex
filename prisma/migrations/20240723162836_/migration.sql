/*
  Warnings:

  - You are about to drop the column `olt` on the `OltOutput` table. All the data in the column will be lost.
  - Added the required column `olt_type` to the `OltOutput` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OltOutput" DROP COLUMN "olt",
ADD COLUMN     "olt_type" TEXT NOT NULL;
