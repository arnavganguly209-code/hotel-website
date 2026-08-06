"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { routes, legalSectionPath, LEGAL_SECTIONS, type LegalSectionId } from "@/lib/navigation";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "privacy" as const, label: "Privacy Policy" },
  { id: "terms" as const, label: "Terms & Conditions" },
  { id: "cancellation" as const, label: "Cancellation Policy" },
  { id: "cookies" as const, label: "Cookie Settings" },
  { id: "sitemap" as const, label: "Sitemap" },
] satisfies ReadonlyArray<{ id: LegalSectionId; label: string }>;

const SITEMAP_LINKS = [
  { label: "Overview", href: routes.home },
  { label: "Rooms", href: routes.rooms },
  { label: "Restaurant", href: routes.restaurant },
  { label: "Spa & Wellness", href: routes.spa },
  { label: "Meetings & Events", href: routes.meetingsEvents },
  { label: "Gallery", href: routes.gallery },
  { label: "About Us", href: routes.about },
  { label: "Contact Us", href: routes.contact },
  { label: "Cultural Experience", href: routes.culturalExperience },
  ...LEGAL_SECTIONS.filter((id) => id !== "sitemap").map((id) => ({
    label: SECTIONS.find((s) => s.id === id)?.label ?? id,
    href: legalSectionPath(id),
  })),
];

interface LegalPageClientProps {
  activeSection?: LegalSectionId;
}

export function LegalPageClient({ activeSection = "privacy" }: LegalPageClientProps) {
  const nav = useMemo(() => SECTIONS, []);

  useEffect(() => {
    const el = document.getElementById(activeSection);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, [activeSection]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F7F4EF]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl min-w-0 px-6 pb-24 pt-16 sm:pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <p className="font-body text-xs uppercase tracking-[0.32em] text-[#C9A227]">
            Hotel Thamel Park
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-wide text-[#1A2E26] md:text-5xl lg:text-[3.25rem]">
            Legal Information
          </h1>
          <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-[#5A6B63] md:text-[15px]">
            Our policies are designed to protect your privacy and ensure a transparent,
            refined guest experience at {siteConfig.name}.
          </p>
          <div className="mt-8 h-px w-20 bg-[#D4AF37]/50" />
        </motion.header>

        <div className="mt-14 grid min-w-0 gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-label="Legal sections"
            className="min-w-0 lg:sticky lg:top-28 lg:self-start"
          >
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {nav.map((item) => (
                <li key={item.id} className="shrink-0 lg:shrink">
                  <Link
                    href={legalSectionPath(item.id)}
                    className={cn(
                      "block whitespace-nowrap border-l-2 px-4 py-2.5 font-body text-[12px] tracking-[0.08em] transition-colors duration-300",
                      activeSection === item.id
                        ? "border-[#D4AF37] text-[#1A2E26]"
                        : "border-transparent text-[#6B7A73] hover:text-[#1A2E26]"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-16 md:space-y-20">
            <LegalSection
              id="privacy"
              title="Privacy Policy"
              highlighted={activeSection === "privacy"}
            >
              <LegalBlock heading="Information We Collect">
                {siteConfig.name} collects information you provide directly, including name,
                email, phone number, and booking details. This information is used to process
                reservations and enhance your guest experience.
              </LegalBlock>
              <LegalBlock heading="How We Use Your Data">
                We use your personal information to process bookings, communicate with you, and
                improve our services. We do not sell or share your data with third parties except
                as necessary to provide our services.
              </LegalBlock>
              <LegalBlock heading="Data Security">
                All personal data is stored securely with appropriate technical and organizational
                safeguards to protect against unauthorized access.
              </LegalBlock>
              <LegalBlock heading="Your Rights">
                You may request access, correction, or deletion of your personal data by contacting
                us at {siteConfig.email}.
              </LegalBlock>
            </LegalSection>

            <LegalSection id="terms" title="Terms & Conditions" highlighted={activeSection === "terms"}>
              <LegalBlock heading="Reservations">
                All bookings are subject to availability and confirmation. Rates are quoted in USD
                and may vary by season.
              </LegalBlock>
              <LegalBlock heading="Check-In & Check-Out">
                Check-in begins at 2:00 PM. Check-out is at 12:00 PM. Early check-in and late
                check-out are subject to availability.
              </LegalBlock>
              <LegalBlock heading="Guest Responsibilities">
                Guests are responsible for any damage to hotel property during their stay. The hotel
                reserves the right to refuse service for policy violations.
              </LegalBlock>
              <LegalBlock heading="Liability">
                {siteConfig.name} is not liable for loss of personal belongings unless caused by
                proven negligence of the hotel.
              </LegalBlock>
            </LegalSection>

            <LegalSection
              id="cancellation"
              title="Cancellation Policy"
              highlighted={activeSection === "cancellation"}
            >
              <LegalBlock heading="Standard Cancellations">
                Cancellations made 48 hours or more prior to the scheduled arrival date receive a
                full refund of prepaid amounts, subject to the rate and package conditions of your
                booking.
              </LegalBlock>
              <LegalBlock heading="Late Cancellations">
                Cancellations within 48 hours of arrival may incur a charge equivalent to one
                night&apos;s stay. No-shows are charged according to the confirmed reservation terms.
              </LegalBlock>
              <LegalBlock heading="Special Rates & Packages">
                Non-refundable rates, promotional packages, and group bookings may carry different
                cancellation terms, which will be stated at the time of booking.
              </LegalBlock>
              <LegalBlock heading="How to Cancel">
                Please contact reservations at {siteConfig.email} or {siteConfig.phone} to cancel or
                modify your stay.
              </LegalBlock>
            </LegalSection>

            <LegalSection id="cookies" title="Cookie Settings" highlighted={activeSection === "cookies"}>
              <LegalBlock heading="What Are Cookies">
                Cookies are small text files stored on your device that help us remember preferences
                and understand how our website is used.
              </LegalBlock>
              <LegalBlock heading="How We Use Cookies">
                We use essential cookies for site functionality, analytics cookies to improve
                performance, and optional preference cookies to remember your settings.
              </LegalBlock>
              <LegalBlock heading="Managing Cookies">
                You can control cookies through your browser settings. Disabling certain cookies may
                affect site features such as booking forms and preference recall.
              </LegalBlock>
              <LegalBlock heading="Updates">
                We may update this cookie notice periodically. Continued use of the site after
                changes constitutes acceptance of the revised settings description.
              </LegalBlock>
            </LegalSection>

            <LegalSection id="sitemap" title="Sitemap" highlighted={activeSection === "sitemap"}>
              <p className="font-body text-sm leading-relaxed text-[#5A6B63]">
                Explore the main destinations on our website:
              </p>
              <ul className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
                {SITEMAP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 font-body text-sm text-[#1A2E26] transition-colors hover:text-[#C9A227]"
                    >
                      <span className="text-[#D4AF37] transition-transform group-hover:translate-x-0.5">
                        ›
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </LegalSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalSection({
  id,
  title,
  highlighted,
  children,
}: {
  id: string;
  title: string;
  highlighted?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
      className={cn(
        "scroll-mt-28 rounded-2xl transition-shadow duration-300",
        highlighted && "ring-1 ring-[#D4AF37]/25 ring-offset-4 ring-offset-[#F7F4EF]"
      )}
    >
      <h2 className="font-display text-2xl font-light tracking-wide text-[#1A2E26] md:text-3xl">
        {title}
      </h2>
      <div className="mt-3 h-px w-14 bg-[#D4AF37]/45" />
      <div className="mt-8 space-y-8">{children}</div>
    </motion.section>
  );
}

function LegalBlock({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-lg text-[#243830]">{heading}</h3>
      <p className="mt-2.5 font-body text-sm leading-relaxed text-[#5A6B63] md:text-[15px]">
        {children}
      </p>
    </div>
  );
}
