import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { formatUsd, formatVatPercent } from "@/lib/booking/vat";
import { getHotelMailConfig } from "./config";
import type { BookingEmailContext } from "./template-service";

/** A4 — matches HTML reservation voucher (green logo, no QR, tight sides). */
const MM = 2.834645669;
const MARGIN = 8 * MM;
const GREEN = "#14352c";
const GOLD = "#d4af37";
const GOLD_TEXT = "#c9a227";
const INK = "#14352c";
const MUTED = "#5a635c";
const LABEL = "#6b7a73";
const CREAM = "#fffdf8";
const LINE = "#e8dfc8";
const NOTE_BG = "#f8f4eb";
const NOTE_BORDER = "#e5d7b4";

function loadLogoFromDisk(): Buffer | null {
  const candidates = [
    path.join(process.cwd(), "public", "brand", "voucher-logo.png"),
    path.join(process.cwd(), "public", "brand", "pdf-logo.png"),
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
 * A4 reservation voucher PDF — same structure as HTML voucher for guest + admin.
 * Real booking fields only; green print logo; no QR.
 */
export async function buildReservationPdf(ctx: BookingEmailContext): Promise<Buffer> {
  const hotel = getHotelMailConfig();
  const bookingCode = ctx.bookingNumber || formatBookingNumber(ctx.bookingId);
  const logoBuf = await resolveLogoBuffer(hotel.logoUrl);
  const vatLabel = `VAT (${formatVatPercent(ctx.vatRate || 0.13)})`;
  const currency = ctx.currency || "USD";

  const doc = new PDFDocument({
    size: "A4",
    autoFirstPage: true,
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `Booking-${bookingCode}`,
      Author: hotel.name,
      Subject: "Reservation Voucher",
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
  const left = MARGIN;
  const right = pageW - MARGIN;
  const contentW = right - left;
  const colGap = 18;
  const colW = (contentW - colGap) / 2;

  // Page cream + gold frame (4 sides)
  doc.rect(0, 0, pageW, pageH).fill(CREAM);
  doc
    .lineWidth(1.2)
    .strokeColor(GOLD)
    .rect(MARGIN * 0.45, MARGIN * 0.45, pageW - MARGIN * 0.9, pageH - MARGIN * 0.9)
    .stroke();

  let y = MARGIN + 6;

  // Header: logo + hotel left, voucher meta right
  const headerTop = y;
  if (logoBuf) {
    try {
      // ~74×207 CSS px ≈ +15% over original 64×180
      doc.image(logoBuf, left, y, {
        fit: [155, 55],
        align: "left",
        valign: "top",
      });
      y += 58;
    } catch (err) {
      console.error("[pdf] Logo draw failed:", err instanceof Error ? err.message : err);
    }
  }

  doc.fillColor(INK).fontSize(16).text(hotel.name || "Hotel Thamel Park", left, y, {
    width: contentW * 0.55,
  });
  y += 20;
  doc.fillColor(MUTED).fontSize(9).text(hotel.address || "", left, y, {
    width: contentW * 0.55,
  });
  y += 12;
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(`${hotel.phone || ""} · ${hotel.email || ""}`, left, y, {
      width: contentW * 0.55,
    });

  const metaX = left + contentW * 0.52;
  const metaW = contentW * 0.48;
  let metaY = headerTop;
  doc.fillColor(INK).fontSize(12).text("Reservation Voucher", metaX, metaY, {
    width: metaW,
    align: "right",
  });
  metaY += 16;
  doc.fillColor(MUTED).fontSize(9).text("Booking No.", metaX, metaY, {
    width: metaW,
    align: "right",
  });
  metaY += 12;
  doc.fillColor(INK).fontSize(11).text(`#${ctx.bookingId}`, metaX, metaY, {
    width: metaW,
    align: "right",
  });
  metaY += 14;
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(`Status: ${statusLabel(ctx.bookingStatus)}`, metaX, metaY, {
      width: metaW,
      align: "right",
    });
  metaY += 12;
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(
      `Payment: ${statusLabel(ctx.paymentStatus)} (${statusLabel(ctx.paymentMethod || "—")})`,
      metaX,
      metaY,
      { width: metaW, align: "right" }
    );

  y = Math.max(y + 16, metaY + 18);
  doc
    .moveTo(left, y)
    .lineTo(right, y)
    .lineWidth(1.5)
    .strokeColor(GOLD)
    .stroke();
  y += 16;

  const section = (title: string) => {
    doc
      .fillColor(GOLD_TEXT)
      .fontSize(10)
      .text(title.toUpperCase(), left, y, { characterSpacing: 1.4 });
    y += 16;
  };

  const cell = (label: string, value: string, x: number, rowY: number, width: number) => {
    doc.fillColor(LABEL).fontSize(8).text(label.toUpperCase(), x, rowY, {
      width,
      characterSpacing: 0.5,
    });
    doc.fillColor(INK).fontSize(10).text(clip(value, 56), x, rowY + 11, { width });
  };

  const pair = (a: [string, string], b: [string, string]) => {
    cell(a[0], a[1], left, y, colW);
    cell(b[0], b[1], left + colW + colGap, y, colW);
    y += 30;
  };

  section("Guest Information");
  pair(["Guest Name", ctx.guestName], ["Email", ctx.guestEmail]);
  pair(
    ["Phone", ctx.guestPhone || "—"],
    ["Country", ctx.guestCountry || ctx.nationality || "—"]
  );

  section("Stay Information");
  pair(["Room Type", ctx.roomName], ["Rooms", String(ctx.roomQuantity || 1)]);
  pair(["Check-in", ctx.checkIn], ["Check-out", ctx.checkOut]);
  pair(
    ["Nights", String(ctx.nights)],
    ["Guests", `${ctx.adults} adult(s), ${ctx.children} child(ren)`]
  );

  section("Tax Breakdown (VAT Inclusive Pricing)");
  doc.fillColor(LABEL).fontSize(8).text("DESCRIPTION", left, y, { characterSpacing: 0.5 });
  doc
    .fillColor(LABEL)
    .fontSize(8)
    .text(`AMOUNT (${currency})`, left, y, { width: contentW, align: "right", characterSpacing: 0.5 });
  y += 12;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.6).strokeColor(LINE).stroke();
  y += 8;

  const moneyRow = (label: string, amount: string, bold = false) => {
    doc
      .fillColor(INK)
      .fontSize(bold ? 11 : 10)
      .text(label, left, y, { width: contentW * 0.65 });
    doc
      .fillColor(INK)
      .fontSize(bold ? 11 : 10)
      .text(amount, left, y, { width: contentW, align: "right" });
    y += bold ? 18 : 16;
    if (!bold) {
      doc.moveTo(left, y - 4).lineTo(right, y - 4).lineWidth(0.5).strokeColor(LINE).stroke();
    }
  };

  moneyRow("Room Rate (VAT Included)", formatUsd(ctx.displayPrice));
  moneyRow("Room Charge (Excl. VAT)", formatUsd(ctx.basePrice));
  moneyRow(vatLabel, formatUsd(ctx.vatAmount));
  y += 4;
  moneyRow("Grand Total (VAT Included)", `${formatUsd(ctx.grandTotal)} ${currency}`, true);

  y += 10;
  const special = (ctx.specialRequests || "").trim();
  const noteText =
    "Website room rates are VAT inclusive. The amount above is the final payable total — " +
    "VAT is shown for accounting only and is not added again." +
    (special ? `\n\nSpecial requests: ${special}` : "");

  const noteH = Math.max(48, doc.heightOfString(noteText, { width: contentW - 20, fontSize: 9 }) + 18);
  doc.roundedRect(left, y, contentW, noteH, 2).fillAndStroke(NOTE_BG, NOTE_BORDER);
  doc.fillColor(MUTED).fontSize(9).text(noteText, left + 10, y + 9, {
    width: contentW - 20,
    lineGap: 2,
  });
  y += noteH + 16;

  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.7).strokeColor(NOTE_BORDER).stroke();
  y += 10;
  doc.fillColor(INK).fontSize(9).text("Terms & Conditions", left, y);
  y += 12;
  doc
    .fillColor(LABEL)
    .fontSize(8)
    .text(
      `Check-in from ${hotel.checkInTime || "14:00"} · Check-out by ${hotel.checkOutTime || "12:00"} · ` +
        `Cancellations subject to hotel policy · Rates quoted in ${currency} · ` +
        `Present this voucher or booking number on arrival · For changes contact ${hotel.email || ""} or ${hotel.phone || ""}.`,
      left,
      y,
      { width: contentW, lineGap: 1.5 }
    );

  doc.end();
  return done;
}
