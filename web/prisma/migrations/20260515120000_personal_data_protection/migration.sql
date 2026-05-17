-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "personalDataConsentAt" DATETIME;

-- CreateTable
CREATE TABLE "DocumentGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "contextJson" TEXT NOT NULL,
    "piiEncrypted" TEXT NOT NULL,
    "aiOutput" TEXT NOT NULL,
    "finalOutput" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "piiSentToAi" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
