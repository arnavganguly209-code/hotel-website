import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { formatUsd, formatVatPercent } from "@/lib/booking/vat";
import { getHotelMailConfig } from "./config";
import type { BookingEmailContext } from "./template-service";

/** A4 = 210×297mm. Tight margins so one page holds the full bill. */
const MM = 2.834645669;
const MARGIN = 12 * MM; // 12mm — use more of the A4 sheet
const GREEN = "#153a2a";
const GOLD = "#c5a059";
const GOLD_SOFT = "#e8d5a0";
const INK = "#14352c";
const MUTED = "#5a635c";
const CREAM = "#fffdf8";
const LINE = "#e2d2a8";

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
    const buf = Buffer.from(await res.arrayBuffer());
    console.info("[pdf] Logo fetched from URL", { url: clean, bytes: buf.length });
    return buf;
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
 * Logo at top (no hotel name text when logo is present). Never adds a second page.
 */
export async function buildReservationPdf(ctx: BookingEmailContext): Promise<Buffer> {
  const hotel = getHotelMailConfig();
  const issueDate = ctx.issueDate || new Date().toISOString().slice(0, 10);

  const qrDataUrl = await QRCode.toDataURL(
    [`#${ctx.bookingId}`, ctx.guestName, ctx.checkIn, ctx.checkOut].join("|"),
    {
      width: 140,
      margin: 1,
      color: { dark: GREEN, light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }
  );
  const qrBuf = Buffer.from(qrDataUrl.split(",")[1] || "", "base64");
  const logoBuf = await resolveLogoBuffer(hotel.logoUrl);

  const doc = new PDFDocument({
    size: "A4",
    autoFirstPage: true,
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `Booking-${ctx.bookingId}`,
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

  const pageW = doc.page.width; // 595.28
  const pageH = doc.page.height; // 841.89
  const contentW = pageW - MARGIN * 2;
  const left = MARGIN;
  const right = pageW - MARGIN;
  const colGap = 10;
  const colW = (contentW - colGap) / 2;

  // Full-bleed cream background on the single A4 page
  doc.rect(0, 0, pageW, pageH).fill(CREAM);

  // —— Header: logo only (no hotel name when logo exists) ——
  doc.rect(0, 0, pageW, 72).fill("#ffffff");
  doc.rect(0, 72, pageW, 2.5).fill(GOLD);

  if (logoBuf) {
    try {
      const logoBox = 56;
      doc.image(logoBuf, (pageW - logoBox) / 2, 8, {
        fit: [logoBox, logoBox],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      console.error("[pdf] Logo draw failed:", err instanceof Error ? err.message : err);
      doc.fillColor(GREEN).fontSize(16).text(hotel.name, left, 28, {
        width: contentW,
        align: "center",
      });
    }
  } else {
    doc.fillColor(GREEN).fontSize(16).text(hotel.name, left, 28, {
      width: contentW,
      align: "center",
    });
  }

  // Title strip
  doc.rect(0, 74.5, pageW, 36).fill(GREEN);
  doc
    .fillColor("#ffffff")
    .fontSize(15)
    .text("BOOKING CONFIRMATION", left, 82, { width: contentW, align: "center" });
  doc
    .fillColor(GOLD_SOFT)
    .fontSize(8)
    .text("RESERVATION VOUCHER  ·  A4", left, 98, {
      width: contentW,
      align: "center",
      characterSpacing: 1.4,
    });

  let y = 122;

  // —— Booking meta + QR (compact) ——
  const qrSize = 58;
  doc.roundedRect(left, y, contentW - qrSize - 12, qrSize + 4, 4).fill("#ffffff");
  doc
    .roundedRect(left, y, contentW - qrSize - 12, qrSize + 4, 4)
    .lineWidth(0.8)
    .strokeColor(LINE)
    .stroke();

  doc.fillColor(INK).fontSize(12).text(`Booking #${ctx.bookingId}`, left + 10, y + 8);
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      `Status: ${statusLabel(ctx.bookingStatus)}   ·   Payment: ${statusLabel(ctx.paymentStatus)}`,
      left + 10,
      y + 26
    );
  doc.text(`Issued: ${issueDate}   ·   Booked: ${ctx.bookingDate}`, left + 10, y + 40);

  doc.image(qrBuf, right - qrSize, y, { width: qrSize, height: qrSize });
  y += qrSize + 14;

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

  // —— Guest ——
  section("Guest");
  pair(["Guest Name", ctx.guestName], ["Email", ctx.guestEmail]);
  pair(
    ["Phone", ctx.guestPhone || "—"],
    ["Nationality", ctx.nationality || ctx.guestCountry || "—"]
  );

  // —— Stay ——
  section("Stay");
  pair(["Room Type", ctx.roomName], ["Rooms", String(ctx.roomQuantity || 1)]);
  pair(["Check-in", ctx.checkIn], ["Check-out", ctx.checkOut]);
  pair(["Nights", String(ctx.nights)], ["Meal Plan", ctx.mealPlan || "Breakfast Included"]);
  pair(["Adults", String(ctx.adults)], ["Children", String(ctx.children)]);
  cell("Special Requests", clip(ctx.specialRequests || "—", 90), left, y, contentW);
  y += 26;

  // —— Payment ——
  section("Payment");
  const payH = 78;
  doc.roundedRect(left, y, contentW, payH, 5).fillAndStroke("#fbf7ef", GOLD);

  const payY = y + 10;
  doc
    .fillColor(MUTED)
    .fontSize(6.5)
    .text("TOTAL (VAT INCLUDED)", left + 12, payY, { characterSpacing: 0.4 });
  doc
    .fillColor(GREEN)
    .fontSize(18)
    .text(`${formatUsd(ctx.grandTotal)} ${ctx.currency || "USD"}`, left + 12, payY + 12);

  doc.fillColor(MUTED).fontSize(6.5).text("BREAKDOWN", left + contentW / 2, payY, {
    characterSpacing: 0.4,
  });
  doc
    .fillColor(INK)
    .fontSize(8.5)
    .text(`Room charge     ${formatUsd(ctx.basePrice)}`, left + contentW / 2, payY + 14);
  doc.text(
    `VAT (${formatVatPercent(ctx.vatRate || 0.13)})              ${formatUsd(ctx.vatAmount)}`,
    left + contentW / 2,
    payY + 28
  );
  doc
    .fillColor(MUTED)
    .fontSize(7)
    .text("Rates are VAT-inclusive — VAT is not added again.", left + 12, payY + 54, {
      width: contentW - 24,
    });
  y += payH + 12;

  // —— Hotel contact (compact, no long policies) ——
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

  // —— Footer (pinned near bottom of the same A4 page) ——
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
    .text("We look forward to welcoming you.  ·  Auto-generated voucher — no signature required.", left, footerTop + 22, {
      width: contentW,
      align: "center",
    });

  // Bottom accent on the same page
  doc.rect(0, pageH - 5, pageW, 5).fill(GREEN);
  doc.rect(0, pageH - 7, pageW, 2).fill(GOLD);

  // Never call addPage() — this voucher is always exactly one A4 sheet.
  doc.end();
  return done;
}
