"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PaymentRow {
  id: number;
  name: string;
  email: string;
  roomName: string;
  source: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  totalAmount: number;
  transactionId: string | null;
  cardLast4: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "offline", "refunded"];

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0, refunded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/payments?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load payments");
      setRows(data.bookings ?? []);
      setTotals(data.totals ?? { paid: 0, unpaid: 0, refunded: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [paymentStatus, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Finance</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Payments</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Track payment status across all reservations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a82]">Paid</p>
          <p className="mt-2 font-serif text-2xl text-[#0f2420]">${totals.paid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a82]">Unpaid / Pending</p>
          <p className="mt-2 font-serif text-2xl text-[#0f2420]">${totals.unpaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a82]">Refunded</p>
          <p className="mt-2 font-serif text-2xl text-[#0f2420]">${totals.refunded.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Payment Status
          </p>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            <option value="all">All</option>
            {PAYMENT_STATUSES.map((s) => (
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
          <Loader2 className="h-4 w-4 animate-spin" /> Loading payments…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Booking Status</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#c5a059]/10">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0f2420]">{r.name}</p>
                    <p className="text-xs text-[#7a8a82]">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">{r.roomName}</td>
                  <td className="px-4 py-3 capitalize">{r.source}</td>
                  <td className="px-4 py-3 capitalize">{r.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                        ["paid", "offline"].includes(r.paymentStatus)
                          ? "bg-emerald-50 text-emerald-700"
                          : r.paymentStatus === "refunded"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{r.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 font-medium text-[#0f2420]">${r.totalAmount}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-[#5a635c]">
                    No bookings found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
