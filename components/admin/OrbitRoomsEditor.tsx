"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasMediaSrc } from "@/lib/cms/media-url";
import type { MediaAsset, SiteContent } from "@/lib/cms/types";

type Room = SiteContent["rooms"][number];

interface OrbitRoomsEditorProps {
  rooms: Room[];
  mediaLibrary: MediaAsset[];
  onRoomsChange: (rooms: Room[]) => void;
  onLibraryChange: (library: MediaAsset[]) => void;
}

function patchRoom(rooms: Room[], index: number, next: Room): Room[] {
  const copy = [...rooms];
  copy[index] = next;
  return copy;
}

function RoomEditorCard({
  room,
  index,
  rooms,
  mediaLibrary,
  onRoomsChange,
  onLibraryChange,
}: {
  room: Room;
  index: number;
  rooms: Room[];
  mediaLibrary: MediaAsset[];
  onRoomsChange: (rooms: Room[]) => void;
  onLibraryChange: (library: MediaAsset[]) => void;
}) {
  const set = (next: Partial<Room>) => {
    onRoomsChange(patchRoom(rooms, index, { ...room, ...next }));
  };

  const setSeo = (partial: Partial<NonNullable<Room["seo"]>>) => {
    set({
      seo: {
        metaTitle: room.seo?.metaTitle || room.name,
        metaDescription: room.seo?.metaDescription || room.description,
        canonical: room.seo?.canonical || "",
        ogImage: room.seo?.ogImage || room.imageSrc,
        twitterImage: room.seo?.twitterImage || room.imageSrc,
        altText: room.seo?.altText || room.name,
        ...partial,
      },
    });
  };

  const gallery = room.gallery?.length ? room.gallery : room.imageSrc ? [room.imageSrc] : [];

  return (
    <div className="space-y-5 border border-luxury-gold/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg text-luxury-gold">{room.name || "Untitled room"}</p>
          <p className="mt-1 text-xs text-white/45">
            ${room.price}/night · {room.size} · {room.bedType} · Order {room.order ?? index}
          </p>
        </div>
        <div className="flex h-20 w-28 overflow-hidden rounded-lg border border-white/10 bg-black/30">
          {hasMediaSrc(room.imageSrc) ? (
            <div className="relative h-full w-full">
              <SafeImage src={room.imageSrc} alt={room.name} fill fadeIn={false} className="object-cover" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-white/35">
              No cover
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-luxury-gold/20 bg-black/20 p-4">
        <p className="text-sm font-medium text-luxury-gold">Cover Image</p>
        <p className="text-xs text-white/45">
          Clear the current photo, then upload a new one or pick from the media library. Save Orbit after changing.
        </p>
        <ImagePicker
          label="Room Cover Image"
          folder="rooms"
          category="Rooms"
          value={room.imageSrc || ""}
          library={mediaLibrary}
          onLibraryChange={onLibraryChange}
          enableCrop
          onChange={(url) => {
            const nextGallery =
              url && gallery.length
                ? [url, ...gallery.filter((src) => src && src !== room.imageSrc)]
                : url
                  ? [url]
                  : gallery.filter((src) => src && src !== room.imageSrc);
            set({
              imageSrc: url,
              gallery: nextGallery,
            });
          }}
        />
      </div>

      <AdminInput label="Room Name" value={room.name} onChange={(e) => set({ name: e.target.value })} />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Price ($/night)"
          type="number"
          value={room.price}
          onChange={(e) => set({ price: Number(e.target.value) })}
        />
        <AdminInput
          label="SEO Slug"
          value={room.slug || room.id}
          onChange={(e) =>
            set({
              slug: e.target.value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            })
          }
        />
        <AdminInput label="Guests label" value={room.guests} onChange={(e) => set({ guests: e.target.value })} />
        <AdminInput label="Size" value={room.size} onChange={(e) => set({ size: e.target.value })} />
        <AdminInput label="Bed Type" value={room.bedType} onChange={(e) => set({ bedType: e.target.value })} />
        <AdminInput
          label="Display Order"
          type="number"
          value={room.order ?? index}
          onChange={(e) => set({ order: Number(e.target.value) })}
        />
        <AdminInput
          label="Explore Button Text"
          value={room.exploreText || "Explore Room"}
          onChange={(e) => set({ exploreText: e.target.value })}
        />
        <AdminInput
          label="Cancellation Badge"
          value={room.cancellationLabel || "Flexible cancellation"}
          onChange={(e) => set({ cancellationLabel: e.target.value })}
        />
        <AdminInput
          label="Base adults (included)"
          type="number"
          value={room.baseAdults ?? 2}
          onChange={(e) => set({ baseAdults: Number(e.target.value) })}
        />
        <AdminInput
          label="Base children (included)"
          type="number"
          value={room.baseChildren ?? 1}
          onChange={(e) => set({ baseChildren: Number(e.target.value) })}
        />
        <AdminInput
          label="Max adults"
          type="number"
          value={room.maxAdults ?? 2}
          onChange={(e) => set({ maxAdults: Number(e.target.value) })}
        />
        <AdminInput
          label="Max children"
          type="number"
          value={room.maxChildren ?? 1}
          onChange={(e) => set({ maxChildren: Number(e.target.value) })}
        />
        <AdminInput
          label="Extra adult $/night"
          type="number"
          value={room.extraAdultPrice ?? 0}
          onChange={(e) => set({ extraAdultPrice: Number(e.target.value) })}
        />
        <AdminInput
          label="Extra child $/night"
          type="number"
          value={room.extraChildPrice ?? 0}
          onChange={(e) => set({ extraChildPrice: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={room.visible !== false}
            onChange={(e) => set({ visible: e.target.checked })}
            className="accent-luxury-gold"
          />
          Show on Homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={room.available !== false}
            onChange={(e) => set({ available: e.target.checked })}
            className="accent-luxury-gold"
          />
          Available for booking (/rooms)
        </label>
      </div>

      <AdminInput
        label="Card amenities / features (comma separated)"
        value={(room.amenities?.length ? room.amenities : room.features).join(", ")}
        onChange={(e) => {
          const list = e.target.value
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
          set({ amenities: list, features: list });
        }}
      />
      <AdminTextarea
        label="Short Description (cards)"
        rows={2}
        value={room.description}
        onChange={(e) => set({ description: e.target.value })}
      />
      <AdminTextarea
        label="Long Description (detail page)"
        rows={4}
        value={room.longDescription}
        onChange={(e) => set({ longDescription: e.target.value })}
      />

      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <p className="text-xs text-white/50">Gallery images (detail page)</p>
        {gallery.map((src, gi) => (
          <div key={`${room.id}-gallery-${gi}`} className="flex items-end gap-2">
            <div className="flex-1">
              <ImagePicker
                label={`Gallery Image ${gi + 1}`}
                folder="rooms"
                category="Rooms"
                value={src || ""}
                library={mediaLibrary}
                onLibraryChange={onLibraryChange}
                enableCrop
                onChange={(url) => {
                  const next = [...gallery];
                  next[gi] = url;
                  set({ gallery: next.filter(Boolean) });
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-400"
              onClick={() => {
                const next = gallery.filter((_, idx) => idx !== gi);
                set({ gallery: next });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() => set({ gallery: [...gallery, ""] })}
        >
          <Plus className="h-4 w-4" /> Add Gallery Image
        </Button>
      </div>

      <AdminTextarea
        label="Policies (one per line)"
        rows={3}
        value={(room.policies || []).join("\n")}
        onChange={(e) =>
          set({
            policies: e.target.value
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          })
        }
      />
      <AdminTextarea
        label="Facilities (one per line)"
        rows={3}
        value={(room.facilities || []).join("\n")}
        onChange={(e) =>
          set({
            facilities: e.target.value
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          })
        }
      />
      <AdminTextarea
        label="Services (one per line)"
        rows={3}
        value={(room.services || []).join("\n")}
        onChange={(e) =>
          set({
            services: e.target.value
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          })
        }
      />
      <AdminTextarea
        label="Nearby Attractions (one per line)"
        rows={3}
        value={(room.nearbyAttractions || []).join("\n")}
        onChange={(e) =>
          set({
            nearbyAttractions: e.target.value
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          })
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Check-in Time"
          value={room.checkInTime || "2:00 PM"}
          onChange={(e) => set({ checkInTime: e.target.value })}
        />
        <AdminInput
          label="Check-out Time"
          value={room.checkOutTime || "12:00 PM"}
          onChange={(e) => set({ checkOutTime: e.target.value })}
        />
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-4">
        <p className="text-sm font-medium text-luxury-gold">Room SEO</p>
        <AdminInput
          label="Meta Title"
          value={room.seo?.metaTitle || ""}
          onChange={(e) => setSeo({ metaTitle: e.target.value })}
        />
        <AdminTextarea
          label="Meta Description"
          rows={2}
          value={room.seo?.metaDescription || ""}
          onChange={(e) => setSeo({ metaDescription: e.target.value })}
        />
        <AdminInput
          label="Canonical URL"
          value={room.seo?.canonical || ""}
          onChange={(e) => setSeo({ canonical: e.target.value })}
        />
        <ImagePicker
          label="OpenGraph Image"
          folder="seo"
          category="SEO"
          value={room.seo?.ogImage || room.imageSrc || ""}
          library={mediaLibrary}
          onLibraryChange={onLibraryChange}
          onChange={(ogImage) => setSeo({ ogImage })}
        />
        <AdminInput
          label="Image Alt Text"
          value={room.seo?.altText || room.name}
          onChange={(e) => setSeo({ altText: e.target.value })}
        />
      </div>
    </div>
  );
}

export function OrbitRoomsEditor({
  rooms,
  mediaLibrary,
  onRoomsChange,
  onLibraryChange,
}: OrbitRoomsEditorProps) {
  const indexed = rooms.map((room, index) => ({ room, index }));
  const active = indexed
    .filter(({ room }) => room.available !== false)
    .sort((a, b) => (a.room.order ?? a.index) - (b.room.order ?? b.index));
  const archived = indexed.filter(({ room }) => room.available === false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-luxury-gold/10 p-4">
        <div>
          <p className="font-display text-lg text-luxury-gold">Active Room Categories</p>
          <p className="mt-1 text-xs text-white/45">
            Edit name, price, text, cover image, and amenities for the live categories only. Old
            unavailable categories stay hidden below.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            onRoomsChange([
              ...rooms,
              {
                id: `room-${Date.now()}`,
                name: "New Room",
                price: 50,
                guests: "2 Adults + 1 Child",
                maxGuests: 4,
                baseAdults: 2,
                baseChildren: 1,
                maxAdults: 2,
                maxChildren: 2,
                extraAdultPrice: 5,
                extraChildPrice: 5,
                size: "30 m²",
                bedType: "Queen Bed",
                features: ["Air Conditioning", "Attached Bathroom", "Free Wifi"],
                description: "A luxurious room designed for your comfort.",
                longDescription:
                  "A luxurious room designed for your comfort with premium amenities and refined service.",
                imageSrc: "",
                gallery: [],
                amenities: ["Air Conditioning", "Attached Bathroom", "Free Wifi"],
                policies: ["Check-in from 2:00 PM · Check-out by 12:00 PM"],
                available: true,
                visible: true,
                order: rooms.length,
                exploreText: "Explore Room",
                breakfastPrice: 5,
              },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      {active.length === 0 ? (
        <div className="border border-luxury-gold/10 p-6 text-sm text-white/50">
          No active room categories. Add a room or restore an archived one.
        </div>
      ) : (
        active.map(({ room, index }) => (
          <RoomEditorCard
            key={room.id}
            room={room}
            index={index}
            rooms={rooms}
            mediaLibrary={mediaLibrary}
            onRoomsChange={onRoomsChange}
            onLibraryChange={onLibraryChange}
          />
        ))
      )}

      {archived.length > 0 ? (
        <div className="space-y-4 border border-white/10 p-4">
          <p className="text-sm font-medium text-white/55">
            Archived / old categories (hidden from site)
          </p>
          {archived.map(({ room, index }) => (
            <div
              key={room.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3"
            >
              <div>
                <p className="text-sm text-white/70">{room.name}</p>
                <p className="text-[11px] text-white/40">
                  ${room.price}/night · id: {room.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-luxury-gold/30 text-luxury-gold"
                  onClick={() =>
                    onRoomsChange(
                      patchRoom(rooms, index, {
                        ...room,
                        available: true,
                        visible: true,
                      })
                    )
                  }
                >
                  Restore
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() =>
                    onRoomsChange(rooms.filter((_, idx) => idx !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
