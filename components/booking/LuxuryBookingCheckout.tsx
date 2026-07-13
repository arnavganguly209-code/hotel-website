"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { luxuryEase } from "@/lib/animations";
import {
  calculateBookingTotal,
  calculateNights,
  formatBookingDate,
} from "@/lib/booking/utils";
import type { BookingSearchParams, BreakfastOption, PaymentMethod } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface LuxuryBookingCheckoutProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
  search: BookingSearchParams;
}

export function LuxuryBookingCheckout({ room, booking, search }: LuxuryBookingCheckoutProps) {
  const router = useRouter();
  const nights = calculateNights(search.checkIn, search.checkOut);
  const roomQuantity = Number(search.rooms) || 1;

  const [breakfast, setBreakfast] = useState<BreakfastOption>("room-only");
  const [payment, setPayment] = useState<PaymentMethod>("hotel");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ id: number; transactionId: string | null } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const total = useMemo(
    () => calculateBookingTotal({ room, nights, roomQuantity, breakfast }),
    [room, nights, roomQuantity, breakfast]
  );

  const breakfastExtra = (room.breakfastPrice ?? 15) * nights * roomQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          country,
          specialRequests,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          guests: Number(search.guests) || 1,
          children: Number(search.children) || 0,
          roomQuantity,
          roomSlug: room.id,
          roomName: room.name,
          breakfast,
          paymentMethod: payment,
          totalAmount: total,
          nights,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Booking failed. Please try again.");
        return;
      }

      setConfirmed({
        id: data.booking.id,
        transactionId: data.booking.transactionId,
      });
      router.refresh();
    } catch {
      setError("Unable to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-[32px] border border-luxury-gold/25 bg-gradient-to-br from-white/95 to-luxury-sage/25 p-10 text-center shadow-luxury-lg md:p-14"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-luxury-gold/15 text-luxury-gold">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-luxury-forest">{booking.confirmationTitle}</h1>
        <p className="mt-4 text-sm leading-relaxed text-luxury-muted">{booking.confirmationMessage}</p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-luxury-gold">
          Booking Reference #{confirmed.id}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: luxuryEase }}
        className="rounded-[32px] border border-white/70 bg-gradient-to-br from-white/95 to-luxury-sage/20 p-8 shadow-luxury-lg md:p-10"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-luxury-gold">Guest Details</p>
        <h2 className="mt-2 font-display text-3xl text-luxury-forest">Complete Your Reservation</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" aria-label="Full Name" className="border-luxury-gold/15 bg-white/70" />
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" aria-label="Email" className="border-luxury-gold/15 bg-white/70" />
          <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" aria-label="Phone" className="border-luxury-gold/15 bg-white/70" />
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" aria-label="Country" className="border-luxury-gold/15 bg-white/70" />
        </div>

        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder={booking.specialRequestLabel}
          rows={4}
          aria-label={booking.specialRequestLabel}
          className="mt-4 w-full resize-none rounded-xl border border-luxury-gold/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-luxury-gold/40"
        />

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-luxury-gold">Payment</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(["online", "hotel"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPayment(option)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-500 ${
                payment === option
                  ? "bg-luxury-gold text-white shadow-luxury-gold"
                  : "border border-luxury-gold/30 bg-white/50 text-luxury-forest hover:border-luxury-gold/50"
              }`}
            >
              {option === "online" ? booking.payOnlineLabel : booking.payAtHotelLabel}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        <Button type="submit" variant="gold" size="lg" disabled={submitting} className="mt-8 w-full gap-2 uppercase tracking-[0.16em] sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {booking.submitLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.form>

      <motion.aside
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: luxuryEase }}
        className="space-y-6"
      >
        <div className="rounded-[28px] border border-luxury-gold/20 bg-luxury-green-dark p-8 text-white shadow-luxury-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-luxury-gold">Stay Summary</p>
          <h3 className="mt-2 font-display text-2xl">{room.name}</h3>
          <dl className="mt-6 space-y-3 text-sm text-white/80">
            <div className="flex justify-between gap-4"><dt>Check-in</dt><dd className="font-medium text-white">{formatBookingDate(search.checkIn)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Check-out</dt><dd className="font-medium text-white">{formatBookingDate(search.checkOut)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Nights</dt><dd className="font-medium text-white">{nights}</dd></div>
            <div className="flex justify-between gap-4"><dt>Guests</dt><dd className="font-medium text-white">{search.guests}</dd></div>
            <div className="flex justify-between gap-4"><dt>Rooms</dt><dd className="font-medium text-white">{roomQuantity}</dd></div>
          </dl>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-luxury-lg backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-luxury-gold">Breakfast</p>
          <p className="mt-2 text-sm text-luxury-muted">{booking.breakfastNote}</p>
          <div className="mt-5 grid gap-3">
            {([
              { id: "room-only" as const, label: booking.breakfastRoomOnlyLabel, extra: 0 },
              { id: "with-breakfast" as const, label: booking.breakfastWithLabel, extra: breakfastExtra },
            ]).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setBreakfast(option.id)}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-500 ${
                  breakfast === option.id
                    ? "border-luxury-gold bg-luxury-gold/10 shadow-luxury-gold"
                    : "border-luxury-gold/15 bg-white/50 hover:border-luxury-gold/35"
                }`}
              >
                <span className="font-medium text-luxury-forest">{option.label}</span>
                <span className="text-sm text-luxury-gold">
                  {option.extra > 0 ? `+$${option.extra}` : "Included"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-luxury-gold/15 pt-6">
            <div className="flex items-end justify-between">
              <span className="text-sm uppercase tracking-[0.16em] text-luxury-muted">Total</span>
              <span className="font-display text-4xl text-luxury-forest">${total}</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
