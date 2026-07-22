"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

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

function StatusBadge({ value }: { value: string }) {
  const tone =
    value.includes("cancel") || value.includes("refund")
      ? "border-red-200 bg-red-50 text-red-800"
      : value.includes("confirm") || value === "paid" || value === "checked_in"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

export default function AdminOnlineBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams({ source: "online" });
      if (status !== "all") params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/bookings?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load bookings");
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    setLoading(true);
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void load(), 12000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [load]);

  const pages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const rows = useMemo(
    () => bookings.slice((page - 1) * pageSize, page * pageSize),
    [bookings, page]
  );

  async function update(id: number, patch: Record<string, unknown>) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } as Booking : b)));
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this booking permanently?")) return;
    const res = await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Reservations</p>
        <h1 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#0f2420]">
          Online Bookings
        </h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Live website bookings · auto-refreshes when Orbit deletes records.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#c5a059]/20 bg-white/70 p-4">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Status</p>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
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
        <div className="min-w-[220px] flex-1">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Search</p>
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Guest, email, room…"
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-white/80 shadow-[0_12px_40px_rgba(15,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#f7f2ea] text-[10px] uppercase tracking-[0.16em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Room / Stay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-[#5a635c]">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-[#5a635c]">
                    No online bookings found.
                  </td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id} className="border-t border-[#c5a059]/10 transition hover:bg-[#fbf8f1]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0f2420]">
                        #{b.id} · {b.name}
                      </p>
                      <p className="text-xs text-[#7a8a82]">
                        {b.email} · {b.phone || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{b.roomName}</p>
                      <p className="text-xs text-[#7a8a82]">
                        {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => void update(b.id, { status: e.target.value })}
                        className="mb-1 rounded-md border border-[#c5a059]/30 bg-white px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <div>
                        <StatusBadge value={b.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.paymentStatus}
                        onChange={(e) => void update(b.id, { paymentStatus: e.target.value })}
                        className="rounded-md border border-[#c5a059]/30 bg-white px-2 py-1 text-xs"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-cormorant)] text-lg">
                      ${b.totalAmount}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void remove(b.id)}
                        className="rounded-lg p-2 text-red-700 transition hover:bg-red-50"
                        aria-label="Delete booking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#c5a059]/15 px-4 py-3 text-xs text-[#5a635c]">
          <span>
            Page {page} of {pages} · {bookings.length} records
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#c5a059]/30 px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="rounded-full border border-[#c5a059]/30 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
