import { db, isDatabaseAvailable } from "@/lib/db";
import { EMAIL_TEMPLATES, getBookingPdfUrl, type EmailTemplateId } from "./config";
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
    const result = await emailService.sendNewBookingPair(ctx);
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
 * Safe no-op when statuses unchanged.
 */
export async function notifyBookingStatusChange(opts: {
  bookingId: number;
  previousStatus?: string;
  nextStatus?: string;
  previousPaymentStatus?: string;
  nextPaymentStatus?: string;
}) {
  const { bookingId, previousStatus, nextStatus, previousPaymentStatus, nextPaymentStatus } =
    opts;

  if (nextStatus && nextStatus !== previousStatus) {
    if (nextStatus === "pending") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_PENDING);
    } else if (nextStatus === "confirmed") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_CONFIRMED);
    } else if (nextStatus === "cancelled" || nextStatus === "refunded") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.BOOKING_CANCELLED);
    } else if (nextStatus === "checked_out") {
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.CHECKOUT_THANKYOU);
      // Follow-up review request (queued separately)
      await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.REVIEW_REQUEST);
    }
  }

  if (
    nextPaymentStatus &&
    nextPaymentStatus !== previousPaymentStatus &&
    ["paid", "offline"].includes(nextPaymentStatus)
  ) {
    await sendBookingLifecycleEmail(bookingId, EMAIL_TEMPLATES.PAYMENT_RECEIVED);
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
