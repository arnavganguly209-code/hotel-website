"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface RoomBookingFormProps {
  room: SiteContent["rooms"][number];
  booking: SiteContent["roomBooking"];
}

export function RoomBookingForm({ room, booking }: RoomBookingFormProps) {
  const [payment, setPayment] = useState<"online" | "hotel">("hotel");

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: luxuryEase }}
      onSubmit={(e) => e.preventDefault()}
      className="rounded-[28px] border border-white/60 p-8 backdrop-blur-[24px] md:p-10"
      style={{
        background: "linear-gradient(145deg, rgba(255,249,242,0.92) 0%, rgba(234,242,232,0.85) 100%)",
        boxShadow: "0 28px 80px rgba(24,56,47,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-luxury-gold">Reserve</p>
      <h3 className="mt-2 font-display text-2xl text-luxury-forest">{room.name}</h3>
      <p className="mt-2 text-sm text-luxury-muted">{booking.availabilityNote}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Input placeholder="Full Name" aria-label="Name" className="border-white/60 bg-white/50" />
        <Input type="email" placeholder="Email Address" aria-label="Email" className="border-white/60 bg-white/50" />
        <Input placeholder="Phone Number" aria-label="Phone" className="border-white/60 bg-white/50" />
        <Input placeholder="Country Code" aria-label="Country Code" className="border-white/60 bg-white/50" />
        <Input placeholder="Country" aria-label="Country" className="border-white/60 bg-white/50 sm:col-span-2" />
        <Input type="number" placeholder="Guests" aria-label="Guests" defaultValue={2} className="border-white/60 bg-white/50" />
        <Input type="number" placeholder="Children" aria-label="Children" defaultValue={0} className="border-white/60 bg-white/50" />
        <Input type="date" aria-label="Check-in" className="border-white/60 bg-white/50" />
        <Input type="date" aria-label="Check-out" className="border-white/60 bg-white/50" />
      </div>

      <textarea
        placeholder={booking.specialRequestLabel}
        rows={4}
        aria-label={booking.specialRequestLabel}
        className="mt-4 w-full resize-none rounded-md border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none focus:border-luxury-gold/40"
      />

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-luxury-gold">Payment</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {(["online", "hotel"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPayment(option)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-500 ${
              payment === option
                ? "bg-luxury-gold text-white shadow-luxury-gold"
                : "border border-luxury-gold/30 bg-white/40 text-luxury-forest hover:border-luxury-gold/50"
            }`}
          >
            {option === "online" ? booking.payOnlineLabel : booking.payAtHotelLabel}
          </button>
        ))}
      </div>

      <Button type="submit" variant="gold" size="lg" className="mt-8 w-full gap-2 uppercase tracking-[0.16em] sm:w-auto">
        {booking.submitLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.form>
  );
}
