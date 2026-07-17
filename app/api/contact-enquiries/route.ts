import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cms/auth";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getContent } from "@/lib/cms/store";
import { sendContactEnquiryEmails } from "@/lib/mail";
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

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();
  const bookingType = searchParams.get("bookingType")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  const inquiries = await db.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = inquiries.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (bookingType && bookingType !== "all" && item.bookingType !== bookingType) return false;
    if (from) {
      const fromDate = new Date(from);
      if (item.createdAt < fromDate) return false;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (item.createdAt > toDate) return false;
    }
    if (q) {
      const hay = `${item.fullName} ${item.email} ${item.phone} ${item.bookingType}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, inquiries: filtered });
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
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const arrivalDateRaw = String(formData.get("arrivalDate") || "").trim();
    const departureDateRaw = String(formData.get("departureDate") || "").trim();
    const guestsRaw = String(formData.get("guests") || "").trim();
    const adultsRaw = String(formData.get("adults") || "").trim();
    const childrenRaw = String(formData.get("children") || "").trim();
    const roomPreference = String(formData.get("roomPreference") || "").trim();
    const bookingType = String(formData.get("bookingType") || "General Inquiry").trim();
    const preferredContact = String(formData.get("preferredContact") || "Email").trim();
    const budget = String(formData.get("budget") || "").trim();
    const specialRequest = String(formData.get("specialRequest") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const consent = String(formData.get("consent") || "") === "on" || formData.get("consent") === "true";
    const attachment = formData.get("attachment");

    if (!fullName || !email || !bookingType) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and booking type are required." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: "Please accept the consent checkbox to continue." },
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
        folder: "contact",
      });
      attachmentUrl = saved.url;
    }

    const guests = guestsRaw ? Number(guestsRaw) : 1;
    const adults = adultsRaw ? Number(adultsRaw) : 1;
    const children = childrenRaw ? Number(childrenRaw) : 0;

    const inquiry = await db.contactEnquiry.create({
      data: {
        fullName,
        email,
        phone,
        country,
        arrivalDate: arrivalDateRaw ? new Date(arrivalDateRaw) : null,
        departureDate: departureDateRaw ? new Date(departureDateRaw) : null,
        guests: Number.isFinite(guests) ? guests : 1,
        adults: Number.isFinite(adults) ? adults : 1,
        children: Number.isFinite(children) ? children : 0,
        roomPreference,
        bookingType,
        preferredContact,
        budget,
        specialRequest,
        message,
        attachmentUrl,
        consent,
        status: "new",
      },
    });

    const content = await getContent();
    const adminEmail = content.settings.bookingEmail || content.contactPage.email || content.hotel.email;

    const mail = await sendContactEnquiryEmails(
      {
        id: inquiry.id,
        fullName,
        email,
        phone,
        bookingType,
        message: message || specialRequest,
        arrivalDate: arrivalDateRaw || null,
        departureDate: departureDateRaw || null,
      },
      adminEmail
    );

    return NextResponse.json({
      success: true,
      inquiry: { id: inquiry.id },
      email: mail,
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error("[ContactEnquiries]", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
