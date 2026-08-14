"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import type { SiteContent } from "@/lib/cms/types";

interface DiningReservationFormProps {
  form: SiteContent["diningPage"]["form"];
  goldColor?: string;
  headingColor?: string;
  bodyColor?: string;
  /** inline = page section; modal = popup dialog */
  mode?: "inline" | "modal";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pre-select restaurant when opening from a venue card */
  presetRestaurant?: string;
}

export function DiningReservationForm({
  form,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#5A635C",
  mode = "inline",
  open = false,
  onOpenChange,
  presetRestaurant = "",
}: DiningReservationFormProps) {
  const titleId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [restaurant, setRestaurant] = useState("");
  const [formKey, setFormKey] = useState(0);

  const isModal = mode === "modal";
  const visible = !isModal || open;

  useEffect(() => {
    if (isModal) return;
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("restaurant")?.trim() || "";
    if (!preset) return;
    const match = form.restaurantOptions.find(
      (opt) => opt.toLowerCase() === preset.toLowerCase()
    );
    setRestaurant(match || preset);
  }, [form.restaurantOptions, isModal]);

  useEffect(() => {
    if (!isModal || !open) return;
    const match = presetRestaurant
      ? form.restaurantOptions.find(
          (opt) => opt.toLowerCase() === presetRestaurant.toLowerCase()
        ) || presetRestaurant
      : "";
    setRestaurant(match);
    setStatus("idle");
    setError("");
    setFormKey((k) => k + 1);
  }, [isModal, open, presetRestaurant, form.restaurantOptions]);

  useEffect(() => {
    if (!isModal || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showSuccess) onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isModal, open, onOpenChange, showSuccess]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const fd = new FormData(e.currentTarget);
    const formEl = e.currentTarget;

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
      formEl.reset();
      setRestaurant("");
      setFormKey((k) => k + 1);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  function closeSuccess() {
    setShowSuccess(false);
    if (isModal) onOpenChange?.(false);
  }

  const inputClass =
    "w-full min-h-12 max-w-full rounded-xl border border-[#C5A059]/40 bg-white/95 px-3.5 py-3 font-body text-sm text-[#1A2E26] outline-none transition focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/25 sm:px-4";
  const labelClass =
    "mb-1.5 block break-words font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#062C24]/80 sm:tracking-[0.14em]";

  const formBody = (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="mx-auto mt-2 grid max-w-3xl gap-3.5 sm:grid-cols-2 sm:gap-4"
    >
      <div className="sm:col-span-1">
        <label className={labelClass} htmlFor={`${titleId}-fullName`}>
          Full Name *
        </label>
        <input id={`${titleId}-fullName`} name="fullName" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-email`}>
          Email Address *
        </label>
        <input
          id={`${titleId}-email`}
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-phone`}>
          Phone Number *
        </label>
        <input id={`${titleId}-phone`} name="phone" type="tel" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-country`}>
          Country
        </label>
        <input id={`${titleId}-country`} name="country" className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${titleId}-restaurant`}>
          Restaurant Selection *
        </label>
        <select
          id={`${titleId}-restaurant`}
          name="restaurant"
          required
          className={inputClass}
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
        >
          <option value="" disabled>
            Select a restaurant
          </option>
          {form.restaurantOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {restaurant && !form.restaurantOptions.includes(restaurant) ? (
            <option value={restaurant}>{restaurant}</option>
          ) : null}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-date`}>
          Reservation Date *
        </label>
        <input
          id={`${titleId}-date`}
          name="reservationDate"
          type="date"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-time`}>
          Reservation Time *
        </label>
        <input
          id={`${titleId}-time`}
          name="reservationTime"
          type="time"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${titleId}-adults`}>
          Adults *
        </label>
        <input
          id={`${titleId}-adults`}
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
        <label className={labelClass} htmlFor={`${titleId}-children`}>
          Children
        </label>
        <input
          id={`${titleId}-children`}
          name="children"
          type="number"
          min={0}
          max={20}
          defaultValue={0}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${titleId}-occasion`}>
          Special Occasion
        </label>
        <select
          id={`${titleId}-occasion`}
          name="specialOccasion"
          className={inputClass}
          defaultValue=""
        >
          <option value="">None / Not specified</option>
          {form.occasionOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${titleId}-request`}>
          Special Request
        </label>
        <textarea
          id={`${titleId}-request`}
          name="specialRequest"
          rows={4}
          className={`${inputClass} min-h-[7rem] resize-y`}
          placeholder="Allergies, seating preferences, celebration details…"
        />
      </div>
      <div className="sm:col-span-2">
        <label
          className="flex items-start gap-3 font-body text-sm leading-relaxed"
          style={{ color: bodyColor }}
        >
          <input
            type="checkbox"
            name="consent"
            value="true"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#C5A059]"
          />
          <span className="min-w-0 break-words">{form.consentLabel}</span>
        </label>
      </div>

      {status === "error" && error ? (
        <p className="sm:col-span-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex justify-center pt-2 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#062C24] transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto sm:px-10 sm:tracking-[0.2em]"
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
  );

  const header = (
    <div className="mx-auto max-w-3xl text-center">
      <p
        className="font-display text-[10px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: goldColor }}
      >
        Dining Reservation
      </p>
      <h2
        id={titleId}
        className="mt-2 break-words font-display text-[1.65rem] font-light leading-snug sm:text-3xl md:text-[2rem]"
        style={{ color: headingColor }}
      >
        {form.title}
      </h2>
      <p
        className="mx-auto mt-3 max-w-xl break-words font-body text-sm leading-relaxed sm:mt-4"
        style={{ color: bodyColor }}
      >
        {form.description}
      </p>
      <div className="mx-auto my-5 flex items-center justify-center gap-3" aria-hidden>
        <span className="h-px w-10" style={{ backgroundColor: `${goldColor}77` }} />
        <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: goldColor }} />
        <span className="h-px w-10" style={{ backgroundColor: `${goldColor}77` }} />
      </div>
    </div>
  );

  const successDialog = (
    <AnimatePresence>
      {showSuccess ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-t-[22px] border border-[#C5A059]/50 bg-[#FBF8F1] p-5 text-center shadow-2xl sm:rounded-[24px] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-success`}
          >
            <button
              type="button"
              onClick={closeSuccess}
              className="absolute right-4 top-4 text-[#5A635C]/70 transition hover:text-[#062C24]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="font-display text-[11px] uppercase tracking-[0.32em] text-[#C5A059]">
              Reservation Received
            </p>
            <h3
              id={`${titleId}-success`}
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
                Reference Number <span className="text-[#C5A059]">{reference}</span>
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dining"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#062C24] px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C5A059]"
                onClick={closeSuccess}
              >
                Return to Dining
              </Link>
              <button
                type="button"
                onClick={closeSuccess}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#C5A059]/60 px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#062C24]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (isModal) {
    return (
      <>
        <AnimatePresence>
          {visible ? (
            <motion.div
              className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/65 backdrop-blur-sm"
                aria-label="Close reservation form"
                onClick={() => onOpenChange?.(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 28 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-[1] flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[22px] border border-[#C5A059]/45 bg-[#FBF8F1] shadow-2xl sm:max-h-[90vh] sm:rounded-[24px]"
              >
                <div className="flex items-center justify-between border-b border-[#C5A059]/20 px-4 py-3 sm:px-6">
                  <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[#C5A059]">
                    Reserve Your Table
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenChange?.(false)}
                    className="rounded-full p-2 text-[#5A635C] transition hover:bg-[#062C24]/5 hover:text-[#062C24]"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7">
                  {header}
                  {formBody}
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {successDialog}
      </>
    );
  }

  return (
    <>
      <div
        id="reserve-table"
        className="scroll-mt-28 rounded-[18px] border p-4 sm:rounded-[24px] sm:p-8 md:p-10"
        style={{
          backgroundColor: "#FBF8F1",
          borderColor: `${goldColor}55`,
          boxShadow: "0 28px 60px rgba(15, 42, 34, 0.12)",
        }}
      >
        {header}
        {formBody}
      </div>
      {successDialog}
    </>
  );
}
