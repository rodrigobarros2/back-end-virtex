/*
  Warnings:

  - The primary key for the `OltOutput` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `state` on the `OltOutput` table. All the data in the column will be lost.
  - The `id` column on the `OltOutput` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `olt` to the `OltOutput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `OltOutput` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OltOutput" DROP CONSTRAINT "OltOutput_pkey",
DROP COLUMN "state",
ADD COLUMN     "olt" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "OltOutput_pkey" PRIMARY KEY ("id");
