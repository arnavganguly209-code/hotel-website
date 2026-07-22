"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  children: number;
  roomQuantity: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  source: string;
  remarks: string;
  createdAt: string;
}

const STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "refunded",
  "payment_pending",
];

const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "offline", "refunded"];

export default function AdminOnlineBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [remarksDraft, setRemarksDraft] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ source: "online" });
      if (status !== "all") params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/bookings?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load bookings");
      setBookings(data.bookings ?? []);
      setRemarksDraft(
        Object.fromEntries((data.bookings ?? []).map((b: Booking) => [b.id, b.remarks || ""]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(id: number, patch: Record<string, unknown>) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } as Booking : b))
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Reservations</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Online Bookings</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Bookings placed through the website.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Status</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            <option value="all">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Search</p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Guest, email, room…"
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-[#0f2420]">
                    #{b.id} · {b.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7a8a82]">
                    {b.email} · {b.phone || "—"} · {new Date(b.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-[#3d5a4c]">
                    {b.roomName} · {new Date(b.checkIn).toLocaleDateString()} →{" "}
                    {new Date(b.checkOut).toLocaleDateString()} · {b.guests}g/{b.children}c ·{" "}
                    {b.roomQuantity} room(s)
                  </p>
                </div>
                <p className="font-serif text-xl text-[#0f2420]">${b.totalAmount}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={b.status}
                  onChange={(e) => void update(b.id, { status: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <select
                  value={b.paymentStatus}
                  onChange={(e) => void update(b.id, { paymentStatus: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={remarksDraft[b.id] ?? ""}
                  onChange={(e) => setRemarksDraft({ ...remarksDraft, [b.id]: e.target.value })}
                  placeholder="Internal remarks"
                  className="min-w-[220px] flex-1 rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => void update(b.id, { remarks: remarksDraft[b.id] ?? "" })}
                  className="rounded-full border border-[#c5a059]/40 px-3 py-1.5 text-xs font-medium text-[#0f2420] hover:bg-[#c5a059]/10"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-[#5a635c]">No online bookings found.</p> : null}
        </div>
      )}
    </div>
  );
}
