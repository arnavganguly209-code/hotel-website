"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bed,
  Bell,
  Briefcase,
  Clock,
  Coffee,
  Compass,
  Gem,
  Map,
  MapPin,
  Plane,
  Shield,
  Shirt,
  Smile,
  Sparkles,
  Utensils,
  Wifi,
  Wine,
} from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/shared/SafeImage";
import { MountainBackdrop } from "@/components/about/MountainBackdrop";
import { hasMediaSrc } from "@/lib/cms/media-url";

interface AboutPageProps {
  content: SiteContent["aboutPage"];
}

const ICONS: Record<string, typeof Bed> = {
  bed: Bed,
  utensils: Utensils,
  coffee: Coffee,
  wine: Wine,
  sparkles: Sparkles,
  briefcase: Briefcase,
  plane: Plane,
  map: Map,
  bell: Bell,
  shirt: Shirt,
  wifi: Wifi,
  clock: Clock,
  smile: Smile,
  "map-pin": MapPin,
  gem: Gem,
  shield: Shield,
  compass: Compass,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICONS[name] || Sparkles;
  return <Comp className={className} strokeWidth={1.25} />;
}

export function AboutPage({ content }: AboutPageProps) {
  const page = content;
  const why = page.whyChoose.items
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
  const facilities = page.services.items
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const transportItems = (page.transport?.items || [])
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const promiseItems = (page.promise?.items || [])
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const dining = page.diningExperience;
  const spa = page.spaWellness;
  const transport = page.transport;
  const promise = page.promise;

  return (
    <div className="relative bg-[#F7F4EF] text-[#14352C]">
      {/* Our Story */}
      <section className="relative px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <MountainBackdrop className="opacity-80" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <SectionHeader
            eyebrow={page.story.eyebrow}
            title={page.story.title}
            description={page.story.content}
            center
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto mt-14 max-w-6xl overflow-hidden"
        >
          <div className="relative aspect-[21/9] min-h-[240px] w-full sm:min-h-[320px] lg:min-h-[420px]">
            {hasMediaSrc(page.story.imageSrc) ? (
              <SafeImage
                src={page.story.imageSrc}
                alt={`${page.story.title} at Hotel Thamel Park`}
                fill
                fadeIn={false}
                objectFit="cover"
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </motion.div>
      </section>

      {/* Why Choose — icon cards only */}
      <section className="relative border-y border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow={page.whyChoose.eyebrow}
            title={page.whyChoose.title}
            description={page.whyChoose.description}
            center
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.05, duration: 0.55 }}
                whileHover={{ y: -4 }}
                className="group rounded-[22px] border border-[#D4AF37]/20 bg-white/80 px-7 py-8 shadow-[0_14px_40px_rgba(15,42,34,0.04)] transition duration-500 hover:border-[#D4AF37]/45 hover:shadow-[0_20px_50px_rgba(15,42,34,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#F7F4EF] transition duration-500 group-hover:border-[#D4AF37]/55 group-hover:bg-[#14352C]">
                  <Icon
                    name={item.icon}
                    className="h-5 w-5 text-[#C9A227] transition group-hover:text-[#D4AF37]"
                  />
                </div>
                <h3 className="mt-6 font-display text-xl font-light text-[#14352C]">{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#5A635C]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="relative px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <MountainBackdrop className="opacity-60" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeader
            eyebrow={page.services.eyebrow}
            title={page.services.title}
            description="Every detail arranged for effortless comfort — from dining and wellness to travel support and security."
            center
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {facilities.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: Math.min(i * 0.02, 0.35), duration: 0.45 }}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-[#D4AF37]/18 bg-white/75 p-5 transition duration-500 hover:border-[#D4AF37]/40 hover:bg-white"
              >
                <Icon
                  name={item.icon}
                  className="h-5 w-5 text-[#C9A227] transition group-hover:scale-110"
                />
                <h3 className="mt-4 font-display text-[17px] text-[#14352C]">{item.title}</h3>
                <p className="mt-2 font-body text-xs leading-relaxed text-[#6B7A73]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Dining — one cover image */}
      {dining ? (
        <CoverStory
          eyebrow={dining.eyebrow}
          title={dining.title}
          content={dining.content}
          imageSrc={dining.imageSrc}
          alt="Dining at Hotel Thamel Park"
          href="/restaurant"
          linkLabel="Explore Dining"
        />
      ) : null}

      {/* Spa — one cover image */}
      {spa ? (
        <CoverStory
          eyebrow={spa.eyebrow}
          title={spa.title}
          content={spa.content}
          imageSrc={spa.imageSrc}
          alt="Spa & Wellness at Hotel Thamel Park"
          href="/spa"
          linkLabel="Explore Spa"
          invert
        />
      ) : null}

      {/* Transport */}
      {transport ? (
        <section className="relative border-y border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow={transport.eyebrow}
              title={transport.title}
              description={transport.content}
              center
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {transportItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-[#D4AF37]/18 bg-white/80 px-5 py-6"
                >
                  <Icon name={item.icon} className="h-5 w-5 text-[#C9A227]" />
                  <h3 className="mt-4 font-display text-lg text-[#14352C]">{item.title}</h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-[#6B7A73]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center font-body text-sm italic leading-relaxed text-[#5A635C]">
              {transport.note}
            </p>
          </div>
        </section>
      ) : null}

      {/* Promise */}
      {promise ? (
        <section className="relative px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <MountainBackdrop />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C9A227]">
              {promise.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-light text-[#14352C] md:text-5xl">
              {promise.title}
            </h2>
            <div className="mx-auto mt-8 h-px w-16 bg-[#D4AF37]/50" />
            <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {promiseItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="font-display text-xl font-light tracking-wide text-[#14352C] md:text-2xl"
                >
                  {item.title}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-[#D4AF37]/15 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        {page.cta.backgroundImage ? (
          <div className="absolute inset-0">
            <SafeImage
              src={page.cta.backgroundImage}
              alt=""
              fill
              objectFit="cover"
              className="object-cover opacity-[0.18]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#FBF8F1]/75" />
          </div>
        ) : null}
        <MountainBackdrop className="opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.1),transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-light leading-tight text-[#14352C] md:text-5xl">
            {page.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-relaxed text-[#5A635C]">
            {page.cta.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={page.cta.primaryHref}
              className="rounded-full bg-[#14352C] px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37] transition hover:opacity-90"
            >
              {page.cta.primaryText}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className="rounded-full border border-[#D4AF37]/45 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14352C] transition hover:border-[#C9A227] hover:bg-white/60"
            >
              {page.cta.secondaryText}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  center,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C9A227]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-light text-[#14352C] md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 font-body text-sm leading-[1.9] text-[#5A635C] md:text-[15px]">
          {description}
        </p>
      ) : null}
      <div className={cn("mt-7 h-px w-16 bg-[#D4AF37]/45", center && "mx-auto")} />
    </div>
  );
}

function CoverStory({
  eyebrow,
  title,
  content,
  imageSrc,
  alt,
  href,
  linkLabel,
  invert,
}: {
  eyebrow: string;
  title: string;
  content: string;
  imageSrc: string;
  alt: string;
  href: string;
  linkLabel: string;
  invert?: boolean;
}) {
  const showImage = hasMediaSrc(imageSrc);
  return (
    <section
      className={cn(
        "relative px-6 py-20 sm:px-8 lg:px-10 lg:py-28",
        invert ? "bg-[#FBF8F1]" : "bg-[#F7F4EF]"
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-10 lg:gap-16",
          showImage ? "lg:grid-cols-2" : "lg:grid-cols-1"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(showImage && invert && "lg:order-2")}
        >
          <SectionHeader eyebrow={eyebrow} title={title} description={content} />
          <Link
            href={href}
            className="mt-8 inline-flex font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] transition hover:text-[#14352C]"
          >
            {linkLabel} →
          </Link>
        </motion.div>
        {showImage ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn("relative overflow-hidden", invert && "lg:order-1")}
          >
            <div className="relative aspect-[16/11] w-full">
              <SafeImage
                src={imageSrc}
                alt={alt}
                fill
                fadeIn={false}
                objectFit="cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
