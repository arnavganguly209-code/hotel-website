"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

interface EventInquiryFormProps {
  form: SiteContent["meetingsEventsPage"]["form"];
  goldColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

export function EventInquiryForm({
  form,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#5A635C",
}: EventInquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/event-inquiries", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div
        id="event-inquiry"
        className="rounded-[22px] border p-6 sm:p-8"
        style={{
          backgroundColor: "#FBF8F1",
          borderColor: `${goldColor}55`,
          boxShadow: "0 24px 52px rgba(15, 42, 34, 0.12)",
        }}
      >
        <h3
          className="font-display text-xl font-semibold"
          style={{ color: headingColor }}
        >
          {form.successTitle}
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed" style={{ color: bodyColor }}>
          {form.successMessage}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
          style={{ backgroundColor: goldColor }}
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border bg-white/90 px-4 py-3 font-body text-sm outline-none transition focus:ring-2";
  const labelClass = "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em]";

  return (
    <div
      id="event-inquiry"
      className="rounded-[22px] border p-6 sm:p-8"
      style={{
        backgroundColor: "#FBF8F1",
        borderColor: `${goldColor}55`,
        boxShadow: "0 24px 52px rgba(15, 42, 34, 0.12)",
      }}
    >
      <h3 className="font-display text-xl font-semibold" style={{ color: headingColor }}>
        {form.title}
      </h3>
      <p className="mt-2 font-body text-sm leading-relaxed" style={{ color: bodyColor }}>
        {form.description}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass} style={{ color: headingColor }}>
            Full Name *
          </label>
          <input name="name" required className={inputClass} style={{ borderColor: `${goldColor}44` }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Email *
            </label>
            <input name="email" type="email" required className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Phone
            </label>
            <input name="phone" type="tel" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Country
            </label>
            <input name="country" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Company
            </label>
            <input name="company" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Event Type *
            </label>
            <select name="eventType" required className={inputClass} style={{ borderColor: `${goldColor}44` }} defaultValue="">
              <option value="" disabled>
                Select type
              </option>
              {form.eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Guests
            </label>
            <input name="guests" type="number" min={1} className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Date
            </label>
            <input name="eventDate" type="date" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: headingColor }}>
              Time
            </label>
            <input name="eventTime" type="time" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
          </div>
        </div>

        <div>
          <label className={labelClass} style={{ color: headingColor }}>
            Budget
          </label>
          <input name="budget" placeholder="e.g. USD 5,000 – 10,000" className={inputClass} style={{ borderColor: `${goldColor}44` }} />
        </div>

        <div>
          <label className={labelClass} style={{ color: headingColor }}>
            Special Request
          </label>
          <textarea
            name="specialRequest"
            rows={4}
            className={inputClass}
            style={{ borderColor: `${goldColor}44` }}
          />
        </div>

        <div>
          <label className={labelClass} style={{ color: headingColor }}>
            Attachment (optional)
          </label>
          <input
            name="attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="w-full font-body text-sm file:mr-3 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider"
            style={{ color: bodyColor }}
          />
        </div>

        {error ? (
          <p className="font-body text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{
            backgroundColor: goldColor,
            boxShadow: "0 12px 32px rgba(197, 160, 89, 0.38)",
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
      </form>
    </div>
  );
}
