"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Coffee,
  Maximize2,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SafeImage } from "@/components/shared/SafeImage";
import {
  buildRoomDetailUrl,
  formatBookingDate,
  isRoomAvailableForSearch,
  roomOnlyNightlyPrice,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { roomDetailPath } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { BookingSearchParams } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface RoomsPageProps {
  rooms: SiteContent["rooms"];
  page: SiteContent["roomsPage"];
  search: BookingSearchParams;
  hasSearch: boolean;
}

export function RoomsPage({ rooms, page, search, hasSearch }: RoomsPageProps) {
  const available = hasSearch
    ? rooms.filter((room) => isRoomAvailableForSearch(room, search))
    : rooms.filter((room) => room.available !== false);

  return (
    <main className="overflow-x-clip bg-[#f8f4eb]">
      <section className="relative min-h-[430px] overflow-hidden md:min-h-[520px]">
        <SafeImage
          src={page.hero.imageSrc || rooms[0]?.imageSrc || ""}
          alt={page.hero.imageAlt}
          fill
          priority
          fadeIn={false}
          objectFit="cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[#10281d]"
          style={{ opacity: page.hero.overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10281d]/75 via-transparent to-black/15" />
        <div className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col justify-end px-5 pb-24 pt-32 text-white md:min-h-[520px] md:px-8 md:pb-28">
          <nav aria-label="Breadcrumb" className="mb-6 text-[11px] uppercase tracking-[0.24em] text-white/70">
            <Link href="/" className="transition hover:text-[#d7b878]">{page.hero.breadcrumbHome}</Link>
            <span className="mx-3 text-[#d7b878]">/</span>
            <span>{page.hero.breadcrumbCurrent}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d7b878]">
            {page.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-light leading-[1.08] sm:text-5xl lg:text-7xl">
            {page.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
            {page.hero.description}
          </p>
        </div>
      </section>

      {hasSearch ? (
        <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4">
          <div className="rounded-2xl border border-white/60 bg-white/90 px-5 py-4 shadow-[0_24px_70px_rgba(20,47,35,0.14)] backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#b79352]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#99763d]">Your search</p>
                  <p className="mt-1 text-sm text-[#30463d]">
                    {formatBookingDate(search.checkIn)} — {formatBookingDate(search.checkOut)}
                    {" · "}{search.guests} adults · {search.children} children · {search.rooms} rooms
                  </p>
                </div>
              </div>
              <Link href="/#hero" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#143a2a] underline decoration-[#c7a666] underline-offset-4">
                Edit search
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a47d3d]">
              {hasSearch ? `${available.length} matching accommodations` : "Our accommodations"}
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#163b2b] sm:text-4xl">
              A room for every kind of stay
            </h2>
          </div>

          {available.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-8 lg:grid-cols-2"
            >
              {available.map((room) => {
                const slug = roomPublicSlug(room);
                const detailHref = hasSearch
                  ? buildRoomDetailUrl(slug, search)
                  : roomDetailPath(slug);
                return (
                  <motion.article
                    key={room.id}
                    id={slug}
                    variants={fadeUp}
                    className="group overflow-hidden rounded-[28px] border border-[#c6aa72]/25 bg-white/82 shadow-[0_18px_55px_rgba(23,55,41,0.10)] backdrop-blur-xl transition duration-700 hover:-translate-y-1.5 hover:shadow-[0_25px_70px_rgba(23,55,41,0.16)]"
                  >
                    <div className="relative min-h-[260px] overflow-hidden sm:min-h-[330px]">
                      <MediaPlaceholder
                        src={room.imageSrc}
                        alt={room.seo?.altText || room.name}
                        variant="room"
                        aspect="auto"
                        priority={available.indexOf(room) === 0}
                        fadeIn={false}
                        className="absolute inset-0 min-h-0"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10281d]/70 via-transparent to-black/5" />
                      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e0c184]">Breakfast included</p>
                          <p className="mt-1 font-display text-3xl">${room.price}<span className="text-sm text-white/70"> / night</span></p>
                        </div>
                        <span className="rounded-full border border-white/25 bg-[#173a2b]/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md">Available</span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-2xl text-[#153a2a] sm:text-3xl">{room.name}</h3>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-[#6e756f]">
                          <Maximize2 className="h-4 w-4 text-[#b18b4b]" /> {room.size}
                        </span>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#68736d]">{room.description}</p>

                      <div className="mt-6 grid grid-cols-2 gap-2.5 text-xs text-[#41534a] sm:grid-cols-4">
                        <span className="flex items-center gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2.5"><Users className="h-4 w-4 text-[#ad8746]" />{room.guests}</span>
                        <span className="flex items-center gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2.5"><Coffee className="h-4 w-4 text-[#ad8746]" />Breakfast</span>
                        <span className="flex items-center gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2.5"><Wifi className="h-4 w-4 text-[#ad8746]" />Free Wi-Fi</span>
                        <span className="flex items-center gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2.5"><ShieldCheck className="h-4 w-4 text-[#ad8746]" />{room.cancellationLabel || "Flexible"}</span>
                      </div>

                      <div className="mt-7 flex flex-col gap-3 border-t border-[#d7c49d]/35 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-[#68736d]">
                          Without breakfast <span className="font-semibold text-[#183b2c]">${roomOnlyNightlyPrice(room)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:flex">
                          <Link
                            href={detailHref}
                            className="group/button inline-flex min-h-12 items-center justify-center rounded-full border border-[#b48b49]/70 bg-white/70 px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#173a2b] shadow-[0_8px_24px_rgba(37,61,48,0.08)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[#d0aa63] hover:bg-[#173a2b] hover:text-[#f4dfae] hover:shadow-[0_14px_32px_rgba(22,58,42,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48b49] focus-visible:ring-offset-2 sm:min-w-[132px]"
                          >
                            Read More
                          </Link>
                          <Link
                            href={`${detailHref}#reserve`}
                            className="group/button inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d3ad64] bg-gradient-to-r from-[#173a2b] to-[#214b38] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5dfad] shadow-[0_10px_28px_rgba(22,58,42,0.24)] transition-all duration-500 hover:-translate-y-0.5 hover:from-[#b8893e] hover:to-[#d0a65d] hover:text-[#10281d] hover:shadow-[0_16px_38px_rgba(156,113,51,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48b49] focus-visible:ring-offset-2 sm:min-w-[132px]"
                          >
                            Book Now
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/button:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-[28px] border border-[#c6aa72]/25 bg-white/80 p-10 text-center shadow-lg sm:p-16">
              <Check className="mx-auto h-8 w-8 text-[#b38b4a]" />
              <h2 className="mt-5 font-display text-3xl text-[#173a2b]">No matching room is available</h2>
              <p className="mt-3 text-sm text-[#68736d]">Adjust the dates, guest count, or number of rooms and search again.</p>
              <Button asChild variant="gold" className="mt-7"><Link href="/#hero">Edit Search</Link></Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
