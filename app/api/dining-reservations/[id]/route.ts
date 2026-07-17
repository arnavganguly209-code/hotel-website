import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set([
  "new",
  "confirmed",
  "pending",
  "completed",
  "cancelled",
  "archived",
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const reservationId = Number(id);
  if (!Number.isFinite(reservationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as { status?: string; adminNotes?: string };
  const status =
    body.status && ALLOWED_STATUS.has(body.status) ? body.status : undefined;

  const reservation = await db.diningReservation.update({
    where: { id: reservationId },
    data: {
      status,
      adminNotes: body.adminNotes ?? undefined,
    },
  });

  return NextResponse.json({ success: true, reservation });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const reservationId = Number(id);
  if (!Number.isFinite(reservationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.diningReservation.delete({ where: { id: reservationId } });
  return NextResponse.json({ success: true });
}
