import {
  formatUsd,
  formatVatPercent,
  type VatInclusiveBreakdown,
} from "@/lib/booking/vat";

export type ReservationVoucherData = {
  bookingId: number;
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  logoUrl?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomQuantity: number;
  roomSubtotal: number;
  extraGuestCharge: number;
  vat: VatInclusiveBreakdown;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  specialRequests?: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Original A4 voucher — green logo (+15% size), QR removed. No layout redesign. */
export async function buildReservationVoucherHtml(
  data: ReservationVoucherData
): Promise<string> {
  const vatLabel = `VAT (${formatVatPercent(data.vat.vatRate)})`;
  const roomsBooked = Math.max(1, Math.trunc(Number(data.roomQuantity) || 1));
  const roomsLabel = roomsBooked === 1 ? "1 Room" : `${roomsBooked} Rooms`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Reservation #${data.bookingId} — ${esc(data.hotelName)}</title>
  <style>
    @page { size: A4; margin: 8mm 6mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Georgia, "Times New Roman", serif;
      color: #14352c;
      background: #f7f3ea;
    }
    .sheet {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      background: #fffdf8;
      border: 1px solid #d4af37;
      padding: 18px 12px 22px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 18px;
    }
    .brand h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .brand p { margin: 4px 0 0; font-size: 12px; color: #5a635c; }
    /* Original was 64×180 — +15% for green print logo */
    .logo {
      display: block;
      max-height: 74px;
      max-width: 207px;
      width: auto;
      height: auto;
      object-fit: contain;
      background: transparent;
      margin-bottom: 8px;
    }
    .meta { text-align: right; font-size: 12px; color: #5a635c; }
    .meta strong { display: block; color: #14352c; font-size: 14px; margin-bottom: 4px; }
    h2 {
      margin: 22px 0 10px;
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #c9a227;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 28px;
      font-size: 13px;
    }
    .grid .label { color: #6b7a73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
    .grid .value { margin-top: 2px; font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 13px;
    }
    th, td {
      padding: 10px 8px;
      border-bottom: 1px solid #e8dfc8;
      text-align: left;
    }
    th { color: #6b7a73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
    td.num, th.num { text-align: right; }
    .total-row td {
      border-bottom: none;
      padding-top: 14px;
      font-size: 15px;
      font-weight: 700;
      color: #14352c;
    }
    .note {
      margin-top: 18px;
      padding: 12px 14px;
      background: #f8f4eb;
      border: 1px solid #e5d7b4;
      font-size: 12px;
      color: #5a635c;
      line-height: 1.55;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #e5d7b4;
      padding-top: 16px;
    }
    .terms { font-size: 11px; color: #6b7a73; line-height: 1.5; }
    .actions { margin: 16px auto; text-align: center; }
    .actions button {
      background: #14352c;
      color: #d4af37;
      border: 0;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
    }
    @media print {
      body { background: white; }
      .sheet {
        border: 1px solid #d4af37;
        max-width: none;
        width: auto;
        padding: 12px 10px 16px;
      }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        ${data.logoUrl ? `<img class="logo" src="${esc(data.logoUrl)}" alt="${esc(data.hotelName)}" />` : ""}
        <h1>${esc(data.hotelName)}</h1>
        <p>${esc(data.hotelAddress)}</p>
        <p>${esc(data.hotelPhone)} · ${esc(data.hotelEmail)}</p>
      </div>
      <div class="meta">
        <strong>Reservation Voucher</strong>
        Booking No. <strong>#${data.bookingId}</strong><br/>
        Status: ${esc(data.bookingStatus)}<br/>
        Payment: ${esc(data.paymentStatus)} (${esc(data.paymentMethod)})
      </div>
    </div>

    <h2>Guest Information</h2>
    <div class="grid">
      <div><div class="label">Guest Name</div><div class="value">${esc(data.guestName)}</div></div>
      <div><div class="label">Email</div><div class="value">${esc(data.guestEmail)}</div></div>
      <div><div class="label">Phone</div><div class="value">${esc(data.guestPhone || "—")}</div></div>
      <div><div class="label">Country</div><div class="value">${esc(data.guestCountry || "—")}</div></div>
    </div>

    <h2>Stay Information</h2>
    <div class="grid">
      <div><div class="label">Room Type</div><div class="value">${esc(data.roomName)}</div></div>
      <div><div class="label">Rooms</div><div class="value">${esc(roomsLabel)}</div></div>
      <div><div class="label">Check-in</div><div class="value">${esc(data.checkIn)}</div></div>
      <div><div class="label">Check-out</div><div class="value">${esc(data.checkOut)}</div></div>
      <div><div class="label">Nights</div><div class="value">${data.nights}</div></div>
      <div><div class="label">Guests</div><div class="value">${data.adults} adult(s), ${data.children} child(ren)</div></div>
    </div>

    <h2>Tax Breakdown (VAT Inclusive Pricing)</h2>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="num">Amount (${esc(data.vat.currency)})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Room Rate (VAT Included)</td>
          <td class="num">${formatUsd(data.vat.displayPrice)}</td>
        </tr>
        <tr>
          <td>Room Charge (Excl. VAT)</td>
          <td class="num">${formatUsd(data.vat.basePrice)}</td>
        </tr>
        <tr>
          <td>${esc(vatLabel)}</td>
          <td class="num">${formatUsd(data.vat.vatAmount)}</td>
        </tr>
        ${
          data.extraGuestCharge > 0
            ? `<tr><td>Extra Guest Charge (incl. in total above)</td><td class="num">${formatUsd(data.extraGuestCharge)}</td></tr>`
            : ""
        }
        <tr class="total-row">
          <td>Grand Total (VAT Included)</td>
          <td class="num">${formatUsd(data.vat.grandTotal)} ${esc(data.vat.currency)}</td>
        </tr>
      </tbody>
    </table>

    <div class="note">
      Website room rates are <strong>VAT inclusive</strong>. The amount above is the final payable total —
      VAT is shown for accounting only and is <strong>not added again</strong>.
      ${data.specialRequests ? `<br/><br/><strong>Special requests:</strong> ${esc(data.specialRequests)}` : ""}
    </div>

    <div class="footer">
      <div class="terms">
        <strong>Terms &amp; Conditions</strong><br/>
        Check-in from 14:00 · Check-out by 12:00 · Cancellations subject to hotel policy ·
        Rates quoted in ${esc(data.vat.currency)} · Present this voucher or booking number on arrival ·
        For changes contact ${esc(data.hotelEmail)} or ${esc(data.hotelPhone)}.
      </div>
    </div>
  </div>
</body>
</html>`;
}
