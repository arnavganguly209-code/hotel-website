"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  Bed,
  CalendarDays,
  Check,
  Maximize2,
  Trees,
  Tv,
  Users,
  Volume2,
  Wifi,
  Wind,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasMediaSrc } from "@/lib/cms/media-url";
import {
  buildReserveUrl,
  buildRoomDetailUrl,
  formatBookingDate,
  isRoomAvailableForSearch,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { roomDetailPath } from "@/lib/navigation";
import { fadeUp, luxuryEase, staggerContainer } from "@/lib/animations";
import type { BookingSearchParams } from "@/lib/booking/types";
import type { SiteContent } from "@/lib/cms/types";

interface RoomsPageProps {
  rooms: SiteContent["rooms"];
  page: SiteContent["roomsPage"];
  search: BookingSearchParams;
  hasSearch: boolean;
}

const GOLD = "#C5A059";
const HEADING = "#062C24";

function featureIcon(label: string): LucideIcon {
  const t = label.toLowerCase();
  if (t.includes("m²") || t.includes("m2") || t.includes("sq")) return Maximize2;
  if (t.includes("view") || t.includes("garden")) return Trees;
  if (t.includes("air") || t.includes("climate") || t.includes("ac")) return Wind;
  if (t.includes("bath")) return Bath;
  if (t.includes("tv") || t.includes("screen")) return Tv;
  if (t.includes("sound")) return Volume2;
  if (t.includes("mini") || t.includes("bar")) return Wine;
  if (t.includes("wifi") || t.includes("wi-fi")) return Wifi;
  if (t.includes("guest") || t.includes("adult")) return Users;
  if (t.includes("bed")) return Bed;
  return Maximize2;
}

function buildFeatureList(room: SiteContent["rooms"][number]): string[] {
  const fromAmenities = (room.amenities || []).filter(Boolean);
  const fromFeatures = (room.features || []).filter(Boolean);
  const pool = fromAmenities.length >= 4 ? fromAmenities : fromFeatures;
  const withSize = room.size ? [room.size, ...pool.filter((item) => item !== room.size)] : pool;
  return Array.from(new Set(withSize)).slice(0, 8);
}

function RoomListingRow({
  room,
  index,
  detailHref,
  reserveHref,
}: {
  room: SiteContent["rooms"][number];
  index: number;
  detailHref: string;
  reserveHref: string;
}) {
  const features = buildFeatureList(room);
  const imageRight = index % 2 === 1;
  const hasImage = hasMediaSrc(room.imageSrc);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const gallery = (room.gallery?.length ? room.gallery : [room.imageSrc]).filter(Boolean);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.55, ease: luxuryEase }}
      id={roomPublicSlug(room)}
      className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_48px_rgba(6,44,36,0.09)]"
      style={{ border: `1px solid ${GOLD}40` }}
    >
      <div
        className={`flex flex-col lg:min-h-[420px] ${
          imageRight ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        <div className="relative h-[260px] w-full shrink-0 overflow-hidden sm:h-[320px] lg:h-auto lg:min-h-[420px] lg:w-[48%]">
          {hasImage ? (
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setViewerIndex(0)}
              aria-label={`View ${room.name} photos`}
            >
              <SafeImage
                src={room.imageSrc}
                alt={room.seo?.altText || room.name}
                fill
                fadeIn={false}
                objectFit="cover"
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index === 0}
              />
            </button>
          ) : (
            <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#EFE8DA] lg:min-h-[420px]">
              <p className="font-display text-sm uppercase tracking-[0.28em]" style={{ color: `${GOLD}99` }}>
                {room.name}
              </p>
            </div>
          )}

          <div
            className="absolute left-4 top-4 rounded-sm px-3.5 py-2.5 sm:left-5 sm:top-5"
            style={{
              backgroundColor: HEADING,
              border: `1.5px solid ${GOLD}`,
              boxShadow: "0 10px 22px rgba(0,0,0,0.2)",
            }}
          >
            <p className="font-display text-lg font-semibold leading-none tracking-wide sm:text-xl" style={{ color: GOLD }}>
              ${room.price}{" "}
              <span className="text-xs font-semibold uppercase tracking-[0.12em]">/ Night</span>
            </p>
            <p className="mt-1.5 text-[10px] leading-none text-white/85">Includes taxes and fees</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: GOLD }}
          >
            {room.bedType} · {room.guests}
          </p>
          <h3
            className="font-display text-2xl font-semibold uppercase tracking-[0.04em] sm:text-3xl lg:text-[2.05rem]"
            style={{ color: HEADING }}
          >
            {room.name}
          </h3>

          <div className="mt-4 flex items-center gap-2.5" aria-hidden>
            <span className="h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
            <span className="h-px w-10" style={{ backgroundColor: `${GOLD}99` }} />
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#5A635C] sm:text-[15px] sm:leading-8">
            {room.description}
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {features.map((label) => {
              const Icon = featureIcon(label);
              return (
                <li key={label} className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} style={{ color: GOLD }} />
                  <span className="truncate text-sm" style={{ color: HEADING }}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={detailHref}
              prefetch
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: HEADING,
                color: GOLD,
                boxShadow: "0 10px 24px rgba(6, 44, 36, 0.22)",
              }}
            >
              Explore Room
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={reserveHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-7 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5"
              style={{
                borderColor: `${GOLD}99`,
                color: HEADING,
                backgroundColor: "#FBF8F1",
              }}
            >
              Book Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <ImageViewer
        items={gallery.map((src) => ({ src, alt: room.name, title: room.name }))}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={setViewerIndex}
      />
    </motion.article>
  );
}

export function RoomsPage({ rooms, page, search, hasSearch }: RoomsPageProps) {
  const available = hasSearch
    ? rooms.filter((room) => isRoomAvailableForSearch(room, search))
    : rooms.filter((room) => room.available !== false);

  const ordered = available
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
            <Link href="/" className="transition hover:text-[#d7b878]">
              {page.hero.breadcrumbHome}
            </Link>
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#99763d]">
                    Your search
                  </p>
                  <p className="mt-1 text-sm text-[#30463d]">
                    {formatBookingDate(search.checkIn)} — {formatBookingDate(search.checkOut)}
                    {" · "}
                    {search.guests} adults · {search.children} children · {search.rooms} rooms
                  </p>
                </div>
              </div>
              <Link
                href="/#hero"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#143a2a] underline decoration-[#c7a666] underline-offset-4"
              >
                Edit search
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl md:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a47d3d]">
              {hasSearch ? `${ordered.length} matching accommodations` : "Our accommodations"}
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#163b2b] sm:text-4xl">
              A room for every kind of stay
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#68736d] md:text-[15px]">
              Explore each category in detail — spacious layouts, refined amenities, and rates
              inclusive of taxes and fees.
            </p>
          </div>

          {ordered.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex flex-col gap-8 md:gap-10"
            >
              {ordered.map((room, index) => {
                const slug = roomPublicSlug(room);
                const detailHref = hasSearch
                  ? buildRoomDetailUrl(slug, search)
                  : roomDetailPath(slug);
                const reserveHref = hasSearch
                  ? buildReserveUrl(slug, search)
                  : buildReserveUrl(slug, {
                      checkIn: "",
                      checkOut: "",
                      guests: "2",
                      children: "0",
                      rooms: "1",
                      breakfast: "with-breakfast",
                    });

                return (
                  <RoomListingRow
                    key={room.id}
                    room={room}
                    index={index}
                    detailHref={detailHref}
                    reserveHref={reserveHref}
                  />
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-[28px] border border-[#c6aa72]/25 bg-white/80 p-10 text-center shadow-lg sm:p-16">
              <Check className="mx-auto h-8 w-8 text-[#b38b4a]" />
              <h2 className="mt-5 font-display text-3xl text-[#173a2b]">
                No matching room is available
              </h2>
              <p className="mt-3 text-sm text-[#68736d]">
                Adjust the dates, guest count, or number of rooms and search again.
              </p>
              <Button asChild variant="gold" className="mt-7">
                <Link href="/#hero">Edit Search</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
