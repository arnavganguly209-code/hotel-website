-- Payment Link card-fee fields + Decimal money (isolated tables only).

ALTER TABLE "PaymentLink" ALTER COLUMN "amountUsd" TYPE DECIMAL(12,2);
ALTER TABLE "PaymentLink" ALTER COLUMN "paidAmount" TYPE DECIMAL(12,2);

ALTER TABLE "PaymentLink" ADD COLUMN "cardFeeEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PaymentLink" ADD COLUMN "cardFeeType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PaymentLink" ADD COLUMN "cardFeeValue" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "PaymentLink" ADD COLUMN "cardFeeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "PaymentLink" ADD COLUMN "subtotalAmountUsd" DECIMAL(12,2);
ALTER TABLE "PaymentLink" ADD COLUMN "totalAmountUsd" DECIMAL(12,2);

UPDATE "PaymentLink"
SET
  "subtotalAmountUsd" = COALESCE("subtotalAmountUsd", "amountUsd"),
  "totalAmountUsd" = COALESCE("totalAmountUsd", "amountUsd");

ALTER TABLE "PaymentLink" ALTER COLUMN "subtotalAmountUsd" SET NOT NULL;
ALTER TABLE "PaymentLink" ALTER COLUMN "totalAmountUsd" SET NOT NULL;

ALTER TABLE "PaymentLinkAttempt" ALTER COLUMN "amount" TYPE DECIMAL(12,2);

CREATE INDEX "PaymentLinkAttempt_paymentLinkId_status_idx" ON "PaymentLinkAttempt"("paymentLinkId", "status");

CREATE UNIQUE INDEX "PaymentLinkAttempt_one_active_per_link"
ON "PaymentLinkAttempt"("paymentLinkId")
WHERE "status" IN ('initiated', 'redirected');
