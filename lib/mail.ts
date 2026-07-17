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
