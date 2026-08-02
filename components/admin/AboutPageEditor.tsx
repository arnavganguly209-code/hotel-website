"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { SafeImage } from "@/components/shared/SafeImage";
import { CMS_MEDIA_CLEARED, hasMediaSrc } from "@/lib/cms/media-url";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

interface AboutPageEditorProps {
  content: SiteContent;
  update: <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K] | ((prev: SiteContent[K]) => SiteContent[K])
  ) => void;
}

type CoverBlock = {
  eyebrow: string;
  title: string;
  content: string;
  imageSrc: string;
};

function CoverSectionEditor({
  heading,
  hint,
  block,
  invert,
  linkLabel,
  folder,
  category,
  library,
  onLibraryChange,
  onChange,
}: {
  heading: string;
  hint: string;
  block: CoverBlock;
  invert?: boolean;
  linkLabel: string;
  folder: string;
  category: string;
  library: SiteContent["mediaLibrary"];
  onLibraryChange: (library: SiteContent["mediaLibrary"]) => void;
  onChange: (next: CoverBlock) => void;
}) {
  const empty: CoverBlock = { eyebrow: "", title: "", content: "", imageSrc: "" };
  const value = block ?? empty;

  return (
    <div className="space-y-4 border border-luxury-gold/20 bg-white/[0.02] p-6">
      <div>
        <p className="font-display text-lg text-luxury-gold">{heading}</p>
        <p className="mt-1 text-xs text-white/45">{hint}</p>
      </div>

      {/* Website-style live preview (same layout as /about) */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-luxury-gold/15",
          invert ? "bg-[#FBF8F1]" : "bg-[#F7F4EF]"
        )}
      >
        <p className="border-b border-[#D4AF37]/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7340]">
          Live preview · matches /about
        </p>
        <div className="grid items-stretch gap-0 lg:grid-cols-2">
          <div className={cn("space-y-3 p-5 sm:p-6", invert && "lg:order-2")}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C9A227]">
              {value.eyebrow || "EYEBROW"}
            </p>
            <h3 className="font-display text-2xl font-light tracking-wide text-[#14352C] sm:text-3xl">
              {value.title || "Title"}
            </h3>
            <p className="font-body text-sm leading-relaxed text-[#5A635C]">
              {value.content || "Description appears here…"}
            </p>
            <div className="h-px w-14 bg-[#D4AF37]/45" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              {linkLabel} →
            </p>
          </div>
          <div className={cn("relative min-h-[200px] bg-[#e8e2d6]", invert && "lg:order-1")}>
            {hasMediaSrc(value.imageSrc) ? (
              <SafeImage
                key={value.imageSrc}
                src={value.imageSrc}
                alt={value.title || heading}
                fill
                fadeIn={false}
                objectFit="cover"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center px-4 text-center text-sm text-[#8a7340]">
                Image cleared — will not show on /about after save
              </div>
            )}
          </div>
        </div>
      </div>

      <ImagePicker
        label={`${heading} Image`}
        folder={folder}
        category={category}
        value={hasMediaSrc(value.imageSrc) ? value.imageSrc : ""}
        library={library}
        onLibraryChange={onLibraryChange}
        onChange={(url) =>
          onChange({
            ...value,
            // Explicit clear marker so merge/save never restore default stock art.
            imageSrc: url && url.trim() ? url : CMS_MEDIA_CLEARED,
          })
        }
        enableCrop
      />
      <AdminInput
        label="Eyebrow"
        value={value.eyebrow || ""}
        onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
      />
      <AdminInput
        label="Title"
        value={value.title || ""}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <AdminTextarea
        label="Description"
        rows={4}
        value={value.content || ""}
        onChange={(e) => onChange({ ...value, content: e.target.value })}
      />
    </div>
  );
}

export function AboutPageEditor({ content, update }: AboutPageEditorProps) {
  const page = content.aboutPage;
  /** Functional update so rapid Dining/Spa clears don't overwrite each other. */
  const setPage = (
    next:
      | SiteContent["aboutPage"]
      | ((prev: SiteContent["aboutPage"]) => SiteContent["aboutPage"])
  ) => update("aboutPage", next);
  const patchPage = (patch: Partial<SiteContent["aboutPage"]>) =>
    update("aboutPage", (prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        About Page — every cover image on the live page is editable here (Hero, Story, Dining, Spa,
        CTA). Dining & Spa sections include a large preview matching the public /about layout.
      </p>

      {/* Hero */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Hero Cover</p>
        <ImagePicker
          label="Hero Cover Image"
          folder="about"
          category="General"
          value={page.hero.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
        onChange={(url) =>
          setPage((prev) => ({
            ...prev,
            hero: {
              ...prev.hero,
              imageSrc: url && url.trim() ? url : CMS_MEDIA_CLEARED,
            },
          }))
        }
          enableCrop
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
          label="Overlay Opacity"
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

      {/* Story */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Our Story</p>
        <ImagePicker
          label="Story Image"
          folder="about"
          category="General"
          value={page.story.imageSrc}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) =>
            setPage((prev) => ({
              ...prev,
              story: {
                ...prev.story,
                imageSrc: url && url.trim() ? url : CMS_MEDIA_CLEARED,
              },
            }))
          }
          enableCrop
        />
        <AdminInput
          label="Eyebrow"
          value={page.story.eyebrow}
          onChange={(e) => setPage({ ...page, story: { ...page.story, eyebrow: e.target.value } })}
        />
        <AdminInput
          label="Title"
          value={page.story.title}
          onChange={(e) => setPage({ ...page, story: { ...page.story, title: e.target.value } })}
        />
        <AdminTextarea
          label="Story Content"
          rows={6}
          value={page.story.content}
          onChange={(e) => setPage({ ...page, story: { ...page.story, content: e.target.value } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="Signature"
            value={page.story.signature}
            onChange={(e) =>
              setPage({ ...page, story: { ...page.story, signature: e.target.value } })
            }
          />
          <AdminInput
            label="Signature Role"
            value={page.story.signatureRole}
            onChange={(e) =>
              setPage({ ...page, story: { ...page.story, signatureRole: e.target.value } })
            }
          />
        </div>
      </div>

      <CoverSectionEditor
        heading="Dining Experience (About page)"
        hint="Same two-column block as public /about — Culinary Journey / Dining Experience. Change the image here to update the website."
        block={
          page.diningExperience ?? {
            eyebrow: "Culinary Journey",
            title: "Dining Experience",
            content: "",
            imageSrc: "",
          }
        }
        linkLabel="Explore Dining"
        folder="dining"
        category="Dining"
        library={content.mediaLibrary}
        onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
        onChange={(diningExperience) => patchPage({ diningExperience })}
      />

      <CoverSectionEditor
        heading="Spa & Wellness (About page)"
        hint="Same two-column block as public /about — Restore & Renew / Spa & Wellness. Image on the left on the live site."
        block={
          page.spaWellness ?? {
            eyebrow: "Restore & Renew",
            title: "Spa & Wellness",
            content: "",
            imageSrc: "",
          }
        }
        invert
        linkLabel="Explore Spa"
        folder="spa"
        category="Spa"
        library={content.mediaLibrary}
        onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
        onChange={(spaWellness) => patchPage({ spaWellness })}
      />

      {/* Transport copy */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Transportation & Travel</p>
        <AdminInput
          label="Eyebrow"
          value={page.transport?.eyebrow || ""}
          onChange={(e) =>
            setPage({
              ...page,
              transport: {
                ...(page.transport ?? { eyebrow: "", title: "", content: "", note: "", items: [] }),
                eyebrow: e.target.value,
              },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.transport?.title || ""}
          onChange={(e) =>
            setPage({
              ...page,
              transport: {
                ...(page.transport ?? { eyebrow: "", title: "", content: "", note: "", items: [] }),
                title: e.target.value,
              },
            })
          }
        />
        <AdminTextarea
          label="Description"
          rows={3}
          value={page.transport?.content || ""}
          onChange={(e) =>
            setPage({
              ...page,
              transport: {
                ...(page.transport ?? { eyebrow: "", title: "", content: "", note: "", items: [] }),
                content: e.target.value,
              },
            })
          }
        />
        <AdminTextarea
          label="Footer Note"
          rows={2}
          value={page.transport?.note || ""}
          onChange={(e) =>
            setPage({
              ...page,
              transport: {
                ...(page.transport ?? { eyebrow: "", title: "", content: "", note: "", items: [] }),
                note: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Promise copy */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Our Promise</p>
        <AdminInput
          label="Eyebrow"
          value={page.promise?.eyebrow || ""}
          onChange={(e) =>
            setPage({
              ...page,
              promise: {
                ...(page.promise ?? { eyebrow: "", title: "", items: [] }),
                eyebrow: e.target.value,
              },
            })
          }
        />
        <AdminInput
          label="Title"
          value={page.promise?.title || ""}
          onChange={(e) =>
            setPage({
              ...page,
              promise: {
                ...(page.promise ?? { eyebrow: "", title: "", items: [] }),
                title: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Stats */}
      <EditableListSection
        title="Statistics"
        onAdd={() =>
          setPage({
            ...page,
            stats: [
              ...page.stats,
              {
                id: `s-${Date.now()}`,
                enabled: true,
                order: page.stats.length + 1,
                value: "0",
                label: "New Stat",
              },
            ],
          })
        }
      >
        {page.stats.map((stat, i) => (
          <div key={stat.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 border border-luxury-gold/10 p-3">
            <AdminInput
              label="Value"
              value={stat.value}
              onChange={(e) => {
                const stats = [...page.stats];
                stats[i] = { ...stat, value: e.target.value };
                setPage({ ...page, stats });
              }}
            />
            <AdminInput
              label="Label"
              value={stat.label}
              onChange={(e) => {
                const stats = [...page.stats];
                stats[i] = { ...stat, label: e.target.value };
                setPage({ ...page, stats });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-6 text-red-400"
              onClick={() => setPage({ ...page, stats: page.stats.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </EditableListSection>

      {/* Philosophy */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Philosophy</p>
        <AdminInput
          label="Section Title"
          value={page.philosophy.title}
          onChange={(e) =>
            setPage({ ...page, philosophy: { ...page.philosophy, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Intro"
          rows={3}
          value={page.philosophy.content}
          onChange={(e) =>
            setPage({ ...page, philosophy: { ...page.philosophy, content: e.target.value } })
          }
        />
        <AdminInput
          label="Mission Title"
          value={page.philosophy.mission.title}
          onChange={(e) =>
            setPage({
              ...page,
              philosophy: {
                ...page.philosophy,
                mission: { ...page.philosophy.mission, title: e.target.value },
              },
            })
          }
        />
        <AdminTextarea
          label="Mission Content"
          rows={3}
          value={page.philosophy.mission.content}
          onChange={(e) =>
            setPage({
              ...page,
              philosophy: {
                ...page.philosophy,
                mission: { ...page.philosophy.mission, content: e.target.value },
              },
            })
          }
        />
        <AdminInput
          label="Vision Title"
          value={page.philosophy.vision.title}
          onChange={(e) =>
            setPage({
              ...page,
              philosophy: {
                ...page.philosophy,
                vision: { ...page.philosophy.vision, title: e.target.value },
              },
            })
          }
        />
        <AdminTextarea
          label="Vision Content"
          rows={3}
          value={page.philosophy.vision.content}
          onChange={(e) =>
            setPage({
              ...page,
              philosophy: {
                ...page.philosophy,
                vision: { ...page.philosophy.vision, content: e.target.value },
              },
            })
          }
        />
        {page.philosophy.values.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-3">
            <AdminInput
              label="Value Title"
              value={item.title}
              onChange={(e) => {
                const values = [...page.philosophy.values];
                values[i] = { ...item, title: e.target.value };
                setPage({ ...page, philosophy: { ...page.philosophy, values } });
              }}
            />
            <AdminTextarea
              label="Description"
              rows={2}
              value={item.description}
              onChange={(e) => {
                const values = [...page.philosophy.values];
                values[i] = { ...item, description: e.target.value };
                setPage({ ...page, philosophy: { ...page.philosophy, values } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Why Choose */}
      <CardArrayEditor
        title="Why Choose Cards"
        items={page.whyChoose.items}
        onChange={(items) =>
          setPage({ ...page, whyChoose: { ...page.whyChoose, items } })
        }
        blank={() => ({
          id: `w-${Date.now()}`,
          enabled: true,
          order: page.whyChoose.items.length + 1,
          title: "New Feature",
          description: "",
          icon: "sparkles",
        })}
      />

      {/* Discover */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Discover Experience</p>
        <AdminInput
          label="Title"
          value={page.discover.title}
          onChange={(e) =>
            setPage({ ...page, discover: { ...page.discover, title: e.target.value } })
          }
        />
        <AdminTextarea
          label="Content"
          rows={3}
          value={page.discover.content}
          onChange={(e) =>
            setPage({ ...page, discover: { ...page.discover, content: e.target.value } })
          }
        />
        {page.discover.images.map((img, i) => (
          <div key={img.id} className="space-y-2 border border-luxury-gold/10 p-3">
            <ImagePicker
              label={`Discover Image ${i + 1}`}
              folder="about"
              category="General"
              value={img.src}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const images = [...page.discover.images];
                images[i] = { ...img, src: url };
                setPage({ ...page, discover: { ...page.discover, images } });
              }}
              enableCrop
            />
            <AdminInput
              label="Alt Text"
              value={img.alt}
              onChange={(e) => {
                const images = [...page.discover.images];
                images[i] = { ...img, alt: e.target.value };
                setPage({ ...page, discover: { ...page.discover, images } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Services */}
      <CardArrayEditor
        title="Service Cards"
        items={page.services.items}
        onChange={(items) => setPage({ ...page, services: { ...page.services, items } })}
        blank={() => ({
          id: `sv-${Date.now()}`,
          enabled: true,
          order: page.services.items.length + 1,
          title: "New Service",
          description: "",
          icon: "sparkles",
        })}
      />

      {/* Team */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Team Members</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                team: {
                  ...page.team,
                  members: [
                    ...page.team.members,
                    {
                      id: `t-${Date.now()}`,
                      enabled: true,
                      order: page.team.members.length + 1,
                      name: "New Member",
                      position: "Position",
                      bio: "",
                      imageSrc:
                        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>
        {page.team.members.map((member, i) => (
          <div key={member.id} className="space-y-3 border border-luxury-gold/10 p-4">
            <div className="flex justify-between">
              <p className="text-sm text-luxury-gold/80">{member.name}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setPage({
                    ...page,
                    team: {
                      ...page.team,
                      members: page.team.members.filter((_, idx) => idx !== i),
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ImagePicker
              label="Photo"
              folder="about"
              category="General"
              value={member.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const members = [...page.team.members];
                members[i] = { ...member, imageSrc: url };
                setPage({ ...page, team: { ...page.team, members } });
              }}
              enableCrop
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <AdminInput
                label="Name"
                value={member.name}
                onChange={(e) => {
                  const members = [...page.team.members];
                  members[i] = { ...member, name: e.target.value };
                  setPage({ ...page, team: { ...page.team, members } });
                }}
              />
              <AdminInput
                label="Position"
                value={member.position}
                onChange={(e) => {
                  const members = [...page.team.members];
                  members[i] = { ...member, position: e.target.value };
                  setPage({ ...page, team: { ...page.team, members } });
                }}
              />
            </div>
            <AdminTextarea
              label="Bio"
              rows={2}
              value={member.bio}
              onChange={(e) => {
                const members = [...page.team.members];
                members[i] = { ...member, bio: e.target.value };
                setPage({ ...page, team: { ...page.team, members } });
              }}
            />
          </div>
        ))}
      </div>

      {/* Awards */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Awards & Achievements</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() =>
              setPage({
                ...page,
                awards: {
                  ...page.awards,
                  items: [
                    ...page.awards.items,
                    {
                      id: `a-${Date.now()}`,
                      enabled: true,
                      order: page.awards.items.length + 1,
                      year: "2026",
                      title: "New Award",
                      description: "",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {page.awards.items.map((item, i) => (
          <div key={item.id} className="grid grid-cols-[100px_1fr_1fr_auto] gap-2">
            <AdminInput
              label="Year"
              value={item.year}
              onChange={(e) => {
                const items = [...page.awards.items];
                items[i] = { ...item, year: e.target.value };
                setPage({ ...page, awards: { ...page.awards, items } });
              }}
            />
            <AdminInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const items = [...page.awards.items];
                items[i] = { ...item, title: e.target.value };
                setPage({ ...page, awards: { ...page.awards, items } });
              }}
            />
            <AdminInput
              label="Description"
              value={item.description}
              onChange={(e) => {
                const items = [...page.awards.items];
                items[i] = { ...item, description: e.target.value };
                setPage({ ...page, awards: { ...page.awards, items } });
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
                  awards: {
                    ...page.awards,
                    items: page.awards.items.filter((_, idx) => idx !== i),
                  },
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-luxury-gold">Testimonials</p>
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
                      id: `r-${Date.now()}`,
                      enabled: true,
                      order: page.testimonials.items.length + 1,
                      name: "Guest Name",
                      country: "Country",
                      review: "",
                      rating: 5,
                      imageSrc:
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Review
          </Button>
        </div>
        {page.testimonials.items.map((item, i) => (
          <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-4">
            <ImagePicker
              label="Guest Photo"
              folder="about"
              category="General"
              value={item.imageSrc}
              library={content.mediaLibrary}
              onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              onChange={(url) => {
                const items = [...page.testimonials.items];
                items[i] = { ...item, imageSrc: url };
                setPage({ ...page, testimonials: { ...page.testimonials, items } });
              }}
              enableCrop
            />
            <div className="grid gap-2 sm:grid-cols-3">
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
                label="Rating"
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
            </div>
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
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Gallery preview */}
      <div className="space-y-4 border border-luxury-gold/10 p-6">
        <p className="font-display text-lg text-luxury-gold">Gallery Preview</p>
        <AdminInput
          label="Title"
          value={page.galleryPreview.title}
          onChange={(e) =>
            setPage({
              ...page,
              galleryPreview: { ...page.galleryPreview, title: e.target.value },
            })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            label="CTA Text"
            value={page.galleryPreview.ctaText}
            onChange={(e) =>
              setPage({
                ...page,
                galleryPreview: { ...page.galleryPreview, ctaText: e.target.value },
              })
            }
          />
          <AdminInput
            label="CTA Link"
            value={page.galleryPreview.ctaHref}
            onChange={(e) =>
              setPage({
                ...page,
                galleryPreview: { ...page.galleryPreview, ctaHref: e.target.value },
              })
            }
          />
        </div>
        {page.galleryPreview.images.map((img, i) => (
          <ImagePicker
            key={img.id}
            label={`Gallery Image ${i + 1}`}
            folder="about"
            category="General"
            value={img.src}
            library={content.mediaLibrary}
            onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
            onChange={(url) => {
              const images = [...page.galleryPreview.images];
              images[i] = { ...img, src: url };
              setPage({ ...page, galleryPreview: { ...page.galleryPreview, images } });
            }}
            enableCrop
          />
        ))}
      </div>

      {/* CTA */}
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
            label="Primary Button"
            value={page.cta.primaryText}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, primaryText: e.target.value } })
            }
          />
          <AdminInput
            label="Primary Link"
            value={page.cta.primaryHref}
            onChange={(e) =>
              setPage({ ...page, cta: { ...page.cta, primaryHref: e.target.value } })
            }
          />
          <AdminInput
            label="Secondary Button"
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
          label="CTA Background"
          folder="about"
          category="General"
          value={page.cta.backgroundImage}
          library={content.mediaLibrary}
          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
          onChange={(url) => setPage({ ...page, cta: { ...page.cta, backgroundImage: url } })}
          enableCrop
        />
      </div>

      {/* SEO */}
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

function EditableListSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 border border-luxury-gold/10 p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-luxury-gold">{title}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {children}
    </div>
  );
}

type CardItem = {
  id: string;
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  icon: string;
};

function CardArrayEditor({
  title,
  items,
  onChange,
  blank,
}: {
  title: string;
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
  blank: () => CardItem;
}) {
  return (
    <div className="space-y-4 border border-luxury-gold/10 p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-luxury-gold">{title}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-luxury-gold/30 text-luxury-gold"
          onClick={() => onChange([...items, blank()])}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} className="space-y-2 border border-luxury-gold/10 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <AdminInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, title: e.target.value };
                onChange(next);
              }}
            />
            <AdminInput
              label="Icon key"
              value={item.icon}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, icon: e.target.value };
                onChange(next);
              }}
            />
          </div>
          <AdminTextarea
            label="Description"
            rows={2}
            value={item.description}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, description: e.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-400"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
