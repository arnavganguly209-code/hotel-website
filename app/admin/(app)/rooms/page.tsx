"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";

interface AdminRoom {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  breakfastPrice: number;
  amenities: string[];
  available: boolean;
  maxGuests: number;
  imageSrc: string;
  gallery: string[];
  totalRooms: number;
}

type EditState = {
  name: string;
  description: string;
  price: string;
  breakfastPrice: string;
  maxGuests: string;
  available: boolean;
  imageSrc: string;
  amenities: string;
  gallery: string;
  totalRooms: string;
};

function toEditState(room: AdminRoom): EditState {
  return {
    name: room.name,
    description: room.description,
    price: String(room.price),
    breakfastPrice: String(room.breakfastPrice),
    maxGuests: String(room.maxGuests),
    available: room.available,
    imageSrc: room.imageSrc,
    amenities: (room.amenities || []).join("\n"),
    gallery: (room.gallery || []).join("\n"),
    totalRooms: String(room.totalRooms),
  };
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminRoom | null>(null);
  const [form, setForm] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rooms", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load rooms");
      setRooms(data.rooms ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(room: AdminRoom) {
    setEditing(room);
    setForm(toEditState(room));
    setNotice("");
  }

  async function saveEdit() {
    if (!editing || !form) return;
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: editing.slug,
          name: form.name,
          description: form.description,
          price: Number(form.price) || 0,
          breakfastPrice: Number(form.breakfastPrice) || 0,
          maxGuests: Number(form.maxGuests) || 1,
          available: form.available,
          imageSrc: form.imageSrc,
          amenities: form.amenities
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean),
          gallery: form.gallery
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean),
          totalRooms: Number(form.totalRooms) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Unable to update room");
        return;
      }
      setEditing(null);
      setForm(null);
      void load();
    } catch {
      setNotice("Unable to update room");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Accommodations</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Rooms</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Update room details, pricing, and physical inventory. Changes sync to the public website.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-[#5a635c]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading rooms…
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {rooms.map((room) => (
            <div
              key={room.slug}
              className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-[#0f2420]">{room.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[#7a8a82]">{room.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(room)}
                  className="flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 px-3 py-1.5 text-xs font-medium text-[#0f2420] transition hover:bg-[#c5a059]/10"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-[#5a635c]">{room.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#7a8a82]">Price</p>
                  <p className="mt-0.5 font-medium text-[#0f2420]">${room.price}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#7a8a82]">Breakfast</p>
                  <p className="mt-0.5 font-medium text-[#0f2420]">${room.breakfastPrice}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#7a8a82]">Max Guests</p>
                  <p className="mt-0.5 font-medium text-[#0f2420]">{room.maxGuests}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#7a8a82]">Total Rooms</p>
                  <p className="mt-0.5 font-medium text-[#0f2420]">{room.totalRooms}</p>
                </div>
              </div>
              <span
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${
                  room.available
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {room.available ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
          {rooms.length === 0 ? (
            <p className="text-sm text-[#5a635c]">No rooms configured yet.</p>
          ) : null}
        </div>
      )}

      {editing && form ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fbf8f1] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#0f2420]">Edit {editing.name}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-[#5a635c]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Name">
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price / Night ($)">
                  <input
                    type="number"
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </Field>
                <Field label="Breakfast Price ($)">
                  <input
                    type="number"
                    className="input"
                    value={form.breakfastPrice}
                    onChange={(e) => setForm({ ...form, breakfastPrice: e.target.value })}
                  />
                </Field>
                <Field label="Max Guests">
                  <input
                    type="number"
                    className="input"
                    value={form.maxGuests}
                    onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                  />
                </Field>
                <Field label="Total Physical Rooms">
                  <input
                    type="number"
                    className="input"
                    value={form.totalRooms}
                    onChange={(e) => setForm({ ...form, totalRooms: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Cover Image URL">
                <input
                  className="input"
                  value={form.imageSrc}
                  onChange={(e) => setForm({ ...form, imageSrc: e.target.value })}
                />
              </Field>
              <Field label="Amenities (one per line)">
                <textarea
                  rows={4}
                  className="input"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                />
              </Field>
              <Field label="Gallery Image URLs (one per line)">
                <textarea
                  rows={3}
                  className="input"
                  value={form.gallery}
                  onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[#3d5a4c]">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="h-4 w-4 rounded border-[#c5a059]/50"
                />
                Room is available for booking
              </label>

              {notice ? <p className="text-sm text-red-600">{notice}</p> : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-[#c5a059]/40 px-5 py-2.5 text-sm text-[#0f2420]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveEdit()}
                  className="flex items-center gap-2 rounded-full bg-[#0f2420] px-6 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(197, 160, 89, 0.35);
          background: #ffffff;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          color: #0f2420;
          outline: none;
        }
        .input:focus {
          border-color: #c5a059;
          box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">{label}</p>
      {children}
    </div>
  );
}
