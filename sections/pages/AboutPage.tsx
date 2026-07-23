"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bed,
  Bell,
  Briefcase,
  Clock,
  Coffee,
  Compass,
  Eye,
  Gem,
  Heart,
  HeartHandshake,
  Map,
  MapPin,
  Plane,
  Shield,
  Shirt,
  Smile,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wifi,
  Wine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasMediaSrc, mediaUrl } from "@/lib/cms/media-url";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";

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
  users: Users,
  "map-pin": MapPin,
  gem: Gem,
  shield: Shield,
  heart: Heart,
  "hand-heart": HeartHandshake,
  compass: Compass,
  eye: Eye,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICONS[name] || Sparkles;
  return <Comp className={className} strokeWidth={1.3} />;
}

export function AboutPage({ content }: AboutPageProps) {
  const page = content;
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const stats = page.stats.filter((s) => s.enabled !== false).sort((a, b) => a.order - b.order);
  const values = page.philosophy.values
    .filter((v) => v.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const why = page.whyChoose.items
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const services = page.services.items
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const awards = page.awards.items
    .filter((a) => a.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const testimonials = page.testimonials.items
    .filter((t) => t.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <div className="bg-[#F7F4EF]">
      {/* Our Story */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/5] w-full">
              {hasMediaSrc(page.story.imageSrc) ? (
                <SafeImage
                  src={page.story.imageSrc}
                  alt={page.story.title}
                  fill
                  objectFit="cover"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
            </div>
            <div className="pointer-events-none absolute inset-0 border border-[#D4AF37]/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-[#C9A227]">
              {page.story.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-light text-[#1A2E26] md:text-4xl">
              {page.story.title}
            </h2>
            <div className="mt-6 h-px w-16 bg-[#D4AF37]/50" />
            <p className="mt-8 font-body text-sm leading-[1.9] text-[#5A635C] md:text-[15px]">
              {page.story.content}
            </p>
            <div className="mt-10 border-l-2 border-[#D4AF37]/40 pl-5">
              <p className="font-display text-lg italic text-[#1A2E26]">{page.story.signature}</p>
              <p className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-[#C9A227]">
                {page.story.signatureRole}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-[#D4AF37]/20 bg-white/80 p-8 text-center shadow-[0_12px_40px_rgba(15,42,34,0.05)] transition duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/45"
            >
              <p className="font-display text-4xl font-light text-[#14352C] md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-3 font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A227]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Header
            eyebrow={page.philosophy.eyebrow}
            title={page.philosophy.title}
            description={page.philosophy.content}
            center
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[page.philosophy.mission, page.philosophy.vision].map((block) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#D4AF37]/20 bg-white/70 p-8"
              >
                <Icon name={block.icon} className="h-6 w-6 text-[#C9A227]" />
                <h3 className="mt-5 font-display text-xl text-[#1A2E26]">{block.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#5A635C]">
                  {block.content}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {values.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-[#D4AF37]/15 bg-[#FBF8F1] p-7 transition hover:-translate-y-1"
              >
                <Icon name={item.icon} className="h-5 w-5 text-[#C9A227]" />
                <h4 className="mt-4 font-display text-lg text-[#1A2E26]">{item.title}</h4>
                <p className="mt-2 font-body text-sm text-[#5A635C]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-[#14352C] px-6 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            {page.whyChoose.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-light md:text-4xl">
            {page.whyChoose.title}
          </h2>
          <p className="mt-4 max-w-xl font-body text-sm text-white/75">{page.whyChoose.description}</p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-500 hover:border-[#D4AF37]/40 hover:bg-white/10"
              >
                <Icon name={item.icon} className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="mt-4 font-display text-lg">{item.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover collage */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Header
              eyebrow={page.discover.eyebrow}
              title={page.discover.title}
              description={page.discover.content}
            />
          </motion.div>
          <div className="relative grid grid-cols-2 gap-4">
            {page.discover.images.slice(0, 3).map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-[#D4AF37]/25",
                  i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square",
                  i === 2 && "lg:-mt-10"
                )}
              >
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  objectFit="cover"
                  className="object-cover transition duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Header eyebrow={page.services.eyebrow} title={page.services.title} center />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-[#D4AF37]/20 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-[#D4AF37]/45"
              >
                <Icon name={item.icon} className="h-5 w-5 text-[#C9A227]" />
                <h3 className="mt-3 font-display text-base text-[#1A2E26]">{item.title}</h3>
                <p className="mt-1 font-body text-xs text-[#6B7A73]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Header
            eyebrow={page.team.eyebrow}
            title={page.team.title}
            description={page.team.description}
            center
          />
        </div>
      </section>

      {/* Awards */}
      <section className="bg-[#14352C] px-6 py-20 text-white lg:px-10 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-body text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            {page.awards.eyebrow}
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-light md:text-4xl">
            {page.awards.title}
          </h2>
          <div className="mt-14 space-y-0">
            {awards.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-[120px_1fr] md:gap-10"
              >
                <p className="font-display text-2xl text-[#D4AF37]">{item.year}</p>
                <div>
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-2 font-body text-sm text-white/70">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials slider */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <Header
            eyebrow={page.testimonials.eyebrow}
            title={page.testimonials.title}
            description={page.testimonials.description}
            center
          />
          <div className="relative mt-14 min-h-[280px]">
            <AnimatePresence mode="wait">
              {testimonials[slide] ? (
                <motion.blockquote
                  key={testimonials[slide].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-[#D4AF37]/20 bg-white/80 p-8 text-center shadow-[0_16px_48px_rgba(15,42,34,0.06)] md:p-12"
                >
                  <div className="mb-4 flex justify-center gap-1">
                    {Array.from({ length: testimonials[slide].rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="font-body text-base italic leading-relaxed text-[#5A635C] md:text-lg">
                    &ldquo;{testimonials[slide].review}&rdquo;
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#D4AF37]/30">
                      {hasMediaSrc(testimonials[slide].imageSrc) ? (
                        <SafeImage
                          src={testimonials[slide].imageSrc}
                          alt={testimonials[slide].name}
                          fill
                          objectFit="cover"
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : null}
                    </div>
                    <div>
                      <cite className="font-display text-lg not-italic text-[#1A2E26]">
                        {testimonials[slide].name}
                      </cite>
                      <p className="font-body text-xs uppercase tracking-wider text-[#C9A227]">
                        {testimonials[slide].country}
                      </p>
                    </div>
                  </div>
                </motion.blockquote>
              ) : null}
            </AnimatePresence>
            {testimonials.length > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={() =>
                    setSlide((s) => (s - 1 + testimonials.length) % testimonials.length)
                  }
                  className="rounded-full border border-[#D4AF37]/30 p-2 text-[#14352C] transition hover:border-[#D4AF37]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next review"
                  onClick={() => setSlide((s) => (s + 1) % testimonials.length)}
                  className="rounded-full border border-[#D4AF37]/30 p-2 text-[#14352C] transition hover:border-[#D4AF37]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="border-t border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Header
            eyebrow={page.galleryPreview.eyebrow}
            title={page.galleryPreview.title}
            center
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.galleryPreview.images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-[#D4AF37]/35"
              >
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  objectFit="cover"
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={page.galleryPreview.ctaHref}
              className="inline-flex rounded-full border border-[#D4AF37]/50 bg-[#14352C] px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37] transition hover:opacity-90"
            >
              {page.galleryPreview.ctaText}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            hasMediaSrc(page.cta.backgroundImage)
              ? { backgroundImage: `url(${mediaUrl(page.cta.backgroundImage, revision || undefined)})` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-[#0A1F19]/72" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-light text-white md:text-5xl">
            {page.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm text-white/80">
            {page.cta.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={page.cta.primaryHref}
              className="rounded-full bg-[#D4AF37] px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19] transition hover:opacity-90"
            >
              {page.cta.primaryText}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className="rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {page.cta.secondaryText}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Header({
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
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-[#C9A227]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-light text-[#1A2E26] md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 font-body text-sm leading-relaxed text-[#5A635C] md:text-[15px]">
          {description}
        </p>
      ) : null}
      <div
        className={cn("mt-6 h-px w-16 bg-[#D4AF37]/45", center && "mx-auto")}
      />
    </div>
  );
}
