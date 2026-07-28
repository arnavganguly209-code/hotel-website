-- Contact enquiry inbox fields + migrate legacy statuses
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "starred" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "replied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "sourcePage" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ContactEnquiry" ADD COLUMN IF NOT EXISTS "userAgent" TEXT NOT NULL DEFAULT '';

-- Normalize legacy workflow statuses into inbox folders
UPDATE "ContactEnquiry"
SET "status" = 'inbox',
    "isRead" = CASE WHEN "status" IN ('contacted', 'completed') THEN true ELSE false END
WHERE "status" IN ('new', 'pending', 'contacted', 'completed');

UPDATE "ContactEnquiry"
SET "status" = 'archived'
WHERE "status" = 'archived';

ALTER TABLE "ContactEnquiry" ALTER COLUMN "status" SET DEFAULT 'inbox';

CREATE INDEX IF NOT EXISTS "ContactEnquiry_status_createdAt_idx" ON "ContactEnquiry"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactEnquiry_isRead_createdAt_idx" ON "ContactEnquiry"("isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactEnquiry_starred_idx" ON "ContactEnquiry"("starred");
CREATE INDEX IF NOT EXISTS "ContactEnquiry_email_idx" ON "ContactEnquiry"("email");
