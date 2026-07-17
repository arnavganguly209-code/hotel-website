"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

interface SpaPageEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

const SPA_BOOKING_URL = "https://hotelthamelparkspa.com/";

function joinComma(values: string[]): string {
  return values.join(", ");
}

function splitComma(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SpaPageEditor({ content, update }: SpaPageEditorProps) {
  const page = content.spaPage;
  const setPage = (next: SiteContent["spaPage"]) => update("spaPage", next);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Spa Page Management — hero, introduction, treatments, experiences, packages, gallery,
        why choose, testimonials, booking, FAQ, CTA, SEO. Changes auto-save.
      </p>
      <p className="rounded border border-luxury-gold/20 bg-luxury-gold/5 px-4 py-3 text-sm text-luxury-gold/90">
        All spa booking CTAs should point to{" "}
        <span className="font-medium text-luxury-gold">{SPA_BOOKING_URL}</span>
      </p>

      {/* Hero */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Hero Cover</p>
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

      {/* Treatments */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Treatments Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.treatments.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              treatments: { ...page.treatments, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.treatments.title}
          onChange={(e) =>
            setPage({
              ...page,
              treatments: { ...page.treatments, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.treatments.description}
          onChange={(e) =>
            setPage({
              ...page,
              treatments: { ...page.treatments, description: e.target.value },
            })
          }
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Treatment Items</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                treatments: {
                  ...page.treatments,
                  items: [
                    ...page.treatments.items,
                    {
                      id: `treatment-${Date.now()}`,
                      enabled: true,
                      order: page.treatments.items.length,
                      name: "New Treatment",
                      description: "",
                      icon: "Sparkles",
                      imageSrc: "",
                      imageAlt: "",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Treatment
          </Button>
        </div>
        {page.treatments.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{item.name}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={item.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const items = [...page.treatments.items];
                      items[i] = { ...item, enabled: e.target.checked };
                      setPage({ ...page, treatments: { ...page.treatments, items } });
                    }}
                  />
                  Enabled
                </label>
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.treatments.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, treatments: { ...page.treatments, items } });
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
                      treatments: {
                        ...page.treatments,
                        items: page.treatments.items.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AdminInput
              label="Name"
              value={item.name}
              onChange={(e) => {
                const items = [...page.treatments.items];
                items[i] = { ...item, name: e.target.value };
                setPage({ ...page, treatments: { ...page.treatments, items } });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={3}
              value={item.description}
              onChange={(e) => {
                const items = [...page.treatments.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, treatments: { ...page.treatments, items } });
              }}
            />
            <AdminInput
              label="Icon (Lucide name)"
              value={item.icon}
              onChange={(e) => {
                const items = [...page.treatments.items];
                items[i] = { ...item, icon: e.target.value };
                setPage({ ...page, treatments: { ...page.treatments, items } });
              }}
            />
            <ImagePicker
              label="Treatment Image"
              folder="spa"
              category="Spa"
              value={item.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.treatments.items];
                items[i] = { ...item, imageSrc: url };
                setPage({ ...page, treatments: { ...page.treatments, items } });
              }}
            />
            <AdminInput
              label="Image Alt"
              value={item.imageAlt}
              onChange={(e) => {
                const items = [...page.treatments.items];
                items[i] = { ...item, imageAlt: e.target.value };
                setPage({ ...page, treatments: { ...page.treatments, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Experiences */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Experiences Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.experiences.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              experiences: { ...page.experiences, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.experiences.title}
          onChange={(e) =>
            setPage({
              ...page,
              experiences: { ...page.experiences, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.experiences.description}
          onChange={(e) =>
            setPage({
              ...page,
              experiences: { ...page.experiences, description: e.target.value },
            })
          }
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Experience Items</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                experiences: {
                  ...page.experiences,
                  items: [
                    ...page.experiences.items,
                    {
                      id: `experience-${Date.now()}`,
                      enabled: true,
                      order: page.experiences.items.length,
                      title: "New Experience",
                      description: "",
                      imageSrc: "",
                      imageAlt: "",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        </div>
        {page.experiences.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{item.title}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={item.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const items = [...page.experiences.items];
                      items[i] = { ...item, enabled: e.target.checked };
                      setPage({ ...page, experiences: { ...page.experiences, items } });
                    }}
                  />
                  Enabled
                </label>
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.experiences.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, experiences: { ...page.experiences, items } });
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
                      experiences: {
                        ...page.experiences,
                        items: page.experiences.items.filter((_, idx) => idx !== i),
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
              value={item.title}
              onChange={(e) => {
                const items = [...page.experiences.items];
                items[i] = { ...item, title: e.target.value };
                setPage({ ...page, experiences: { ...page.experiences, items } });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={3}
              value={item.description}
              onChange={(e) => {
                const items = [...page.experiences.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, experiences: { ...page.experiences, items } });
              }}
            />
            <ImagePicker
              label="Experience Image"
              folder="spa"
              category="Spa"
              value={item.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.experiences.items];
                items[i] = { ...item, imageSrc: url };
                setPage({ ...page, experiences: { ...page.experiences, items } });
              }}
            />
            <AdminInput
              label="Image Alt"
              value={item.imageAlt}
              onChange={(e) => {
                const items = [...page.experiences.items];
                items[i] = { ...item, imageAlt: e.target.value };
                setPage({ ...page, experiences: { ...page.experiences, items } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Packages */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Packages Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.packages.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              packages: { ...page.packages, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.packages.title}
          onChange={(e) =>
            setPage({
              ...page,
              packages: { ...page.packages, title: e.target.value },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={2}
          value={page.packages.description}
          onChange={(e) =>
            setPage({
              ...page,
              packages: { ...page.packages, description: e.target.value },
            })
          }
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Package Items</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                packages: {
                  ...page.packages,
                  items: [
                    ...page.packages.items,
                    {
                      id: `package-${Date.now()}`,
                      enabled: true,
                      order: page.packages.items.length,
                      name: "New Package",
                      duration: "",
                      price: "",
                      description: "",
                      benefits: [],
                      imageSrc: "",
                      imageAlt: "",
                      ctaText: "Book Now",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Package
          </Button>
        </div>
        {page.packages.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{item.name}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={item.enabled !== false}
                    className="accent-luxury-gold"
                    onChange={(e) => {
                      const items = [...page.packages.items];
                      items[i] = { ...item, enabled: e.target.checked };
                      setPage({ ...page, packages: { ...page.packages, items } });
                    }}
                  />
                  Enabled
                </label>
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.packages.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, packages: { ...page.packages, items } });
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
                      packages: {
                        ...page.packages,
                        items: page.packages.items.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AdminInput
              label="Name"
              value={item.name}
              onChange={(e) => {
                const items = [...page.packages.items];
                items[i] = { ...item, name: e.target.value };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput
                label="Duration"
                value={item.duration}
                onChange={(e) => {
                  const items = [...page.packages.items];
                  items[i] = { ...item, duration: e.target.value };
                  setPage({ ...page, packages: { ...page.packages, items } });
                }}
              />
              <AdminInput
                label="Price"
                value={item.price}
                onChange={(e) => {
                  const items = [...page.packages.items];
                  items[i] = { ...item, price: e.target.value };
                  setPage({ ...page, packages: { ...page.packages, items } });
                }}
              />
            </div>
            <AdminTextarea
              label="Description"
              rows={3}
              value={item.description}
              onChange={(e) => {
                const items = [...page.packages.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
            <AdminTextarea
              label="Benefits (comma-separated)"
              rows={2}
              value={joinComma(item.benefits)}
              onChange={(e) => {
                const items = [...page.packages.items];
                items[i] = { ...item, benefits: splitComma(e.target.value) };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
            <ImagePicker
              label="Package Image"
              folder="spa"
              category="Spa"
              value={item.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.packages.items];
                items[i] = { ...item, imageSrc: url };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
            <AdminInput
              label="Image Alt"
              value={item.imageAlt}
              onChange={(e) => {
                const items = [...page.packages.items];
                items[i] = { ...item, imageAlt: e.target.value };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
            <AdminInput
              label="CTA Text"
              value={item.ctaText}
              onChange={(e) => {
                const items = [...page.packages.items];
                items[i] = { ...item, ctaText: e.target.value };
                setPage({ ...page, packages: { ...page.packages, items } });
              }}
            />
          </div>
        ))}
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
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const gallery = [...page.gallery];
                    gallery[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, gallery });
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

      {/* Why Choose */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Why Choose Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.whyChoose.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              whyChoose: { ...page.whyChoose, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.whyChoose.title}
          onChange={(e) =>
            setPage({
              ...page,
              whyChoose: { ...page.whyChoose, title: e.target.value },
            })
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Why Choose Items</p>
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
                      id: `why-${Date.now()}`,
                      enabled: true,
                      order: page.whyChoose.items.length,
                      title: "New Reason",
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
        </div>
        {page.whyChoose.items.map((item, i) => (
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
                      const items = [...page.whyChoose.items];
                      items[i] = { ...item, enabled: e.target.checked };
                      setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
                    }}
                  />
                  Enabled
                </label>
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.whyChoose.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, whyChoose: { ...page.whyChoose, items } });
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
        <p className="font-display text-lg text-luxury-gold">Testimonials Section</p>
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
                    id: `testimonial-${Date.now()}`,
                    enabled: true,
                    order: page.testimonials.items.length,
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
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
        {page.testimonials.items.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-luxury-gold">{item.name}</p>
              <div className="flex items-center gap-2">
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
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.testimonials.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, testimonials: { ...page.testimonials, items } });
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
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
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
        <p className="font-display text-lg text-luxury-gold">Booking Section</p>
        <AdminInput
          label="Eyebrow"
          value={page.booking.eyebrow}
          onChange={(e) =>
            setPage({
              ...page,
              booking: { ...page.booking, eyebrow: e.target.value },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.booking.title}
          onChange={(e) =>
            setPage({
              ...page,
              booking: { ...page.booking, title: e.target.value },
            })
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
            label="Button Text"
            value={page.booking.buttonText}
            onChange={(e) =>
              setPage({
                ...page,
                booking: { ...page.booking, buttonText: e.target.value },
              })
            }
          />
          <AdminInput
            label="Button Link"
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
            label="Secondary Text"
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
              <div className="flex items-center gap-2">
                <AdminInput
                  label="Order"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const items = [...page.faq.items];
                    items[i] = { ...item, order: Number(e.target.value) };
                    setPage({ ...page, faq: { ...page.faq, items } });
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
            placeholder={SPA_BOOKING_URL}
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
    </div>
  );
}
