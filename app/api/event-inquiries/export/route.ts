import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const inquiries = await db.eventInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Country",
    "Company",
    "Event Type",
    "Guests",
    "Event Date",
    "Event Time",
    "Budget",
    "Special Request",
    "Attachment URL",
    "Status",
    "Admin Reply",
    "Created At",
  ];

  const rows = inquiries.map((item) =>
    [
      item.id,
      item.name,
      item.email,
      item.phone,
      item.country,
      item.company,
      item.eventType,
      item.guests,
      item.eventDate ? item.eventDate.toISOString().slice(0, 10) : "",
      item.eventTime,
      item.budget,
      item.specialRequest,
      item.attachmentUrl,
      item.status,
      item.adminReply,
      item.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-inquiries-${Date.now()}.csv"`,
    },
  });
}
