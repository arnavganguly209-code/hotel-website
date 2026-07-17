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
    const inquiry = await db.contactEnquiry.findUnique({
      where: { id: Number(idParam) },
    });
    if (!inquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Enquiry #${inquiry.id}</title>
<style>
  body{font-family:Georgia,serif;padding:40px;color:#1a2e26;line-height:1.5}
  h1{font-weight:400;letter-spacing:.06em}
  .meta{color:#5a6b63;font-size:14px;margin-bottom:24px}
  .row{margin:8px 0} .label{color:#c9a227;text-transform:uppercase;font-size:11px;letter-spacing:.12em}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">Print / Save PDF</button>
<h1>Contact Enquiry #${inquiry.id}</h1>
<p class="meta">Status: ${inquiry.status} · ${inquiry.createdAt.toISOString()}</p>
<div class="row"><div class="label">Guest</div>${inquiry.fullName}</div>
<div class="row"><div class="label">Email</div>${inquiry.email}</div>
<div class="row"><div class="label">Phone</div>${inquiry.phone}</div>
<div class="row"><div class="label">Country</div>${inquiry.country}</div>
<div class="row"><div class="label">Booking Type</div>${inquiry.bookingType}</div>
<div class="row"><div class="label">Preferred Contact</div>${inquiry.preferredContact}</div>
<div class="row"><div class="label">Guests</div>${inquiry.guests} (Adults ${inquiry.adults}, Children ${inquiry.children})</div>
<div class="row"><div class="label">Arrival</div>${inquiry.arrivalDate ? inquiry.arrivalDate.toISOString().slice(0, 10) : "—"}</div>
<div class="row"><div class="label">Departure</div>${inquiry.departureDate ? inquiry.departureDate.toISOString().slice(0, 10) : "—"}</div>
<div class="row"><div class="label">Room Preference</div>${inquiry.roomPreference || "—"}</div>
<div class="row"><div class="label">Budget</div>${inquiry.budget || "—"}</div>
<div class="row"><div class="label">Special Request</div>${inquiry.specialRequest || "—"}</div>
<div class="row"><div class="label">Message</div><p>${(inquiry.message || "").replace(/</g, "&lt;")}</p></div>
<script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const inquiries = await db.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Phone",
    "Country",
    "Booking Type",
    "Preferred Contact",
    "Guests",
    "Adults",
    "Children",
    "Arrival",
    "Departure",
    "Room Preference",
    "Budget",
    "Special Request",
    "Message",
    "Status",
    "Created At",
  ];

  const rows = inquiries.map((item) =>
    [
      item.id,
      item.fullName,
      item.email,
      item.phone,
      item.country,
      item.bookingType,
      item.preferredContact,
      item.guests,
      item.adults,
      item.children,
      item.arrivalDate ? item.arrivalDate.toISOString().slice(0, 10) : "",
      item.departureDate ? item.departureDate.toISOString().slice(0, 10) : "",
      item.roomPreference,
      item.budget,
      item.specialRequest,
      item.message,
      item.status,
      item.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const filename =
    format === "excel"
      ? `contact-enquiries-${Date.now()}.csv`
      : `contact-enquiries-${Date.now()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
