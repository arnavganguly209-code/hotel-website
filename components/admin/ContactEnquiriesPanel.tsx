"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";

interface ContactEnquiry {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  arrivalDate: string | null;
  departureDate: string | null;
  guests: number;
  adults: number;
  children: number;
  roomPreference: string;
  bookingType: string;
  preferredContact: string;
  budget: string;
  specialRequest: string;
  message: string;
  attachmentUrl: string;
  status: string;
  adminNotes: string;
  createdAt: string;
}

const STATUSES = ["new", "pending", "contacted", "completed", "archived"] as const;

export function ContactEnquiriesPanel() {
  const [inquiries, setInquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [bookingType, setBookingType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (bookingType) params.set("bookingType", bookingType);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/contact-enquiries?${params}`, { cache: "no-store" });
      const data = (await res.json()) as { inquiries?: ContactEnquiry[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load enquiries");
      setInquiries(data.inquiries ?? []);
      setNotes(
        Object.fromEntries((data.inquiries ?? []).map((item) => [item.id, item.adminNotes || ""]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, status, bookingType, from, to]);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void load(), 15000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [load]);

  async function updateStatus(id: number, next: string) {
    const res = await fetch(`/api/contact-enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, adminNotes: notes[id] ?? "" }),
    });
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: next } : item))
      );
      if (selected?.id === id) setSelected({ ...selected, status: next });
    }
  }

  async function saveNotes(id: number) {
    const res = await fetch(`/api/contact-enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes[id] ?? "" }),
    });
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, adminNotes: notes[id] ?? "" } : item
        )
      );
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this enquiry permanently?")) return;
    const res = await fetch(`/api/contact-enquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading contact enquiries…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <AdminInput label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-luxury-gold/70">Status</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-luxury-gold/70">Category</p>
          <select
            value={bookingType}
            onChange={(e) => setBookingType(e.target.value)}
            className="rounded border border-luxury-gold/20 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            {[...new Set(inquiries.map((i) => i.bookingType))].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <AdminInput label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <AdminInput label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button type="button" variant="outline" size="sm" className="border-luxury-gold/30 text-luxury-gold" onClick={() => void load()}>
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() => window.open("/api/contact-enquiries/export?format=excel", "_blank")}
        >
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <p className="text-sm text-white/50">{inquiries.length} enquiry(ies)</p>

      <div className="space-y-3">
        {inquiries.map((item) => (
          <div key={item.id} className="border border-luxury-gold/15 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg text-luxury-gold">
                  #{item.id} · {item.fullName}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {item.bookingType} · {item.email} · {item.phone || "—"} ·{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={item.status}
                  onChange={(e) => void updateStatus(item.id, e.target.value)}
                  className="rounded border border-luxury-gold/20 bg-black/40 px-2 py-1 text-xs text-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-luxury-gold/30 text-luxury-gold"
                  onClick={() => setSelected(item)}
                >
                  View Details
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-luxury-gold/30 text-luxury-gold"
                  onClick={() =>
                    window.open(`/api/contact-enquiries/export?format=pdf&id=${item.id}`, "_blank")
                  }
                >
                  <Printer className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => void handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-luxury-gold/20 bg-[#0F1C18] p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl text-luxury-gold">
                Enquiry #{selected.id}
              </h3>
              <button type="button" className="text-white/60" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm text-white/80">
              {[
                ["Guest", selected.fullName],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Country", selected.country],
                ["Type", selected.bookingType],
                ["Preferred Contact", selected.preferredContact],
                ["Guests", `${selected.guests} (A${selected.adults}/C${selected.children})`],
                [
                  "Dates",
                  `${selected.arrivalDate?.slice(0, 10) || "—"} → ${selected.departureDate?.slice(0, 10) || "—"}`,
                ],
                ["Room", selected.roomPreference || "—"],
                ["Budget", selected.budget || "—"],
                ["Special Request", selected.specialRequest || "—"],
                ["Message", selected.message || "—"],
                ["Attachment", selected.attachmentUrl || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <AdminTextarea
                label="Admin Notes"
                rows={3}
                value={notes[selected.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [selected.id]: e.target.value }))}
              />
              <Button
                type="button"
                variant="gold"
                size="sm"
                className="mt-3"
                onClick={() => void saveNotes(selected.id)}
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
