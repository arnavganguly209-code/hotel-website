"use client";

import { useState } from "react";
import { Calendar, Users, Baby, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { buildAvailabilityUrl } from "@/lib/booking/utils";
import { cn } from "@/lib/utils";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import type { HeroBookingBarSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface BookingWidgetProps {
  variant?: "hero" | "inline";
  className?: string;
  rooms?: SiteContent["rooms"];
  bookingBar?: HeroBookingBarSettings;
}

export function BookingWidget({ variant = "hero", className, rooms = [], bookingBar }: BookingWidgetProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [children, setChildren] = useState("0");
  const [roomQuantity, setRoomQuantity] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildAvailabilityUrl({ checkIn, checkOut, guests, children, rooms: roomQuantity }));
  };

  if (variant === "hero") {
    return <PremiumFloatingBookingBar rooms={rooms} bookingBar={bookingBar} className={className} variant="hero" />;
  }

  const labelClass =
    "flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-luxury-muted";

  const fields = [
    { id: "check-in", label: "Check In", icon: Calendar, type: "date" as const, value: checkIn, set: setCheckIn },
    { id: "check-out", label: "Check Out", icon: Calendar, type: "date" as const, value: checkOut, set: setCheckOut },
  ];

  return (
    <motion.form
      onSubmit={handleSearch}
      className={cn(
        "rounded-2xl border border-luxury-gold/15 bg-white/80 p-6 shadow-luxury backdrop-blur-md md:p-8",
        className
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {fields.map((f) => (
          <div key={f.id} className="space-y-2">
            <label htmlFor={`inline-${f.id}`} className={labelClass}>
              <f.icon className="h-3.5 w-3.5 text-luxury-gold" />
              {f.label}
            </label>
            <input
              id={`inline-${f.id}`}
              type={f.type}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              required
              className="flex h-11 w-full rounded-xl border border-luxury-gold/15 bg-luxury-cream/60 px-4 text-sm outline-none focus:border-luxury-gold/40"
            />
          </div>
        ))}
        <div className="space-y-2">
          <label htmlFor="inline-guests" className={labelClass}>
            <Users className="h-3.5 w-3.5 text-luxury-gold" />
            Guests
          </label>
          <select
            id="inline-guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-luxury-gold/15 bg-luxury-cream/60 px-4 text-sm"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="inline-children" className={labelClass}>
            <Baby className="h-3.5 w-3.5 text-luxury-gold" />
            Children
          </label>
          <select
            id="inline-children"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-luxury-gold/15 bg-luxury-cream/60 px-4 text-sm"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="inline-room" className={labelClass}>
            Rooms
          </label>
          <select
            id="inline-room"
            value={roomQuantity}
            onChange={(e) => setRoomQuantity(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-luxury-gold/15 bg-luxury-cream/60 px-4 text-sm"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" variant="gold" size="lg" className="w-full gap-2 rounded-xl uppercase tracking-wider">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
