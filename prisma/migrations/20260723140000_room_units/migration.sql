-- AlterTable: Booking.roomNumber + breakfast default
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "roomNumber" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Booking" ALTER COLUMN "breakfast" SET DEFAULT 'with-breakfast';

-- CreateTable
CREATE TABLE IF NOT EXISTS "RoomUnit" (
    "id" TEXT NOT NULL,
    "roomSlug" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoomUnit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RoomUnit_roomSlug_roomNumber_key" ON "RoomUnit"("roomSlug", "roomNumber");
CREATE INDEX IF NOT EXISTS "RoomUnit_roomSlug_status_idx" ON "RoomUnit"("roomSlug", "status");
