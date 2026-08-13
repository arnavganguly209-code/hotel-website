"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

interface SpaPageEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

const SPA_BOOKING_URL = "https://hotelthamelparkspa.com/";

export function SpaPageEditor({ content, update }: SpaPageEditorProps) {
  const page = content.spaPage;
  const setPage = (next: SiteContent["spaPage"]) => update("spaPage", next);
  const facilities = page.facilities ?? {
    eyebrow: "Our Spaces",
    title: "Spa Rooms & Wellness Suites",
    description: "",
    items: [],
  };

  const setFacilities = (next: SiteContent["spaPage"]["facilities"]) =>
    setPage({ ...page, facilities: next });

  const patchFacility = (
    index: number,
    patch: Partial<SiteContent["spaPage"]["facilities"]["items"][number]>
  ) => {
    const items = [...facilities.items];
    items[index] = { ...items[index], ...patch };
    setFacilities({ ...facilities, items });
  };

  const moveFacility = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= facilities.items.length) return;
    const items = [...facilities.items];
    const [item] = items.splice(index, 1);
    items.splice(target, 0, item);
    setFacilities({
      ...facilities,
      items: items.map((entry, order) => ({ ...entry, order })),
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Spa Page — hero, facilities rooms, gallery, why choose, testimonials, booking, FAQ, CTA,
        SEO. Public page shows rooms (no prices / yoga). Changes auto-save.
      </p>
      <p className="rounded border border-luxury-gold/20 bg-luxury-gold/5 px-4 py-3 text-sm text-luxury-gold/90">
        Book Now CTAs should point to{" "}
        <span className="font-medium text-luxury-gold">{SPA_BOOKING_URL}</span>
      </p>

      {/* Hero */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Hero Cover (Reception)</p>
        <ImagePicker
          label="Hero Cover Image"
          folder="spa"
          category="Spa"
          value={page.hero.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, hero: { ...page.hero, imageSrc: url } })}
        />
        <AdminInput
          label="Title"
          value={page.hero.title}
          onChange={(e) => setPage({ ...page, hero: { ...page.hero, title: e.target.value } })}
        />
        <AdminInput
          label="Subtitle"
          value={page.hero.subtitle}
          onChange={(e) => setPage({ ...page, hero: { ...page.hero, subtitle: e.target.value } })}
        />
        <AdminTextarea
          label="Description"
          rows={3}
          value={page.hero.description}
          onChange={(e) =>
            setPage({ ...page, hero: { ...page.hero, description: e.target.value } })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Breadcrumb Home"
            value={page.hero.breadcrumbHome}
            onChange={(e) =>
              setPage({ ...page, hero: { ...page.hero, breadcrumbHome: e.target.value } })
            }
          />
          <AdminInput
            label="Breadcrumb Current"
            value={page.hero.breadcrumbCurrent}
            onChange={(e) =>
              setPage({ ...page, hero: { ...page.hero, breadcrumbCurrent: e.target.value } })
            }
          />
        </div>
        <AdminInput
          label="Scroll Hint"
          value={page.hero.scrollHint}
          onChange={(e) =>
            setPage({ ...page, hero: { ...page.hero, scrollHint: e.target.value } })
          }
        />
        <AdminInput
          label="Overlay Opacity (0.4–0.5 recommended)"
          type="number"
          step="0.05"
          min={0.2}
          max={0.8}
          value={page.hero.overlayOpacity}
          onChange={(e) =>
            setPage({
              ...page,
              hero: { ...page.hero, overlayOpacity: Number(e.target.value) },
            })
          }
        />
      </div>

      {/* SEO */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">SEO</p>
        <AdminInput
          label="Meta Title"
          value={page.seo.title}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
        />
        <AdminTextarea
          label="Meta Description"
          rows={2}
          value={page.seo.description}
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, description: e.target.value } })
          }
        />
        <AdminInput
          label="Keywords"
          value={page.seo.keywords}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, keywords: e.target.value } })}
        />
        <AdminInput
          label="Canonical URL"
          value={page.seo.canonical || ""}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, canonical: e.target.value } })}
        />
        <ImagePicker
          label="OG Image"
          folder="spa"
          category="Spa"
          value={page.seo.ogImage || ""}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, seo: { ...page.seo, ogImage: url } })}
        />
      </div>

      {/* Introduction */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Introduction</p>
        <AdminInput
          label="Eyebrow"
          value={page.introduction.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.introduction.title}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Content"
          rows={4}
          value={page.introduction.content}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, content: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Quote"
          rows={2}
          value={page.introduction.quote}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, quote: e.target.value },
            })
          }
        />
        <AdminInput
          label="Quote Author"
          value={page.introduction.quoteAuthor}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, quoteAuthor: e.target.value },
            })
          }
        />
        <ImagePicker
          label="Introduction Image"
          folder="spa"
          category="Spa"
          value={page.introduction.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, imageSrc: url },
            })
          }
        />
        <AdminInput
          label="Image Alt"
          value={page.introduction.imageAlt}
          onChange={(e) =>
            setPage({
              ...page,
              introduction: { ...page.introduction, imageAlt: e.target.value },
            })
          }
        />
      </div>

      {/* Facilities — primary Orbit focus */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Spa Rooms & Facilities</p>
        <p className="text-xs text-white/45">
          Alternating left/right layout on the public spa page. Slim gold frames — no prices.
        </p>
        <AdminInput
          label="Eyebrow"
          value={facilities.eyebrow}
          onChange={(e) => setFacilities({ ...facilities, eyebrow: e.target.value })}
        />
        <AdminInput
          label="Title"
          value={facilities.title}
          onChange={(e) => setFacilities({ ...facilities, title: e.target.value })}
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={facilities.description}
          onChange={(e) => setFacilities({ ...facilities, description: e.target.value })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-white/60">
            Rooms ({facilities.items.filter((r) => r.enabled !== false).length} visible /{" "}
            {facilities.items.length})
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setFacilities({
                ...facilities,
                items: [
                  ...facilities.items,
                  {
                    id: `spa-room-${Date.now()}`,
                    enabled: true,
                    order: facilities.items.length,
                    name: "New Spa Room",
                    tagline: "",
                    description: "",
                    imageSrc: "",
                    imageAlt: "",
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Room
          </Button>
        </div>
        {facilities.items.map((room, i) => (
          <div key={room.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-luxury-gold">
                Room {i + 1}
                {room.name ? ` — ${room.name}` : ""}
                <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-white/40">
                  {i % 2 === 0 ? "Image left · text right" : "Text left · image right"}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <label className="mr-2 flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={room.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => patchFacility(i, { enabled: e.target.checked })}
                  />
                  Show on /spa
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-white/60"
                  disabled={i === 0}
                  onClick={() => moveFacility(i, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-white/60"
                  disabled={i === facilities.items.length - 1}
                  onClick={() => moveFacility(i, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() =>
                    setFacilities({
                      ...facilities,
                      items: facilities.items
                        .filter((_, idx) => idx !== i)
                        .map((entry, order) => ({ ...entry, order })),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ImagePicker
              label="Room Image"
              folder="spa"
              category="Spa"
              value={room.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => patchFacility(i, { imageSrc: url })}
            />
            <AdminInput
              label="Name"
              value={room.name}
              onChange={(e) => patchFacility(i, { name: e.target.value })}
            />
            <AdminInput
              label="Tagline"
              value={room.tagline}
              onChange={(e) => patchFacility(i, { tagline: e.target.value })}
            />
            <AdminTextarea
              label="Description"
              rows={3}
              value={room.description}
              onChange={(e) => patchFacility(i, { description: e.target.value })}
            />
            <AdminInput
              label="Image Alt"
              value={room.imageAlt}
              onChange={(e) => patchFacility(i, { imageAlt: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Gallery */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Gallery</p>
        <AdminInput
          label="Eyebrow"
          value={page.gallerySection.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              gallerySection: { ...page.gallerySection, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.gallerySection.title}
          onChange={(e) =>
            setPage({
              ...page,
              gallerySection: { ...page.gallerySection, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.gallerySection.description}
          onChange={(e) =>
            setPage({
              ...page,
              gallerySection: { ...page.gallerySection, description: e.target.value },
            })
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setPage({
              ...page,
              gallery: [
                ...page.gallery,
                {
                  id: `sg-${Date.now()}`,
                  src: "",
                  title: "New image",
                  alt: "",
                  enabled: true,
                  order: page.gallery.length,
                },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Gallery Image
        </Button>
        {page.gallery.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const gallery = [...page.gallery];
                    gallery[i] = { ...item, enabled: e.target.checked };
                    setPage({ ...page, gallery });
                  }}
                />
                Enabled
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({
                    ...page,
                    gallery: page.gallery.filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ImagePicker
              label="Image"
              folder="spa"
              category="Spa"
              value={item.src}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const gallery = [...page.gallery];
                gallery[i] = { ...item, src: url };
                setPage({ ...page, gallery });
              }}
            />
            <AdminInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const gallery = [...page.gallery];
                gallery[i] = { ...item, title: e.target.value };
                setPage({ ...page, gallery });
              }}
            />
            <AdminInput
              label="Alt"
              value={item.alt}
              onChange={(e) => {
                const gallery = [...page.gallery];
                gallery[i] = { ...item, alt: e.target.value };
                setPage({ ...page, gallery });
              }}
            />
          </div>
        ))}
      </div>

      {/* Why choose */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Why Choose</p>
        <AdminInput
          label="Eyebrow"
          value={page.whyChoose.eyebrow}
          onChange={(e) =>
            setPage({ ...page, whyChoose: { ...page.whyChoose, eyebrow: e.target.value } })
          }
        />
        <AdminInput
          label="Title"
          value={page.whyChoose.title}
          onChange={(e) =>
            setPage({ ...page, whyChoose: { ...page.whyChoose, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.whyChoose.description}
          onChange={(e) =>
            setPage({
              ...page,
              whyChoose: { ...page.whyChoose, description: e.target.value },
            })
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setPage({
              ...page,
              whyChoose: {
                ...page.whyChoose,
                items: [
                  ...page.whyChoose.items,
                  {
                    id: `w-${Date.now()}`,
                    enabled: true,
                    order: page.whyChoose.items.length,
                    title: "New reason",
                    description: "",
                    icon: "Sparkles",
                  },
                ],
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
        {page.whyChoose.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const items = [...page.whyChoose.items];
                    items[i] = { ...item, enabled: e.target.checked };
                    setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
                  }}
                />
                Enabled
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({
                    ...page,
                    whyChoose: {
                      ...page.whyChoose,
                      items: page.whyChoose.items.filter((_, idx) => idx !== i),
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AdminInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const items = [...page.whyChoose.items];
                items[i] = { ...item, title: e.target.value };
                setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={2}
              value={item.description}
              onChange={(e) => {
                const items = [...page.whyChoose.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
              }}
            />
            <AdminInput
              label="Icon (Lucide name)"
              value={item.icon}
              onChange={(e) => {
                const items = [...page.whyChoose.items];
                items[i] = { ...item, icon: e.target.value };
                setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Testimonials</p>
        <AdminInput
          label="Eyebrow"
          value={page.testimonials.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              testimonials: { ...page.testimonials, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.testimonials.title}
          onChange={(e) =>
            setPage({
              ...page,
              testimonials: { ...page.testimonials, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.testimonials.description}
          onChange={(e) =>
            setPage({
              ...page,
              testimonials: { ...page.testimonials, description: e.target.value },
            })
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setPage({
              ...page,
              testimonials: {
                ...page.testimonials,
                items: [
                  ...page.testimonials.items,
                  {
                    id: `st-${Date.now()}`,
                    enabled: true,
                    order: page.testimonials.items.length,
                    name: "Guest name",
                    country: "",
                    rating: 5,
                    review: "",
                    photoSrc: "",
                  },
                ],
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
        {page.testimonials.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const items = [...page.testimonials.items];
                    items[i] = { ...item, enabled: e.target.checked };
                    setPage({ ...page, testimonials: { ...page.testimonials, items } });
                  }}
                />
                Enabled
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({
                    ...page,
                    testimonials: {
                      ...page.testimonials,
                      items: page.testimonials.items.filter((_, idx) => idx !== i),
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AdminInput
              label="Name"
              value={item.name}
              onChange={(e) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, name: e.target.value };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
            />
            <AdminInput
              label="Country"
              value={item.country}
              onChange={(e) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, country: e.target.value };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
            />
            <AdminInput
              label="Rating (1–5)"
              type="number"
              min={1}
              max={5}
              value={item.rating}
              onChange={(e) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, rating: Number(e.target.value) };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
            />
            <AdminTextarea
              label="Review"
              rows={3}
              value={item.review}
              onChange={(e) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, review: e.target.value };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
            />
            <ImagePicker
              label="Guest Photo"
              folder="spa"
              category="Spa"
              value={item.photoSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, photoSrc: url };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Booking */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Booking Band</p>
        <AdminInput
          label="Eyebrow"
          value={page.booking.eyebrow}
          onChange={(e) =>
            setPage({ ...page, booking: { ...page.booking, eyebrow: e.target.value } })
          }
        />
        <AdminInput
          label="Title"
          value={page.booking.title}
          onChange={(e) =>
            setPage({ ...page, booking: { ...page.booking, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.booking.description}
          onChange={(e) =>
            setPage({
              ...page,
              booking: { ...page.booking, description: e.target.value },
            })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Book Now Text"
            value={page.booking.buttonText}
            onChange={(e) =>
              setPage({
                ...page,
                booking: { ...page.booking, buttonText: e.target.value },
              })
            }
          />
          <AdminInput
            label="Book Now Link"
            value={page.booking.buttonHref}
            placeholder={SPA_BOOKING_URL}
            onChange={(e) =>
              setPage({
                ...page,
                booking: { ...page.booking, buttonHref: e.target.value },
              })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Secondary Text (optional)"
            value={page.booking.secondaryText}
            onChange={(e) =>
              setPage({
                ...page,
                booking: { ...page.booking, secondaryText: e.target.value },
              })
            }
          />
          <AdminInput
            label="Secondary Link"
            value={page.booking.secondaryHref}
            placeholder={SPA_BOOKING_URL}
            onChange={(e) =>
              setPage({
                ...page,
                booking: { ...page.booking, secondaryHref: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">FAQ</p>
        <AdminInput
          label="Eyebrow"
          value={page.faq.eyebrow}
          onChange={(e) => setPage({ ...page, faq: { ...page.faq, eyebrow: e.target.value } })}
        />
        <AdminInput
          label="Title"
          value={page.faq.title}
          onChange={(e) => setPage({ ...page, faq: { ...page.faq, title: e.target.value } })}
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.faq.description}
          onChange={(e) =>
            setPage({ ...page, faq: { ...page.faq, description: e.target.value } })
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setPage({
              ...page,
              faq: {
                ...page.faq,
                items: [
                  ...page.faq.items,
                  {
                    id: `faq-${Date.now()}`,
                    question: "New question?",
                    answer: "",
                    enabled: true,
                    order: page.faq.items.length,
                  },
                ],
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
        {page.faq.items.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const items = [...page.faq.items];
                    items[i] = { ...item, enabled: e.target.checked };
                    setPage({ ...page, faq: { ...page.faq, items } });
                  }}
                />
                Enabled
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({
                    ...page,
                    faq: {
                      ...page.faq,
                      items: page.faq.items.filter((_, idx) => idx !== i),
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AdminInput
              label="Question"
              value={item.question}
              onChange={(e) => {
                const items = [...page.faq.items];
                items[i] = { ...item, question: e.target.value };
                setPage({ ...page, faq: { ...page.faq, items } });
              }}
            />
            <AdminTextarea
              label="Answer"
              rows={3}
              value={item.answer}
              onChange={(e) => {
                const items = [...page.faq.items];
                items[i] = { ...item, answer: e.target.value };
                setPage({ ...page, faq: { ...page.faq, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Final CTA</p>
        <AdminInput
          label="Title"
          value={page.cta.title}
          onChange={(e) => setPage({ ...page, cta: { ...page.cta, title: e.target.value } })}
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.cta.description}
          onChange={(e) =>
            setPage({ ...page, cta: { ...page.cta, description: e.target.value } })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Button Text"
            value={page.cta.buttonText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, buttonText: e.target.value } })
            }
          />
          <AdminInput
            label="Button Link"
            value={page.cta.buttonHref}
            placeholder={SPA_BOOKING_URL}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, buttonHref: e.target.value } })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Secondary Text (optional)"
            value={page.cta.secondaryText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Link"
            value={page.cta.secondaryHref}
            placeholder={SPA_BOOKING_URL}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryHref: e.target.value } })
            }
          />
        </div>
        <ImagePicker
          label="Background Image"
          folder="spa"
          category="Spa"
          value={page.cta.backgroundImage}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) =>
            setPage({ ...page, cta: { ...page.cta, backgroundImage: url } })
          }
        />
      </div>

      {/* Hidden legacy sections */}
      <div className="space-y-2 border border-dashed border-white/10 p-5">
        <p className="font-display text-base text-white/50">Hidden on public spa page</p>
        <p className="text-sm text-white/40">
          Treatments, experiences, and packages are not shown on /spa (no price menu / yoga).
          Legacy CMS data is retained for migration only.
        </p>
      </div>
    </div>
  );
}
