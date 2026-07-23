"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

interface RoomOption {
  slug: string;
  name: string;
}

interface RoomUnit {
  id: string;
  roomSlug: string;
  roomNumber: string;
  status: string;
}

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  roomName: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
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

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  country: "",
  checkIn: "",
  checkOut: "",
  guests: "2",
  children: "0",
  roomQuantity: "1",
  roomSlug: "",
  roomNumber: "",
  breakfast: "with-breakfast",
  notes: "",
  remarks: "",
  status: "confirmed",
  paymentStatus: "offline",
  paymentMethod: "hotel",
  totalAmount: "",
};

export default function AdminOfflineBookingsPage() {
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsRes, bookingsRes, unitsRes] = await Promise.all([
        fetch("/api/admin/rooms", { cache: "no-store" }),
        fetch("/api/admin/bookings?source=offline", { cache: "no-store" }),
        fetch("/api/admin/units", { cache: "no-store" }),
      ]);
      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();
      const unitsData = await unitsRes.json();
      if (!roomsRes.ok || !roomsData.success) throw new Error("Failed to load rooms");
      if (!bookingsRes.ok || !bookingsData.success) throw new Error("Failed to load bookings");
      const roomOptions = (roomsData.rooms ?? []).map((r: { slug: string; name: string }) => ({
        slug: r.slug,
        name: r.name,
      }));
      setRooms(roomOptions);
      setUnits(unitsData.success ? unitsData.units ?? [] : []);
      setForm((f) => (f.roomSlug ? f : { ...f, roomSlug: roomOptions[0]?.slug ?? "" }));
      setBookings(bookingsData.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const availableUnits = useMemo(
    () =>
      units.filter(
        (u) => u.roomSlug === form.roomSlug && u.status === "available"
      ),
    [units, form.roomSlug]
  );

  const categoryHasUnits = useMemo(
    () => units.some((u) => u.roomSlug === form.roomSlug),
    [units, form.roomSlug]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.roomSlug || !form.checkIn || !form.checkOut) {
      setNotice({ type: "err", text: "Guest name, room, and dates are required." });
      return;
    }
    if (categoryHasUnits && !form.roomNumber) {
      setNotice({ type: "err", text: "Select an available room number for this category." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          breakfast: "with-breakfast",
          guests: Number(form.guests) || 1,
          children: Number(form.children) || 0,
          roomQuantity: Number(form.roomQuantity) || 1,
          totalAmount: form.totalAmount ? Number(form.totalAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: "err", text: data.error || "Unable to create booking" });
        return;
      }
      setNotice({ type: "ok", text: `Booking #${data.booking.id} created.` });
      setForm({ ...emptyForm, roomSlug: form.roomSlug });
      void load();
    } catch {
      setNotice({ type: "err", text: "Unable to create booking" });
    } finally {
      setSaving(false);
    }
  }

  async function update(id: number, patch: Record<string, unknown>) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } as Booking : b)));
      if (patch.status === "cancelled" || patch.status === "checked_out" || patch.status === "refunded") {
        void load();
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Front Desk</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Offline Bookings</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Record walk-in or phone reservations. Availability is checked against live inventory.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)] sm:grid-cols-2 lg:grid-cols-4"
      >
        <TextField label="Guest Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <TextField label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Room Category *
          </p>
          <select
            value={form.roomSlug}
            onChange={(e) => setForm({ ...form, roomSlug: e.target.value, roomNumber: "" })}
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
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Room Number {categoryHasUnits ? "*" : "(optional)"}
          </p>
          <select
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            <option value="">
              {categoryHasUnits
                ? availableUnits.length
                  ? "Select available unit"
                  : "No available units"
                : "No units configured"}
            </option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.roomNumber}>
                Room #{u.roomNumber}
              </option>
            ))}
          </select>
        </div>
        <TextField
          type="date"
          label="Check-in *"
          value={form.checkIn}
          onChange={(v) => setForm({ ...form, checkIn: v })}
        />
        <TextField
          type="date"
          label="Check-out *"
          value={form.checkOut}
          onChange={(v) => setForm({ ...form, checkOut: v })}
        />
        <TextField
          type="number"
          label="Guests"
          value={form.guests}
          onChange={(v) => setForm({ ...form, guests: v })}
        />
        <TextField
          type="number"
          label="Children"
          value={form.children}
          onChange={(v) => setForm({ ...form, children: v })}
        />
        <TextField
          type="number"
          label="Rooms"
          value={form.roomQuantity}
          onChange={(v) => setForm({ ...form, roomQuantity: v })}
        />
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Breakfast</p>
          <div className="rounded-lg border border-[#c5a059]/35 bg-[#f7f2e9] px-3 py-2.5 text-sm text-[#0f2420]">
            Breakfast Included
          </div>
        </div>
        <TextField
          type="number"
          label="Total Amount ($, optional)"
          value={form.totalAmount}
          onChange={(v) => setForm({ ...form, totalAmount: v })}
        />
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Status</p>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Payment Status
          </p>
          <select
            value={form.paymentStatus}
            onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <TextField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
        <TextField label="Internal Remarks" value={form.remarks} onChange={(v) => setForm({ ...form, remarks: v })} />

        <div className="sm:col-span-2 lg:col-span-4">
          {notice ? (
            <p className={`mb-3 text-sm ${notice.type === "err" ? "text-red-600" : "text-emerald-700"}`}>
              {notice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#0f2420] px-6 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Booking
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-[#0f2420]">
                    #{b.id} · {b.name}
                  </p>
                  <p className="mt-1 text-xs text-[#7a8a82]">
                    {b.email || "—"} · {b.phone || "—"} · {new Date(b.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-[#3d5a4c]">
                    {b.roomName}
                    {b.roomNumber ? ` · Room #${b.roomNumber}` : ""} ·{" "}
                    {new Date(b.checkIn).toLocaleDateString()} →{" "}
                    {new Date(b.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-serif text-xl text-[#0f2420]">${b.totalAmount}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={b.status}
                  onChange={(e) => void update(b.id, { status: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <select
                  value={b.paymentStatus}
                  onChange={(e) => void update(b.id, { paymentStatus: e.target.value })}
                  className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-1.5 text-xs outline-none"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {bookings.length === 0 ? (
            <p className="text-sm text-[#5a635c]">No offline bookings recorded yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
      />
    </div>
  );
}
