/*
  Warnings:

  - You are about to drop the column `status` on the `OltOutput` table. All the data in the column will be lost.
  - Added the required column `state` to the `OltOutput` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OltOutput" DROP COLUMN "status",
ADD COLUMN     "state" TEXT NOT NULL;
