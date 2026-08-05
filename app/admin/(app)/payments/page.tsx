"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminBookingMoney } from "@/components/admin/AdminBookingMoney";

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
  displayPrice?: number;
  basePrice?: number;
  vatRate?: number;
  vatAmount?: number;
  grandTotal?: number;
  currency?: string;
  transactionId: string | null;
  cardLast4: string;
  paymentGateway?: string | null;
  paymentDate?: string | null;
  pacoOrderNo?: string | null;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

interface PacoTxn {
  id: string;
  orderNo: string;
  status: string;
  amount: number;
  currency: string;
  approvalCode: string | null;
  invoiceNo: string | null;
  paidAt: string | null;
  booking: {
    id: number;
    name: string;
    email: string;
    roomName: string;
    paymentStatus: string;
    status: string;
  };
}

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "offline",
  "refunded",
  "failed",
  "cancelled",
  "void",
  "pay_at_hotel",
];

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [txns, setTxns] = useState<PacoTxn[]>([]);
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0, refunded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [q, setQ] = useState("");
  const [busyOrder, setBusyOrder] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (q) params.set("q", q);
      const [res, pacoRes] = await Promise.all([
        fetch(`/api/admin/payments?${params}`, { cache: "no-store" }),
        fetch("/api/admin/payments/paco", { cache: "no-store" }),
      ]);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load payments");
      setRows(data.bookings ?? []);
      setTotals(data.totals ?? { paid: 0, unpaid: 0, refunded: 0 });
      if (pacoRes.ok) {
        const pacoData = await pacoRes.json();
        setTxns(pacoData.transactions ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [paymentStatus, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runPaco(action: string, orderNo: string) {
    setBusyOrder(orderNo);
    setNotice("");
    setError("");
    try {
      const res = await fetch("/api/admin/payments/paco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, orderNo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `${action} failed`);
      setNotice(`${action} completed for ${orderNo}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setBusyOrder("");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Finance</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Payments</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Track payment status and HBL PACO transactions across all reservations.
        </p>
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
      {notice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading payments…
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
                <tr>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Txn / Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Docs</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#c5a059]/10">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0f2420]">
                        #{r.id} · {r.name}
                      </p>
                      <p className="text-xs text-[#7a8a82]">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">{r.roomName}</td>
                    <td className="px-4 py-3 text-xs capitalize">
                      {r.paymentGateway || r.paymentMethod || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                          ["paid", "offline"].includes(r.paymentStatus)
                            ? "bg-emerald-50 text-emerald-700"
                            : r.paymentStatus === "refunded" || r.paymentStatus === "void"
                              ? "bg-orange-50 text-orange-700"
                              : r.paymentStatus === "failed" || r.paymentStatus === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.paymentStatus}
                      </span>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[#7a8a82]">
                        {r.status.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5a635c]">
                      <p>{r.transactionId || r.pacoOrderNo || "—"}</p>
                      <p>{r.paymentDate ? new Date(r.paymentDate).toLocaleString() : "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <AdminBookingMoney booking={r} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <a
                        href={`/api/bookings/${r.id}/voucher`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9e7738] underline"
                      >
                        Invoice / Voucher
                      </a>
                    </td>
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

          <div>
            <h2 className="font-serif text-xl text-[#0f2420]">HBL PACO transactions</h2>
            <p className="mt-1 text-sm text-[#5a635c]">Inquiry, refund, void, and settlement.</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.id} className="border-t border-[#c5a059]/10">
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-[#0f2420]">{t.orderNo}</p>
                        <p className="text-[#7a8a82]">Booking #{t.booking.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{t.booking.name}</p>
                        <p className="text-xs text-[#7a8a82]">{t.booking.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{t.status.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        {t.currency} {Number(t.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(["sync", "inquiry", "refund", "void", "settle"] as const).map((action) => (
                            <button
                              key={action}
                              type="button"
                              disabled={busyOrder === t.orderNo}
                              onClick={() => {
                                if (
                                  ["refund", "void", "settle"].includes(action) &&
                                  !confirm(`Run ${action} for order ${t.orderNo}?`)
                                ) {
                                  return;
                                }
                                void runPaco(action, t.orderNo);
                              }}
                              className="rounded-md border border-[#c5a059]/35 px-2 py-1 text-[10px] uppercase tracking-wide text-[#3d5a4c] hover:bg-[#f7f2ea] disabled:opacity-50"
                            >
                              {busyOrder === t.orderNo ? "…" : action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {txns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-[#5a635c]">
                        No HBL PACO transactions yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
