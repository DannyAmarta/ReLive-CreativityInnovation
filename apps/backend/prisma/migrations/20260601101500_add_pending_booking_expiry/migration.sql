ALTER TABLE "Booking"
ADD COLUMN "pendingExpiresAt" TIMESTAMP(3);

UPDATE "Booking"
SET "pendingExpiresAt" = "createdAt" + interval '15 minutes'
WHERE "status" = 'PENDING'
  AND "pendingExpiresAt" IS NULL;

CREATE INDEX "Booking_status_pendingExpiresAt_idx" ON "Booking"("status", "pendingExpiresAt");
