-- Add deliveredAt to EmailLog for SMTP acceptance tracking
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
