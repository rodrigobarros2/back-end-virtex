-- CreateTable
CREATE TABLE "OntInfo" (
    "id" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "ont_id" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OntInfo_pkey" PRIMARY KEY ("id")
);
