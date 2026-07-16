import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";
import { saveEventAttachmentFile, UploadError } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_ATTACHMENT_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

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

  return NextResponse.json({ success: true, inquiries });
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const eventType = String(formData.get("eventType") || "").trim();
    const guestsRaw = String(formData.get("guests") || "").trim();
    const eventDateRaw = String(formData.get("eventDate") || "").trim();
    const eventTime = String(formData.get("eventTime") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const specialRequest = String(formData.get("specialRequest") || "").trim();
    const attachment = formData.get("attachment");

    if (!name || !email || !eventType) {
      return NextResponse.json(
        { success: false, error: "Name, email, and event type are required." },
        { status: 400 }
      );
    }

    let attachmentUrl = "";
    if (attachment instanceof File && attachment.size > 0) {
      const mime = attachment.type || "application/octet-stream";
      if (!ALLOWED_ATTACHMENT_MIME.has(mime)) {
        return NextResponse.json(
          { success: false, error: "Attachment must be PDF or image (PNG, JPG, WEBP)." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await attachment.arrayBuffer());
      const saved = await saveEventAttachmentFile({
        buffer,
        originalName: attachment.name || "attachment",
        mimeType: mime,
        folder: "events",
      });
      attachmentUrl = saved.url;
    }

    const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;
    const guests = guestsRaw ? Number(guestsRaw) : 0;

    const inquiry = await db.eventInquiry.create({
      data: {
        name,
        email,
        phone,
        country,
        company,
        eventType,
        guests: Number.isFinite(guests) ? guests : 0,
        eventDate,
        eventTime,
        budget,
        specialRequest,
        attachmentUrl,
        status: "new",
      },
    });

    return NextResponse.json({ success: true, inquiry: { id: inquiry.id } });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error("[EventInquiries]", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
