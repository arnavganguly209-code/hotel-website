import { NextResponse } from "next/server";
import { isDatabaseAvailable, db } from "@/lib/db";
import { getContent } from "@/lib/cms/store";
import { assertBookingAvailability } from "@/lib/admin/availability";
import {
  bookingDatesAreValid,
  calculateExtraGuestBreakdown,
  calculateNights,
  roomFitsOccupancy,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { taxFieldsFromInclusiveTotal } from "@/lib/booking/tax-snapshot";
import { formatBookingNumber } from "@/lib/booking/booking-number";
import {
  createPrePaymentUi,
  getPacoConfig,
  isPacoConfigured,
  pacoLog,
} from "@/lib/payments/paco";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.info("[Bookings] Booking request received");

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      name: string;
      email: string;
      phone?: string;
      whatsapp?: string;
      countryCode?: string;
      country?: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      children?: number;
      roomQuantity?: number;
      roomSlug: string;
      roomName: string;
      breakfast?: string;
      specialRequests?: string;
      paymentMethod?: string;
      totalAmount?: number;
      nights?: number;
      promoCode?: string;
      arrivalTime?: string;
      flightNumber?: string;
      notes?: string;
      cardLast4?: string;
    };

    if (
      !body.name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || "") ||
      !body.phone?.trim() ||
      !body.country?.trim() ||
      !body.roomSlug ||
      !bookingDatesAreValid(body.checkIn, body.checkOut)
    ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    console.info("[Bookings] Booking validated", {
      email: body.email,
      roomSlug: body.roomSlug,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
    });

    const content = await getContent();
    const room = content.rooms.find(
      (candidate) =>
        candidate.id === body.roomSlug ||
        roomPublicSlug(candidate) === body.roomSlug
    );
    if (!room || room.available === false) {
      return NextResponse.json({ success: false, error: "This room is not available." }, { status: 400 });
    }
    if (body.paymentMethod !== "hotel" && body.paymentMethod !== "online") {
      return NextResponse.json({ success: false, error: "Select a valid payment method." }, { status: 400 });
    }
    if (body.paymentMethod === "online" && !isPacoConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Online payment is temporarily unavailable. Please choose Pay at Hotel or try again later.",
        },
        { status: 503 }
      );
    }

    const guests = Math.max(1, Math.min(20, Number(body.guests) || 1));
    const children = Math.max(0, Math.min(20, Number(body.children) || 0));
    const roomQuantity = Math.max(1, Math.min(20, Number(body.roomQuantity) || 1));
    if (!roomFitsOccupancy(room, guests, children, roomQuantity)) {
      return NextResponse.json(
        { success: false, error: "Guest count exceeds this room’s maximum occupancy." },
        { status: 400 }
      );
    }
    const breakfast = "with-breakfast";
    const nights = calculateNights(body.checkIn, body.checkOut);

    const availability = await assertBookingAvailability({
      roomSlug: roomPublicSlug(room),
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      roomQuantity,
    });
    if (!availability.ok) {
      return NextResponse.json({ success: false, error: availability.error }, { status: 400 });
    }

    const price = calculateExtraGuestBreakdown({
      room,
      adults: guests,
      children,
      nights,
      roomQuantity,
    });
    // Settlement currency is server-owned (default USD).
    // Use BOOKING_CURRENCY=NPR only for intentional NPR-site mode.
    // Do NOT read HBL_PACO_CURRENCY here — that env is a payment fallback and NPR UAT
    // scripts temporarily set it; coupling would silently convert USD bookings to NPR.
    const bookingCurrency =
      String(process.env.BOOKING_CURRENCY || "USD").trim().toUpperCase() === "NPR"
        ? "NPR"
        : "USD";
    const tax = taxFieldsFromInclusiveTotal(price.grandTotal, bookingCurrency);

    const slug = roomPublicSlug(room);
    const { findRoomIdBySlug } = await import("@/lib/cms/sync-rooms");
    const roomId = await findRoomIdBySlug(slug);

    const payOnline = body.paymentMethod === "online";

    const booking = await db.booking.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? "",
        whatsapp: body.whatsapp ?? "",
        countryCode: body.countryCode ?? "",
        country: body.country ?? "",
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        guests,
        children,
        roomQuantity,
        roomSlug: slug,
        roomName: room.name,
        breakfast,
        specialRequests: body.specialRequests ?? "",
        promoCode: body.promoCode ?? "",
        arrivalTime: body.arrivalTime ?? "",
        flightNumber: body.flightNumber ?? "",
        notes: body.notes ?? "",
        paymentMethod: body.paymentMethod,
        cardLast4: "",
        totalAmount: tax.totalAmount,
        displayPrice: tax.displayPrice,
        basePrice: tax.basePrice,
        vatRate: tax.vatRate,
        vatAmount: tax.vatAmount,
        grandTotal: tax.grandTotal,
        currency: tax.currency,
        nights,
        status: payOnline ? "payment_pending" : "pending",
        paymentStatus: payOnline ? "pending" : "pay_at_hotel",
        paymentGateway: payOnline ? "hbl_paco" : null,
        transactionId: null,
        roomId,
        source: "online",
      },
    });

    console.info("[Bookings] Booking saved to database", { bookingId: booking.id });

    const bookingNumber = formatBookingNumber(booking.id);
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ipAddress = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // Pay online → initiate HBL PACO and redirect (emails after paid callback)
    if (payOnline) {
      try {
        const paco = getPacoConfig();
        const base = paco.siteUrl;
        // Authoritative money: server-calculated tax snapshot only — never trust body.totalAmount.
        const paymentAmount = tax.grandTotal;
        const paymentCurrency = tax.currency;
        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
          throw new Error(`Invalid payment amount: ${paymentAmount}`);
        }
        if (paymentCurrency !== "USD" && paymentCurrency !== "NPR") {
          throw new Error(`Invalid payment currency: ${paymentCurrency}`);
        }
        // Ignore any client-supplied totalAmount / currency for gateway initiation.
        if (
          typeof body.totalAmount === "number" &&
          Math.round(body.totalAmount * 100) !== Math.round(paymentAmount * 100)
        ) {
          pacoLog("warn", "client_amount_ignored", {
            bookingId: booking.id,
            clientTotal: body.totalAmount,
            serverTotal: paymentAmount,
            currency: paymentCurrency,
          });
        }
        pacoLog("info", "payment_init_money", {
          bookingId: booking.id,
          requestedAmount: paymentAmount,
          requestedCurrency: paymentCurrency,
          clientTotalIgnored: body.totalAmount,
        });
        const payment = await createPrePaymentUi({
          amount: paymentAmount,
          currency: paymentCurrency,
          productDescription: `Hotel Thamel Park booking ${bookingNumber}`,
          bookingId: booking.id,
          bookingNumber,
          browserIp: ipAddress || "0.0.0.0",
          browserUserAgent: userAgent,
          successUrl: `${base}/api/payments/hbl/success`,
          failedUrl: `${base}/api/payments/hbl/failed`,
          cancelUrl: `${base}/api/payments/hbl/cancel`,
          backendUrl: `${base}/api/payments/hbl/callback`,
        });

        // Append orderNo to front-channel URLs if PACO does not inject it
        // (notification URLs already registered; we store orderNo for sync)
        await db.paymentTransaction.create({
          data: {
            bookingId: booking.id,
            gateway: "hbl_paco",
            orderNo: payment.orderNo,
            requestMessageId: payment.requestMessageId,
            amount: paymentAmount,
            currency: paymentCurrency,
            status: "redirected",
            paymentPageUrl: payment.paymentPageURL,
            rawRequest: payment.request as object,
            rawResponse: payment.rawResponse as object,
          },
        });

        await db.booking.update({
          where: { id: booking.id },
          data: { pacoOrderNo: payment.orderNo, transactionId: payment.orderNo },
        });

        pacoLog("info", "payment_redirect_ready", {
          bookingId: booking.id,
          orderNo: payment.orderNo,
          amount: paymentAmount,
          currency: paymentCurrency,
          transactionCurrency: payment.request.transactionAmount?.currencyCode,
          purchaseItemCurrency: payment.request.purchaseItems?.[0]?.purchaseItemPrice?.currencyCode,
        });

        const { pacoOrderCookieOptions } = await import("@/lib/payments/paco/order-resolve");
        const cookie = pacoOrderCookieOptions(payment.orderNo);
        const res = NextResponse.json({
          success: true,
          redirectUrl: payment.paymentPageURL,
          booking: {
            id: booking.id,
            bookingNumber,
            status: "payment_pending",
            paymentStatus: "pending",
            transactionId: payment.orderNo,
            pacoOrderNo: payment.orderNo,
            displayPrice: tax.displayPrice,
            basePrice: tax.basePrice,
            vatRate: tax.vatRate,
            vatAmount: tax.vatAmount,
            grandTotal: tax.grandTotal,
            currency: tax.currency,
          },
        });
        res.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
          path: cookie.path,
          maxAge: cookie.maxAge,
          secure: cookie.secure,
        });
        return res;
      } catch (err) {
        pacoLog("error", "payment_init_failed", {
          bookingId: booking.id,
          error: err instanceof Error ? err.message : String(err),
        });
        await db.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "failed", status: "payment_pending" },
        });
        return NextResponse.json(
          {
            success: false,
            error: "Unable to start online payment. Please try Pay at Hotel or contact the hotel.",
            bookingId: booking.id,
          },
          { status: 502 }
        );
      }
    }

    // Pay at hotel — existing email + confirmation path
    let emailResult = { guestSent: false, adminSent: false };
    try {
      console.info("[Bookings] Preparing booking emails", { bookingId: booking.id });
      const { sendRoomBookingEmails } = await import("@/lib/mail");
      emailResult = await sendRoomBookingEmails(
        {
          id: booking.id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          country: body.country,
          specialRequests: body.specialRequests ?? "",
          roomName: room.name,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          nights,
          adults: guests,
          children,
          roomQuantity,
          roomSubtotal: price.roomSubtotal,
          extraGuestCharge: price.total,
          displayPrice: tax.displayPrice,
          basePrice: tax.basePrice,
          vatRate: tax.vatRate,
          vatAmount: tax.vatAmount,
          grandTotal: tax.grandTotal,
          currency: tax.currency,
          paymentMethod: body.paymentMethod,
          bookingStatus: booking.status,
          paymentStatus: booking.paymentStatus,
          bookingDate: booking.createdAt.toISOString().slice(0, 10),
          bookingTime: booking.createdAt.toISOString(),
          ipAddress,
          userAgent,
          voucherUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ""}/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(body.email)}`,
        },
        "booking@hotelthamelpark.com"
      );
      console.info("[Bookings] Booking email workflow completed", {
        bookingId: booking.id,
        guestSent: emailResult.guestSent,
        adminSent: emailResult.adminSent,
      });
    } catch (err) {
      console.error(
        "[Bookings] email workflow crashed (booking still saved):",
        err instanceof Error ? err.stack || err.message : err
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        roomSubtotal: price.roomSubtotal,
        extraGuestCharge: price.total,
        displayPrice: tax.displayPrice,
        basePrice: tax.basePrice,
        vatRate: tax.vatRate,
        vatAmount: tax.vatAmount,
        grandTotal: tax.grandTotal,
        currency: tax.currency,
        voucherUrl: `/api/bookings/${booking.id}/voucher?email=${encodeURIComponent(body.email)}`,
        pdfUrl: `/api/bookings/${booking.id}/pdf?email=${encodeURIComponent(body.email)}&download=1`,
        email: emailResult,
      },
    });
  } catch (error) {
    console.error("[Bookings]", error);
    return NextResponse.json({ success: false, error: "Booking failed" }, { status: 500 });
  }
}
