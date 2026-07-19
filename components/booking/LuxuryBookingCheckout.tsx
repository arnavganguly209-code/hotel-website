"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bookingDatesAreValid,
  calculateBookingTotal,
  calculateNights,
  formatBookingDate,
  roomOnlyNightlyPrice,
  roomPublicSlug,
} from "@/lib/booking/utils";
import type { BookingSearchParams, BreakfastOption, PaymentMethod } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface LuxuryBookingCheckoutProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
  search: BookingSearchParams;
}

const fieldClass = "w-full rounded-xl border border-[#d7c49d]/55 bg-white/80 px-4 py-3.5 text-sm text-[#173a2b] outline-none transition placeholder:text-[#8a938e] focus:border-[#af8744] focus:ring-2 focus:ring-[#af8744]/10";

export function LuxuryBookingCheckout({ room, booking, search }: LuxuryBookingCheckoutProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ id: number } | null>(null);
  const [stay, setStay] = useState({
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    adults: search.guests || "2",
    children: search.children || "0",
    rooms: search.rooms || "1",
  });
  const [breakfast, setBreakfast] = useState<BreakfastOption>(search.breakfast || "with-breakfast");
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "", phone: "", whatsapp: "", countryCode: "+977", country: "" });
  const [request, setRequest] = useState({ promoCode: "", arrivalTime: "", flightNumber: "", notes: "" });
  const [payment, setPayment] = useState<PaymentMethod>("hotel");
  const [card, setCard] = useState({ holder: "", number: "", expiry: "", cvv: "" });
  const nights = calculateNights(stay.checkIn, stay.checkOut);
  const roomQuantity = Math.max(1, Number(stay.rooms) || 1);
  const total = useMemo(() => calculateBookingTotal({ room, nights, roomQuantity, breakfast }), [room, nights, roomQuantity, breakfast]);

  const validateStep = () => {
    if (step === 1 && !bookingDatesAreValid(stay.checkIn, stay.checkOut)) return "Choose valid future check-in and check-out dates.";
    if (step === 2 && (!guest.firstName.trim() || !guest.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email) || !guest.phone.trim() || !guest.country.trim())) return "Complete all required guest details with a valid email address.";
    if (step === 4 && payment === "online" && (!card.holder.trim() || card.number.replace(/\D/g, "").length < 13 || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvv))) return "Complete the card preview fields using valid formatting.";
    return null;
  };

  const next = () => {
    const message = validateStep();
    if (message) return setError(message);
    setError(null);
    setStep((value) => Math.min(4, value + 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = validateStep();
    if (message) return setError(message);
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${guest.firstName.trim()} ${guest.lastName.trim()}`,
          ...guest,
          ...request,
          specialRequests: request.notes,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          guests: Number(stay.adults) || 1,
          children: Number(stay.children) || 0,
          roomQuantity,
          roomSlug: roomPublicSlug(room),
          roomName: room.name,
          breakfast,
          paymentMethod: payment,
          totalAmount: total,
          nights,
          cardLast4: payment === "online" ? card.number.replace(/\D/g, "").slice(-4) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Booking failed. Please try again.");
      setConfirmed({ id: data.booking.id });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl overflow-hidden rounded-[32px] border border-[#d4b676]/35 bg-white/92 text-center shadow-[0_30px_90px_rgba(17,54,37,0.16)]">
        <div className="bg-[#153a2a] px-8 py-10 text-white">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d9bb7c]/40 bg-[#d9bb7c]/15 text-[#e2c88f]"><Check className="h-10 w-10" /></motion.div>
          <h1 className="mt-6 font-display text-4xl">Thank you for choosing Hotel Thamel Park.</h1>
        </div>
        <div className="space-y-4 px-8 py-10 text-sm leading-7 text-[#657169] sm:px-14">
          <p>Your booking request has been received successfully.</p>
          <p>Our reservation team will contact you shortly.</p>
          <p>For booking changes please contact:</p>
          <a href="mailto:info@hotelthamelpark.com" className="font-semibold text-[#9e7738] underline underline-offset-4">info@hotelthamelpark.com</a>
          <p className="pt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#a27b3c]">Booking Reference #{confirmed.id}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <form onSubmit={handleSubmit} className="min-w-0 rounded-[30px] border border-[#d4bc8e]/30 bg-white/88 p-5 shadow-[0_25px_70px_rgba(20,55,40,0.11)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="grid grid-cols-4 gap-2">
          {["Stay", "Guest", "Requests", "Payment"].map((label, index) => {
            const number = index + 1;
            return <div key={label} className="text-center"><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${number <= step ? "bg-[#173a2b] text-white" : "bg-[#eee8dc] text-[#7b847e]"}`}>{number < step ? <Check className="h-4 w-4" /> : number}</div><p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-[#6f7973]">{label}</p></div>;
          })}
        </div>

        <div className="my-8 h-px bg-[#d8c49e]/35" />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }}>
            {step === 1 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 1</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Choose your stay</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#4f5f56]">Check In<input required type="date" value={stay.checkIn} onChange={(e) => setStay({ ...stay, checkIn: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Check Out<input required type="date" value={stay.checkOut} onChange={(e) => setStay({ ...stay, checkOut: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Adults<input required type="number" min="1" max="8" value={stay.adults} onChange={(e) => setStay({ ...stay, adults: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Children<input type="number" min="0" max="6" value={stay.children} onChange={(e) => setStay({ ...stay, children: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[{ id: "with-breakfast" as const, label: "Breakfast Included", price: room.price }, { id: "room-only" as const, label: "Without Breakfast", price: roomOnlyNightlyPrice(room) }].map((option) => <button key={option.id} type="button" onClick={() => setBreakfast(option.id)} className={`flex justify-between rounded-2xl border p-4 text-left text-sm ${breakfast === option.id ? "border-[#ae8645] bg-[#f5edde] text-[#173a2b]" : "border-[#d7c49d]/50 text-[#68736d]"}`}><span>{option.label}</span><strong>${option.price}</strong></button>)}
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 2</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Guest details</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <input required placeholder="First Name *" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} className={fieldClass} />
                  <input required placeholder="Last Name *" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} className={fieldClass} />
                  <input required type="email" placeholder="Email *" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className={fieldClass} />
                  <div className="grid grid-cols-[95px_1fr] gap-2"><input placeholder="+977" value={guest.countryCode} onChange={(e) => setGuest({ ...guest, countryCode: e.target.value })} className={fieldClass} /><input required placeholder="Phone *" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className={fieldClass} /></div>
                  <input placeholder="WhatsApp" value={guest.whatsapp} onChange={(e) => setGuest({ ...guest, whatsapp: e.target.value })} className={fieldClass} />
                  <input required placeholder="Country *" value={guest.country} onChange={(e) => setGuest({ ...guest, country: e.target.value })} className={fieldClass} />
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 3</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Special requests</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <input placeholder="Promo Code" value={request.promoCode} onChange={(e) => setRequest({ ...request, promoCode: e.target.value })} className={fieldClass} />
                  <input type="time" aria-label="Arrival Time" value={request.arrivalTime} onChange={(e) => setRequest({ ...request, arrivalTime: e.target.value })} className={fieldClass} />
                  <input placeholder="Flight Number" value={request.flightNumber} onChange={(e) => setRequest({ ...request, flightNumber: e.target.value })} className={`${fieldClass} sm:col-span-2`} />
                  <textarea rows={5} placeholder="Notes or special requests" value={request.notes} onChange={(e) => setRequest({ ...request, notes: e.target.value })} className={`${fieldClass} resize-none sm:col-span-2`} />
                </div>
              </div>
            ) : null}
            {step === 4 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 4</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Payment option</h2>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {(["hotel", "online"] as const).map((option) => <button key={option} type="button" onClick={() => setPayment(option)} className={`rounded-2xl border p-5 text-left ${payment === option ? "border-[#ae8645] bg-[#f5edde]" : "border-[#d7c49d]/50 bg-white"}`}><CreditCard className="h-5 w-5 text-[#ad8746]" /><p className="mt-3 text-sm font-semibold uppercase tracking-wider text-[#173a2b]">{option === "hotel" ? booking.payAtHotelLabel : booking.payOnlineLabel}</p></button>)}
                </div>
                {payment === "online" ? <div className="mt-5 rounded-2xl border border-[#d7c49d]/45 bg-[#f8f4eb] p-5"><p className="mb-4 text-xs text-[#68736d]">Card UI preview only — no payment will be processed or card data stored.</p><div className="grid gap-4 sm:grid-cols-2"><input placeholder="Card Holder Name" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} className={`${fieldClass} sm:col-span-2`} /><input inputMode="numeric" autoComplete="cc-number" placeholder="Card Number" maxLength={19} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "") })} className={`${fieldClass} sm:col-span-2`} /><input autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} className={fieldClass} /><input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} className={fieldClass} /></div></div> : <p className="mt-5 rounded-2xl bg-[#f5edde] p-4 text-sm leading-6 text-[#68736d]">Your reservation team will confirm the booking. Payment can be completed at the hotel.</p>}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" disabled={step === 1 || submitting} onClick={() => { setError(null); setStep((value) => Math.max(1, value - 1)); }} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          {step < 4 ? <Button type="button" variant="gold" onClick={next} className="gap-2">Continue <ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" variant="gold" disabled={submitting} className="gap-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{booking.submitLabel}<ArrowRight className="h-4 w-4" /></Button>}
        </div>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[28px] bg-[#153a2a] p-7 text-white shadow-[0_24px_70px_rgba(17,52,36,0.20)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d9bb7c]">Stay summary</p>
          <h3 className="mt-3 font-display text-2xl">{room.name}</h3>
          <dl className="mt-6 space-y-3 text-sm text-white/72"><div className="flex justify-between gap-3"><dt>Check-in</dt><dd className="text-right text-white">{formatBookingDate(stay.checkIn)}</dd></div><div className="flex justify-between gap-3"><dt>Check-out</dt><dd className="text-right text-white">{formatBookingDate(stay.checkOut)}</dd></div><div className="flex justify-between"><dt>Nights</dt><dd className="text-white">{nights}</dd></div><div className="flex justify-between"><dt>Guests</dt><dd className="text-white">{stay.adults} adults, {stay.children} children</dd></div><div className="flex justify-between"><dt>Rate</dt><dd className="text-white">{breakfast === "with-breakfast" ? "Breakfast included" : "Without breakfast"}</dd></div></dl>
          <div className="mt-6 flex items-end justify-between border-t border-white/12 pt-6"><span className="text-xs uppercase tracking-widest text-white/55">Total</span><span className="font-display text-4xl text-[#e0c184]">${total}</span></div>
        </div>
      </aside>
    </div>
  );
}
