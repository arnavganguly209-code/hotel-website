"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MotionSection } from "@/components/shared/MotionSection";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface ContactHomeSectionProps {
  contact: SiteContent["contact"];
  hotel: SiteContent["hotel"];
}

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

  return (
    <MotionSection
      id="contact"
      className="section-padding relative overflow-hidden bg-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <motion.p
            variants={fadeUp}
            className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-luxury-gold"
          >
            {contact.eyebrow}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl font-normal text-luxury-charcoal md:text-4xl lg:text-5xl"
          >
            {contact.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-luxury-muted"
          >
            {contact.description}
          </motion.p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <ul className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: hotel.address },
                { icon: Phone, label: "Telephone", value: hotel.phone },
                { icon: Mail, label: "Email", value: hotel.email },
                { icon: Clock, label: "Front Desk", value: contact.frontDesk },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-luxury-gold/15 bg-luxury-cream">
                    <item.icon className="h-4 w-4 text-luxury-gold" strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-luxury-gold">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-luxury-muted">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="border border-luxury-gold/10 bg-luxury-cream/40 p-8 md:p-10">
            {status === "success" ? (
              <div>
                <h3 className="font-display text-xl text-luxury-charcoal">Thank you</h3>
                <p className="mt-3 text-sm leading-relaxed text-luxury-muted">
                  Thank you. Your message has been received successfully. Our team will contact you shortly.
                </p>
                <Button
                  type="button"
                  variant="gold"
                  className="mt-6 uppercase tracking-wider"
                  onClick={() => setStatus("idle")}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate={false}>
                <h3 className="font-display text-xl text-luxury-charcoal">Send a Message</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input name="fullName" required placeholder="Your Name" aria-label="Name" autoComplete="name" />
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    aria-label="Email"
                    autoComplete="email"
                  />
                </div>
                <Input className="mt-4" name="phone" type="tel" placeholder="Phone (optional)" aria-label="Phone" autoComplete="tel" />
                <Input className="mt-4" name="subject" placeholder="Subject" aria-label="Subject" />
                <textarea
                  name="message"
                  required
                  placeholder="Your Message"
                  rows={4}
                  aria-label="Message"
                  className="mt-4 w-full resize-none border border-luxury-gold/15 bg-white px-4 py-3 text-sm outline-none focus:border-luxury-gold/40"
                />
                {status === "error" ? (
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="gold"
                  disabled={status === "loading"}
                  className="mt-6 gap-2 uppercase tracking-wider disabled:opacity-60"
                >
                  {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}
