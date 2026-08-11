"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { MediaAsset } from "@/lib/cms/types";

interface AdminRoom {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  breakfastPrice: number;
  amenities: string[];
  available: boolean;
  visible: boolean;
  maxGuests: number;
  guests: string;
  size: string;
  bedType: string;
  baseAdults: number;
  baseChildren: number;
  maxAdults: number;
  maxChildren: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  imageSrc: string;
  gallery: string[];
  totalRooms: number;
}

type EditState = {
  name: string;
  description: string;
  longDescription: string;
  price: string;
  breakfastPrice: string;
  maxGuests: string;
  guests: string;
  size: string;
  bedType: string;
  available: boolean;
  visible: boolean;
  imageSrc: string;
  amenities: string;
  gallery: string[];
  totalRooms: string;
  baseAdults: string;
  baseChildren: string;
  maxAdults: string;
  maxChildren: string;
  extraAdultPrice: string;
  extraChildPrice: string;
};

function toEditState(room: AdminRoom): EditState {
  return {
    name: room.name,
    description: room.description,
    longDescription: room.longDescription || "",
    price: String(room.price),
    breakfastPrice: String(room.breakfastPrice),
    maxGuests: String(room.maxGuests),
    guests: room.guests || "",
    size: room.size || "",
    bedType: room.bedType || "",
    available: room.available,
    visible: room.visible,
    imageSrc: room.imageSrc,
    amenities: (room.amenities || []).join("\n"),
    gallery: room.gallery?.length ? [...room.gallery] : room.imageSrc ? [room.imageSrc] : [],
    totalRooms: String(room.totalRooms),
    baseAdults: String(room.baseAdults ?? 2),
    baseChildren: String(room.baseChildren ?? 1),
    maxAdults: String(room.maxAdults ?? 2),
    maxChildren: String(room.maxChildren ?? 1),
    extraAdultPrice: String(room.extraAdultPrice ?? 0),
    extraChildPrice: String(room.extraChildPrice ?? 0),
  };
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
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
      setMediaLibrary(data.mediaLibrary ?? []);
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
          longDescription: form.longDescription,
          price: Number(form.price) || 0,
          breakfastPrice: Number(form.breakfastPrice) || 0,
          maxGuests: Number(form.maxGuests) || 1,
          guests: form.guests,
          size: form.size,
          bedType: form.bedType,
          available: form.available,
          visible: form.visible,
          imageSrc: form.imageSrc,
          amenities: form.amenities
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean),
          gallery: form.gallery.map((src) => src.trim()).filter(Boolean),
          totalRooms: Number(form.totalRooms) || 1,
          baseAdults: Number(form.baseAdults) || 1,
          baseChildren: Number(form.baseChildren) || 0,
          maxAdults: Number(form.maxAdults) || 1,
          maxChildren: Number(form.maxChildren) || 0,
          extraAdultPrice: Number(form.extraAdultPrice) || 0,
          extraChildPrice: Number(form.extraChildPrice) || 0,
          mediaLibrary,
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
          Live room categories only. Edit cover, gallery, copy, and all prices — changes sync to the
          public website and Orbit.
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
                  room.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                {room.available ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
          {rooms.length === 0 ? (
            <p className="text-sm text-[#5a635c]">No live room categories yet.</p>
          ) : null}
        </div>
      )}

      {editing && form ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[96vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-[#fbf8f1] p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-[#0f2420]">Edit {editing.name}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-[#5a635c]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-[#0f2420] p-4">
                <ImagePicker
                  label="Cover Image"
                  folder="rooms"
                  category="Rooms"
                  value={form.imageSrc}
                  library={mediaLibrary}
                  onLibraryChange={setMediaLibrary}
                  enableCrop
                  onChange={(url) => {
                    const nextGallery = url
                      ? [url, ...form.gallery.filter((src) => src && src !== form.imageSrc)]
                      : form.gallery.filter((src) => src && src !== form.imageSrc);
                    setForm({ ...form, imageSrc: url, gallery: nextGallery });
                  }}
                />
              </div>

              <Field label="Name">
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Short Description">
                <textarea
                  rows={3}
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
              <Field label="Long Description (room page)">
                <textarea
                  rows={5}
                  className="input"
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
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
                <Field label="Extra adult $/night">
                  <input
                    type="number"
                    className="input"
                    value={form.extraAdultPrice}
                    onChange={(e) => setForm({ ...form, extraAdultPrice: e.target.value })}
                  />
                </Field>
                <Field label="Extra child $/night">
                  <input
                    type="number"
                    className="input"
                    value={form.extraChildPrice}
                    onChange={(e) => setForm({ ...form, extraChildPrice: e.target.value })}
                  />
                </Field>
                <Field label="Size">
                  <input
                    className="input"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  />
                </Field>
                <Field label="Bed Type">
                  <input
                    className="input"
                    value={form.bedType}
                    onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                  />
                </Field>
                <Field label="Guests label">
                  <input
                    className="input"
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
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
                <Field label="Base adults">
                  <input
                    type="number"
                    className="input"
                    value={form.baseAdults}
                    onChange={(e) => setForm({ ...form, baseAdults: e.target.value })}
                  />
                </Field>
                <Field label="Base children">
                  <input
                    type="number"
                    className="input"
                    value={form.baseChildren}
                    onChange={(e) => setForm({ ...form, baseChildren: e.target.value })}
                  />
                </Field>
                <Field label="Max adults">
                  <input
                    type="number"
                    className="input"
                    value={form.maxAdults}
                    onChange={(e) => setForm({ ...form, maxAdults: e.target.value })}
                  />
                </Field>
                <Field label="Max children">
                  <input
                    type="number"
                    className="input"
                    value={form.maxChildren}
                    onChange={(e) => setForm({ ...form, maxChildren: e.target.value })}
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
              <Field label="Amenities (one per line)">
                <textarea
                  rows={4}
                  className="input"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                />
              </Field>

              <div className="space-y-3 rounded-xl bg-[#0f2420] p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#e8d5a3]">
                  Gallery images
                </p>
                {form.gallery.map((src, i) => (
                  <div key={`${src}-${i}`} className="flex items-end gap-2">
                    <div className="flex-1">
                      <ImagePicker
                        label={`Gallery image ${i + 1}`}
                        folder="rooms"
                        category="Rooms"
                        value={src}
                        library={mediaLibrary}
                        onLibraryChange={setMediaLibrary}
                        enableCrop
                        onChange={(url) => {
                          const next = [...form.gallery];
                          next[i] = url;
                          setForm({ ...form, gallery: next });
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="mb-1 rounded-full p-2 text-red-300"
                      onClick={() =>
                        setForm({ ...form, gallery: form.gallery.filter((_, idx) => idx !== i) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gallery: [...form.gallery, ""] })}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 px-4 py-2 text-xs text-[#e8d5a3]"
                >
                  <Plus className="h-4 w-4" /> Add gallery image
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#3d5a4c]">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="h-4 w-4 rounded border-[#c5a059]/50"
                />
                Room is available for booking
              </label>
              <label className="flex items-center gap-2 text-sm text-[#3d5a4c]">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="h-4 w-4 rounded border-[#c5a059]/50"
                />
                Show on homepage
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
