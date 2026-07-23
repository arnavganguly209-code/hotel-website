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
  roomPublicSlug,
} from "@/lib/booking/utils";
import type { BookingSearchParams, PaymentMethod } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface LuxuryBookingCheckoutProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
  search: BookingSearchParams;
}

const fieldClass = "w-full rounded-xl border border-[#d7c49d]/55 bg-white/80 px-4 py-3.5 text-sm text-[#173a2b] outline-none transition placeholder:text-[#8a938e] focus:border-[#af8744] focus:ring-2 focus:ring-[#af8744]/10";

function cardNumberIsValid(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryIsValid(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const expiry = new Date(year, month, 1);
  const now = new Date();
  return expiry > new Date(now.getFullYear(), now.getMonth(), 1);
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1.5 text-xs font-medium text-red-700">{message}</p>
  ) : null;
}

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
  const breakfast = "with-breakfast" as const;
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "", phone: "", whatsapp: "", countryCode: "+977", country: "" });
  const [request, setRequest] = useState({ promoCode: "", arrivalTime: "", flightNumber: "", notes: "" });
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [card, setCard] = useState({ holder: "", number: "", expiry: "", cvv: "", country: "", billingName: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nights = calculateNights(stay.checkIn, stay.checkOut);
  const roomQuantity = Math.max(1, Number(stay.rooms) || 1);
  const total = useMemo(() => calculateBookingTotal({ room, nights, roomQuantity, breakfast }), [room, nights, roomQuantity]);
  const inputClass = (name: string) =>
    `${fieldClass} ${fieldErrors[name] ? "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-500/10" : ""}`;

  const validateStep = () => {
    const errors: Record<string, string> = {};
    if (step === 1 && !bookingDatesAreValid(stay.checkIn, stay.checkOut)) {
      errors.dates = "Choose valid future check-in and check-out dates.";
    }
    if (step === 2) {
      if (!guest.firstName.trim()) errors.firstName = "First name is required.";
      if (!guest.lastName.trim()) errors.lastName = "Last name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) errors.email = "Enter a valid email address.";
      if (!guest.countryCode.trim()) errors.countryCode = "Country code is required.";
      if (!guest.phone.trim()) errors.phone = "Phone number is required.";
      if (!guest.whatsapp.trim()) errors.whatsapp = "WhatsApp number is required.";
      if (!guest.country.trim()) errors.country = "Country is required.";
    }
    if (step === 3 && !request.arrivalTime) {
      errors.arrivalTime = "Expected arrival time is required.";
    }
    if (step === 4) {
      if (!payment) errors.payment = "Select Pay at Hotel or Pay Online.";
      if (payment === "online") {
        if (!card.holder.trim()) errors.holder = "Card holder name is required.";
        if (!cardNumberIsValid(card.number)) errors.number = "Enter a valid card number.";
        if (!expiryIsValid(card.expiry)) errors.expiry = "Enter a future expiry date in MM/YY format.";
        if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = "Enter a valid 3 or 4 digit CVV.";
        if (!card.country.trim()) errors.cardCountry = "Billing country is required.";
        if (!card.billingName.trim()) errors.billingName = "Billing name is required.";
      }
    }
    return errors;
  };

  const validationPassed = () => {
    const errors = validateStep();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return false;
    }
    setError(null);
    return true;
  };

  const next = () => {
    if (!validationPassed()) return;
    setStep((value) => Math.min(4, value + 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validationPassed()) return;
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
          <h1 className="mt-6 font-display text-4xl">Thank You For Choosing Hotel Thamel Park.</h1>
        </div>
        <div className="space-y-4 px-8 py-10 text-sm leading-7 text-[#657169] sm:px-14">
          <p>Your booking request has been received successfully.</p>
          <p>Our Reservations Team will contact you shortly.</p>
          <p>If you wish to modify your booking, please contact:</p>
          <a href="mailto:info@hotelthamelpark.com" className="font-semibold text-[#9e7738] underline underline-offset-4">info@hotelthamelpark.com</a>
          <p>We look forward to welcoming you.</p>
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
                  <label className="text-xs font-semibold text-[#4f5f56]">Check In<input required type="date" value={stay.checkIn} onChange={(e) => setStay({ ...stay, checkIn: e.target.value })} className={`mt-2 ${inputClass("dates")}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Check Out<input required type="date" value={stay.checkOut} onChange={(e) => setStay({ ...stay, checkOut: e.target.value })} className={`mt-2 ${inputClass("dates")}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Adults<input required type="number" min="1" max="8" value={stay.adults} onChange={(e) => setStay({ ...stay, adults: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                  <label className="text-xs font-semibold text-[#4f5f56]">Children<input type="number" min="0" max="6" value={stay.children} onChange={(e) => setStay({ ...stay, children: e.target.value })} className={`mt-2 ${fieldClass}`} /></label>
                </div>
                <FieldError message={fieldErrors.dates} />
                <div className="mt-5 flex justify-between rounded-2xl border border-[#ae8645] bg-[#f5edde] p-4 text-sm text-[#173a2b]">
                  <span>Breakfast Included</span>
                  <strong>${room.price}</strong>
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 2</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Guest details</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label><input required placeholder="First Name *" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} className={inputClass("firstName")} /><FieldError message={fieldErrors.firstName} /></label>
                  <label><input required placeholder="Last Name *" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} className={inputClass("lastName")} /><FieldError message={fieldErrors.lastName} /></label>
                  <label><input required type="email" placeholder="Email *" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className={inputClass("email")} /><FieldError message={fieldErrors.email} /></label>
                  <div className="grid grid-cols-[95px_1fr] gap-2">
                    <label><input aria-label="Country code" placeholder="+977" value={guest.countryCode} onChange={(e) => setGuest({ ...guest, countryCode: e.target.value })} className={inputClass("countryCode")} /><FieldError message={fieldErrors.countryCode} /></label>
                    <label><input required placeholder="Phone *" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className={inputClass("phone")} /><FieldError message={fieldErrors.phone} /></label>
                  </div>
                  <label><input required placeholder="WhatsApp *" value={guest.whatsapp} onChange={(e) => setGuest({ ...guest, whatsapp: e.target.value })} className={inputClass("whatsapp")} /><FieldError message={fieldErrors.whatsapp} /></label>
                  <label><input required placeholder="Country *" value={guest.country} onChange={(e) => setGuest({ ...guest, country: e.target.value })} className={inputClass("country")} /><FieldError message={fieldErrors.country} /></label>
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 3</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Special requests</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <input placeholder="Promo Code" value={request.promoCode} onChange={(e) => setRequest({ ...request, promoCode: e.target.value })} className={fieldClass} />
                  <label>
                    <span className="mb-2 block text-xs font-semibold text-[#4f5f56]">Expected Arrival Time *</span>
                    <input required type="time" aria-label="Arrival Time" value={request.arrivalTime} onChange={(e) => setRequest({ ...request, arrivalTime: e.target.value })} className={inputClass("arrivalTime")} />
                    <FieldError message={fieldErrors.arrivalTime} />
                  </label>
                  <input placeholder="Flight Number" value={request.flightNumber} onChange={(e) => setRequest({ ...request, flightNumber: e.target.value })} className={`${fieldClass} sm:col-span-2`} />
                  <textarea rows={5} placeholder="Notes or special requests" value={request.notes} onChange={(e) => setRequest({ ...request, notes: e.target.value })} className={`${fieldClass} resize-none sm:col-span-2`} />
                </div>
              </div>
            ) : null}
            {step === 4 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a47e3e]">Step 4</p><h2 className="mt-2 font-display text-3xl text-[#173a2b]">Payment option</h2>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {(["hotel", "online"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={payment === option}
                      onClick={() => {
                        setPayment(option);
                        setFieldErrors((current) => ({ ...current, payment: "" }));
                        setError(null);
                      }}
                      className={`rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 ${
                        payment === option
                          ? "border-[#ae8645] bg-[#f5edde] shadow-[0_12px_30px_rgba(174,134,69,0.14)]"
                          : "border-[#d7c49d]/50 bg-white hover:-translate-y-0.5 hover:border-[#ae8645]/70"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-[#ad8746]" />
                      <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-[#173a2b]">
                        {option === "hotel" ? booking.payAtHotelLabel : booking.payOnlineLabel}
                      </p>
                    </button>
                  ))}
                </div>
                <FieldError message={fieldErrors.payment} />
                {payment === "online" ? (
                  <div className="mt-5 overflow-hidden rounded-[24px] border border-[#d7c49d]/50 bg-gradient-to-br from-[#fbf8f1] to-[#f1eadc] shadow-[0_18px_44px_rgba(38,60,49,0.10)]">
                    <div className="border-b border-[#d7c49d]/40 bg-[#173a2b] px-5 py-4 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e0c184]">Secure Card Details</p>
                      <p className="mt-1 text-xs text-white/65">Payment preview only. Card details are validated locally and are never stored.</p>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <input required placeholder="Card Holder Name *" autoComplete="cc-name" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} className={inputClass("holder")} />
                        <FieldError message={fieldErrors.holder} />
                      </label>
                      <label className="sm:col-span-2">
                        <input required inputMode="numeric" autoComplete="cc-number" placeholder="Card Number *" maxLength={23} value={card.number} onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                          setCard({ ...card, number: digits.replace(/(\d{4})(?=\d)/g, "$1 ") });
                        }} className={inputClass("number")} />
                        <FieldError message={fieldErrors.number} />
                      </label>
                      <label>
                        <input required autoComplete="cc-exp" placeholder="Expiry MM/YY *" maxLength={5} value={card.expiry} onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCard({ ...card, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits });
                        }} className={inputClass("expiry")} />
                        <FieldError message={fieldErrors.expiry} />
                      </label>
                      <label>
                        <input required inputMode="numeric" autoComplete="cc-csc" placeholder="CVV *" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} className={inputClass("cvv")} />
                        <FieldError message={fieldErrors.cvv} />
                      </label>
                      <label>
                        <input required placeholder="Billing Country *" autoComplete="country-name" value={card.country} onChange={(e) => setCard({ ...card, country: e.target.value })} className={inputClass("cardCountry")} />
                        <FieldError message={fieldErrors.cardCountry} />
                      </label>
                      <label>
                        <input required placeholder="Billing Name *" autoComplete="name" value={card.billingName} onChange={(e) => setCard({ ...card, billingName: e.target.value })} className={inputClass("billingName")} />
                        <FieldError message={fieldErrors.billingName} />
                      </label>
                    </div>
                  </div>
                ) : payment === "hotel" ? (
                  <p className="mt-5 rounded-2xl border border-[#d7c49d]/45 bg-[#f5edde] p-4 text-sm leading-6 text-[#68736d]">
                    Your reservation team will confirm the booking. Payment can be completed at the hotel.
                  </p>
                ) : (
                  <p className="mt-5 text-sm text-[#68736d]">Select a payment method to continue.</p>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" disabled={step === 1 || submitting} onClick={() => { setError(null); setFieldErrors({}); setStep((value) => Math.max(1, value - 1)); }} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          {step < 4 ? <Button type="button" variant="gold" onClick={next} className="gap-2">Continue <ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" variant="gold" disabled={submitting} className="gap-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{booking.submitLabel}<ArrowRight className="h-4 w-4" /></Button>}
        </div>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[28px] bg-[#153a2a] p-7 text-white shadow-[0_24px_70px_rgba(17,52,36,0.20)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d9bb7c]">Stay summary</p>
          <h3 className="mt-3 font-display text-2xl">{room.name}</h3>
          <dl className="mt-6 space-y-3 text-sm text-white/72"><div className="flex justify-between gap-3"><dt>Check-in</dt><dd className="text-right text-white">{formatBookingDate(stay.checkIn)}</dd></div><div className="flex justify-between gap-3"><dt>Check-out</dt><dd className="text-right text-white">{formatBookingDate(stay.checkOut)}</dd></div><div className="flex justify-between"><dt>Nights</dt><dd className="text-white">{nights}</dd></div><div className="flex justify-between"><dt>Guests</dt><dd className="text-white">{stay.adults} adults, {stay.children} children</dd></div><div className="flex justify-between"><dt>Rate</dt><dd className="text-white">Breakfast Included</dd></div></dl>
          <div className="mt-6 flex items-end justify-between border-t border-white/12 pt-6"><span className="text-xs uppercase tracking-widest text-white/55">Total</span><span className="font-display text-4xl text-[#e0c184]">${total}</span></div>
        </div>
      </aside>
    </div>
  );
}
