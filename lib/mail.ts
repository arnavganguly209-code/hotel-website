import nodemailer from "nodemailer";

export type EnquiryMailPayload = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  bookingType: string;
  message: string;
  arrivalDate?: string | null;
  departureDate?: string | null;
};

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** Sends guest confirmation + admin notification. No-ops gracefully if SMTP is unset. */
export async function sendContactEnquiryEmails(
  payload: EnquiryMailPayload,
  adminEmail: string
): Promise<{ guestSent: boolean; adminSent: boolean }> {
  if (!smtpConfigured()) {
    console.info("[mail] SMTP not configured — enquiry stored without email send.", payload.id);
    return { guestSent: false, adminSent: false };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hotelthamelpark.com";
  const hotelName = "Hotel Thamel Park";
  const transport = createTransport();
  let guestSent = false;
  let adminSent = false;

  try {
    await transport.sendMail({
      from,
      to: payload.email,
      subject: `We received your enquiry — ${hotelName}`,
      text: [
        `Dear ${payload.fullName},`,
        "",
        `Thank you for contacting ${hotelName}.`,
        `We have received your ${payload.bookingType} enquiry (reference #${payload.id}).`,
        "Our concierge team will respond shortly.",
        "",
        "Warm regards,",
        hotelName,
      ].join("\n"),
      html: `<p>Dear ${payload.fullName},</p>
<p>Thank you for contacting <strong>${hotelName}</strong>.</p>
<p>We have received your <strong>${payload.bookingType}</strong> enquiry (reference #${payload.id}). Our concierge team will respond shortly.</p>
<p>Warm regards,<br/>${hotelName}</p>`,
    });
    guestSent = true;
  } catch (err) {
    console.error("[mail] Guest confirmation failed:", err);
  }

  if (adminEmail) {
    try {
      await transport.sendMail({
        from,
        to: adminEmail,
        subject: `New contact enquiry #${payload.id} — ${payload.bookingType}`,
        text: [
          `New enquiry from ${payload.fullName}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Type: ${payload.bookingType}`,
          `Arrival: ${payload.arrivalDate || "—"}`,
          `Departure: ${payload.departureDate || "—"}`,
          "",
          payload.message || "(no message)",
        ].join("\n"),
        html: `<h2>New Contact Enquiry #${payload.id}</h2>
<p><strong>Name:</strong> ${payload.fullName}<br/>
<strong>Email:</strong> ${payload.email}<br/>
<strong>Phone:</strong> ${payload.phone}<br/>
<strong>Type:</strong> ${payload.bookingType}<br/>
<strong>Arrival:</strong> ${payload.arrivalDate || "—"}<br/>
<strong>Departure:</strong> ${payload.departureDate || "—"}</p>
<p>${(payload.message || "").replace(/\n/g, "<br/>")}</p>`,
      });
      adminSent = true;
    } catch (err) {
      console.error("[mail] Admin notification failed:", err);
    }
  }

  return { guestSent, adminSent };
}

export type DiningReservationMailPayload = {
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  restaurant: string;
  reservationDate?: string | null;
  reservationTime: string;
  adults: number;
  children: number;
  specialOccasion: string;
  specialRequest: string;
};

/** Sends guest confirmation + admin notification for dining reservations. */
export async function sendDiningReservationEmails(
  payload: DiningReservationMailPayload,
  adminEmail: string
): Promise<{ guestSent: boolean; adminSent: boolean }> {
  if (!smtpConfigured()) {
    console.info(
      "[mail] SMTP not configured — dining reservation stored without email send.",
      payload.referenceNumber
    );
    return { guestSent: false, adminSent: false };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hotelthamelpark.com";
  const hotelName = "Hotel Thamel Park";
  const transport = createTransport();
  let guestSent = false;
  let adminSent = false;

  try {
    await transport.sendMail({
      from,
      to: payload.email,
      subject: `Table reservation confirmed — ${hotelName}`,
      text: [
        `Dear ${payload.fullName},`,
        "",
        `Thank you for choosing ${hotelName}.`,
        `Your table reservation at ${payload.restaurant} has been received.`,
        `Reference: ${payload.referenceNumber}`,
        `Date: ${payload.reservationDate || "—"}`,
        `Time: ${payload.reservationTime || "—"}`,
        `Party: ${payload.adults} adult(s), ${payload.children} child(ren)`,
        payload.specialOccasion ? `Occasion: ${payload.specialOccasion}` : "",
        "",
        "Our dining team will confirm your reservation shortly.",
        "",
        "Warm regards,",
        hotelName,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `<p>Dear ${payload.fullName},</p>
<p>Thank you for choosing <strong>${hotelName}</strong>.</p>
<p>Your table reservation at <strong>${payload.restaurant}</strong> has been received.</p>
<p><strong>Reference:</strong> ${payload.referenceNumber}<br/>
<strong>Date:</strong> ${payload.reservationDate || "—"}<br/>
<strong>Time:</strong> ${payload.reservationTime || "—"}<br/>
<strong>Party:</strong> ${payload.adults} adult(s), ${payload.children} child(ren)${payload.specialOccasion ? `<br/><strong>Occasion:</strong> ${payload.specialOccasion}` : ""}</p>
<p>Our dining team will confirm your reservation shortly.</p>
<p>Warm regards,<br/>${hotelName}</p>`,
    });
    guestSent = true;
  } catch (err) {
    console.error("[mail] Guest dining confirmation failed:", err);
  }

  if (adminEmail) {
    try {
      await transport.sendMail({
        from,
        to: adminEmail,
        subject: `New dining reservation ${payload.referenceNumber}`,
        text: [
          `New dining reservation ${payload.referenceNumber}`,
          `Guest: ${payload.fullName}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Country: ${payload.country || "—"}`,
          `Restaurant: ${payload.restaurant}`,
          `Date: ${payload.reservationDate || "—"}`,
          `Time: ${payload.reservationTime || "—"}`,
          `Adults: ${payload.adults}`,
          `Children: ${payload.children}`,
          `Occasion: ${payload.specialOccasion || "—"}`,
          "",
          payload.specialRequest || "(no special request)",
        ].join("\n"),
        html: `<h2>New Dining Reservation ${payload.referenceNumber}</h2>
<p><strong>Guest:</strong> ${payload.fullName}<br/>
<strong>Email:</strong> ${payload.email}<br/>
<strong>Phone:</strong> ${payload.phone}<br/>
<strong>Country:</strong> ${payload.country || "—"}<br/>
<strong>Restaurant:</strong> ${payload.restaurant}<br/>
<strong>Date:</strong> ${payload.reservationDate || "—"}<br/>
<strong>Time:</strong> ${payload.reservationTime || "—"}<br/>
<strong>Adults:</strong> ${payload.adults}<br/>
<strong>Children:</strong> ${payload.children}<br/>
<strong>Occasion:</strong> ${payload.specialOccasion || "—"}</p>
<p>${(payload.specialRequest || "").replace(/\n/g, "<br/>")}</p>`,
      });
      adminSent = true;
    } catch (err) {
      console.error("[mail] Admin dining notification failed:", err);
    }
  }

  return { guestSent, adminSent };
}

export type RoomBookingMailPayload = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomQuantity: number;
  roomSubtotal: number;
  extraGuestCharge: number;
  displayPrice: number;
  basePrice: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  paymentMethod?: string;
  voucherUrl?: string;
};

/** Guest + admin emails for room bookings, including VAT-inclusive tax breakdown. */
export async function sendRoomBookingEmails(
  payload: RoomBookingMailPayload,
  adminEmail: string
): Promise<{ guestSent: boolean; adminSent: boolean }> {
  if (!smtpConfigured()) {
    console.info("[mail] SMTP not configured — room booking stored without email send.", payload.id);
    return { guestSent: false, adminSent: false };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hotelthamelpark.com";
  const hotelName = "Hotel Thamel Park";
  const transport = createTransport();
  let guestSent = false;
  let adminSent = false;
  const currency = payload.currency || "USD";
  const vatPct = `${Math.round((payload.vatRate || 0.13) * 100)}%`;

  const breakdownText = [
    `Room Rate (VAT Included): $${payload.displayPrice.toFixed(2)}`,
    "",
    "Tax Breakdown",
    `Room Charge (Excl. VAT): $${payload.basePrice.toFixed(2)}`,
    `VAT (${vatPct}): $${payload.vatAmount.toFixed(2)}`,
    `Grand Total: $${payload.grandTotal.toFixed(2)} ${currency}`,
  ].join("\n");

  const breakdownHtml = `<p><strong>Room Rate (VAT Included):</strong> $${payload.displayPrice.toFixed(2)}</p>
<p style="margin-top:12px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#a47e3e;"><strong>Tax Breakdown</strong></p>
<p><strong>Room Charge (Excl. VAT):</strong> $${payload.basePrice.toFixed(2)}<br/>
<strong>VAT (${vatPct}):</strong> $${payload.vatAmount.toFixed(2)}<br/>
<strong>Grand Total:</strong> $${payload.grandTotal.toFixed(2)} ${currency}</p>
<p style="font-size:12px;color:#5a635c;">Website rates are VAT inclusive — VAT is not added again.</p>`;

  try {
    await transport.sendMail({
      from,
      to: payload.email,
      subject: `Booking request received #${payload.id} — ${hotelName}`,
      text: [
        `Dear ${payload.name},`,
        "",
        `Thank you for choosing ${hotelName}.`,
        `We have received your booking request (reference #${payload.id}).`,
        "",
        `Room: ${payload.roomName}`,
        `Check-in: ${payload.checkIn}`,
        `Check-out: ${payload.checkOut}`,
        `Nights: ${payload.nights}`,
        `Guests: ${payload.adults} adult(s), ${payload.children} child(ren)`,
        `Rooms: ${payload.roomQuantity}`,
        "",
        breakdownText,
        payload.voucherUrl ? `\nReservation voucher: ${payload.voucherUrl}` : "",
        "",
        "Our reservations team will confirm availability shortly.",
        "",
        "Warm regards,",
        hotelName,
      ].join("\n"),
      html: `<p>Dear ${payload.name},</p>
<p>Thank you for choosing <strong>${hotelName}</strong>.</p>
<p>We have received your booking request (reference <strong>#${payload.id}</strong>).</p>
<p><strong>Room:</strong> ${payload.roomName}<br/>
<strong>Check-in:</strong> ${payload.checkIn}<br/>
<strong>Check-out:</strong> ${payload.checkOut}<br/>
<strong>Nights:</strong> ${payload.nights}<br/>
<strong>Guests:</strong> ${payload.adults} adult(s), ${payload.children} child(ren)<br/>
<strong>Rooms:</strong> ${payload.roomQuantity}</p>
${breakdownHtml}
${payload.voucherUrl ? `<p><a href="${payload.voucherUrl}">View / print reservation voucher</a></p>` : ""}
<p>Our reservations team will confirm availability shortly.</p>
<p>Warm regards,<br/>${hotelName}</p>`,
    });
    guestSent = true;
  } catch (err) {
    console.error("[mail] Guest room booking confirmation failed:", err);
  }

  if (adminEmail) {
    try {
      await transport.sendMail({
        from,
        to: adminEmail,
        subject: `New room booking #${payload.id} — ${payload.roomName}`,
        text: [
          `New room booking #${payload.id}`,
          `Guest: ${payload.name}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone || "—"}`,
          `Room: ${payload.roomName}`,
          `Check-in: ${payload.checkIn}`,
          `Check-out: ${payload.checkOut}`,
          `Nights: ${payload.nights}`,
          `Guests: ${payload.adults} adults / ${payload.children} children`,
          `Rooms: ${payload.roomQuantity}`,
          `Payment: ${payload.paymentMethod || "—"}`,
          "",
          breakdownText,
        ].join("\n"),
        html: `<h2>New Room Booking #${payload.id}</h2>
<p><strong>Guest:</strong> ${payload.name}<br/>
<strong>Email:</strong> ${payload.email}<br/>
<strong>Phone:</strong> ${payload.phone || "—"}<br/>
<strong>Room:</strong> ${payload.roomName}<br/>
<strong>Check-in:</strong> ${payload.checkIn}<br/>
<strong>Check-out:</strong> ${payload.checkOut}<br/>
<strong>Nights:</strong> ${payload.nights}<br/>
<strong>Guests:</strong> ${payload.adults} adults / ${payload.children} children<br/>
<strong>Rooms:</strong> ${payload.roomQuantity}<br/>
<strong>Payment:</strong> ${payload.paymentMethod || "—"}</p>
${breakdownHtml}`,
      });
      adminSent = true;
    } catch (err) {
      console.error("[mail] Admin room booking notification failed:", err);
    }
  }

  return { guestSent, adminSent };
}
