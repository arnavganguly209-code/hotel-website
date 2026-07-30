-- VAT-inclusive booking accounting fields (website prices already include VAT)
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "displayPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.13;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';

-- Backfill from legacy totalAmount (treat as VAT-inclusive grand total)
UPDATE "Booking"
SET
  "displayPrice" = "totalAmount"::double precision,
  "grandTotal" = "totalAmount"::double precision,
  "basePrice" = ROUND(("totalAmount"::double precision / 1.13)::numeric, 2),
  "vatAmount" = ROUND(("totalAmount"::double precision - ("totalAmount"::double precision / 1.13))::numeric, 2),
  "vatRate" = 0.13,
  "currency" = COALESCE(NULLIF("currency", ''), 'USD')
WHERE "grandTotal" = 0 AND "totalAmount" > 0;
