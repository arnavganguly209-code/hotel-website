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

const FOLDER_STATUSES = new Set(["inbox", "archived", "spam", "trash"]);

/** Simple in-memory rate limit: max 8 posts / IP / 10 minutes. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const rateMap = new Map<string, number[]>();

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const real = req.headers.get("x-real-ip") || "";
  return (forwarded.split(",")[0] || real || "").trim().slice(0, 120);
}

function rateLimited(ip: string): boolean {
  if (!ip) return false;
  const now = Date.now();
  const prev = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) {
    rateMap.set(ip, prev);
    return true;
  }
  prev.push(now);
  rateMap.set(ip, prev);
  return false;
}

function sanitizeText(value: string, max = 5000): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

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
  const folder = searchParams.get("folder")?.trim();
  const unread = searchParams.get("unread");
  const starred = searchParams.get("starred");

  const inquiries = await db.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = inquiries.filter((item) => {
    const itemFolder = FOLDER_STATUSES.has(item.status) ? item.status : "inbox";
    if (folder && folder !== "all" && itemFolder !== folder) return false;
    if (status && status !== "all" && item.status !== status) return false;
    if (unread === "1" && item.isRead) return false;
    if (starred === "1" && !item.starred) return false;
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
      const hay =
        `${item.fullName} ${item.email} ${item.phone} ${item.bookingType} ${item.subject} ${item.message}`.toLowerCase();
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

    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const fullName = sanitizeText(String(formData.get("fullName") || ""), 200);
    const email = sanitizeText(String(formData.get("email") || ""), 320).toLowerCase();
    const phone = sanitizeText(String(formData.get("phone") || ""), 80);
    const country = sanitizeText(String(formData.get("country") || ""), 120);
    const subject = sanitizeText(String(formData.get("subject") || ""), 300);
    const arrivalDateRaw = String(formData.get("arrivalDate") || "").trim();
    const departureDateRaw = String(formData.get("departureDate") || "").trim();
    const guestsRaw = String(formData.get("guests") || "").trim();
    const adultsRaw = String(formData.get("adults") || "").trim();
    const childrenRaw = String(formData.get("children") || "").trim();
    const roomPreference = sanitizeText(String(formData.get("roomPreference") || ""), 200);
    const bookingType = sanitizeText(
      String(formData.get("bookingType") || "General Inquiry"),
      120
    ) || "General Inquiry";
    const preferredContact = sanitizeText(
      String(formData.get("preferredContact") || "Email"),
      80
    ) || "Email";
    const budget = sanitizeText(String(formData.get("budget") || ""), 120);
    const specialRequest = sanitizeText(String(formData.get("specialRequest") || ""), 2000);
    const message = sanitizeText(String(formData.get("message") || ""), 8000);
    const sourcePage = sanitizeText(String(formData.get("sourcePage") || ""), 500);
    const consent =
      String(formData.get("consent") || "") === "on" || formData.get("consent") === "true";
    const attachment = formData.get("attachment");
    const userAgent = sanitizeText(req.headers.get("user-agent") || "", 500);

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: "Full name and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: "Please accept the consent checkbox to continue." },
        { status: 400 }
      );
    }

    if (!message && !specialRequest && !subject) {
      return NextResponse.json(
        { success: false, error: "Please include a message or subject." },
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
        subject,
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
        message: message || subject,
        attachmentUrl,
        consent,
        status: "inbox",
        isRead: false,
        starred: false,
        replied: false,
        sourcePage,
        ipAddress: ip,
        userAgent,
      },
    });

    // Email is best-effort — never fail the submission if SMTP is down.
    let mail = { guestSent: false, adminSent: false };
    try {
      const content = await getContent();
      const adminEmail =
        content.settings.bookingEmail || content.contactPage.email || content.hotel.email;
      mail = await sendContactEnquiryEmails(
        {
          id: inquiry.id,
          fullName,
          email,
          phone,
          bookingType: subject ? `${bookingType} · ${subject}` : bookingType,
          message: message || specialRequest || subject,
          arrivalDate: arrivalDateRaw || null,
          departureDate: departureDateRaw || null,
        },
        adminEmail
      );
    } catch (mailError) {
      console.error("[ContactEnquiries] email failed (message still saved):", mailError);
    }

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
