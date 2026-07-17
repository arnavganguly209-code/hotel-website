"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import type { SiteContent } from "@/lib/cms/types";

interface DiningReservationFormProps {
  form: SiteContent["diningPage"]["form"];
  goldColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

export function DiningReservationForm({
  form,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#5A635C",
}: DiningReservationFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/dining-reservations", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        reservation?: { referenceNumber?: string };
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reservation failed");
      }
      setReference(data.reservation?.referenceNumber || "");
      setShowSuccess(true);
      setStatus("idle");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const inputClass =
    "w-full min-h-12 rounded-xl border border-[#C5A059]/40 bg-white/95 px-4 py-3 font-body text-sm text-[#1A2E26] outline-none transition focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/25";
  const labelClass =
    "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#062C24]/80";

  return (
    <>
      <div
        id="reserve-table"
        className="scroll-mt-28 rounded-[24px] border p-6 sm:p-8 md:p-10"
        style={{
          backgroundColor: "#FBF8F1",
          borderColor: `${goldColor}55`,
          boxShadow: "0 28px 60px rgba(15, 42, 34, 0.12)",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-display text-3xl font-light md:text-4xl"
            style={{ color: headingColor }}
          >
            {form.title}
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed md:text-base"
            style={{ color: bodyColor }}
          >
            {form.description}
          </p>
          <div className="mx-auto my-6 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10" style={{ backgroundColor: `${goldColor}77` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: goldColor }} />
            <span className="h-px w-10" style={{ backgroundColor: `${goldColor}77` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-2 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className={labelClass} htmlFor="fullName">
              Full Name *
            </label>
            <input id="fullName" name="fullName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email Address *
            </label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone Number *
            </label>
            <input id="phone" name="phone" type="tel" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="country">
              Country
            </label>
            <input id="country" name="country" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="restaurant">
              Restaurant Selection *
            </label>
            <select id="restaurant" name="restaurant" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Select a restaurant
              </option>
              {form.restaurantOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="reservationDate">
              Reservation Date *
            </label>
            <input
              id="reservationDate"
              name="reservationDate"
              type="date"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="reservationTime">
              Reservation Time *
            </label>
            <input
              id="reservationTime"
              name="reservationTime"
              type="time"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="adults">
              Adults *
            </label>
            <input
              id="adults"
              name="adults"
              type="number"
              min={1}
              max={40}
              defaultValue={2}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="children">
              Children
            </label>
            <input
              id="children"
              name="children"
              type="number"
              min={0}
              max={20}
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="specialOccasion">
              Special Occasion
            </label>
            <select id="specialOccasion" name="specialOccasion" className={inputClass} defaultValue="">
              <option value="">None / Not specified</option>
              {form.occasionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="specialRequest">
              Special Request
            </label>
            <textarea
              id="specialRequest"
              name="specialRequest"
              rows={5}
              className={`${inputClass} min-h-[8rem] resize-y`}
              placeholder="Allergies, seating preferences, celebration details…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 font-body text-sm" style={{ color: bodyColor }}>
              <input
                type="checkbox"
                name="consent"
                value="true"
                required
                className="mt-1 accent-[#C5A059]"
              />
              <span>{form.consentLabel}</span>
            </label>
          </div>

          {status === "error" && error ? (
            <p className="sm:col-span-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="sm:col-span-2 flex justify-center pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-10 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[#062C24] transition hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                backgroundColor: goldColor,
                boxShadow: "0 14px 32px rgba(197, 160, 89, 0.35)",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                form.submitLabel
              )}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showSuccess ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-[24px] border border-[#C5A059]/50 bg-[#FBF8F1] p-8 text-center shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dining-success-title"
            >
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="absolute right-4 top-4 text-[#5A635C]/70 transition hover:text-[#062C24]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="font-display text-[11px] uppercase tracking-[0.32em] text-[#C5A059]">
                Reservation Received
              </p>
              <h3
                id="dining-success-title"
                className="mt-3 font-display text-3xl font-light text-[#062C24]"
              >
                {form.successTitle}
              </h3>
              <p className="mt-4 font-body text-sm leading-relaxed text-[#5A635C]">
                {form.successMessage}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-[#5A635C]">
                {form.successSecondary}
              </p>
              {reference ? (
                <p className="mt-6 font-display text-sm tracking-[0.12em] text-[#062C24]">
                  Reference Number{" "}
                  <span className="text-[#C5A059]">{reference}</span>
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/dining"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#062C24] px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C5A059]"
                  onClick={() => setShowSuccess(false)}
                >
                  Return to Dining
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#C5A059]/60 px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#062C24]"
                >
                  Book Another Table
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
