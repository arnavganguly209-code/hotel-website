"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface EventInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  eventType: string;
  guests: number;
  eventDate: string | null;
  eventTime: string;
  budget: string;
  specialRequest: string;
  status: string;
  adminReply: string;
  createdAt: string;
}

const STATUSES = ["new", "pending", "contacted", "completed", "archived"];

export default function AdminMeetingsInquiriesPage() {
  const [items, setItems] = useState<EventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/inquiries/meetings?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setItems(data.inquiries ?? []);
      setReplyDraft(
        Object.fromEntries((data.inquiries ?? []).map((i: EventInquiry) => [i.id, i.adminReply || ""]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(id: number, patch: Record<string, unknown>) {
    const res = await fetch("/api/admin/inquiries/meetings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } as EventInquiry : i)));
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this inquiry?")) return;
    const res = await fetch(`/api/admin/inquiries/meetings?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Events</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Meetings &amp; Events</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Corporate and celebration inquiries.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Status</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
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
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Search</p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, company…"
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-[#0f2420]">
                    #{item.id} · {item.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7a8a82]">
                    {item.eventType} · {item.company || "—"} · {item.email} · {item.phone || "—"}
                  </p>
                  <p className="mt-1 text-sm text-[#3d5a4c]">
                    {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "—"} {item.eventTime} ·{" "}
                    {item.guests} guests · Budget: {item.budget || "—"}
                  </p>
                  {item.specialRequest ? (
                    <p className="mt-1 text-sm text-[#5a635c]">{item.specialRequest}</p>
                  ) : null}
                </div>
                <button type="button" onClick={() => void remove(item.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={item.status}
                  onChange={(e) => void update(item.id, { status: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={replyDraft[item.id] ?? ""}
                  onChange={(e) => setReplyDraft({ ...replyDraft, [item.id]: e.target.value })}
                  placeholder="Admin reply"
                  className="min-w-[220px] flex-1 rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => void update(item.id, { adminReply: replyDraft[item.id] ?? "" })}
                  className="rounded-full border border-[#c5a059]/40 px-3 py-1.5 text-xs font-medium text-[#0f2420] hover:bg-[#c5a059]/10"
                >
                  Save Reply
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? <p className="text-sm text-[#5a635c]">No event inquiries found.</p> : null}
        </div>
      )}
    </div>
  );
}
