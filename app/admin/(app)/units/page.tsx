"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface RoomOption {
  slug: string;
  name: string;
}

interface RoomUnit {
  id: string;
  roomSlug: string;
  roomNumber: string;
  status: string;
  notes: string;
}

const STATUSES = ["available", "occupied", "maintenance"] as const;

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-800 border-emerald-200",
  occupied: "bg-amber-50 text-amber-900 border-amber-200",
  maintenance: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminUnitsPage() {
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ roomNumber: "", status: "available", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsRes, unitsRes] = await Promise.all([
        fetch("/api/admin/rooms", { cache: "no-store" }),
        fetch("/api/admin/units", { cache: "no-store" }),
      ]);
      const roomsData = await roomsRes.json();
      const unitsData = await unitsRes.json();
      if (!roomsRes.ok || !roomsData.success) throw new Error("Failed to load rooms");
      if (!unitsRes.ok || !unitsData.success) throw new Error(unitsData.error || "Failed to load units");

      const roomOptions = (roomsData.rooms ?? []).map((r: { slug: string; name: string }) => ({
        slug: r.slug,
        name: r.name,
      }));
      setRooms(roomOptions);
      setSelectedSlug((prev) => prev || roomOptions[0]?.slug || "");
      setUnits(unitsData.units ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => units.filter((u) => !selectedSlug || u.roomSlug === selectedSlug),
    [units, selectedSlug]
  );

  const selectedRoomName = rooms.find((r) => r.slug === selectedSlug)?.name ?? selectedSlug;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!selectedSlug || !form.roomNumber.trim()) {
      setNotice({ type: "err", text: "Room category and number are required." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: selectedSlug,
          roomNumber: form.roomNumber.trim(),
          status: form.status,
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: "err", text: data.error || "Unable to create unit" });
        return;
      }
      setNotice({ type: "ok", text: `Room #${form.roomNumber.trim()} added.` });
      setForm({ roomNumber: "", status: "available", notes: "" });
      void load();
    } catch {
      setNotice({ type: "err", text: "Unable to create unit" });
    } finally {
      setSaving(false);
    }
  }

  async function updateUnit(id: string, patch: Record<string, unknown>) {
    const res = await fetch("/api/admin/units", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setNotice({ type: "err", text: data.error || "Unable to update unit" });
      return;
    }
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.unit } : u)));
  }

  async function removeUnit(id: string, roomNumber: string) {
    if (!window.confirm(`Delete room number ${roomNumber}?`)) return;
    const res = await fetch(`/api/admin/units?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setNotice({ type: "err", text: data.error || "Unable to delete unit" });
      return;
    }
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Physical Rooms</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Room Numbers</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Manage individual room units per category. When units exist, availability uses their count.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}
      {notice ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === "err"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => (
          <button
            key={room.slug}
            type="button"
            onClick={() => setSelectedSlug(room.slug)}
            className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition ${
              selectedSlug === room.slug
                ? "border-[#0f2420] bg-[#0f2420] text-[#e8d5a3]"
                : "border-[#c5a059]/35 bg-white/80 text-[#3d5a4c] hover:border-[#c5a059]"
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)] sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-[#3d5a4c]">
            Adding to <span className="font-semibold text-[#0f2420]">{selectedRoomName || "—"}</span>
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Room Number *
          </p>
          <input
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            placeholder="e.g. 101"
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Status</p>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Notes</p>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving || !selectedSlug}
            className="flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Unit
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading units…
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((unit) => (
            <div
              key={unit.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c5a059]/20 bg-white/80 px-5 py-4 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <div>
                <p className="font-serif text-xl text-[#0f2420]">Room #{unit.roomNumber}</p>
                <p className="mt-1 text-xs text-[#7a8a82]">{unit.notes || "No notes"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    STATUS_STYLES[unit.status] || STATUS_STYLES.available
                  }`}
                >
                  {unit.status}
                </span>
                <select
                  value={unit.status}
                  onChange={(e) => void updateUnit(unit.id, { status: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void removeUnit(unit.id, unit.roomNumber)}
                  className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                  aria-label={`Delete room ${unit.roomNumber}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <p className="text-sm text-[#5a635c]">No room numbers for this category yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
