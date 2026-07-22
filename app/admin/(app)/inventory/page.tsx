"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface InventoryRow {
  roomSlug: string;
  roomName: string;
  totalRooms: number;
  occupiedToday: number;
  availableToday: number;
  blockedToday: boolean;
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSlug, setSavingSlug] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load inventory");
      setRows(data.rooms ?? []);
      setDrafts(
        Object.fromEntries((data.rooms ?? []).map((r: InventoryRow) => [r.roomSlug, String(r.totalRooms)]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(roomSlug: string) {
    const totalRooms = Number(drafts[roomSlug]);
    if (!Number.isFinite(totalRooms) || totalRooms < 1) {
      setNotice("Enter a valid room count.");
      return;
    }
    setSavingSlug(roomSlug);
    setNotice("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomSlug, totalRooms }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to update inventory");
        return;
      }
      void load();
    } catch {
      setNotice("Unable to update inventory");
    } finally {
      setSavingSlug("");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Room Stock</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Inventory</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Set the physical count of rooms available for each room type. This controls availability
          checks for online and offline bookings.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-4 py-3 text-sm text-[#3d5a4c]">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading inventory…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Total Rooms</th>
                <th className="px-4 py-3">Occupied Today</th>
                <th className="px-4 py-3">Available Today</th>
                <th className="px-4 py-3">Blocked</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.roomSlug} className="border-t border-[#c5a059]/10">
                  <td className="px-4 py-3 font-medium text-[#0f2420]">{row.roomName}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      value={drafts[row.roomSlug] ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [row.roomSlug]: e.target.value })}
                      className="w-24 rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#c5a059]"
                    />
                  </td>
                  <td className="px-4 py-3">{row.occupiedToday}</td>
                  <td className="px-4 py-3">{row.availableToday}</td>
                  <td className="px-4 py-3">
                    {row.blockedToday ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">Blocked</span>
                    ) : (
                      <span className="text-[#7a8a82]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={savingSlug === row.roomSlug}
                      onClick={() => void save(row.roomSlug)}
                      className="flex items-center gap-1.5 rounded-full bg-[#0f2420] px-4 py-1.5 text-xs font-medium text-[#e8d5a3] disabled:opacity-70"
                    >
                      {savingSlug === row.roomSlug ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-[#5a635c]">
                    No rooms configured yet.
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
