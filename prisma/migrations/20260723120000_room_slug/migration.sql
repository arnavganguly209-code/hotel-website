-- Add unique slug so CMS rooms sync into relational Room table
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "slug" TEXT;

UPDATE "Room"
SET "slug" = 'room-' || "id"::text
WHERE "slug" IS NULL OR "slug" = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Room_slug_key'
  ) THEN
    ALTER TABLE "Room" ADD CONSTRAINT "Room_slug_key" UNIQUE ("slug");
  END IF;
END $$;
