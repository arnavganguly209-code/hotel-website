"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface RoomOption {
  slug: string;
  name: string;
}

interface RoomBlock {
  id: string;
  roomSlug: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes: string;
  createdAt: string;
}

const REASONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "renovation", label: "Renovation" },
  { value: "private_event", label: "Private Event" },
  { value: "owner_use", label: "Owner Use" },
  { value: "other", label: "Other" },
];

export default function AdminBlocksPage() {
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [roomSlug, setRoomSlug] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("maintenance");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsRes, blocksRes] = await Promise.all([
        fetch("/api/admin/rooms", { cache: "no-store" }),
        fetch("/api/admin/blocks", { cache: "no-store" }),
      ]);
      const roomsData = await roomsRes.json();
      const blocksData = await blocksRes.json();
      if (!roomsRes.ok || !roomsData.success) throw new Error("Failed to load rooms");
      if (!blocksRes.ok || !blocksData.success) throw new Error("Failed to load blocks");
      const roomOptions = (roomsData.rooms ?? []).map((r: { slug: string; name: string }) => ({
        slug: r.slug,
        name: r.name,
      }));
      setRooms(roomOptions);
      if (!roomSlug && roomOptions.length) setRoomSlug(roomOptions[0].slug);
      setBlocks(blocksData.blocks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blocks");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!roomSlug || !startDate || !endDate) {
      setNotice("Room, start date, and end date are required.");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomSlug, startDate, endDate, reason, notes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to create block");
        return;
      }
      setStartDate("");
      setEndDate("");
      setNotes("");
      void load();
    } catch {
      setNotice("Unable to create block");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this date block?")) return;
    const res = await fetch(`/api/admin/blocks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  function roomName(slug: string) {
    return rooms.find((r) => r.slug === slug)?.name ?? slug;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Availability</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Date Blocking</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Close a room out for maintenance, renovation, private events, or owner use.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)] sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Room</p>
          <select
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {rooms.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Start Date</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">End Date</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Reason</p>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Notes</p>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          {notice ? <p className="mb-3 text-sm text-red-600">{notice}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#0f2420] px-6 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add Block
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading blocks…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80 p-2 shadow-[0_10px_40px_rgba(15,36,32,0.04)]">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id} className="border-t border-[#c5a059]/10">
                  <td className="px-4 py-3 font-medium text-[#0f2420]">{roomName(b.roomSlug)}</td>
                  <td className="px-4 py-3">{new Date(b.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(b.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{b.reason.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-[#5a635c]">{b.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void remove(b.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-[#5a635c]">
                    No date blocks configured.
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
