import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { formatUsd, formatVatPercent } from "@/lib/booking/vat";
import { getHotelMailConfig } from "./config";
import type { BookingEmailContext } from "./template-service";

const MM = 2.834645669; // points per mm
const MARGIN = 20 * MM; // 20mm
const GREEN = "#153a2a";
const GOLD = "#c5a059";
const GOLD_SOFT = "#e8d5a0";
const INK = "#14352c";
const MUTED = "#5a635c";
const RULE = "#e2d2a8";
const CREAM = "#fffdf8";

function loadLogoFromDisk(): Buffer | null {
  const candidates = [
    path.join(process.cwd(), "public", "brand", "email-logo.png"),
    path.join(process.cwd(), "public", "brand", "thamelpark-logo.png"),
    path.join(process.cwd(), "public", "brand", "og-logo.png"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        if (buf.length > 0) return buf;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function fetchLogoBuffer(url: string): Promise<Buffer | null> {
  const fromDisk = loadLogoFromDisk();
  if (fromDisk) return fromDisk;
  try {
    if (!url) return null;
    // Strip cache-bust query for fetch reliability
    const clean = url.split("?")[0];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(clean, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error(
      "[pdf] Logo fetch skipped:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
function statusLabel(value: string) {
  return (value || "—").replace(/_/g, " ");
}

/**
 * Luxury A4 portrait reservation voucher (20mm margins).
 * Server-side only. Uses stored VAT-inclusive amounts — never adds VAT again.
 */
export async function buildReservationPdf(ctx: BookingEmailContext): Promise<Buffer> {
  const hotel = getHotelMailConfig();
  const issueDate = ctx.issueDate || new Date().toISOString().slice(0, 10);

  const qrPayload = [
    `Booking #${ctx.bookingId}`,
    `Guest: ${ctx.guestName}`,
    `Arrival: ${ctx.checkIn}`,
    `Departure: ${ctx.checkOut}`,
  ].join("\n");

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 180,
    margin: 1,
    color: { dark: GREEN, light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
  const qrBuf = Buffer.from(qrDataUrl.split(",")[1] || "", "base64");
  const logoBuf = await fetchLogoBuffer(hotel.logoUrl);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `Reservation #${ctx.bookingId} — ${hotel.name}`,
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

  // Cream page base
  doc.rect(0, 0, pageW, pageH).fill(CREAM);

  // White logo band (dark circular logos remain visible)
  doc.rect(0, 0, pageW, 78).fill("#ffffff");
  doc.rect(0, 78, pageW, 3).fill(GOLD);

  if (logoBuf) {
    try {
      const logoH = 52;
      const logoW = 120;
      doc.image(logoBuf, (pageW - logoW) / 2, 12, {
        height: logoH,
        fit: [logoW, logoH],
        align: "center",
      });
    } catch {
      doc.fillColor(GREEN).fontSize(14).text(hotel.name, left, 28, {
        width: contentW,
        align: "center",
      });
    }
  } else {
    doc.fillColor(GREEN).fontSize(14).text(hotel.name, left, 28, {
      width: contentW,
      align: "center",
    });
  }

  // Dark green title band
  doc.rect(0, 81, pageW, 52).fill(GREEN);
  doc
    .fillColor("#ffffff")
    .fontSize(18)
    .text("Booking Confirmation", left, 92, { width: contentW, align: "center" });
  doc
    .fillColor(GOLD_SOFT)
    .fontSize(9)
    .text("RESERVATION VOUCHER", left, 116, {
      width: contentW,
      align: "center",
      characterSpacing: 2,
    });

  let y = 150;

  // Meta + QR row
  const qrSize = 78;
  doc.image(qrBuf, right - qrSize, y, { width: qrSize, height: qrSize });

  doc.fillColor(INK).fontSize(11).text(`Reservation No.  #${ctx.bookingId}`, left, y + 8);
  doc.fillColor(MUTED).fontSize(9).text(`Issue Date  ${issueDate}`, left, y + 28);
  doc.text(`Status  ${statusLabel(ctx.bookingStatus)}  ·  Payment  ${statusLabel(ctx.paymentStatus)}`, left, y + 44);
  doc
    .fillColor(GOLD)
    .fontSize(8)
    .text("Scan QR for booking verification", right - qrSize, y + qrSize + 4, {
      width: qrSize,
      align: "center",
    });

  y = Math.max(y + qrSize + 22, y + 72);

  const sectionTitle = (title: string) => {
    if (y > pageH - MARGIN - 80) {
      doc.addPage();
      doc.rect(0, 0, pageW, pageH).fill(CREAM);
      y = MARGIN;
    }
    doc.fillColor(GREEN).fontSize(10).text(title.toUpperCase(), left, y, { characterSpacing: 1.2 });
    y += 14;
    doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(GOLD).stroke();
    y += 12;
  };

  const row = (label: string, value: string, col = 0) => {
    const colW = contentW / 2 - 8;
    const x = col === 0 ? left : left + contentW / 2 + 8;
    doc.fillColor(MUTED).fontSize(8).text(label.toUpperCase(), x, y, { width: colW, characterSpacing: 0.6 });
    doc.fillColor(INK).fontSize(10).text(value || "—", x, y + 11, { width: colW });
  };

  const twoCol = (a: [string, string], b: [string, string]) => {
    row(a[0], a[1], 0);
    row(b[0], b[1], 1);
    y += 32;
  };

  // SECTION 1 — Hotel
  sectionTitle("1 · Hotel Information");
  twoCol(["Hotel Name", hotel.name], ["Phone", hotel.phone]);
  twoCol(["Email", hotel.email], ["Website", hotel.website]);
  doc.fillColor(MUTED).fontSize(8).text("ADDRESS", left, y, { characterSpacing: 0.6 });
  doc.fillColor(INK).fontSize(10).text(hotel.address, left, y + 11, { width: contentW });
  y += 34;
  doc.fillColor(MUTED).fontSize(8).text("GOOGLE MAPS", left, y, { characterSpacing: 0.6 });
  doc.fillColor(GOLD).fontSize(9).text(hotel.googleMap || "—", left, y + 11, { width: contentW });
  y += 34;

  // SECTION 2 — Booking
  sectionTitle("2 · Booking Information");
  twoCol(["Booking Number", `#${ctx.bookingId}`], ["Booking Date", ctx.bookingDate]);
  twoCol(
    ["Booking Status", statusLabel(ctx.bookingStatus)],
    ["Payment Status", statusLabel(ctx.paymentStatus)]
  );
  twoCol(["Reservation Source", statusLabel(ctx.reservationSource || "online")], ["Issue Date", issueDate]);

  // SECTION 3 — Guest
  sectionTitle("3 · Guest Information");
  twoCol(["Guest Name", ctx.guestName], ["Email", ctx.guestEmail]);
  twoCol(["Phone", ctx.guestPhone || "—"], ["Country", ctx.guestCountry || "—"]);
  twoCol(["Nationality", ctx.nationality || ctx.guestCountry || "—"], ["Passport Number", ctx.passportNumber || "—"]);
  doc.fillColor(MUTED).fontSize(8).text("SPECIAL REQUEST", left, y, { characterSpacing: 0.6 });
  doc.fillColor(INK).fontSize(10).text(ctx.specialRequests || "—", left, y + 11, { width: contentW });
  y += 36;

  // SECTION 4 — Stay
  sectionTitle("4 · Stay Information");
  twoCol(["Room Type", ctx.roomName], ["Room Number", ctx.roomNumber || "To be assigned"]);
  twoCol(["Check In", ctx.checkIn], ["Check Out", ctx.checkOut]);
  twoCol(["Total Nights", String(ctx.nights)], ["Meal Plan", ctx.mealPlan || "Breakfast Included"]);
  twoCol(["Adults", String(ctx.adults)], ["Children", String(ctx.children)]);

  // SECTION 5 — Payment (VAT inclusive)
  sectionTitle("5 · Payment Summary");
  doc
    .roundedRect(left, y, contentW, 108, 6)
    .lineWidth(1)
    .strokeColor(GOLD)
    .fillAndStroke("#fbf7ef", GOLD);

  const payY = y + 14;
  doc.fillColor(MUTED).fontSize(8).text("WEBSITE PRICE (VAT INCLUDED)", left + 16, payY, { characterSpacing: 0.6 });
  doc.fillColor(GREEN).fontSize(16).text(formatUsd(ctx.displayPrice), left + 16, payY + 12);

  doc.fillColor(MUTED).fontSize(8).text("BREAKDOWN", left + contentW / 2, payY, { characterSpacing: 0.6 });
  doc
    .fillColor(INK)
    .fontSize(10)
    .text(`Room Charge          ${formatUsd(ctx.basePrice)}`, left + contentW / 2, payY + 14);
  doc.text(
    `VAT (${formatVatPercent(ctx.vatRate || 0.13)})                  ${formatUsd(ctx.vatAmount)}`,
    left + contentW / 2,
    payY + 30
  );
  doc
    .fillColor(GREEN)
    .fontSize(11)
    .text(
      `Grand Total           ${formatUsd(ctx.grandTotal)} ${ctx.currency || "USD"}`,
      left + contentW / 2,
      payY + 50
    );
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      "Website rates are VAT inclusive. VAT is shown for accounting only and is never added again.",
      left + 16,
      payY + 78,
      { width: contentW - 32 }
    );
  y += 124;

  // SECTION 6 — Policies
  sectionTitle("6 · Hotel Policies");
  const policies: [string, string][] = [
    ["Check In Time", hotel.checkInTime],
    ["Check Out Time", hotel.checkOutTime],
    ["Smoking Policy", hotel.smokingPolicy],
    ["Cancellation Policy", hotel.cancellationPolicy],
    ["Children Policy", hotel.childrenPolicy],
    ["Extra Bed Policy", hotel.extraBedPolicy],
  ];
  for (const [label, value] of policies) {
    if (y > pageH - MARGIN - 50) {
      doc.addPage();
      doc.rect(0, 0, pageW, pageH).fill(CREAM);
      y = MARGIN;
    }
    doc.fillColor(GOLD).fontSize(8).text(label.toUpperCase(), left, y, { characterSpacing: 0.6 });
    doc.fillColor(INK).fontSize(9).text(value, left, y + 11, { width: contentW });
    y += 28;
  }

  // SECTION 7 — QR note
  sectionTitle("7 · Verification QR Code");
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(
      "The QR code on this voucher encodes Booking Number, Guest Name, Arrival and Departure for front-desk verification.",
      left,
      y,
      { width: contentW }
    );
  y += 28;

  // SECTION 8 — Footer
  if (y > pageH - MARGIN - 70) {
    doc.addPage();
    doc.rect(0, 0, pageW, pageH).fill(CREAM);
    y = MARGIN;
  }
  doc.moveTo(left, y).lineTo(right, y).strokeColor(GOLD).stroke();
  y += 14;
  doc
    .fillColor(GREEN)
    .fontSize(11)
    .text("Thank you for choosing Hotel Thamel Park.", left, y, { width: contentW, align: "center" });
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text("We look forward to welcoming you.", left, y + 16, { width: contentW, align: "center" });
  doc
    .fillColor(GOLD)
    .fontSize(8)
    .text("Automatically Generated Reservation Voucher.  No Signature Required.", left, y + 34, {
      width: contentW,
      align: "center",
    });

  // Bottom gold rule
  doc.rect(0, pageH - 6, pageW, 6).fill(GREEN);
  doc.rect(0, pageH - 8, pageW, 2).fill(GOLD);

  doc.end();
  return done;
}
