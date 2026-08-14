"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { RestaurantGalleryEditor } from "@/components/admin/RestaurantGalleryEditor";
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

export function ChefRecommendationEditor({ content, update }: DiningPageEditorProps) {
  const page = content.diningPage;
  const setPage = (next: SiteContent["diningPage"]) => update("diningPage", next);
  const chef = page.chefRecommendation;
  const dishes = chef.dishes || [];
  const portraits = chef.portraits || [];

  const setChef = (next: SiteContent["diningPage"]["chefRecommendation"]) =>
    setPage({ ...page, chefRecommendation: next });

  const patchDish = (index: number, patch: Partial<(typeof dishes)[number]>) => {
    const next = [...dishes];
    const merged = { ...next[index], ...patch };
    const hasContent = Boolean(merged.title?.trim() || merged.imageSrc?.trim());
    next[index] = {
      ...merged,
      enabled: patch.enabled !== undefined ? patch.enabled : hasContent || merged.enabled !== false,
    };
    setChef({ ...chef, dishes: next });
  };

  const moveDish = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= dishes.length) return;
    const next = [...dishes];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    setChef({
      ...chef,
      dishes: next.map((dish, order) => ({ ...dish, order })),
    });
  };

  return (
    <div className="space-y-4 border border-luxury-gold/20 bg-luxury-gold/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg text-luxury-gold">From the Kitchen — Chef’s Recommendation</p>
          <p className="mt-1 text-xs text-white/50">
            This is the overlapping image + text block on /dining. Upload a photo, write the name and
            description. Layout alternates left / right. Price is not shown on the public page. Fill up
            to 8 dishes — every dish with a name or photo appears on the website.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={chef.enabled !== false}
            className="accent-luxury-gold"
            onChange={(e) => setChef({ ...chef, enabled: e.target.checked })}
          />
          Section Enabled
        </label>
      </div>
      <AdminInput
        label="Small label (eyebrow)"
        value={chef.eyebrow}
        onChange={(e) => setChef({ ...chef, eyebrow: e.target.value })}
      />
      <AdminInput
        label="Title"
        value={chef.title}
        onChange={(e) => setChef({ ...chef, title: e.target.value })}
      />
      <AdminTextarea
        label="Description"
        rows={2}
        value={chef.description}
        onChange={(e) => setChef({ ...chef, description: e.target.value })}
      />

      <p className="pt-2 text-xs text-white/45">
        Optional 9:16 chef portraits sit above the dishes. Leave empty to hide.
      </p>
      {portraits.map((portrait, i) => (
        <div key={portrait.id} className="space-y-2 border border-luxury-gold/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-luxury-gold">Chef portrait {i + 1} (9:16)</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={portrait.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const next = [...portraits];
                    next[i] = { ...portrait, enabled: e.target.checked };
                    setChef({ ...chef, portraits: next });
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
                  setChef({
                    ...chef,
                    portraits: portraits.filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ImagePicker
            label="Portrait Image — kitchen / fire cooking, 9:16"
            folder="dining"
            category="Dining"
            value={portrait.imageSrc}
            library={content.mediaLibrary}
            onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
            enableCrop
            onChange={(url) => {
              const next = [...portraits];
              next[i] = { ...portrait, imageSrc: url };
              setChef({ ...chef, portraits: next });
            }}
          />
          <AdminInput
            label="Alt text"
            value={portrait.imageAlt}
            onChange={(e) => {
              const next = [...portraits];
              next[i] = { ...portrait, imageAlt: e.target.value };
              setChef({ ...chef, portraits: next });
            }}
          />
          <AdminInput
            label="Caption (optional)"
            value={portrait.caption}
            onChange={(e) => {
              const next = [...portraits];
              next[i] = { ...portrait, caption: e.target.value };
              setChef({ ...chef, portraits: next });
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-luxury-gold/30 text-luxury-gold"
        onClick={() =>
          setChef({
            ...chef,
            portraits: [
              ...portraits,
              {
                id: `chef-p${Date.now()}`,
                enabled: true,
                order: portraits.length,
                imageSrc: "",
                imageAlt: "Chef in the kitchen",
                caption: "",
              },
            ],
          })
        }
      >
        <Plus className="h-4 w-4" /> Add Chef Portrait
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <p className="text-sm text-white/70">
          Dishes ({dishes.filter((d) => d.title?.trim() || d.imageSrc?.trim()).length} filled / {dishes.length} slots) — image, name, and text. All filled dishes show left / right on /dining.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setChef({
              ...chef,
              dishes: [
                ...dishes,
                {
                  id: `dish-${Date.now()}`,
                  enabled: true,
                  order: dishes.length,
                  title: "New Signature Dish",
                  description: "",
                  price: "",
                  imageSrc: "",
                  imageAlt: "",
                },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Dish
        </Button>
      </div>
      {dishes.map((dish, i) => (
        <div key={dish.id} className="space-y-3 border border-luxury-gold/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-luxury-gold">
              Dish {i + 1}
              {dish.title ? ` — ${dish.title}` : ""}
              <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-white/40">
                {i % 2 === 0 ? "Image left · text right" : "Text left · image right"}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <label className="mr-2 flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={dish.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => patchDish(i, { enabled: e.target.checked })}
                />
                Show on /dining
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/60"
                disabled={i === 0}
                onClick={() => moveDish(i, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/60"
                disabled={i === dishes.length - 1}
                onClick={() => moveDish(i, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setChef({
                    ...chef,
                    dishes: dishes.filter((_, idx) => idx !== i).map((item, order) => ({ ...item, order })),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ImagePicker
            label="Menu / dish image — upload or replace"
            folder="dining"
            category="Dining"
            value={dish.imageSrc}
            library={content.mediaLibrary}
            onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
            enableCrop
            onChange={(url) => patchDish(i, { imageSrc: url, imageAlt: dish.imageAlt || dish.title })}
          />
          <AdminInput
            label="Name"
            value={dish.title}
            onChange={(e) => patchDish(i, { title: e.target.value })}
          />
          <AdminTextarea
            label="Description"
            rows={3}
            value={dish.description}
            onChange={(e) => patchDish(i, { description: e.target.value })}
          />
          <AdminInput
            label="Image alt text"
            value={dish.imageAlt}
            onChange={(e) => patchDish(i, { imageAlt: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

export function CulinaryMenuEditor({ content, update }: DiningPageEditorProps) {
  const page = content.diningPage;
  if (!page) return null;

  const setPage = (next: SiteContent["diningPage"]) => update("diningPage", next);
  const menu = page.menu ?? { eyebrow: "", title: "", description: "", categories: [] };
  const categories = Array.isArray(menu.categories) ? menu.categories : [];

  const setMenu = (next: SiteContent["diningPage"]["menu"]) =>
    setPage({ ...page, menu: next });

  const setCategories = (next: typeof categories) =>
    setMenu({ ...menu, categories: next });

  const patchItem = (
    categoryIndex: number,
    itemIndex: number,
    patch: Partial<(typeof categories)[number]["items"][number]>
  ) => {
    const next = categories.map((category, ci) => {
      if (ci !== categoryIndex) return category;
      const items = [...(category.items || [])];
      items[itemIndex] = { ...items[itemIndex], ...patch };
      return { ...category, items };
    });
    setCategories(next);
  };

  return (
    <div
      id="orbit-culinary"
      className="space-y-4 border border-luxury-gold/30 bg-luxury-gold/[0.04] p-6"
    >
      <div>
        <p className="font-display text-lg text-luxury-gold">
          Culinary — Signature Menu Highlights
        </p>
        <p className="mt-1 text-xs text-white/55">
          This is the Breakfast / Lunch / Dinner card grid on /dining. Every photo, name, description,
          and price below is editable. Add more images with Add Image / Dish.
        </p>
      </div>
      <AdminInput
        label="Small label (eyebrow)"
        value={menu.eyebrow || ""}
        onChange={(e) => setMenu({ ...menu, eyebrow: e.target.value })}
      />
      <AdminInput
        label="Title"
        value={menu.title || ""}
        onChange={(e) => setMenu({ ...menu, title: e.target.value })}
      />
      <AdminTextarea
        label="Description"
        rows={2}
        value={menu.description || ""}
        onChange={(e) => setMenu({ ...menu, description: e.target.value })}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Meal tabs</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() =>
            setCategories([
              ...categories,
              {
                id: `cat-${Date.now()}`,
                name: "New Category",
                enabled: true,
                order: categories.length,
                items: [],
              },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>
      {categories.map((category, ci) => {
        const items = Array.isArray(category.items) ? category.items : [];
        return (
          <div key={category.id || `cat-${ci}`} className="space-y-3 border border-luxury-gold/15 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-base text-luxury-gold">
                {category.name || `Category ${ci + 1}`}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={category.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const next = [...categories];
                      next[ci] = { ...category, enabled: e.target.checked };
                      setCategories(next);
                    }}
                  />
                  Show tab
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-luxury-gold/30 text-luxury-gold"
                  onClick={() => {
                    const next = [...categories];
                    next[ci] = {
                      ...category,
                      items: [
                        ...items,
                        {
                          id: `item-${Date.now()}`,
                          enabled: true,
                          order: items.length,
                          title: "New Dish",
                          description: "",
                          price: "",
                          imageSrc: "",
                          imageAlt: "",
                          chefRecommended: false,
                        },
                      ],
                    };
                    setCategories(next);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add Image / Dish
                </Button>
              </div>
            </div>
            <AdminInput
              label="Tab name"
              value={category.name || ""}
              onChange={(e) => {
                const next = [...categories];
                next[ci] = { ...category, name: e.target.value };
                setCategories(next);
              }}
            />
            {items.length === 0 ? (
              <p className="text-xs text-white/45">
                No images in this tab yet. Click Add Image / Dish.
              </p>
            ) : null}
            {items.map((item, ii) => (
              <div
                key={item.id || `item-${ci}-${ii}`}
                className="space-y-3 border border-luxury-gold/10 bg-black/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-luxury-gold">
                    Image {ii + 1}
                    {item.title ? ` — ${item.title}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        className="accent-luxury-gold"
                        onChange={(e) => patchItem(ci, ii, { enabled: e.target.checked })}
                      />
                      Show on /dining
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={item.chefRecommended === true}
                        className="accent-luxury-gold"
                        onChange={(e) =>
                          patchItem(ci, ii, { chefRecommended: e.target.checked })
                        }
                      />
                      Chef’s Pick
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60"
                      disabled={ii === 0}
                      onClick={() => {
                        if (ii === 0) return;
                        const nextItems = [...items];
                        const current = nextItems[ii];
                        nextItems[ii] = nextItems[ii - 1];
                        nextItems[ii - 1] = current;
                        const next = [...categories];
                        next[ci] = {
                          ...category,
                          items: nextItems.map((entry, order) => ({ ...entry, order })),
                        };
                        setCategories(next);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-white/60"
                      disabled={ii === items.length - 1}
                      onClick={() => {
                        if (ii >= items.length - 1) return;
                        const nextItems = [...items];
                        const current = nextItems[ii];
                        nextItems[ii] = nextItems[ii + 1];
                        nextItems[ii + 1] = current;
                        const next = [...categories];
                        next[ci] = {
                          ...category,
                          items: nextItems.map((entry, order) => ({ ...entry, order })),
                        };
                        setCategories(next);
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => {
                        const next = [...categories];
                        next[ci] = {
                          ...category,
                          items: items.filter((_, idx) => idx !== ii),
                        };
                        setCategories(next);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ImagePicker
                  label="Photo — upload or replace"
                  folder="dining"
                  category="Dining"
                  value={item.imageSrc || ""}
                  library={content.mediaLibrary}
                  onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  enableCrop
                  onChange={(url) =>
                    patchItem(ci, ii, { imageSrc: url, imageAlt: item.imageAlt || item.title })
                  }
                />
                <AdminInput
                  label="Name / title"
                  value={item.title || ""}
                  onChange={(e) => patchItem(ci, ii, { title: e.target.value })}
                />
                <AdminTextarea
                  label="Description"
                  rows={3}
                  value={item.description || ""}
                  onChange={(e) => patchItem(ci, ii, { description: e.target.value })}
                />
                <AdminInput
                  label="Price"
                  value={item.price || ""}
                  onChange={(e) => patchItem(ci, ii, { price: e.target.value })}
                />
                <AdminInput
                  label="Image alt text"
                  value={item.imageAlt || ""}
                  onChange={(e) => patchItem(ci, ii, { imageAlt: e.target.value })}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function DiningPageEditor({ content, update }: DiningPageEditorProps) {
  const page = content.diningPage;
  const setPage = (next: SiteContent["diningPage"]) => update("diningPage", next);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Dining page (/dining) — Culinary Signature Menu Highlights is at the top (Breakfast / Lunch / Dinner
        photos, names, descriptions, prices). Then hero, welcome, venues, Chef’s Recommendation, gallery,
        reviews, FAQ, and the reserve form. Upload or replace any image. Changes auto-save.
      </p>

      <CulinaryMenuEditor content={content} update={update} />

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

      <ChefRecommendationEditor content={content} update={update} />

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

      <RestaurantGalleryEditor content={content} update={update} />

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
