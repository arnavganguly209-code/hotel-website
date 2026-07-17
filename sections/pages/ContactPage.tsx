"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Headphones,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContactEnquiryForm } from "@/components/contact/ContactEnquiryForm";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

interface ContactPageProps {
  content: SiteContent;
}

const CARD_ICONS: Record<string, typeof Phone> = {
  "map-pin": MapPin,
  phone: Phone,
  mail: Mail,
  clock: Clock,
  "message-circle": MessageCircle,
};

const WHY_ICONS: Record<string, typeof Phone> = {
  headset: Headphones,
  sparkles: Sparkles,
  zap: Zap,
  heart: Heart,
};

export function ContactPage({ content }: ContactPageProps) {
  const page = content.contactPage;
  const cards = page.cards.filter((c) => c.enabled !== false).sort((a, b) => a.order - b.order);
  const whyItems = page.whyContact.items
    .filter((i) => i.enabled !== false)
    .sort((a, b) => a.order - b.order);
  const faqs = page.faq.items.filter((i) => i.enabled !== false).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-[#F7F4EF]">
      {/* Quick contact cards */}
      <section className="relative px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[card.icon] || MapPin;
            const inner = (
              <>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#14352C]/5">
                  <Icon className="h-4 w-4 text-[#C9A227]" strokeWidth={1.4} />
                </div>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
                  {card.title}
                </p>
                <p className="mt-2 font-body text-sm font-medium text-[#1A2E26]">{card.value}</p>
                <p className="mt-2 font-body text-xs leading-relaxed text-[#6B7A73]">
                  {card.description}
                </p>
              </>
            );
            const className = cn(
              "group rounded-2xl border border-[#D4AF37]/20 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,42,34,0.06)]",
              "transition duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-[0_18px_48px_rgba(15,42,34,0.12)]"
            );
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={cn(className, "block h-full")}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cn(className, "h-full")}>{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Enquiry form */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ContactEnquiryForm form={page.form} />
        </div>
      </section>

      {/* Why contact */}
      <section className="border-y border-[#D4AF37]/15 bg-[#FBF8F1] px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Header
            eyebrow={page.whyContact.eyebrow}
            title={page.whyContact.title}
            description={page.whyContact.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[item.icon] || Sparkles;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-[#D4AF37]/20 bg-white/70 p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,42,34,0.08)]"
                >
                  <Icon className="h-6 w-6 text-[#C9A227]" strokeWidth={1.3} />
                  <h3 className="mt-5 font-display text-lg text-[#1A2E26]">{item.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#5A635C]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Header
            eyebrow={page.location.eyebrow}
            title={page.location.title}
            description={page.location.description}
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 shadow-[0_20px_50px_rgba(15,42,34,0.1)]">
              {page.location.mapEmbedUrl ? (
                <iframe
                  src={page.location.mapEmbedUrl}
                  title="Hotel location map"
                  className="h-[360px] w-full md:h-[440px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : null}
            </div>
            <div>
              <a
                href={page.location.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#14352C] px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37] transition hover:opacity-90"
              >
                Open Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <h3 className="mt-10 font-display text-xl text-[#1A2E26]">
                {page.location.nearbyTitle}
              </h3>
              <ul className="mt-5 space-y-4">
                {page.location.nearby.map((place) => (
                  <li
                    key={place.id}
                    className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3"
                  >
                    <span className="font-body text-sm text-[#1A2E26]">{place.title}</span>
                    <span className="font-body text-xs tracking-wide text-[#C9A227]">
                      {place.distance}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Business info */}
      <section className="bg-[#14352C] px-6 py-20 text-white lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            {page.business.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-light md:text-4xl">{page.business.title}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {[page.business.left, page.business.right].map((col, ci) => (
              <dl key={ci} className="space-y-5">
                {col.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 border-b border-white/10 pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]">
                      {row.label}
                    </dt>
                    <dd className="font-body text-sm text-white/90 sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <Header eyebrow={page.faq.eyebrow} title={page.faq.title} />
          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {faqs.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-xl border border-[#D4AF37]/20 bg-white/80 px-5 data-[state=open]:border-[#D4AF37]/45"
              >
                <AccordionTrigger className="font-display text-left text-base text-[#1A2E26] hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm leading-relaxed text-[#5A635C]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${page.cta.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-[#0A1F19]/70" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-light text-white md:text-5xl">
            {page.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm text-white/80 md:text-[15px]">
            {page.cta.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={page.cta.primaryHref}
              className="rounded-full bg-[#D4AF37] px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19] transition hover:opacity-90"
            >
              {page.cta.primaryText}
            </Link>
            <a
              href={page.cta.secondaryHref}
              className="rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {page.cta.secondaryText}
            </a>
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
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-[#C9A227]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-light text-[#1A2E26] md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 font-body text-sm leading-relaxed text-[#5A635C] md:text-[15px]">
          {description}
        </p>
      ) : null}
      <div className="mt-6 h-px w-16 bg-[#D4AF37]/45" />
    </div>
  );
}
