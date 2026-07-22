"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

const gold = "#C5A059";
const heading = "#062C24";
const body = "#5A635C";

const fieldClass =
  "w-full rounded-lg border bg-white px-4 py-3 font-body text-sm outline-none transition focus:ring-2";

export function SpaInquiryForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [treatment, setTreatment] = useState("");
  const [guests, setGuests] = useState("1");
  const [specialRequest, setSpecialRequest] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setStatus("error");
      setMessage("Please share your name and email so we can confirm your reservation.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/spa-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          preferredDate,
          preferredTime,
          treatment,
          guests: Number(guests) || 1,
          specialRequest,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error || "Unable to send your request. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thank you. Our spa concierge will reach out shortly to confirm your appointment.");
      setFullName("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setPreferredTime("");
      setTreatment("");
      setGuests("1");
      setSpecialRequest("");
    } catch {
      setStatus("error");
      setMessage("Unable to send your request. Please try again.");
    }
  }

  return (
    <section id="spa-inquiry" className="scroll-mt-28 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div
        className="mx-auto max-w-[720px] rounded-[24px] border px-6 py-10 md:px-10"
        style={{
          backgroundColor: "#FBF8F1",
          borderColor: `${gold}55`,
          boxShadow: "0 24px 54px rgba(15, 42, 34, 0.1)",
        }}
      >
        <div className="text-center">
          <p
            className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: gold }}
          >
            Quick Enquiry
          </p>
          <h2 className="mt-3 font-display text-2xl font-light md:text-3xl" style={{ color: heading }}>
            Request a Spa Appointment
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed" style={{ color: body }}>
            Prefer to book directly? Share your details and our spa team will confirm availability.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="email"
            required
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="tel"
            placeholder="Phone / WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="text"
            placeholder="Preferred Treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="date"
            placeholder="Preferred Date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="time"
            placeholder="Preferred Time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="number"
            min={1}
            max={10}
            placeholder="Guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />
          <input
            type="text"
            placeholder="Special Request (optional)"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            className={fieldClass}
            style={{ borderColor: `${gold}44`, color: heading }}
          />

          {message ? (
            <p
              className="sm:col-span-2 font-body text-sm"
              style={{ color: status === "error" ? "#b64545" : "#2f6b4f" }}
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="sm:col-span-2 mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: heading, color: gold }}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === "loading" ? "Sending…" : "Send Enquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}
