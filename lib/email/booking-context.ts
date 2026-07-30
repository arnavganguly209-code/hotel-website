import type { Booking } from "@prisma/client";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import { DEFAULT_CURRENCY, DEFAULT_VAT_RATE, splitVatInclusive } from "@/lib/booking/vat";
import { getBookingPdfUrl, getHotelMailConfig } from "./config";
import type { BookingEmailContext } from "./template-service";

function isoDate(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function detectDevice(ua: string): string {
  const v = ua.toLowerCase();
  if (!v) return "—";
  if (/ipad|tablet/.test(v)) return "Tablet";
  if (/mobi|iphone|android/.test(v)) return "Mobile";
  return "Desktop";
}

function mealPlanLabel(breakfast: string): string {
  if (!breakfast || breakfast === "with-breakfast") return "Breakfast Included";
  if (breakfast === "room-only") return "Room Only";
  return breakfast.replace(/-/g, " ");
}

/**
 * Map a stored Booking row to email/PDF context.
 * Does NOT recalculate prices — uses persisted VAT-inclusive fields.
 */
export function bookingToEmailContext(
  booking: Booking,
  extras?: Partial<BookingEmailContext>
): BookingEmailContext {
  const hotel = getHotelMailConfig();
  const inclusive =
    Number(booking.grandTotal) > 0
      ? Number(booking.grandTotal)
      : Number(booking.displayPrice) > 0
        ? Number(booking.displayPrice)
        : Number(booking.totalAmount) || 0;

  const hasStored =
    Number(booking.basePrice) > 0 &&
    Number(booking.vatAmount) >= 0 &&
    Number(booking.grandTotal) > 0;

  const vat = hasStored
    ? {
        displayPrice: Number(booking.displayPrice) || inclusive,
        basePrice: Number(booking.basePrice),
        vatRate: Number(booking.vatRate) || DEFAULT_VAT_RATE,
        vatAmount: Number(booking.vatAmount),
        grandTotal: Number(booking.grandTotal) || inclusive,
        currency: booking.currency || DEFAULT_CURRENCY,
      }
    : splitVatInclusive(inclusive, DEFAULT_VAT_RATE, booking.currency || DEFAULT_CURRENCY);

  return {
    bookingId: booking.id,
    bookingNumber: formatBookingNumber(booking.id),
    bookingDate: booking.createdAt.toISOString().slice(0, 10),
    issueDate: new Date().toISOString().slice(0, 10),
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    reservationSource: booking.source || "online",
    guestName: booking.name,
    guestPhone: booking.phone || "",
    guestEmail: booking.email,
    guestCountry: booking.country || "",
    nationality: booking.country || "",
    passportNumber: "",
    roomName: booking.roomName,
    roomNumber: booking.roomNumber || "",
    checkIn: isoDate(booking.checkIn),
    checkOut: isoDate(booking.checkOut),
    nights: booking.nights,
    adults: booking.guests,
    children: booking.children,
    roomQuantity: booking.roomQuantity,
    mealPlan: mealPlanLabel(booking.breakfast || "with-breakfast"),
    specialRequests: booking.specialRequests || "",
    displayPrice: vat.displayPrice,
    basePrice: vat.basePrice,
    vatRate: vat.vatRate,
    vatAmount: vat.vatAmount,
    grandTotal: vat.grandTotal,
    currency: vat.currency,
    paymentMethod: booking.paymentMethod,
    bookingTime: booking.createdAt.toISOString(),
    voucherUrl: `${hotel.website}/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(booking.email)}`,
    pdfUrl: getBookingPdfUrl(booking.id, booking.email),
    ...extras,
    device: extras?.device || detectDevice(extras?.userAgent || ""),
  };
}
