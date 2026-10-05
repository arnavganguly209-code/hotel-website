-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "ogImageUrl" TEXT NOT NULL DEFAULT '',
    "internalReference" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'CREATED',
    "pacoOrderNo" TEXT,
    "gatewayTxnId" TEXT,
    "gatewayReference" TEXT,
    "paidAmount" DOUBLE PRECISION,
    "paidCurrency" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "successEmailSentAt" TIMESTAMP(3),
    "failureEmailSentAt" TIMESTAMP(3),
    "lastError" TEXT NOT NULL DEFAULT '',
    "rawInquiry" JSONB,
    "rawCallback" JSONB,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLinkAttempt" (
    "id" TEXT NOT NULL,
    "paymentLinkId" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "paymentPageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLinkAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_publicToken_key" ON "PaymentLink"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_pacoOrderNo_key" ON "PaymentLink"("pacoOrderNo");

-- CreateIndex
CREATE INDEX "PaymentLink_paymentStatus_idx" ON "PaymentLink"("paymentStatus");

-- CreateIndex
CREATE INDEX "PaymentLink_createdAt_idx" ON "PaymentLink"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLinkAttempt_orderNo_key" ON "PaymentLinkAttempt"("orderNo");

-- CreateIndex
CREATE INDEX "PaymentLinkAttempt_paymentLinkId_idx" ON "PaymentLinkAttempt"("paymentLinkId");

-- AddForeignKey
ALTER TABLE "PaymentLinkAttempt" ADD CONSTRAINT "PaymentLinkAttempt_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
