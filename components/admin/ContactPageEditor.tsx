"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";

interface ContactPageEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

export function ContactPageEditor({ content, update }: ContactPageEditorProps) {
  const page = content.contactPage;

  const setPage = (next: SiteContent["contactPage"]) => update("contactPage", next);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Contact Page Management — hero cover, cards, form, map, FAQ, CTA, SEO. Changes auto-save.
      </p>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Hero Cover</p>
        <ImagePicker
          label="Hero Cover Image"
          folder="contact"
          category="General"
          value={page.hero.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, hero: { ...page.hero, imageSrc: url } })}
        />
        <AdminInput
          label="Title (CONTACT US)"
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

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Primary Contact Details</p>
        <AdminInput
          label="Phone"
          value={page.phone}
          onChange={(e) => setPage({ ...page, phone: e.target.value })}
        />
        <AdminInput
          label="Email"
          value={page.email}
          onChange={(e) => setPage({ ...page, email: e.target.value })}
        />
        <AdminInput
          label="WhatsApp (digits for wa.me)"
          value={page.whatsapp}
          onChange={(e) => setPage({ ...page, whatsapp: e.target.value })}
        />
        <AdminInput
          label="Address"
          value={page.address}
          onChange={(e) => setPage({ ...page, address: e.target.value })}
        />
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Contact Cards</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                cards: [
                  ...page.cards,
                  {
                    id: `c-${Date.now()}`,
                    enabled: true,
                    order: page.cards.length + 1,
                    icon: "phone",
                    title: "New Card",
                    value: "",
                    description: "",
                    href: "",
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Card
          </Button>
        </div>
        {page.cards.map((card, i) => (
          <div key={card.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={card.enabled !== false}
                  className="accent-luxury-gold"
                  onChange={(e) => {
                    const cards = [...page.cards];
                    cards[i] = { ...card, enabled: e.target.checked };
                    setPage({ ...page, cards });
                  }}
                />
                Visible
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({ ...page, cards: page.cards.filter((_, idx) => idx !== i) })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <AdminInput
                label="Title"
                value={card.title}
                onChange={(e) => {
                  const cards = [...page.cards];
                  cards[i] = { ...card, title: e.target.value };
                  setPage({ ...page, cards });
                }}
              />
              <AdminInput
                label="Icon (map-pin|phone|mail|clock|message-circle)"
                value={card.icon}
                onChange={(e) => {
                  const cards = [...page.cards];
                  cards[i] = { ...card, icon: e.target.value };
                  setPage({ ...page, cards });
                }}
              />
              <AdminInput
                label="Value"
                value={card.value}
                onChange={(e) => {
                  const cards = [...page.cards];
                  cards[i] = { ...card, value: e.target.value };
                  setPage({ ...page, cards });
                }}
              />
              <AdminInput
                label="Link (tel: mailto: wa.me)"
                value={card.href}
                onChange={(e) => {
                  const cards = [...page.cards];
                  cards[i] = { ...card, href: e.target.value };
                  setPage({ ...page, cards });
                }}
              />
            </div>
            <AdminTextarea
              label="Description"
              rows={2}
              value={card.description}
              onChange={(e) => {
                const cards = [...page.cards];
                cards[i] = { ...card, description: e.target.value };
                setPage({ ...page, cards });
              }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Enquiry Form</p>
        <AdminInput
          label="Form Title"
          value={page.form.title}
          onChange={(e) => setPage({ ...page, form: { ...page.form, title: e.target.value } })}
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
          label="Submit Button"
          value={page.form.submitLabel}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, submitLabel: e.target.value } })
          }
        />
        <AdminTextarea
          label="Booking Types (one per line)"
          rows={8}
          value={page.form.bookingTypes.join("\n")}
          onChange={(e) =>
            setPage({
              ...page,
              form: {
                ...page.form,
                bookingTypes: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        <AdminTextarea
          label="Consent Text"
          rows={2}
          value={page.form.consentText}
          onChange={(e) =>
            setPage({ ...page, form: { ...page.form, consentText: e.target.value } })
          }
        />
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Location & Map</p>
        <AdminInput
          label="Section Title"
          value={page.location.title}
          onChange={(e) =>
            setPage({ ...page, location: { ...page.location, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Google Map Embed URL"
          rows={2}
          value={page.location.mapEmbedUrl}
          onChange={(e) => {
            const mapEmbedUrl = e.target.value;
            setPage({ ...page, location: { ...page.location, mapEmbedUrl } });
            update("contact", { ...content.contact, mapEmbedUrl });
          }}
        />
        <AdminInput
          label="Directions URL"
          value={page.location.mapsDirectionsUrl}
          onChange={(e) =>
            setPage({
              ...page,
              location: { ...page.location, mapsDirectionsUrl: e.target.value },
            })
          }
        />
        {page.location.nearby.map((place, i) => (
          <div key={place.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <AdminInput
              label="Attraction"
              value={place.title}
              onChange={(e) => {
                const nearby = [...page.location.nearby];
                nearby[i] = { ...place, title: e.target.value };
                setPage({ ...page, location: { ...page.location, nearby } });
              }}
            />
            <AdminInput
              label="Distance"
              value={place.distance}
              onChange={(e) => {
                const nearby = [...page.location.nearby];
                nearby[i] = { ...place, distance: e.target.value };
                setPage({ ...page, location: { ...page.location, nearby } });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-6 text-red-400"
              onClick={() =>
                setPage({
                  ...page,
                  location: {
                    ...page.location,
                    nearby: page.location.nearby.filter((_, idx) => idx !== i),
                  },
                })
              }
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
          onClick={() =>
            setPage({
              ...page,
              location: {
                ...page.location,
                nearby: [
                  ...page.location.nearby,
                  { id: `n-${Date.now()}`, title: "New place", distance: "" },
                ],
              },
            })
          }
        >
          <Plus className="h-4 w-4" /> Add Nearby
        </Button>
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Business Information</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-white/50">Left Column</p>
            {page.business.left.map((row, i) => (
              <div key={`l-${i}`} className="grid grid-cols-2 gap-2">
                <AdminInput
                  label="Label"
                  value={row.label}
                  onChange={(e) => {
                    const left = [...page.business.left];
                    left[i] = { ...row, label: e.target.value };
                    setPage({ ...page, business: { ...page.business, left } });
                  }}
                />
                <AdminInput
                  label="Value"
                  value={row.value}
                  onChange={(e) => {
                    const left = [...page.business.left];
                    left[i] = { ...row, value: e.target.value };
                    setPage({ ...page, business: { ...page.business, left } });
                  }}
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/50">Right Column</p>
            {page.business.right.map((row, i) => (
              <div key={`r-${i}`} className="grid grid-cols-2 gap-2">
                <AdminInput
                  label="Label"
                  value={row.label}
                  onChange={(e) => {
                    const right = [...page.business.right];
                    right[i] = { ...row, label: e.target.value };
                    setPage({ ...page, business: { ...page.business, right } });
                  }}
                />
                <AdminInput
                  label="Value"
                  value={row.value}
                  onChange={(e) => {
                    const right = [...page.business.right];
                    right[i] = { ...row, value: e.target.value };
                    setPage({ ...page, business: { ...page.business, right } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">FAQ</p>
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
                      id: `f-${Date.now()}`,
                      enabled: true,
                      order: page.faq.items.length + 1,
                      question: "New question?",
                      answer: "",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>
        {page.faq.items.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
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
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Final CTA</p>
        <AdminInput
          label="Heading"
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
            label="Primary Button Text"
            value={page.cta.primaryText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, primaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Primary Button Link"
            value={page.cta.primaryHref}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, primaryHref: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Button Text"
            value={page.cta.secondaryText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Button Link"
            value={page.cta.secondaryHref}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, secondaryHref: e.target.value } })
            }
          />
        </div>
        <ImagePicker
          label="CTA Background Image"
          folder="contact"
          category="General"
          value={page.cta.backgroundImage}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, cta: { ...page.cta, backgroundImage: url } })}
        />
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Why Contact Us Cards</p>
        {page.whyContact.items.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <AdminInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const items = [...page.whyContact.items];
                items[i] = { ...item, title: e.target.value };
                setPage({ ...page, whyContact: { ...page.whyContact, items } });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={2}
              value={item.description}
              onChange={(e) => {
                const items = [...page.whyContact.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, whyContact: { ...page.whyContact, items } });
              }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">SEO</p>
        <AdminInput
          label="SEO Title"
          value={page.seo.title}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
        />
        <AdminTextarea
          label="SEO Description"
          rows={3}
          value={page.seo.description}
          onChange={(e) =>
            setPage({ ...page, seo: { ...page.seo, description: e.target.value } })
          }
        />
        <AdminTextarea
          label="Keywords"
          rows={2}
          value={page.seo.keywords}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, keywords: e.target.value } })}
        />
        <AdminInput
          label="Canonical"
          value={page.seo.canonical || ""}
          onChange={(e) => setPage({ ...page, seo: { ...page.seo, canonical: e.target.value } })}
        />
        <ImagePicker
          label="OG Image"
          folder="seo"
          category="General"
          value={page.seo.ogImage || ""}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, seo: { ...page.seo, ogImage: url } })}
        />
      </div>
    </div>
  );
}
