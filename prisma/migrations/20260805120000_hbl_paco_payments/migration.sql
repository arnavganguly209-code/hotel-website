-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentGateway" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentDate" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "issuerApprovalCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pacoOrderNo" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_pacoOrderNo_idx" ON "Booking"("pacoOrderNo");

-- CreateTable
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'hbl_paco',
    "orderNo" TEXT NOT NULL,
    "requestMessageId" TEXT,
    "invoiceNo" TEXT,
    "approvalCode" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "paymentPageUrl" TEXT,
    "rawRequest" JSONB,
    "rawResponse" JSONB,
    "rawCallback" JSONB,
    "rawInquiry" JSONB,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "paidAt" TIMESTAMP(3),
    "emailsSentAt" TIMESTAMP(3),
    "lastInquiryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentTransaction_orderNo_key" ON "PaymentTransaction"("orderNo");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_bookingId_idx" ON "PaymentTransaction"("bookingId");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

DO $$ BEGIN
  ALTER TABLE "PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
