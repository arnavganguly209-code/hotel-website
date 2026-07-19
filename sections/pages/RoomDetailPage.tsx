"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  Maximize2,
  Quote,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import { LuxuryRoomGallery } from "@/components/booking/LuxuryRoomGallery";
import {
  bookingDatesAreValid,
  buildBookUrl,
  calculateBookingTotal,
  calculateNights,
  roomOnlyNightlyPrice,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { roomDetailPath } from "@/lib/navigation";
import type { BookingSearchParams, BreakfastOption } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface RoomDetailPageProps {
  room: SiteContent["rooms"][number];
  search?: BookingSearchParams;
  suggestedRooms: SiteContent["rooms"];
  reviews: SiteContent["reviews"];
}

function todayValue(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[24px] border border-[#d3bb8a]/25 bg-white/70 p-6 shadow-[0_12px_40px_rgba(20,55,40,0.06)] sm:p-8">
      <h2 className="font-display text-2xl text-[#153a2a]">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#68736d]">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#b18a49]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RoomDetailPage({ room, search, suggestedRooms, reviews }: RoomDetailPageProps) {
  const gallery = room.gallery.length ? room.gallery : [room.imageSrc];
  const [checkIn, setCheckIn] = useState(search?.checkIn || todayValue(1));
  const [checkOut, setCheckOut] = useState(search?.checkOut || todayValue(2));
  const [adults, setAdults] = useState(search?.guests || "2");
  const [children, setChildren] = useState(search?.children || "0");
  const [roomQuantity, setRoomQuantity] = useState(search?.rooms || "1");
  const [breakfast, setBreakfast] = useState<BreakfastOption>(search?.breakfast || "with-breakfast");
  const nights = calculateNights(checkIn, checkOut);
  const validDates = bookingDatesAreValid(checkIn, checkOut);
  const bookingSearch: BookingSearchParams = {
    checkIn,
    checkOut,
    guests: adults,
    children,
    rooms: roomQuantity,
    breakfast,
  };
  const total = useMemo(
    () =>
      calculateBookingTotal({
        room,
        nights,
        roomQuantity: Math.max(1, Number(roomQuantity) || 1),
        breakfast,
      }),
    [room, nights, roomQuantity, breakfast]
  );

  return (
    <main className="overflow-x-clip bg-[#f8f4eb]">
      <section className="relative min-h-[540px] overflow-hidden lg:min-h-[680px]">
        <SafeImage src={room.imageSrc} fallbackSrc={gallery.find((src) => src !== room.imageSrc) || "/media/rooms/super-deluxe.jpg"} alt={room.seo?.altText || room.name} fill priority fadeIn={false} objectFit="cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d241a]/90 via-[#0d241a]/25 to-black/15" />
        <div className="relative mx-auto flex min-h-[540px] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 text-white lg:min-h-[680px] lg:px-8 lg:pb-20">
          <nav className="mb-5 text-[10px] uppercase tracking-[0.23em] text-white/65">
            <Link href="/">Home</Link><span className="mx-3 text-[#d7b878]">/</span>
            <Link href="/rooms">Rooms</Link><span className="mx-3 text-[#d7b878]">/</span>
            <span>{room.name}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#dfbf80]">Accommodations</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-light leading-none sm:text-6xl lg:text-7xl">{room.name}</h1>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/80">
            <span className="flex items-center gap-2"><Maximize2 className="h-4 w-4 text-[#dfbf80]" />{room.size}</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-[#dfbf80]" />{room.guests}</span>
            <span>{room.bedType}</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-14">
          <div className="min-w-0 space-y-14">
            <LuxuryRoomGallery images={gallery} alt={room.seo?.altText || room.name} />

            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a47e3f]">The experience</p>
              <h2 className="mt-3 font-display text-3xl text-[#153a2a] sm:text-4xl">A considered space to settle in</h2>
              <p className="mt-6 text-base leading-8 text-[#68736d]">{room.longDescription}</p>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <DetailList title="Room Amenities" items={room.amenities} />
              <DetailList title="Facilities" items={room.facilities || room.features} />
              <DetailList title="Services" items={room.services || []} />
              <DetailList title="Room Features" items={room.features} />
            </div>

            <section className="rounded-[28px] bg-[#153a2a] p-7 text-white sm:p-10">
              <div className="flex items-center gap-3 text-[#dfbf80]"><Clock3 className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-[0.23em]">Stay information</span></div>
              <div className="mt-6 grid gap-7 sm:grid-cols-2">
                <div><p className="text-xs uppercase tracking-widest text-white/50">Check-in</p><p className="mt-2 font-display text-2xl">{room.checkInTime}</p></div>
                <div><p className="text-xs uppercase tracking-widest text-white/50">Check-out</p><p className="mt-2 font-display text-2xl">{room.checkOutTime}</p></div>
              </div>
              <ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm leading-6 text-white/72">
                {room.policies.map((policy) => <li key={policy}>• {policy}</li>)}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 text-[#a47e3f]"><MapPin className="h-5 w-5" /><p className="text-[11px] font-semibold uppercase tracking-[0.25em]">Nearby attractions</p></div>
              <h2 className="mt-3 font-display text-3xl text-[#153a2a]">Explore Kathmandu from Thamel</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(room.nearbyAttractions || []).map((item) => <div key={item} className="rounded-2xl border border-[#d3bb8a]/25 bg-white/75 px-5 py-4 text-sm text-[#5f6d65]">{item}</div>)}
              </div>
            </section>

            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a47e3f]">Guest impressions</p>
              <h2 className="mt-3 font-display text-3xl text-[#153a2a]">Reviews from recent stays</h2>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {reviews.slice(0, 2).map((review) => (
                  <article key={review.id} className="rounded-[24px] border border-[#d3bb8a]/25 bg-white/75 p-7">
                    <Quote className="h-6 w-6 text-[#b18a49]" />
                    <div className="mt-4 flex text-[#c69d54]">{[1,2,3,4,5].map((value) => <Star key={value} className="h-3.5 w-3.5 fill-current" />)}</div>
                    <p className="mt-4 text-sm leading-7 text-[#68736d]">{review.review}</p>
                    <p className="mt-5 text-sm font-semibold text-[#183b2c]">{review.name} · {review.country}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside id="reserve" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#d5b979]/30 bg-white/90 shadow-[0_25px_70px_rgba(15,45,32,0.16)] backdrop-blur-xl">
              <div className="bg-[#153a2a] px-6 py-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#dabb7d]">Reserve this room</p>
                <p className="mt-2 font-display text-3xl">${room.price}<span className="text-sm text-white/60"> / night</span></p>
                <p className="mt-1 text-xs text-white/55">Breakfast included</p>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#68736d]">Check in<input type="date" min={todayValue()} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7c49d]/50 bg-[#faf7f0] px-3 py-3 text-sm text-[#173a2b]" /></label>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#68736d]">Check out<input type="date" min={checkIn || todayValue()} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7c49d]/50 bg-[#faf7f0] px-3 py-3 text-sm text-[#173a2b]" /></label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["Adults", adults, setAdults, 1, 8], ["Children", children, setChildren, 0, 6], ["Rooms", roomQuantity, setRoomQuantity, 1, 4]].map(([label, value, setter, min, max]) => (
                    <label key={String(label)} className="text-[10px] font-semibold uppercase tracking-wider text-[#68736d]">{String(label)}<input type="number" min={Number(min)} max={Number(max)} value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7c49d]/50 bg-[#faf7f0] px-3 py-3 text-sm text-[#173a2b]" /></label>
                  ))}
                </div>
                <div className="grid gap-2">
                  {[
                    { id: "with-breakfast" as const, label: "Breakfast Included", price: room.price },
                    { id: "room-only" as const, label: "Without Breakfast", price: roomOnlyNightlyPrice(room) },
                  ].map((option) => (
                    <button key={option.id} type="button" onClick={() => setBreakfast(option.id)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${breakfast === option.id ? "border-[#b18a49] bg-[#f4ecdc] text-[#173a2b]" : "border-[#d7c49d]/45 text-[#68736d]"}`}>
                      <span>{option.label}</span><span className="font-semibold">${option.price}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-end justify-between border-t border-[#d7c49d]/40 pt-5"><span className="text-xs uppercase tracking-widest text-[#68736d]">Total · {nights} {nights === 1 ? "night" : "nights"}</span><span className="font-display text-3xl text-[#173a2b]">${total}</span></div>
                {!validDates ? <p className="text-xs text-red-600">Choose a valid future check-in and check-out date.</p> : null}
                <Button asChild={validDates} type={validDates ? undefined : "button"} disabled={!validDates || room.available === false} variant="gold" size="lg" className="w-full gap-2 uppercase tracking-[0.14em]">
                  {validDates ? <Link href={buildBookUrl(roomPublicSlug(room), bookingSearch)}>Continue to Book <ArrowRight className="h-4 w-4" /></Link> : <span>Continue to Book</span>}
                </Button>
                <p className="text-center text-[11px] leading-5 text-[#758078]">No payment is charged until your request is reviewed. Pay online is a preview only.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {suggestedRooms.length ? (
        <section className="border-t border-[#d7c49d]/30 bg-white/55 px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a47e3f]">You may also enjoy</p>
            <h2 className="mt-3 font-display text-3xl text-[#153a2a] sm:text-4xl">Suggested Rooms</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {suggestedRooms.slice(0, 3).map((suggested) => (
                <Link key={suggested.id} href={roomDetailPath(roomPublicSlug(suggested))} className="group overflow-hidden rounded-[24px] border border-[#d3bb8a]/25 bg-white shadow-sm">
                  <div className="relative aspect-[16/10] overflow-hidden"><SafeImage src={suggested.imageSrc} fallbackSrc="/media/rooms/super-deluxe.jpg" alt={suggested.seo?.altText || suggested.name} fill fadeIn={false} className="object-cover transition duration-700 group-hover:scale-105" /></div>
                  <div className="p-5"><h3 className="font-display text-2xl text-[#153a2a]">{suggested.name}</h3><p className="mt-2 text-sm text-[#68736d]">From ${suggested.price} / night</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
