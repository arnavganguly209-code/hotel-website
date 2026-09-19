"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface InventoryOverrides {
  monthly?: Record<string, number>;
  daily?: Record<string, number>;
}

interface InventoryRow {
  roomSlug: string;
  roomName: string;
  totalRooms: number;
  occupiedToday: number;
  availableToday: number;
  blockedToday: boolean;
  cappedToday?: number;
  overrides?: InventoryOverrides;
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSlug, setSavingSlug] = useState("");
  const [notice, setNotice] = useState("");

  const [capRoom, setCapRoom] = useState("");
  const [capMonth, setCapMonth] = useState("");
  const [capMonthCount, setCapMonthCount] = useState("1");
  const [capDate, setCapDate] = useState("");
  const [capDateCount, setCapDateCount] = useState("1");
  const [savingCap, setSavingCap] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load inventory");
      const rooms = (data.rooms ?? []) as InventoryRow[];
      setRows(rooms);
      setDrafts(Object.fromEntries(rooms.map((r) => [r.roomSlug, String(r.totalRooms)])));
      setCapRoom((prev) => prev || rooms[0]?.roomSlug || "");
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
      setNotice("Total rooms saved. Available Today updated.");
      void load();
    } catch {
      setNotice("Unable to update inventory");
    } finally {
      setSavingSlug("");
    }
  }

  async function saveMonthCap(e: FormEvent) {
    e.preventDefault();
    const count = Number(capMonthCount);
    if (!capRoom || !/^\d{4}-\d{2}$/.test(capMonth) || !Number.isFinite(count) || count < 0) {
      setNotice("Select room, month (YYYY-MM), and a valid room count.");
      return;
    }
    setSavingCap(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: capRoom,
          mergeOverrides: true,
          overrides: { monthly: { [capMonth]: Math.floor(count) } },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to save month cap");
        return;
      }
      setNotice(`Month ${capMonth}: max ${Math.floor(count)} room(s) online/hotel for this category.`);
      void load();
    } catch {
      setNotice("Unable to save month cap");
    } finally {
      setSavingCap(false);
    }
  }

  async function saveDateCap(e: FormEvent) {
    e.preventDefault();
    const count = Number(capDateCount);
    if (!capRoom || !/^\d{4}-\d{2}-\d{2}$/.test(capDate) || !Number.isFinite(count) || count < 0) {
      setNotice("Select room, date, and a valid room count.");
      return;
    }
    setSavingCap(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: capRoom,
          mergeOverrides: true,
          overrides: { daily: { [capDate]: Math.floor(count) } },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to save date cap");
        return;
      }
      setNotice(`Date ${capDate}: max ${Math.floor(count)} room(s) bookable.`);
      void load();
    } catch {
      setNotice("Unable to save date cap");
    } finally {
      setSavingCap(false);
    }
  }

  const selected = rows.find((r) => r.roomSlug === capRoom);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Room Stock</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Inventory</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          <strong>Available Today</strong> is the live sellable count (units green + month/date caps −
          bookings − blocks). Online and pay-at-hotel bookings cannot exceed this stock.
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
                  <td className="px-4 py-3 font-semibold text-emerald-800">{row.availableToday}</td>
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

      <section className="space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a059]">Month &amp; date caps</p>
          <h2 className="mt-1 font-serif text-2xl font-light text-[#0f2420]">
            Online / hotel sellable by month or date
          </h2>
          <p className="mt-2 text-sm text-[#5a635c]">
            Cap how many rooms of a category can be sold in a month or on a specific date. Lower than
            total rooms. Use Blocks to close a category completely for a date range.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Room category
          </p>
          <select
            value={capRoom}
            onChange={(e) => setCapRoom(e.target.value)}
            className="w-full max-w-md rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {rows.map((r) => (
              <option key={r.roomSlug} value={r.roomSlug}>
                {r.roomName}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={saveMonthCap} className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
              Month (YYYY-MM)
            </p>
            <input
              type="month"
              value={capMonth}
              onChange={(e) => setCapMonth(e.target.value)}
              className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
            />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
              Max rooms that month
            </p>
            <input
              type="number"
              min={0}
              value={capMonthCount}
              onChange={(e) => setCapMonthCount(e.target.value)}
              className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingCap}
              className="rounded-full bg-[#0f2420] px-5 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
            >
              Save month cap
            </button>
          </div>
        </form>

        <form onSubmit={saveDateCap} className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
              Specific date
            </p>
            <input
              type="date"
              value={capDate}
              onChange={(e) => setCapDate(e.target.value)}
              className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
            />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
              Max rooms that date
            </p>
            <input
              type="number"
              min={0}
              value={capDateCount}
              onChange={(e) => setCapDateCount(e.target.value)}
              className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingCap}
              className="rounded-full bg-[#0f2420] px-5 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
            >
              Save date cap
            </button>
          </div>
        </form>

        {selected?.overrides ? (
          <div className="grid gap-4 border-t border-[#c5a059]/15 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">Month caps set</p>
              <ul className="mt-2 space-y-1 text-sm text-[#0f2420]">
                {Object.entries(selected.overrides.monthly || {}).length === 0 ? (
                  <li className="text-[#7a8a82]">None</li>
                ) : (
                  Object.entries(selected.overrides.monthly || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: <strong>{v}</strong> room(s)
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">Date caps set</p>
              <ul className="mt-2 space-y-1 text-sm text-[#0f2420]">
                {Object.entries(selected.overrides.daily || {}).length === 0 ? (
                  <li className="text-[#7a8a82]">None</li>
                ) : (
                  Object.entries(selected.overrides.daily || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: <strong>{v}</strong> room(s)
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
