import { db, isDatabaseAvailable } from "@/lib/db";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import {
  EMAIL_TEMPLATES,
  getBookingNotifyEmail,
  getBookingPdfUrl,
  type EmailTemplateId,
} from "./config";
import { emailService } from "./email-service";
import { bookingToEmailContext } from "./booking-context";
import type { BookingEmailContext } from "./template-service";
import type { RoomBookingMailPayload } from "@/lib/mail";

/**
 * Bridge from legacy mail payload + automatic lifecycle emails.
 * Never mutates booking totals / inventory.
 */
export async function sendBookingLifecycleEmail(
  bookingId: number,
  template: EmailTemplateId,
  extras?: Partial<BookingEmailContext>
) {
  if (!isDatabaseAvailable()) {
    return { ok: false as const, error: "Database not configured" };
  }
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false as const, error: "Booking not found" };
  const ctx = bookingToEmailContext(booking, extras);
  return emailService.sendBookingEmail({
    template,
    ctx,
    to: booking.email,
    attachPdf: true,
  });
}

/** Called after a new online booking is stored (email module only). */
export async function notifyNewRoomBooking(
  payload: RoomBookingMailPayload & {
    country?: string;
    specialRequests?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    bookingDate?: string;
    bookingTime?: string;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  console.info("[email] notifyNewRoomBooking start", {
    bookingId: payload.id,
    guestEmail: payload.email,
  });

  const ctx: BookingEmailContext = {
    bookingId: payload.id,
    bookingNumber: formatBookingNumber(payload.id),
    bookingDate: payload.bookingDate || new Date().toISOString().slice(0, 10),
    issueDate: new Date().toISOString().slice(0, 10),
    bookingStatus: payload.bookingStatus || "pending",
    paymentStatus: payload.paymentStatus || "unpaid",
    reservationSource: "online",
    guestName: payload.name,
    guestPhone: payload.phone || "",
    guestEmail: payload.email,
    guestCountry: payload.country || "",
    nationality: payload.country || "",
    roomName: payload.roomName,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    nights: payload.nights,
    adults: payload.adults,
    children: payload.children,
    roomQuantity: payload.roomQuantity,
    mealPlan: "Breakfast Included",
    specialRequests: payload.specialRequests || "",
    displayPrice: payload.displayPrice,
    basePrice: payload.basePrice,
    vatRate: payload.vatRate,
    vatAmount: payload.vatAmount,
    grandTotal: payload.grandTotal,
    currency: payload.currency,
    paymentMethod: payload.paymentMethod,
    bookingTime: payload.bookingTime || new Date().toISOString(),
    ipAddress: payload.ipAddress,
    userAgent: payload.userAgent,
    device: (() => {
      const v = (payload.userAgent || "").toLowerCase();
      if (!v) return "—";
      if (/ipad|tablet/.test(v)) return "Tablet";
      if (/mobi|iphone|android/.test(v)) return "Mobile";
      return "Desktop";
    })(),
    voucherUrl: payload.voucherUrl,
    pdfUrl: getBookingPdfUrl(payload.id, payload.email),
  };

  try {
    const guestTemplate =
      (payload.bookingStatus || "").toLowerCase() === "confirmed"
        ? EMAIL_TEMPLATES.BOOKING_CONFIRMED
        : EMAIL_TEMPLATES.BOOKING_CONFIRMATION;

    const guest = await emailService.sendBookingEmail({
      template: guestTemplate,
      ctx,
      to: ctx.guestEmail,
      attachPdf: true,
    });
    const hotel = await emailService.sendBookingEmail({
      template: EMAIL_TEMPLATES.HOTEL_NEW_BOOKING,
      ctx,
      to: getBookingNotifyEmail(),
      attachPdf: true,
    });
    const result = { guest, hotel };
    console.info("[email] notifyNewRoomBooking done", {
      bookingId: payload.id,
      guestOk: result.guest.ok,
      hotelOk: result.hotel.ok,
      guestError: result.guest.error,
      hotelError: result.hotel.error,
    });
    return result;
  } catch (err) {
    console.error(
      "[email] notifyNewRoomBooking crashed:",
      err instanceof Error ? err.stack || err.message : err
    );
    throw err;
  }
}

/**
 * Trigger lifecycle email from booking/payment status transitions.
 * Admin /admin changes always notify the guest when status or payment changes.
 */
export async function notifyBookingStatusChange(opts: {
  bookingId: number;
  previousStatus?: string;
  nextStatus?: string;
  previousPaymentStatus?: string;
  nextPaymentStatus?: string;
  forceModified?: boolean;
}) {
  const {
    bookingId,
    previousStatus,
    nextStatus,
    previousPaymentStatus,
    nextPaymentStatus,
    forceModified,
  } = opts;

  let sent = false;

  if (nextStatus && nextStatus !== previousStatus) {
    if (nextStatus === "pending") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_PENDING);
      sent = true;
    } else if (nextStatus === "confirmed") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_CONFIRMED);
      sent = true;
    } else if (nextStatus === "cancelled" || nextStatus === "refunded") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_CANCELLED);
      sent = true;
    } else if (nextStatus === "checked_out") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.CHECKOUT_THANKYOU);
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.REVIEW_REQUEST);
      sent = true;
    } else if (nextStatus === "checked_in" || nextStatus === "modified") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_MODIFIED);
      sent = true;
    }
  }

  if (
    nextPaymentStatus &&
    nextPaymentStatus !== previousPaymentStatus &&
    ["paid", "offline"].includes(nextPaymentStatus)
  ) {
    await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.PAYMENT_RECEIVED);
    // Online / paid payment also confirms the booking email if status wasn't already handled.
    if (!sent && nextStatus !== "confirmed" && previousStatus !== "confirmed") {
      const booking = isDatabaseAvailable()
        ? await db.booking.findUnique({ where: { id: bookingId } })
        : null;
      if (booking?.status === "confirmed") {
        await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_CONFIRMED);
        sent = true;
      }
    }
    sent = true;
  }

  // Any other admin change (remarks, etc.) still notifies the guest.
  if (!sent && forceModified) {
    await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_MODIFIED);
  }
}

/** Daily helper: check-in reminders for tomorrow's arrivals. */
export async function sendCheckinRemindersForDate(dayIso: string) {
  if (!isDatabaseAvailable()) return { sent: 0 };
  const start = new Date(`${dayIso}T00:00:00.000Z`);
  const end = new Date(`${dayIso}T23:59:59.999Z`);
  const bookings = await db.booking.findMany({
    where: {
      checkIn: { gte: start, lte: end },
      status: { in: ["confirmed", "pending", "payment_pending"] },
    },
  });
  let sent = 0;
  for (const booking of bookings) {
    const result = await sendBookingLifecycleEmail(booking.id, EMAIL_TEMPLATES.CHECKIN_REMINDER);
    if (result.ok) sent += 1;
  }
  return { sent };
}

export { EMAIL_TEMPLATES };
