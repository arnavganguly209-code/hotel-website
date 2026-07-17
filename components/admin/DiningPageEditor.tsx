"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

interface DiningPageEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinComma(values: string[]): string {
  return values.join(", ");
}

function splitComma(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function DiningPageEditor({ content, update }: DiningPageEditorProps) {
  const page = content.diningPage;
  const setPage = (next: SiteContent["diningPage"]) => update("diningPage", next);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Dining Page Management — hero, venues, menu, reservations form, gallery, reviews, FAQ, CTA,
        SEO. Changes auto-save.
      </p>

      {/* Hero */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Hero Cover</p>
        <ImagePicker
          label="Hero Cover Image"
          folder="dining"
          category="Dining"
          value={page.hero.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          enableCrop
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
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, title: e.target.value } })
          }
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
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, keywords: e.target.value } })
          }
        />
        <AdminInput
          label="Canonical URL"
          value={page.seo.canonical || ""}
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, canonical: e.target.value } })
          }
        />
        <AdminInput
          label="OG Image"
          value={page.seo.ogImage || ""}
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, ogImage: e.target.value } })
          }
        />
        <ImagePicker
          label="OG Image Picker"
          folder="dining"
          category="Dining"
          value={page.seo.ogImage || ""}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, seo: { ...page.seo, ogImage: url } })}
        />
      </div>

      {/* Welcome */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Welcome Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.welcome.eyebrow}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, eyebrow: e.target.value } })
          }
        />
        <AdminInput
          label="Title"
          value={page.welcome.title}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Content"
          rows={4}
          value={page.welcome.content}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, content: e.target.value } })
          }
        />
        <AdminTextarea
          label="Quote"
          rows={2}
          value={page.welcome.quote}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, quote: e.target.value } })
          }
        />
        <AdminInput
          label="Quote Author"
          value={page.welcome.quoteAuthor}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, quoteAuthor: e.target.value } })
          }
        />
        <ImagePicker
          label="Welcome Image"
          folder="dining"
          category="Dining"
          value={page.welcome.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) =>
            setPage({ ...page, welcome: { ...page.welcome, imageSrc: url } })
          }
        />
        <AdminInput
          label="Image Alt"
          value={page.welcome.imageAlt}
          onChange={(e) =>
            setPage({ ...page, welcome: { ...page.welcome, imageAlt: e.target.value } })
          }
        />
      </div>

      {/* Destinations */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Destinations Header</p>
        <AdminInput
          label="Eyebrow"
          value={page.destinations.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              destinations: { ...page.destinations, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.destinations.title}
          onChange={(e) =>
            setPage({
              ...page,
              destinations: { ...page.destinations, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.destinations.description}
          onChange={(e) =>
            setPage({
              ...page,
              destinations: { ...page.destinations, description: e.target.value },
            })
          }
        />
      </div>

      {/* Venues */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Venues</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                venues: [
                  ...page.venues,
                  {
                    id: `venue-${Date.now()}`,
                    enabled: true,
                    order: page.venues.length,
                    name: "New Venue",
                    tagline: "",
                    description: "",
                    cuisine: "",
                    hours: "",
                    capacity: "",
                    signaturesLabel: "Signature Dishes",
                    signatures: [],
                    features: [],
                    imageSrc: "",
                    imageAlt: "",
                    ctaText: "Reserve Table",
                    ctaHref: "#reserve-table",
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Venue
          </Button>
        </div>
        {page.venues.map((venue, i) => (
          <div key={venue.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{venue.name}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={venue.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const venues = [...page.venues];
                      venues[i] = { ...venue, enabled: e.target.checked };
                      setPage({ ...page, venues });
                    }}
                  />
                  Enabled
                </label>
                <AdminInput
                  label="Order"
                  type="number"
                  value={venue.order}
                  onChange={(e) => {
                    const venues = [...page.venues];
                    venues[i] = { ...venue, order: Number(e.target.value) };
                    setPage({ ...page, venues });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() =>
                    setPage({
                      ...page,
                      venues: page.venues.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AdminInput
              label="Name"
              value={venue.name}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, name: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <AdminInput
              label="Tagline"
              value={venue.tagline}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, tagline: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={3}
              value={venue.description}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, description: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Cuisine"
                value={venue.cuisine}
                onChange={(e) => {
                  const venues = [...page.venues];
                  venues[i] = { ...venue, cuisine: e.target.value };
                  setPage({ ...page, venues });
                }}
              />
              <AdminInput
                label="Hours"
                value={venue.hours}
                onChange={(e) => {
                  const venues = [...page.venues];
                  venues[i] = { ...venue, hours: e.target.value };
                  setPage({ ...page, venues });
                }}
              />
            </div>
            <AdminInput
              label="Capacity"
              value={venue.capacity}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, capacity: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <AdminInput
              label="Signatures Label"
              value={venue.signaturesLabel}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, signaturesLabel: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <AdminTextarea
              label="Signatures (comma-separated)"
              rows={2}
              value={joinComma(venue.signatures)}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, signatures: splitComma(e.target.value) };
                setPage({ ...page, venues });
              }}
            />
            <AdminTextarea
              label="Features (comma-separated)"
              rows={2}
              value={joinComma(venue.features)}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, features: splitComma(e.target.value) };
                setPage({ ...page, venues });
              }}
            />
            <ImagePicker
              label="Venue Image"
              folder="dining"
              category="Dining"
              value={venue.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, imageSrc: url };
                setPage({ ...page, venues });
              }}
            />
            <AdminInput
              label="Image Alt"
              value={venue.imageAlt}
              onChange={(e) => {
                const venues = [...page.venues];
                venues[i] = { ...venue, imageAlt: e.target.value };
                setPage({ ...page, venues });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="CTA Text"
                value={venue.ctaText}
                onChange={(e) => {
                  const venues = [...page.venues];
                  venues[i] = { ...venue, ctaText: e.target.value };
                  setPage({ ...page, venues });
                }}
              />
              <AdminInput
                label="CTA Link"
                value={venue.ctaHref}
                onChange={(e) => {
                  const venues = [...page.venues];
                  venues[i] = { ...venue, ctaHref: e.target.value };
                  setPage({ ...page, venues });
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Menu Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.menu.eyebrow}
          onChange={(e) =>
            setPage({ ...page, menu: { ...page.menu, eyebrow: e.target.value } })
          }
        />
        <AdminInput
          label="Title"
          value={page.menu.title}
          onChange={(e) =>
            setPage({ ...page, menu: { ...page.menu, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.menu.description}
          onChange={(e) =>
            setPage({ ...page, menu: { ...page.menu, description: e.target.value } })
          }
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Categories</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                menu: {
                  ...page.menu,
                  categories: [
                    ...page.menu.categories,
                    {
                      id: `cat-${Date.now()}`,
                      name: "New Category",
                      enabled: true,
                      order: page.menu.categories.length,
                      items: [],
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
        {page.menu.categories.map((category, ci) => (
          <div key={category.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{category.name}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={category.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const categories = [...page.menu.categories];
                      categories[ci] = { ...category, enabled: e.target.checked };
                      setPage({ ...page, menu: { ...page.menu, categories } });
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
                      menu: {
                        ...page.menu,
                        categories: page.menu.categories.filter((_, idx) => idx !== ci),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AdminInput
              label="Category Name"
              value={category.name}
              onChange={(e) => {
                const categories = [...page.menu.categories];
                categories[ci] = { ...category, name: e.target.value };
                setPage({ ...page, menu: { ...page.menu, categories } });
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-luxury-gold/30 text-luxury-gold"
              onClick={() => {
                const categories = [...page.menu.categories];
                categories[ci] = {
                  ...category,
                  items: [
                    ...category.items,
                    {
                      id: `item-${Date.now()}`,
                      enabled: true,
                      order: category.items.length,
                      title: "New Item",
                      description: "",
                      price: "",
                      imageSrc: "",
                      imageAlt: "",
                      chefRecommended: false,
                    },
                  ],
                };
                setPage({ ...page, menu: { ...page.menu, categories } });
              }}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
            {category.items.map((item, ii) => (
              <div key={item.id} className="space-y-2 border border-luxury-gold/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/50">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        className="accent-luxury-gold"
                        onChange={(e) => {
                          const categories = [...page.menu.categories];
                          const items = [...category.items];
                          items[ii] = { ...item, enabled: e.target.checked };
                          categories[ci] = { ...category, items };
                          setPage({ ...page, menu: { ...page.menu, categories } });
                        }}
                      />
                      Enabled
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={item.chefRecommended}
                        className="accent-luxury-gold"
                        onChange={(e) => {
                          const categories = [...page.menu.categories];
                          const items = [...category.items];
                          items[ii] = { ...item, chefRecommended: e.target.checked };
                          categories[ci] = { ...category, items };
                          setPage({ ...page, menu: { ...page.menu, categories } });
                        }}
                      />
                      Chef Recommended
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => {
                        const categories = [...page.menu.categories];
                        categories[ci] = {
                          ...category,
                          items: category.items.filter((_, idx) => idx !== ii),
                        };
                        setPage({ ...page, menu: { ...page.menu, categories } });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <AdminInput
                  label="Title"
                  value={item.title}
                  onChange={(e) => {
                    const categories = [...page.menu.categories];
                    const items = [...category.items];
                    items[ii] = { ...item, title: e.target.value };
                    categories[ci] = { ...category, items };
                    setPage({ ...page, menu: { ...page.menu, categories } });
                  }}
                />
                <AdminTextarea
                  label="Description"
                  rows={2}
                  value={item.description}
                  onChange={(e) => {
                    const categories = [...page.menu.categories];
                    const items = [...category.items];
                    items[ii] = { ...item, description: e.target.value };
                    categories[ci] = { ...category, items };
                    setPage({ ...page, menu: { ...page.menu, categories } });
                  }}
                />
                <AdminInput
                  label="Price"
                  value={item.price}
                  onChange={(e) => {
                    const categories = [...page.menu.categories];
                    const items = [...category.items];
                    items[ii] = { ...item, price: e.target.value };
                    categories[ci] = { ...category, items };
                    setPage({ ...page, menu: { ...page.menu, categories } });
                  }}
                />
                <ImagePicker
                  label="Item Image"
                  folder="dining"
                  category="Dining"
                  value={item.imageSrc}
                  library={content.mediaLibrary}
                  onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  onChange={(url) => {
                    const categories = [...page.menu.categories];
                    const items = [...category.items];
                    items[ii] = { ...item, imageSrc: url };
                    categories[ci] = { ...category, items };
                    setPage({ ...page, menu: { ...page.menu, categories } });
                  }}
                />
                <AdminInput
                  label="Image Alt"
                  value={item.imageAlt}
                  onChange={(e) => {
                    const categories = [...page.menu.categories];
                    const items = [...category.items];
                    items[ii] = { ...item, imageAlt: e.target.value };
                    categories[ci] = { ...category, items };
                    setPage({ ...page, menu: { ...page.menu, categories } });
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Chef Recommendation */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Chef Recommendation</p>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={page.chefRecommendation.enabled !== false}
              className="accent-luxury-gold"
              onChange={(e) =>
                setPage({
                  ...page,
                  chefRecommendation: {
                    ...page.chefRecommendation,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Section Enabled
          </label>
        </div>
        <AdminInput
          label="Eyebrow"
          value={page.chefRecommendation.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              chefRecommendation: {
                ...page.chefRecommendation,
                eyebrow: e.target.value,
              },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.chefRecommendation.title}
          onChange={(e) =>
            setPage({
              ...page,
              chefRecommendation: {
                ...page.chefRecommendation,
                title: e.target.value,
              },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.chefRecommendation.description}
          onChange={(e) =>
            setPage({
              ...page,
              chefRecommendation: {
                ...page.chefRecommendation,
                description: e.target.value,
              },
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
              chefRecommendation: {
                ...page.chefRecommendation,
                dishes: [
                  ...page.chefRecommendation.dishes,
                  {
                    id: `dish-${Date.now()}`,
                    enabled: true,
                    order: page.chefRecommendation.dishes.length,
                    title: "New Dish",
                    description: "",
                    price: "",
                    imageSrc: "",
                    imageAlt: "",
                  },
                ],
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Dish
        </Button>
        {page.chefRecommendation.dishes.map((dish, i) => (
          <div key={dish.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{dish.title}</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={dish.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const dishes = [...page.chefRecommendation.dishes];
                      dishes[i] = { ...dish, enabled: e.target.checked };
                      setPage({
                        ...page,
                        chefRecommendation: { ...page.chefRecommendation, dishes },
                      });
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
                      chefRecommendation: {
                        ...page.chefRecommendation,
                        dishes: page.chefRecommendation.dishes.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AdminInput
              label="Title"
              value={dish.title}
              onChange={(e) => {
                const dishes = [...page.chefRecommendation.dishes];
                dishes[i] = { ...dish, title: e.target.value };
                setPage({
                  ...page,
                  chefRecommendation: { ...page.chefRecommendation, dishes },
                });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={2}
              value={dish.description}
              onChange={(e) => {
                const dishes = [...page.chefRecommendation.dishes];
                dishes[i] = { ...dish, description: e.target.value };
                setPage({
                  ...page,
                  chefRecommendation: { ...page.chefRecommendation, dishes },
                });
              }}
            />
            <AdminInput
              label="Price"
              value={dish.price}
              onChange={(e) => {
                const dishes = [...page.chefRecommendation.dishes];
                dishes[i] = { ...dish, price: e.target.value };
                setPage({
                  ...page,
                  chefRecommendation: { ...page.chefRecommendation, dishes },
                });
              }}
            />
            <ImagePicker
              label="Dish Image"
              folder="dining"
              category="Dining"
              value={dish.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const dishes = [...page.chefRecommendation.dishes];
                dishes[i] = { ...dish, imageSrc: url };
                setPage({
                  ...page,
                  chefRecommendation: { ...page.chefRecommendation, dishes },
                });
              }}
            />
            <AdminInput
              label="Image Alt"
              value={dish.imageAlt}
              onChange={(e) => {
                const dishes = [...page.chefRecommendation.dishes];
                dishes[i] = { ...dish, imageAlt: e.target.value };
                setPage({
                  ...page,
                  chefRecommendation: { ...page.chefRecommendation, dishes },
                });
              }}
            />
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Reservation Form</p>
        <AdminInput
          label="Form Title"
          value={page.form.title}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Form Description"
          rows={2}
          value={page.form.description}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, description: e.target.value } })
          }
        />
        <AdminInput
          label="Submit Label"
          value={page.form.submitLabel}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, submitLabel: e.target.value } })
          }
        />
        <AdminInput
          label="Success Title"
          value={page.form.successTitle}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, successTitle: e.target.value } })
          }
        />
        <AdminTextarea
          label="Success Message"
          rows={2}
          value={page.form.successMessage}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, successMessage: e.target.value } })
          }
        />
        <AdminTextarea
          label="Success Secondary"
          rows={2}
          value={page.form.successSecondary}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, successSecondary: e.target.value } })
          }
        />
        <AdminTextarea
          label="Restaurant Options (one per line)"
          rows={4}
          value={page.form.restaurantOptions.join("\n")}
          onChange={(e) =>
            setPage({
              ...page,
              form: { ...page.form, restaurantOptions: splitLines(e.target.value) },
            })
          }
        />
        <AdminTextarea
          label="Occasion Options (one per line)"
          rows={4}
          value={page.form.occasionOptions.join("\n")}
          onChange={(e) =>
            setPage({
              ...page,
              form: { ...page.form, occasionOptions: splitLines(e.target.value) },
            })
          }
        />
        <AdminTextarea
          label="Consent Label"
          rows={2}
          value={page.form.consentLabel}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, consentLabel: e.target.value } })
          }
        />
      </div>

      {/* Gallery Section */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Gallery Section</p>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Gallery Items</p>
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
                    id: `g-${Date.now()}`,
                    src: "",
                    title: "New Image",
                    alt: "",
                    enabled: true,
                    order: page.gallery.length,
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        </div>
        {page.gallery.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{item.title}</p>
              <div className="flex items-center gap-2">
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
            </div>
            <ImagePicker
              label="Gallery Image"
              folder="dining"
              category="Dining"
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
              label="Alt Text"
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

      {/* Reviews */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Reviews Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.reviews.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              reviews: { ...page.reviews, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.reviews.title}
          onChange={(e) =>
            setPage({
              ...page,
              reviews: { ...page.reviews, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.reviews.description}
          onChange={(e) =>
            setPage({
              ...page,
              reviews: { ...page.reviews, description: e.target.value },
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
              reviews: {
                ...page.reviews,
                items: [
                  ...page.reviews.items,
                  {
                    id: `rev-${Date.now()}`,
                    enabled: true,
                    order: page.reviews.items.length,
                    name: "Guest Name",
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
          <Plus className="h-4 w-4" /> Add Review
        </Button>
        {page.reviews.items.map((review, i) => (
          <div key={review.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{review.name}</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={review.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const items = [...page.reviews.items];
                      items[i] = { ...review, enabled: e.target.checked };
                      setPage({ ...page, reviews: { ...page.reviews, items } });
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
                      reviews: {
                        ...page.reviews,
                        items: page.reviews.items.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Name"
                value={review.name}
                onChange={(e) => {
                  const items = [...page.reviews.items];
                  items[i] = { ...review, name: e.target.value };
                  setPage({ ...page, reviews: { ...page.reviews, items } });
                }}
              />
              <AdminInput
                label="Country"
                value={review.country}
                onChange={(e) => {
                  const items = [...page.reviews.items];
                  items[i] = { ...review, country: e.target.value };
                  setPage({ ...page, reviews: { ...page.reviews, items } });
                }}
              />
            </div>
            <AdminInput
              label="Rating (1–5)"
              type="number"
              min={1}
              max={5}
              value={review.rating}
              onChange={(e) => {
                const items = [...page.reviews.items];
                items[i] = { ...review, rating: Number(e.target.value) };
                setPage({ ...page, reviews: { ...page.reviews, items } });
              }}
            />
            <AdminTextarea
              label="Review"
              rows={3}
              value={review.review}
              onChange={(e) => {
                const items = [...page.reviews.items];
                items[i] = { ...review, review: e.target.value };
                setPage({ ...page, reviews: { ...page.reviews, items } });
              }}
            />
            <ImagePicker
              label="Guest Photo"
              folder="dining"
              category="Dining"
              value={review.photoSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.reviews.items];
                items[i] = { ...review, photoSrc: url };
                setPage({ ...page, reviews: { ...page.reviews, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">FAQ Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.faq.eyebrow}
          onChange={(e) =>
            setPage({ ...page, faq: { ...page.faq, eyebrow: e.target.value } })
          }
        />
        <AdminInput
          label="Title"
          value={page.faq.title}
          onChange={(e) =>
            setPage({ ...page, faq: { ...page.faq, title: e.target.value } })
          }
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
        <p className="font-display text-lg text-luxury-gold">CTA Section</p>
        <AdminInput
          label="Title"
          value={page.cta.title}
          onChange={(e) =>
            setPage({ ...page, cta: { ...page.cta, title: e.target.value } })
          }
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
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, buttonHref: e.target.value } })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Secondary Text"
            value={page.cta.secondaryText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Link"
            value={page.cta.secondaryHref}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryHref: e.target.value } })
            }
          />
        </div>
        <ImagePicker
          label="Background Image"
          folder="dining"
          category="Dining"
          value={page.cta.backgroundImage}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) =>
            setPage({ ...page, cta: { ...page.cta, backgroundImage: url } })
          }
        />
      </div>
    </div>
  );
}
