"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as XIcon,
} from "lucide-react";

type ManageDayCell = {
  date: string;
  inventory: number;
  booked: number;
  available: number;
  open: boolean;
  blocked: boolean;
  hasDailyCap: boolean;
};

type ManageRoomRow = {
  roomSlug: string;
  roomName: string;
  sellableBase: number;
  days: ManageDayCell[];
};

type CategoryOption = { slug: string; name: string };

type MetricRow = "availability" | "inventory" | "booked" | "available";

const METRIC_ROWS: { key: MetricRow; label: string }[] = [
  { key: "availability", label: "Availability" },
  { key: "inventory", label: "Inventory" },
  { key: "booked", label: "Booked" },
  { key: "available", label: "Available" },
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function localToday(): string {
  const n = new Date();
  return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthStart(year: number, month: number): string {
  return `${year}-${pad2(month)}-01`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatHeaderDate(iso: string): { day: string; weekday: string; month: string } {
  const d = new Date(`${iso}T12:00:00`);
  return {
    month: d.toLocaleString("en", { month: "short" }),
    day: String(d.getDate()),
    weekday: d.toLocaleString("en", { weekday: "short" }),
  };
}

function statusTone(cell: ManageDayCell): string {
  if (cell.blocked || !cell.open || cell.available <= 0) {
    return "bg-red-50 text-red-800";
  }
  if (cell.available <= 2 || cell.available / Math.max(1, cell.inventory) <= 0.3) {
    return "bg-amber-50 text-amber-900";
  }
  return "bg-emerald-50 text-emerald-900";
}

export default function InventoryManagePage() {
  const today = localToday();
  const initial = new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [startDate, setStartDate] = useState(monthStart(initial.getFullYear(), initial.getMonth() + 1));
  const [days, setDays] = useState(Math.min(31, daysInMonth(initial.getFullYear(), initial.getMonth() + 1)));
  const [viewMode, setViewMode] = useState<"month" | "range">("month");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [rooms, setRooms] = useState<ManageRoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<{ slug: string; date: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Bulk panel
  const [bulkRoom, setBulkRoom] = useState("");
  const [bulkFrom, setBulkFrom] = useState(today);
  const [bulkTo, setBulkTo] = useState(addDaysIso(today, 10));
  const [bulkInventory, setBulkInventory] = useState("10");
  const [copySource, setCopySource] = useState(today);
  const [copyFrom, setCopyFrom] = useState(addDaysIso(today, 1));
  const [copyTo, setCopyTo] = useState(addDaysIso(today, 7));

  const monthLabel = useMemo(
    () => new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" }),
    [year, month]
  );

  const applyMonthView = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setStartDate(monthStart(y, m));
    setDays(daysInMonth(y, m));
    setViewMode("month");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        start: startDate,
        days: String(days),
      });
      if (selectedRooms.length > 0) {
        params.set("rooms", selectedRooms.join(","));
      }
      const res = await fetch(`/api/admin/inventory-manage?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load inventory");
      const cats = (data.categories ?? []) as CategoryOption[];
      setCategories(cats);
      setDates((data.dates ?? []) as string[]);
      setRooms((data.rooms ?? []) as ManageRoomRow[]);
      setBulkRoom((prev) => prev || cats[0]?.slug || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [startDate, days, selectedRooms]);

  useEffect(() => {
    void load();
  }, [load]);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    applyMonthView(y, m);
  }

  function goToday() {
    const n = new Date();
    applyMonthView(n.getFullYear(), n.getMonth() + 1);
  }

  async function mutate(body: Record<string, unknown>) {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const res = await fetch("/api/admin/inventory-manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Unable to update inventory");
        return false;
      }
      setNotice(
        data.action === "close"
          ? `Closed ${data.datesUpdated} date(s) for booking.`
          : data.action === "open"
            ? `Opened ${data.datesUpdated} date(s) to base inventory.`
            : data.action === "copy"
              ? `Copied inventory to ${data.datesUpdated} date(s).`
              : `Updated inventory on ${data.datesUpdated} date(s).`
      );
      await load();
      return true;
    } catch {
      setError("Unable to update inventory");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveCell(slug: string, date: string, value: string) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      setError("Inventory must be a number ≥ 0");
      return;
    }
    const ok = await mutate({
      action: "set",
      roomSlug: slug,
      date,
      inventory: Math.floor(n),
    });
    if (ok) setEditing(null);
  }

  async function onBulkSet(e: FormEvent) {
    e.preventDefault();
    if (!bulkRoom) return;
    await mutate({
      action: "set",
      roomSlug: bulkRoom,
      startDate: bulkFrom,
      endDate: bulkTo,
      inventory: Math.floor(Number(bulkInventory)),
    });
  }

  async function onBulkClose() {
    if (!bulkRoom) return;
    await mutate({
      action: "close",
      roomSlug: bulkRoom,
      startDate: bulkFrom,
      endDate: bulkTo,
    });
  }

  async function onBulkOpen() {
    if (!bulkRoom) return;
    await mutate({
      action: "open",
      roomSlug: bulkRoom,
      startDate: bulkFrom,
      endDate: bulkTo,
    });
  }

  async function onCopy(e: FormEvent) {
    e.preventDefault();
    if (!bulkRoom) return;
    await mutate({
      action: "copy",
      roomSlug: bulkRoom,
      sourceDate: copySource,
      targetStart: copyFrom,
      targetEnd: copyTo,
    });
  }

  function toggleRoomFilter(slug: string) {
    setSelectedRooms((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      return [...prev, slug];
    });
  }

  function cellValue(cell: ManageDayCell, metric: MetricRow): ReactNode {
    if (metric === "availability") {
      if (cell.open && cell.available > 0) {
        return <Check className="mx-auto h-4 w-4 text-emerald-600" strokeWidth={2.5} />;
      }
      return <XIcon className="mx-auto h-4 w-4 text-red-500" strokeWidth={2.5} />;
    }
    if (metric === "inventory") return cell.inventory;
    if (metric === "booked") return cell.booked;
    return cell.available;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Channel Manager</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Inventory Manage</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5a635c]">
          Date-wise allotment for every room category. Same database as{" "}
          <span className="font-medium text-[#0f2420]">Available Today</span> and public booking —
          inventory − booked = available. No rates here.
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

      {/* Date controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#c5a059]/20 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgba(15,36,32,0.04)]">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c5a059]/30 text-[#0f2420] hover:bg-[#c5a059]/10"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-[10rem] text-center font-serif text-lg text-[#0f2420]">{monthLabel}</div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c5a059]/30 text-[#0f2420] hover:bg-[#c5a059]/10"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goToday}
          className="rounded-full border border-[#1e5a9a]/40 px-3 py-1.5 text-xs font-medium text-[#1e5a9a] hover:bg-[#1e5a9a]/5"
        >
          Today
        </button>
        <label className="flex items-center gap-2 text-xs text-[#5a635c]">
          Month
          <select
            className="rounded-lg border border-[#c5a059]/25 bg-white px-2 py-1.5 text-sm text-[#0f2420]"
            value={month}
            onChange={(e) => applyMonthView(year, Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[#5a635c]">
          Year
          <select
            className="rounded-lg border border-[#c5a059]/25 bg-white px-2 py-1.5 text-sm text-[#0f2420]"
            value={year}
            onChange={(e) => applyMonthView(Number(e.target.value), month)}
          >
            {Array.from({ length: 8 }, (_, i) => initial.getFullYear() - 1 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[#5a635c]">
          Start
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setViewMode("range");
              const d = new Date(`${e.target.value}T12:00:00`);
              setYear(d.getFullYear());
              setMonth(d.getMonth() + 1);
            }}
            className="rounded-lg border border-[#c5a059]/25 bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-[#5a635c]">
          Days
          <input
            type="number"
            min={7}
            max={62}
            value={days}
            onChange={(e) => {
              setDays(Math.min(62, Math.max(7, Number(e.target.value) || 18)));
              setViewMode("range");
            }}
            className="w-16 rounded-lg border border-[#c5a059]/25 bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <span className="text-[11px] uppercase tracking-wider text-[#7a8a82]">
          {viewMode === "month" ? "Month view" : "Custom range"}
        </span>
        {saving || loading ? <Loader2 className="h-4 w-4 animate-spin text-[#c5a059]" /> : null}
      </div>

      {/* Room filter + legend */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedRooms([])}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              selectedRooms.length === 0
                ? "border-[#1e5a9a] bg-[#1e5a9a]/10 text-[#1e5a9a]"
                : "border-[#c5a059]/30 text-[#5a635c]"
            }`}
          >
            All rooms ({categories.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggleRoomFilter(c.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedRooms.includes(c.slug)
                  ? "border-[#1e5a9a] bg-[#1e5a9a]/10 text-[#1e5a9a]"
                  : "border-[#c5a059]/30 text-[#5a635c] hover:bg-[#c5a059]/5"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-[#5a635c]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-400" /> Limited
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-red-500" /> Closed / 0
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
        {loading && rooms.length === 0 ? (
          <div className="flex items-center gap-2 px-6 py-16 text-[#5a635c]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar…
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#e8ebe9] bg-[#f8f9f8]">
                <th className="sticky left-0 z-20 min-w-[11rem] bg-[#f8f9f8] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8a82]">
                  Room / metric
                </th>
                {dates.map((iso) => {
                  const h = formatHeaderDate(iso);
                  const isToday = iso === today;
                  return (
                    <th
                      key={iso}
                      className={`min-w-[3.25rem] px-1 py-2 text-center ${
                        isToday ? "bg-[#1e5a9a]/8" : ""
                      }`}
                    >
                      <div className="text-[10px] font-medium text-[#7a8a82]">{h.month}</div>
                      <div className="text-sm font-semibold text-[#0f2420]">{h.day}</div>
                      <div className="text-[10px] text-[#9aa39c]">{h.weekday}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const isCollapsed = collapsed[room.roomSlug];
                return (
                  <FragmentRoom
                    key={room.roomSlug}
                    room={room}
                    dates={dates}
                    collapsed={Boolean(isCollapsed)}
                    onToggle={() =>
                      setCollapsed((prev) => ({
                        ...prev,
                        [room.roomSlug]: !prev[room.roomSlug],
                      }))
                    }
                    editing={editing}
                    editValue={editValue}
                    setEditing={setEditing}
                    setEditValue={setEditValue}
                    onSaveCell={saveCell}
                    cellValue={cellValue}
                    statusTone={statusTone}
                    today={today}
                    saving={saving}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={onBulkSet}
          className="space-y-3 rounded-2xl border border-[#c5a059]/20 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,36,32,0.04)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5a059]">
            Bulk set / close / open
          </p>
          <label className="block text-xs text-[#5a635c]">
            Room
            <select
              value={bulkRoom}
              onChange={(e) => setBulkRoom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c5a059]/25 bg-white px-3 py-2 text-sm text-[#0f2420]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[#5a635c]">
              From
              <input
                type="date"
                value={bulkFrom}
                onChange={(e) => setBulkFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-[#5a635c]">
              To
              <input
                type="date"
                value={bulkTo}
                onChange={(e) => setBulkTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs text-[#5a635c]">
            Inventory
            <input
              type="number"
              min={0}
              value={bulkInventory}
              onChange={(e) => setBulkInventory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#0f2420] px-4 py-2 text-xs font-medium text-white hover:bg-[#1a3830] disabled:opacity-60"
            >
              Apply inventory
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onBulkClose()}
              className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
            >
              Close dates
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onBulkOpen()}
              className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
            >
              Open dates
            </button>
          </div>
        </form>

        <form
          onSubmit={onCopy}
          className="space-y-3 rounded-2xl border border-[#c5a059]/20 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,36,32,0.04)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5a059]">
            Copy inventory
          </p>
          <p className="text-xs text-[#5a635c]">
            Copy one date&apos;s inventory allotment onto a target range (same room as bulk panel).
          </p>
          <label className="block text-xs text-[#5a635c]">
            Source date
            <input
              type="date"
              value={copySource}
              onChange={(e) => setCopySource(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[#5a635c]">
              Target from
              <input
                type="date"
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-[#5a635c]">
              Target to
              <input
                type="date"
                value={copyTo}
                onChange={(e) => setCopyTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#c5a059]/25 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-[#1e5a9a]/40 bg-[#1e5a9a]/10 px-4 py-2 text-xs font-medium text-[#1e5a9a] hover:bg-[#1e5a9a]/15 disabled:opacity-60"
          >
            Copy to range
          </button>
        </form>
      </div>
    </div>
  );
}

function FragmentRoom({
  room,
  dates,
  collapsed,
  onToggle,
  editing,
  editValue,
  setEditing,
  setEditValue,
  onSaveCell,
  cellValue,
  statusTone,
  today,
  saving,
}: {
  room: ManageRoomRow;
  dates: string[];
  collapsed: boolean;
  onToggle: () => void;
  editing: { slug: string; date: string } | null;
  editValue: string;
  setEditing: (v: { slug: string; date: string } | null) => void;
  setEditValue: (v: string) => void;
  onSaveCell: (slug: string, date: string, value: string) => Promise<void>;
  cellValue: (cell: ManageDayCell, metric: MetricRow) => ReactNode;
  statusTone: (cell: ManageDayCell) => string;
  today: string;
  saving: boolean;
}) {
  const byDate = useMemo(() => {
    const map = new Map<string, ManageDayCell>();
    for (const d of room.days) map.set(d.date, d);
    return map;
  }, [room.days]);

  return (
    <>
      <tr className="border-t border-[#e8ebe9] bg-[#fafbfa]">
        <td
          colSpan={dates.length + 1}
          className="sticky left-0 z-10 bg-[#fafbfa] px-3 py-2"
        >
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 text-left font-medium text-[#0f2420]"
          >
            <ChevronRight
              className={`h-4 w-4 text-[#7a8a82] transition-transform ${collapsed ? "" : "rotate-90"}`}
            />
            <span>{room.roomName}</span>
            <span className="text-[11px] font-normal text-[#7a8a82]">
              base {room.sellableBase}
            </span>
          </button>
        </td>
      </tr>
      {!collapsed
        ? METRIC_ROWS.map((metric) => (
            <tr key={`${room.roomSlug}-${metric.key}`} className="border-t border-[#f0f2f1]">
              <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-xs text-[#5a635c]">
                {metric.label}
              </td>
              {dates.map((iso) => {
                const cell = byDate.get(iso);
                if (!cell) {
                  return (
                    <td key={iso} className="px-1 py-1 text-center text-[#ccc]">
                      —
                    </td>
                  );
                }
                const isEdit =
                  metric.key === "inventory" &&
                  editing?.slug === room.roomSlug &&
                  editing?.date === iso;
                const tone =
                  metric.key === "available" || metric.key === "availability"
                    ? statusTone(cell)
                    : metric.key === "inventory"
                      ? cell.hasDailyCap
                        ? "bg-[#1e5a9a]/5"
                        : ""
                      : "";

                return (
                  <td
                    key={iso}
                    className={`px-0.5 py-0.5 text-center tabular-nums ${
                      iso === today ? "bg-[#1e5a9a]/5" : ""
                    }`}
                  >
                    {metric.key === "inventory" ? (
                      isEdit ? (
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          value={editValue}
                          disabled={saving}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => void onSaveCell(room.roomSlug, iso, editValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void onSaveCell(room.roomSlug, iso, editValue);
                            }
                            if (e.key === "Escape") setEditing(null);
                          }}
                          className="mx-auto w-12 rounded border-2 border-[#1e5a9a] bg-white px-1 py-1 text-center text-sm font-semibold text-[#0f2420] outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          title="Click to edit inventory"
                          onClick={() => {
                            setEditing({ slug: room.roomSlug, date: iso });
                            setEditValue(String(cell.inventory));
                          }}
                          className={`mx-auto block w-full min-w-[2.75rem] rounded px-1 py-1.5 text-sm font-semibold hover:ring-2 hover:ring-[#1e5a9a]/40 ${tone}`}
                        >
                          {cell.inventory}
                        </button>
                      )
                    ) : (
                      <div
                        className={`mx-auto flex min-h-[2rem] min-w-[2.75rem] items-center justify-center rounded px-1 py-1 ${tone}`}
                      >
                        {cellValue(cell, metric.key)}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))
        : null}
    </>
  );
}
