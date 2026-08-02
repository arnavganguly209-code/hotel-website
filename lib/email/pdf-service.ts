import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { formatUsd, formatVatPercent } from "@/lib/booking/vat";
import { getHotelMailConfig } from "./config";
import type { BookingEmailContext } from "./template-service";

/** A4 = 210×297mm. Tight margins so one page holds the full bill. */
const MM = 2.834645669;
const MARGIN = 12 * MM;
const GREEN = "#153a2a";
const GOLD = "#c5a059";
const INK = "#14352c";
const MUTED = "#5a635c";
const CREAM = "#fffdf8";
const LINE = "#e2d2a8";

function loadLogoFromDisk(): Buffer | null {
  const candidates = [
    path.join(process.cwd(), "public", "brand", "pdf-logo.png"),
    path.join(process.cwd(), "public", "brand", "admin-login-logo.png"),
    path.join(process.cwd(), "public", "brand", "email-logo.png"),
    path.join(process.cwd(), "public", "brand", "thamelpark-logo.png"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        if (buf.length > 0) {
          console.info("[pdf] Logo loaded from disk", { file, bytes: buf.length });
          return buf;
        }
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function resolveLogoBuffer(url: string): Promise<Buffer | null> {
  const fromDisk = loadLogoFromDisk();
  if (fromDisk) return fromDisk;
  try {
    if (!url) return null;
    const clean = url.split("?")[0];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(clean, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("[pdf] Logo missing:", err instanceof Error ? err.message : err);
    return null;
  }
}

function statusLabel(value: string) {
  return (value || "—").replace(/_/g, " ");
}

function clip(value: string, max: number) {
  const v = (value || "—").trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max - 1)}…`;
}

/**
 * Single-page A4 reservation bill / voucher.
 * Full Hotel Thamel Park & Spa logo at top (no separate hotel name text).
 */
export async function buildReservationPdf(ctx: BookingEmailContext): Promise<Buffer> {
  const hotel = getHotelMailConfig();
  const issueDate = ctx.issueDate || new Date().toISOString().slice(0, 10);
  const bookingCode = ctx.bookingNumber || formatBookingNumber(ctx.bookingId);

  const logoBuf = await resolveLogoBuffer(hotel.logoUrl);

  const doc = new PDFDocument({
    size: "A4",
    autoFirstPage: true,
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `Booking-${bookingCode}`,
      Author: hotel.name,
      Subject: "Booking Confirmation Voucher",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const contentW = pageW - MARGIN * 2;
  const left = MARGIN;
  const right = pageW - MARGIN;
  const colGap = 10;
  const colW = (contentW - colGap) / 2;

  doc.rect(0, 0, pageW, pageH).fill(CREAM);

  // Header — cream white so green logo wordmark stays readable
  doc.rect(0, 0, pageW, 78).fill(CREAM);
  doc.rect(0, 78, pageW, 2.5).fill(GOLD);

  if (logoBuf) {
    try {
      const maxW = 280;
      const maxH = 58;
      doc.image(logoBuf, (pageW - maxW) / 2, 10, {
        fit: [maxW, maxH],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      console.error("[pdf] Logo draw failed:", err instanceof Error ? err.message : err);
      doc.fillColor(GREEN).fontSize(14).text(hotel.name, left, 30, {
        width: contentW,
        align: "center",
      });
    }
  } else {
    doc.fillColor(GREEN).fontSize(14).text(hotel.name, left, 30, {
      width: contentW,
      align: "center",
    });
  }

  doc.rect(0, 80.5, pageW, 32).fill(GREEN);
  doc
    .fillColor("#ffffff")
    .fontSize(14)
    .text("BOOKING CONFIRMATION", left, 89, { width: contentW, align: "center" });

  let y = 124;

  const metaH = 52;
  doc.roundedRect(left, y, contentW, metaH, 4).fill("#ffffff");
  doc
    .roundedRect(left, y, contentW, metaH, 4)
    .lineWidth(0.8)
    .strokeColor(LINE)
    .stroke();

  doc.fillColor(INK).fontSize(12).text(`Booking No : ${bookingCode}`, left + 10, y + 8);
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      `Status: ${statusLabel(ctx.bookingStatus)}   ·   Payment: ${statusLabel(ctx.paymentStatus)}`,
      left + 10,
      y + 26
    );
  doc.text(`Issued: ${issueDate}   ·   Booked: ${ctx.bookingDate}`, left + 10, y + 40);

  y += metaH + 14;

  const section = (title: string) => {
    doc.fillColor(GREEN).fontSize(9).text(title.toUpperCase(), left, y, { characterSpacing: 1 });
    y += 11;
    doc.moveTo(left, y).lineTo(right, y).lineWidth(0.9).strokeColor(GOLD).stroke();
    y += 8;
  };

  const cell = (label: string, value: string, x: number, rowY: number, width: number) => {
    doc.fillColor(MUTED).fontSize(6.5).text(label.toUpperCase(), x, rowY, {
      width,
      characterSpacing: 0.4,
    });
    doc.fillColor(INK).fontSize(9).text(clip(value, 48), x, rowY + 9, { width });
  };

  const pair = (a: [string, string], b: [string, string]) => {
    cell(a[0], a[1], left, y, colW);
    cell(b[0], b[1], left + colW + colGap, y, colW);
    y += 24;
  };

  section("Guest");
  pair(["Guest Name", ctx.guestName], ["Email", ctx.guestEmail]);
  pair(
    ["Phone", ctx.guestPhone || "—"],
    ["Nationality", ctx.nationality || ctx.guestCountry || "—"]
  );

  section("Stay");
  pair(["Room Type", ctx.roomName], ["Rooms", String(ctx.roomQuantity || 1)]);
  pair(["Check-in", `${ctx.checkIn}  ${hotel.checkInTime}`], [
    "Check-out",
    `${ctx.checkOut}  ${hotel.checkOutTime}`,
  ]);
  pair(["Nights", String(ctx.nights)], ["Meal Plan", ctx.mealPlan || "Breakfast Included"]);
  pair(["Adults", String(ctx.adults)], ["Children", String(ctx.children)]);
  cell("Special Requests", clip(ctx.specialRequests || "—", 90), left, y, contentW);
  y += 26;

  section("Payment");
  const payH = 84;
  const payPad = 12;
  doc.roundedRect(left, y, contentW, payH, 5).fillAndStroke("#fbf7ef", GOLD);
  const payY = y + 10;
  const leftColW = contentW * 0.48;
  const rightColX = left + leftColW + 8;
  const rightColW = contentW - leftColW - payPad * 2 - 8;

  doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .text("TOTAL (VAT INCLUDED)", left + payPad, payY, { characterSpacing: 0.4 });
  doc
    .fillColor(GREEN)
    .fontSize(16)
    .text(`${formatUsd(ctx.grandTotal)} ${ctx.currency || "USD"}`, left + payPad, payY + 12, {
      width: leftColW - payPad,
    });

  doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .text("BREAKDOWN", rightColX, payY, { width: rightColW, characterSpacing: 0.4 });

  const rowLabelW = rightColW * 0.58;
  const rowAmountW = rightColW * 0.42;
  const drawBreakRow = (label: string, amount: string, rowY: number) => {
    doc.fillColor(INK).fontSize(8.5).text(label, rightColX, rowY, { width: rowLabelW });
    doc.text(amount, rightColX + rowLabelW, rowY, { width: rowAmountW, align: "right" });
  };
  drawBreakRow("Room charge", formatUsd(ctx.basePrice), payY + 16);
  drawBreakRow(
    `VAT (${formatVatPercent(ctx.vatRate || 0.13)})`,
    formatUsd(ctx.vatAmount),
    payY + 30
  );

  doc
    .fillColor(MUTED)
    .fontSize(7)
    .text("Rates are VAT-inclusive — VAT is not added again.", left + payPad, payY + 58, {
      width: contentW - payPad * 2,
    });
  y += payH + 12;

  section("Hotel");
  pair(["Phone", hotel.phone], ["Email", hotel.email]);
  cell("Address", hotel.address, left, y, contentW);
  y += 22;
  cell("Website", hotel.website, left, y, contentW);
  y += 22;
  doc
    .fillColor(MUTED)
    .fontSize(7.5)
    .text(
      `Check-in ${hotel.checkInTime}  ·  Check-out ${hotel.checkOutTime}  ·  Free cancellation up to 24h before arrival`,
      left,
      y,
      { width: contentW }
    );
  y += 18;

  const footerTop = Math.max(y + 8, pageH - MARGIN - 42);
  doc.moveTo(left, footerTop).lineTo(right, footerTop).strokeColor(GOLD).stroke();
  doc
    .fillColor(GREEN)
    .fontSize(9)
    .text("Thank you for choosing Hotel Thamel Park.", left, footerTop + 8, {
      width: contentW,
      align: "center",
    });
  doc
    .fillColor(MUTED)
    .fontSize(7)
    .text(
      "We look forward to welcoming you.  ·  Auto-generated voucher — no signature required.",
      left,
      footerTop + 22,
      { width: contentW, align: "center" }
    );

  doc.rect(0, pageH - 5, pageW, 5).fill(GREEN);
  doc.rect(0, pageH - 7, pageW, 2).fill(GOLD);

  doc.end();
  return done;
}
