"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/AdminFields";

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  source: string;
  totalAmount: number;
  createdAt: string;
}

/** Orbit room booking management — same Booking table as Admin PMS. */
export function OrbitBookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (source !== "all") params.set("source", source);
      if (q) params.set("q", q);
      const res = await fetch(`/api/orbit/bookings?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [source, q]);

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

  async function remove(id: number) {
    if (!confirm("Permanently delete this booking? It will disappear from Admin immediately.")) return;
    const res = await fetch(`/api/orbit/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Room bookings shared with the Admin PMS. Deleting here removes the record from Admin tables and
        dashboard counts instantly.
      </p>
      <div className="flex flex-wrap gap-3">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-lg border border-luxury-gold/30 bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="all">All sources</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        <AdminInput
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guest / room"
          className="min-w-[200px]"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {loading ? (
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-luxury-gold/20">
          <table className="min-w-full text-left text-sm text-white/85">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-luxury-gold/80">
              <tr>
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Dates</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-white/50">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                    <td className="px-3 py-3">
                      <div>{b.name}</div>
                      <div className="text-xs text-white/45">{b.email}</div>
                    </td>
                    <td className="px-3 py-3">{b.roomName || "—"}</td>
                    <td className="px-3 py-3 text-xs">
                      {String(b.checkIn).slice(0, 10)} → {String(b.checkOut).slice(0, 10)}
                    </td>
                    <td className="px-3 py-3 capitalize">{b.source}</td>
                    <td className="px-3 py-3 capitalize">{b.status.replace(/_/g, " ")}</td>
                    <td className="px-3 py-3">${b.totalAmount}</td>
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:text-red-200"
                        onClick={() => void remove(b.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
