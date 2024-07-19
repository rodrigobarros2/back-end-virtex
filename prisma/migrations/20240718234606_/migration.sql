/*
  Warnings:

  - You are about to drop the `OntInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OntInfo";

-- CreateTable
CREATE TABLE "OltOutput" (
    "id" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "ont_id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OltOutput_pkey" PRIMARY KEY ("id")
);
