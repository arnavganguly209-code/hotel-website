"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Loader2,
  User,
  PenLine,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { MotionSection } from "@/components/shared/MotionSection";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface ContactHomeSectionProps {
  contact: SiteContent["contact"];
  hotel: SiteContent["hotel"];
}

const GOLD = "#C5A059";
const HEADING = "#062C24";
const BODY = "#5A635C";
const CARD_BG = "#FBF8F1";
const SECTION_BG = "#F7F4EC";

function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 max-w-[4.5rem]" style={{ backgroundColor: `${GOLD}99` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
      <span className="h-px flex-1 max-w-[4.5rem]" style={{ backgroundColor: `${GOLD}99` }} />
    </div>
  );
}

function CardShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`h-full rounded-[18px] p-6 sm:p-7 md:p-8 ${className}`}
      style={{
        backgroundColor: CARD_BG,
        border: `1px solid ${GOLD}55`,
        boxShadow: "0 14px 36px rgba(15, 42, 34, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

function IconField({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
        style={{ color: `${BODY}99` }}
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      {children}
    </div>
  );
}

const fieldClass =
  "w-full min-h-12 rounded-xl border border-[#C5A059]/25 bg-white pl-11 pr-4 py-3 font-body text-sm text-[#062C24] outline-none transition placeholder:text-[#5A635C]/70 focus:border-[#C5A059]/55 focus:ring-2 focus:ring-[#C5A059]/15";

export function ContactHomeSection({ contact, hotel }: ContactHomeSectionProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("bookingType", "General Inquiry");
    fd.set("consent", "true");
    fd.set("sourcePage", typeof window !== "undefined" ? window.location.href : "/#contact");
    if (!fd.get("preferredContact")) fd.set("preferredContact", "Email");

    try {
      const res = await fetch("/api/contact-enquiries", { method: "POST", body: fd });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to send your message. Please try again.");
      }
      form.reset();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send your message. Please try again.");
    }
  }

  const details = [
    { icon: MapPin, label: "Address", value: hotel.address },
    { icon: Phone, label: "Telephone", value: hotel.phone },
    { icon: Mail, label: "Email", value: hotel.email },
    { icon: Clock, label: "Front Desk", value: contact.frontDesk },
  ];

  return (
    <MotionSection
      id="contact"
      className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: SECTION_BG }}
    >
      <div className="mx-auto max-w-[1100px]">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <motion.p
            variants={fadeUp}
            className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.32em] sm:text-[11px]"
            style={{ color: GOLD }}
          >
            {contact.eyebrow}
          </motion.p>
          <OrnamentDivider className="mb-4" />
          <motion.h2
            variants={fadeUp}
            className="font-display text-[1.75rem] font-semibold uppercase leading-[1.15] tracking-[0.04em] sm:text-[2.1rem] md:text-[2.35rem]"
            style={{ color: HEADING }}
          >
            {contact.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl font-body text-[14px] leading-[1.7] sm:text-[15px]"
            style={{ color: BODY }}
          >
            {contact.description}
          </motion.p>
        </div>

        {/* Same frame: left details + right form, tops flush */}
        <div className="grid items-start gap-5 lg:grid-cols-[0.92fr_1.28fr] lg:gap-6 xl:gap-7">
          {/* LEFT — contact details card */}
          <motion.div variants={fadeUp} className="min-w-0 self-start">
            <CardShell>
              <ul>
                {details.map((item, i) => (
                  <li key={item.label}>
                    {i > 0 ? (
                      <div className="my-4 flex items-center gap-2.5" aria-hidden>
                        <span className="h-px flex-1" style={{ backgroundColor: `${GOLD}55` }} />
                        <span
                          className="h-1 w-1 rotate-45 shrink-0"
                          style={{ backgroundColor: GOLD }}
                        />
                        <span className="h-px flex-1" style={{ backgroundColor: `${GOLD}55` }} />
                      </div>
                    ) : null}
                    <div className="flex items-start gap-3.5">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "#F3EDE0",
                          border: `1px solid ${GOLD}66`,
                          color: GOLD,
                        }}
                      >
                        <item.icon className="h-4 w-4" strokeWidth={1.4} />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p
                          className="font-body text-[10px] font-semibold uppercase tracking-[0.2em]"
                          style={{ color: GOLD }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="mt-1 font-body text-[14px] font-medium leading-snug sm:text-[15px]"
                          style={{ color: HEADING }}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardShell>
          </motion.div>

          {/* RIGHT — form card (same top edge as left) */}
          <motion.div variants={fadeUp} className="min-w-0 self-start">
            <CardShell>
              {status === "success" ? (
                <div className="text-center">
                  <h3
                    className="font-display text-xl font-semibold uppercase tracking-[0.06em]"
                    style={{ color: HEADING }}
                  >
                    Thank you
                  </h3>
                  <OrnamentDivider className="my-4" />
                  <p className="font-body text-sm leading-relaxed" style={{ color: BODY }}>
                    Thank you. Your message has been received successfully. Our team will contact you
                    shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-7 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD} 0%, #B08D45 100%)`,
                      boxShadow: "0 10px 24px rgba(197, 160, 89, 0.35)",
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate={false}>
                  <h3
                    className="text-center font-display text-[1.15rem] font-semibold uppercase tracking-[0.08em] sm:text-xl"
                    style={{ color: HEADING }}
                  >
                    Send a Message
                  </h3>
                  <OrnamentDivider className="my-4" />

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <IconField icon={User}>
                      <input
                        name="fullName"
                        required
                        placeholder="Your Name"
                        aria-label="Name"
                        autoComplete="name"
                        className={fieldClass}
                      />
                    </IconField>
                    <IconField icon={Mail}>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email Address"
                        aria-label="Email"
                        autoComplete="email"
                        className={fieldClass}
                      />
                    </IconField>
                  </div>

                  <div className="mt-3.5">
                    <IconField icon={Phone}>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone (optional)"
                        aria-label="Phone"
                        autoComplete="tel"
                        className={fieldClass}
                      />
                    </IconField>
                  </div>

                  <div className="mt-3.5">
                    <IconField icon={PenLine}>
                      <input
                        name="subject"
                        placeholder="Subject"
                        aria-label="Subject"
                        className={fieldClass}
                      />
                    </IconField>
                  </div>

                  <div className="relative mt-3.5">
                    <span
                      className="pointer-events-none absolute left-3.5 top-3.5"
                      style={{ color: `${BODY}99` }}
                      aria-hidden
                    >
                      <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <textarea
                      name="message"
                      required
                      placeholder="Your Message"
                      rows={4}
                      aria-label="Message"
                      className={`${fieldClass} resize-none pt-3.5`}
                    />
                  </div>

                  {status === "error" ? (
                    <p
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-8 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 disabled:opacity-60 sm:text-[12px]"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD} 0%, #B08D45 100%)`,
                      boxShadow: "0 12px 28px rgba(197, 160, 89, 0.38)",
                    }}
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Send Message
                    {status !== "loading" ? (
                      <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                    ) : null}
                  </button>
                </form>
              )}
            </CardShell>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}
