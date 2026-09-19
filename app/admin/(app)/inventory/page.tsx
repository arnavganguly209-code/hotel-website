"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";

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

interface CalendarDay {
  date: string;
  sellableBase: number;
  cap: number;
  booked: number;
  available: number;
  blocked: boolean;
  hasDailyCap: boolean;
  hasMonthlyCap: boolean;
}

interface CalendarPayload {
  roomSlug: string;
  year: number;
  month: number;
  monthKey: string;
  sellableBase: number;
  monthlyCap: number | null;
  days: CalendarDay[];
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function AdminInventoryPage() {
  const now = new Date();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSlug, setSavingSlug] = useState("");
  const [notice, setNotice] = useState("");

  const [calRoom, setCalRoom] = useState("");
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calendar, setCalendar] = useState<CalendarPayload | null>(null);
  const [calLoading, setCalLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [setCount, setSetCount] = useState("2");
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
      setCalRoom((prev) => prev || rooms[0]?.roomSlug || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!calRoom) return;
    setCalLoading(true);
    try {
      const res = await fetch(
        `/api/admin/inventory/calendar?roomSlug=${encodeURIComponent(calRoom)}&year=${calYear}&month=${calMonth}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load calendar");
      setCalendar(data.calendar as CalendarPayload);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to load calendar");
      setCalendar(null);
    } finally {
      setCalLoading(false);
    }
  }, [calRoom, calYear, calMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const monthLabel = useMemo(() => {
    return new Date(calYear, calMonth - 1, 1).toLocaleString("en", {
      month: "long",
      year: "numeric",
    });
  }, [calYear, calMonth]);

  const selectedDay = calendar?.days.find((d) => d.date === selectedDate);

  function shiftMonth(delta: number) {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setCalMonth(m);
    setCalYear(y);
    setSelectedDate("");
  }

  async function saveTotal(roomSlug: string) {
    const totalRooms = Number(drafts[roomSlug]);
    if (!Number.isFinite(totalRooms) || totalRooms < 1) {
      setNotice("Enter a valid room count (minimum 1). Use date/month caps to set 0 for a day.");
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
      setNotice("Total rooms saved. Available Today updated for online + hotel bookings.");
      await load();
      await loadCalendar();
    } catch {
      setNotice("Unable to update inventory");
    } finally {
      setSavingSlug("");
    }
  }

  async function applyDailyCap(count: number) {
    if (!calRoom || !selectedDate) {
      setNotice("Select a date in the calendar first.");
      return;
    }
    if (!Number.isFinite(count) || count < 0) {
      setNotice("Enter a valid room count (0 = fully closed that date).");
      return;
    }
    setSavingCap(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: calRoom,
          mergeOverrides: true,
          overrides: { daily: { [selectedDate]: Math.floor(count) } },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to save date stock");
        return;
      }
      setNotice(
        count === 0
          ? `${selectedDate}: fully closed for online booking (0 rooms).`
          : `${selectedDate}: online/hotel max ${Math.floor(count)} room(s).`
      );
      await load();
      await loadCalendar();
    } catch {
      setNotice("Unable to save date stock");
    } finally {
      setSavingCap(false);
    }
  }

  async function applyMonthCap(count: number) {
    if (!calRoom) return;
    const monthKey = `${calYear}-${pad2(calMonth)}`;
    if (!Number.isFinite(count) || count < 0) {
      setNotice("Enter a valid month room count (0 = close whole month).");
      return;
    }
    setSavingCap(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: calRoom,
          mergeOverrides: true,
          overrides: { monthly: { [monthKey]: Math.floor(count) } },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to save month stock");
        return;
      }
      setNotice(
        count === 0
          ? `${monthKey}: whole month closed for online booking.`
          : `${monthKey}: max ${Math.floor(count)} room(s) per night online/hotel.`
      );
      await load();
      await loadCalendar();
    } catch {
      setNotice("Unable to save month stock");
    } finally {
      setSavingCap(false);
    }
  }

  async function onSetCountSubmit(e: FormEvent) {
    e.preventDefault();
    await applyDailyCap(Number(setCount));
  }

  const firstWeekday = useMemo(() => {
    // Monday-first calendar: JS getDay Sun=0 → convert
    const js = new Date(calYear, calMonth - 1, 1).getDay();
    return (js + 6) % 7;
  }, [calYear, calMonth]);

  const roomName = rows.find((r) => r.roomSlug === calRoom)?.roomName || calRoom;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Room Stock</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Inventory</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5a635c]">
          <strong className="text-[#0f2420]">Available Today</strong> (category-wise) is the only
          stock online booking and pay-at-hotel can sell — never more. Check any year/month below:
          booked vs free, then set 0–N rooms for a date or whole month.
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

      {/* Available Today table — source of truth */}
      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading inventory…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5a059]">
              Available Today — online booking limit
            </p>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Booked today</th>
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
                  <td className="px-4 py-3 text-base font-semibold text-emerald-800">
                    {row.availableToday}
                  </td>
                  <td className="px-4 py-3">
                    {row.blockedToday ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="text-[#7a8a82]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={savingSlug === row.roomSlug}
                      onClick={() => void saveTotal(row.roomSlug)}
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
            </tbody>
          </table>
        </div>
      )}

      {/* Month / year calendar checker */}
      <section className="space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a059]">Any year · any month</p>
            <h2 className="mt-1 font-serif text-2xl font-light text-[#0f2420]">
              Online stock calendar
            </h2>
            <p className="mt-2 text-sm text-[#5a635c]">
              Green free / amber booked / red closed. Click a date to set 2–5 rooms (or any number) or
              full-block (0).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={calRoom}
              onChange={(e) => {
                setCalRoom(e.target.value);
                setSelectedDate("");
              }}
              className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2 text-sm outline-none"
            >
              {rows.map((r) => (
                <option key={r.roomSlug} value={r.roomSlug}>
                  {r.roomName}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={2020}
              max={2100}
              value={calYear}
              onChange={(e) => setCalYear(Number(e.target.value) || now.getFullYear())}
              className="w-24 rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2 text-sm outline-none"
            />
            <select
              value={calMonth}
              onChange={(e) => setCalMonth(Number(e.target.value))}
              className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2 text-sm outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg border border-[#c5a059]/30 p-2 text-[#0f2420] hover:bg-[#f8f4eb]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg border border-[#c5a059]/30 p-2 text-[#0f2420] hover:bg-[#f8f4eb]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium text-[#0f2420]">
            {roomName} · {monthLabel}
            {calendar?.monthlyCap != null ? (
              <span className="ml-2 text-sm font-normal text-[#5a635c]">
                (month cap: {calendar.monthlyCap})
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingCap || !calRoom}
              onClick={() => void applyMonthCap(Number(setCount))}
              className="rounded-full border border-[#0f2420]/20 px-4 py-1.5 text-xs font-medium text-[#0f2420] disabled:opacity-60"
            >
              Set whole month to {setCount || "N"} rooms
            </button>
            <button
              type="button"
              disabled={savingCap || !calRoom}
              onClick={() => void applyMonthCap(0)}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-800 disabled:opacity-60"
            >
              Full-block this month
            </button>
          </div>
        </div>

        {calLoading ? (
          <div className="flex items-center gap-2 py-8 text-[#5a635c]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar…
          </div>
        ) : calendar ? (
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-[0.12em] text-[#7a8a82] sm:gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {calendar.days.map((day) => {
              const dayNum = Number(day.date.slice(-2));
              const selected = selectedDate === day.date;
              const tone = day.blocked || day.available <= 0
                ? "border-red-200 bg-red-50 text-red-900"
                : day.booked > 0
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900";
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSetCount(String(Math.max(0, day.cap)));
                  }}
                  className={`min-h-[4.5rem] rounded-xl border p-1.5 text-left transition sm:min-h-[5.25rem] sm:p-2 ${tone} ${
                    selected ? "ring-2 ring-[#0f2420] ring-offset-1" : ""
                  }`}
                >
                  <div className="text-[11px] font-semibold">{dayNum}</div>
                  <div className="mt-1 space-y-0.5 normal-case tracking-normal">
                    <div className="text-[10px] sm:text-[11px]">
                      Free <strong>{day.available}</strong>
                    </div>
                    <div className="text-[10px] opacity-80 sm:text-[11px]">
                      Booked {day.booked}
                    </div>
                    <div className="text-[10px] opacity-70 sm:text-[11px]">Cap {day.cap}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#5a635c]">Select a category to load the calendar.</p>
        )}

        {selectedDay ? (
          <div className="rounded-xl border border-[#c5a059]/25 bg-[#fbf8f1] p-4">
            <p className="text-sm text-[#0f2420]">
              <strong>{selectedDay.date}</strong> · Free{" "}
              <strong className="text-emerald-800">{selectedDay.available}</strong> · Booked{" "}
              <strong>{selectedDay.booked}</strong> · Cap <strong>{selectedDay.cap}</strong>
              {selectedDay.blocked ? (
                <span className="ml-2 text-red-700">(date block active)</span>
              ) : null}
            </p>
            <form onSubmit={onSetCountSubmit} className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#7a8a82]">
                  Set rooms for this date (0 = full block)
                </p>
                <input
                  type="number"
                  min={0}
                  value={setCount}
                  onChange={(e) => setSetCount(e.target.value)}
                  className="w-28 rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={savingCap}
                className="rounded-full bg-[#0f2420] px-4 py-2 text-xs font-medium text-[#e8d5a3] disabled:opacity-70"
              >
                Save date stock
              </button>
              <button
                type="button"
                disabled={savingCap}
                onClick={() => void applyDailyCap(0)}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-800 disabled:opacity-70"
              >
                Full-block this date
              </button>
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={savingCap}
                  onClick={() => {
                    setSetCount(String(n));
                    void applyDailyCap(n);
                  }}
                  className="rounded-full border border-[#c5a059]/35 px-3 py-2 text-xs text-[#0f2420] disabled:opacity-70"
                >
                  Set {n}
                </button>
              ))}
            </form>
          </div>
        ) : null}

        <p className="text-xs text-[#7a8a82]">
          Legend: green = free stock · amber = some booked · red = none free / blocked. Caps apply to
          online + pay-at-hotel. Dashboard Available Rooms uses the same Available Today total.
        </p>
      </section>
    </div>
  );
}
