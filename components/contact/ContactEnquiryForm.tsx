"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

interface ContactEnquiryFormProps {
  form: SiteContent["contactPage"]["form"];
}

const inputClass =
  "w-full rounded-xl border border-[#D4AF37]/25 bg-white px-4 py-3 font-body text-sm text-[#1A2E26] outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20";
const labelClass =
  "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5A635C]";

export function ContactEnquiryForm({ form }: ContactEnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact-enquiries", { method: "POST", body: fd });
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
        id="enquiry-form"
        className="rounded-2xl border border-[#D4AF37]/35 bg-[#FBF8F1] p-8 shadow-[0_24px_52px_rgba(15,42,34,0.1)] md:p-10"
      >
        <h3 className="font-display text-2xl font-light text-[#062C24]">{form.successTitle}</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#5A635C]">{form.successMessage}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 rounded-full bg-[#14352C] px-8 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37] transition hover:opacity-90"
        >
          Send Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div
      id="enquiry-form"
      className="rounded-2xl border border-[#D4AF37]/30 bg-[#FBF8F1] p-6 shadow-[0_24px_52px_rgba(15,42,34,0.1)] sm:p-8 md:p-10"
    >
      <h2 className="font-display text-2xl font-light text-[#062C24] md:text-3xl">{form.title}</h2>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-[#5A635C]">{form.description}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" encType="multipart/form-data">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full Name *">
            <input name="fullName" required className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Email Address *">
            <input name="email" type="email" required className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Phone Number">
            <input name="phone" type="tel" className={inputClass} autoComplete="tel" />
          </Field>
          <Field label="Country">
            <input name="country" className={inputClass} autoComplete="country-name" />
          </Field>
          <Field label="Arrival Date">
            <input name="arrivalDate" type="date" className={inputClass} />
          </Field>
          <Field label="Departure Date">
            <input name="departureDate" type="date" className={inputClass} />
          </Field>
          <Field label="Number of Guests">
            <input name="guests" type="number" min={1} defaultValue={2} className={inputClass} />
          </Field>
          <Field label="Room Preference">
            <input name="roomPreference" placeholder="e.g. Deluxe, Family" className={inputClass} />
          </Field>
          <Field label="Adults">
            <input name="adults" type="number" min={1} defaultValue={2} className={inputClass} />
          </Field>
          <Field label="Children">
            <input name="children" type="number" min={0} defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Booking Type *">
            <select name="bookingType" required className={inputClass} defaultValue={form.bookingTypes[0]}>
              {form.bookingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred Contact Method">
            <select name="preferredContact" className={inputClass} defaultValue="Email">
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </Field>
          <Field label="Budget">
            <input name="budget" placeholder="Optional" className={inputClass} />
          </Field>
          <Field label="Attachment (Optional)">
            <input
              name="attachment"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="w-full font-body text-sm text-[#5A635C] file:mr-3 file:rounded-full file:border-0 file:bg-[#14352C] file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-wider file:text-[#D4AF37]"
            />
          </Field>
        </div>

        <Field label="Special Request">
          <input name="specialRequest" className={inputClass} />
        </Field>

        <Field label="Message">
          <textarea name="message" rows={6} className={`${inputClass} resize-y`} />
        </Field>

        <label className="flex items-start gap-3 font-body text-sm text-[#5A635C]">
          <input
            name="consent"
            type="checkbox"
            required
            value="true"
            className="mt-1 accent-[#D4AF37]"
          />
          <span>{form.consentText}</span>
        </label>

        {status === "error" ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14352C] px-8 py-4 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37] transition hover:bg-[#0F2820] disabled:opacity-60 md:w-auto"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {form.submitLabel}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
