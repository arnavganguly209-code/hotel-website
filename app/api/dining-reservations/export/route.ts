import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | boolean | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const idParam = searchParams.get("id");

  if (format === "pdf" && idParam) {
    const reservation = await db.diningReservation.findUnique({
      where: { id: Number(idParam) },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Reservation ${reservation.referenceNumber}</title>
<style>
  body{font-family:Georgia,serif;padding:40px;color:#1a2e26;line-height:1.5}
  h1{font-weight:400;letter-spacing:.06em}
  .meta{color:#5a6b63;font-size:14px;margin-bottom:24px}
  .row{margin:8px 0} .label{color:#c9a227;text-transform:uppercase;font-size:11px;letter-spacing:.12em}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">Print / Save PDF</button>
<h1>Dining Reservation ${reservation.referenceNumber}</h1>
<p class="meta">Status: ${reservation.status} · ${reservation.createdAt.toISOString()}</p>
<div class="row"><div class="label">Guest</div>${reservation.fullName}</div>
<div class="row"><div class="label">Email</div>${reservation.email}</div>
<div class="row"><div class="label">Phone</div>${reservation.phone}</div>
<div class="row"><div class="label">Country</div>${reservation.country}</div>
<div class="row"><div class="label">Restaurant</div>${reservation.restaurant}</div>
<div class="row"><div class="label">Date</div>${reservation.reservationDate ? reservation.reservationDate.toISOString().slice(0, 10) : "—"}</div>
<div class="row"><div class="label">Time</div>${reservation.reservationTime || "—"}</div>
<div class="row"><div class="label">Party</div>${reservation.adults} adult(s), ${reservation.children} child(ren)</div>
<div class="row"><div class="label">Occasion</div>${reservation.specialOccasion || "—"}</div>
<div class="row"><div class="label">Special Request</div><p>${(reservation.specialRequest || "").replace(/</g, "&lt;")}</p></div>
<div class="row"><div class="label">Admin Notes</div><p>${(reservation.adminNotes || "").replace(/</g, "&lt;")}</p></div>
<script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const reservations = await db.diningReservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "Reference",
    "Full Name",
    "Email",
    "Phone",
    "Country",
    "Restaurant",
    "Reservation Date",
    "Reservation Time",
    "Adults",
    "Children",
    "Special Occasion",
    "Special Request",
    "Status",
    "Admin Notes",
    "Created At",
  ];

  const rows = reservations.map((item) =>
    [
      item.id,
      item.referenceNumber,
      item.fullName,
      item.email,
      item.phone,
      item.country,
      item.restaurant,
      item.reservationDate ? item.reservationDate.toISOString().slice(0, 10) : "",
      item.reservationTime,
      item.adults,
      item.children,
      item.specialOccasion,
      item.specialRequest,
      item.status,
      item.adminNotes,
      item.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename =
    format === "excel"
      ? `dining-reservations-${Date.now()}.csv`
      : `dining-reservations-${Date.now()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
