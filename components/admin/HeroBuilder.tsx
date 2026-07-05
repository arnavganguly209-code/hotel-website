"use client";

import { useCallback, useState } from "react";
import { Undo2, Redo2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { FileUpload } from "@/components/admin/FileUpload";
import { PremiumHero } from "@/components/hero/PremiumHero";
import type { HeroBuilderSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const TABS = [
  "Preview",
  "Content",
  "Hero Image",
  "Logo",
  "Buttons",
  "Booking Bar",
  "Effects",
  "Colors",
  "SEO",
] as const;

type Tab = (typeof TABS)[number];

interface HeroBuilderProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  onChange: (hero: HeroBuilderSettings) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-luxury-gold"
      />
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-luxury-gold/10 bg-white/[0.03] p-5">
      <p className="font-display text-sm text-luxury-gold">{title}</p>
      {children}
    </div>
  );
}

export function HeroBuilder({ hero, rooms, onChange }: HeroBuilderProps) {
  const [tab, setTab] = useState<Tab>("Preview");
  const [history, setHistory] = useState<HeroBuilderSettings[]>([hero]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const patch = useCallback(
    (partial: Partial<HeroBuilderSettings>) => {
      const next = { ...hero, ...partial };
      onChange(next);
      setHistory((h) => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex((i) => i + 1);
    },
    [hero, historyIndex, onChange]
  );

  const patchNested = useCallback(
    <K extends keyof HeroBuilderSettings>(key: K, value: HeroBuilderSettings[K]) => {
      patch({ [key]: value } as Partial<HeroBuilderSettings>);
    },
    [patch]
  );

  const undo = () => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    onChange(history[idx]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    onChange(history[idx]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">Premium Hero Builder — changes preview instantly. Save to publish.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0} className="border-luxury-gold/20 text-luxury-gold">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="border-luxury-gold/20 text-luxury-gold">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
              tab === t ? "bg-luxury-gold text-luxury-green-dark" : "bg-white/5 text-white/60 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Preview" && (
        <Panel title="Live Preview">
          <div className="overflow-hidden rounded-xl border border-luxury-gold/20 bg-[#F8F3EA]">
            <div className="pointer-events-none origin-top scale-[0.55] md:scale-[0.65] lg:scale-75">
              <PremiumHero hero={hero} rooms={rooms} preview />
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-white/40">
            <Eye className="h-3 w-3" /> Preview scaled — visit homepage after saving for full view.
          </p>
        </Panel>
      )}

      {tab === "Content" && (
        <>
          <Panel title="Hotel Title">
            <AdminInput label="Welcome Line (e.g. HOTEL)" value={hero.welcomeText} onChange={(e) => patch({ welcomeText: e.target.value })} />
            <AdminInput label="Main Title" value={hero.title} onChange={(e) => patch({ title: e.target.value })} />
            <AdminInput label="Subtitle" value={hero.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
            <AdminTextarea label="Description (HTML supported)" rows={3} value={hero.description} onChange={(e) => patch({ description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <AdminInput label="Title Color" value={hero.titleStyle.color} onChange={(e) => patchNested("titleStyle", { ...hero.titleStyle, color: e.target.value })} />
              <AdminInput label="Subtitle Color" value={hero.subtitleStyle.color} onChange={(e) => patchNested("subtitleStyle", { ...hero.subtitleStyle, color: e.target.value })} />
              <AdminInput label="Title Desktop Size" value={hero.titleStyle.desktopFontSize} onChange={(e) => patchNested("titleStyle", { ...hero.titleStyle, desktopFontSize: e.target.value })} />
              <AdminInput label="Subtitle Letter Spacing" value={hero.subtitleStyle.letterSpacing} onChange={(e) => patchNested("subtitleStyle", { ...hero.subtitleStyle, letterSpacing: e.target.value })} />
            </div>
          </Panel>
        </>
      )}

      {tab === "Hero Image" && (
        <>
          <Panel title="Hero Background Image">
            <AdminInput label="Image URL" value={hero.image.src} onChange={(e) => patchNested("image", { ...hero.image, src: e.target.value, desktopSrc: e.target.value })} />
            <FileUpload label="Upload Hero Image" folder="hero" accept="image/*" value={hero.image.src} onChange={(url) => patchNested("image", { ...hero.image, src: url, desktopSrc: url, tabletSrc: url, mobileSrc: url })} />
            <AdminInput label="Alt Text" value={hero.image.alt} onChange={(e) => patchNested("image", { ...hero.image, alt: e.target.value })} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminInput label="Mobile Image URL" value={hero.image.mobileSrc} onChange={(e) => patchNested("image", { ...hero.image, mobileSrc: e.target.value })} />
              <AdminInput label="Tablet Image URL" value={hero.image.tabletSrc} onChange={(e) => patchNested("image", { ...hero.image, tabletSrc: e.target.value })} />
              <AdminInput label="Desktop Image URL" value={hero.image.desktopSrc} onChange={(e) => patchNested("image", { ...hero.image, desktopSrc: e.target.value })} />
            </div>
            <Slider label="Scale" value={hero.image.scale} min={0.8} max={1.4} step={0.05} onChange={(v) => patchNested("image", { ...hero.image, scale: v })} />
            <Slider label="Brightness %" value={hero.image.brightness} min={50} max={150} onChange={(v) => patchNested("image", { ...hero.image, brightness: v })} />
            <Slider label="Contrast %" value={hero.image.contrast} min={50} max={150} onChange={(v) => patchNested("image", { ...hero.image, contrast: v })} />
            <Slider label="Saturation %" value={hero.image.saturation} min={0} max={200} onChange={(v) => patchNested("image", { ...hero.image, saturation: v })} />
            <Slider label="Blur (px)" value={hero.image.blur} min={0} max={12} onChange={(v) => patchNested("image", { ...hero.image, blur: v })} />
            <Slider label="Rotate (deg)" value={hero.image.rotate} min={-180} max={180} onChange={(v) => patchNested("image", { ...hero.image, rotate: v })} />
            <Slider label="Overlay Opacity" value={hero.image.overlayOpacity} min={0} max={100} onChange={(v) => patchNested("image", { ...hero.image, overlayOpacity: v / 100 })} />
            <AdminInput label="Image Position" value={hero.image.position} onChange={(e) => patchNested("image", { ...hero.image, position: e.target.value })} />
            <AdminInput label="Border Radius" value={hero.image.borderRadius} onChange={(e) => patchNested("image", { ...hero.image, borderRadius: e.target.value })} />
            <AdminInput label="Gradient Overlay (CSS)" value={hero.image.gradientOverlay} onChange={(e) => patchNested("image", { ...hero.image, gradientOverlay: e.target.value })} />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.image.parallax} onChange={(e) => patchNested("image", { ...hero.image, parallax: e.target.checked })} className="accent-luxury-gold" />
              Parallax ON
            </label>
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.image.flipX} onChange={(e) => patchNested("image", { ...hero.image, flipX: e.target.checked })} className="accent-luxury-gold" />
              Flip Horizontal
            </label>
          </Panel>
        </>
      )}

      {tab === "Logo" && (
        <Panel title="Hero Logo">
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" checked={hero.logo.visible} onChange={(e) => patchNested("logo", { ...hero.logo, visible: e.target.checked })} className="accent-luxury-gold" />
            Show Logo
          </label>
          <AdminInput label="Logo URL" value={hero.logo.src} onChange={(e) => patchNested("logo", { ...hero.logo, src: e.target.value })} />
          <FileUpload label="Upload Logo (PNG/SVG/WebP)" folder="logo" accept="image/*" value={hero.logo.src} onChange={(url) => patchNested("logo", { ...hero.logo, src: url })} />
          <div className="grid grid-cols-2 gap-4">
            <Slider label="Width (px)" value={hero.logo.width} min={60} max={200} onChange={(v) => patchNested("logo", { ...hero.logo, width: v })} />
            <Slider label="Opacity" value={Math.round(hero.logo.opacity * 100)} min={0} max={100} onChange={(v) => patchNested("logo", { ...hero.logo, opacity: v / 100 })} />
            <Slider label="Rotation" value={hero.logo.rotation} min={-45} max={45} onChange={(v) => patchNested("logo", { ...hero.logo, rotation: v })} />
          </div>
          <AdminInput label="Glow (CSS shadow)" value={hero.logo.glow} onChange={(e) => patchNested("logo", { ...hero.logo, glow: e.target.value })} />
        </Panel>
      )}

      {tab === "Buttons" && (
        <>
          <Panel title="Discover More Button">
            <AdminInput label="Text" value={hero.primaryButton.text} onChange={(e) => patchNested("primaryButton", { ...hero.primaryButton, text: e.target.value })} />
            <AdminInput label="URL" value={hero.primaryButton.href} onChange={(e) => patchNested("primaryButton", { ...hero.primaryButton, href: e.target.value })} />
            <AdminInput label="Background Color" value={hero.primaryButton.backgroundColor} onChange={(e) => patchNested("primaryButton", { ...hero.primaryButton, backgroundColor: e.target.value })} />
            <AdminInput label="Border Radius" value={hero.primaryButton.borderRadius} onChange={(e) => patchNested("primaryButton", { ...hero.primaryButton, borderRadius: e.target.value })} />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.primaryButton.visible} onChange={(e) => patchNested("primaryButton", { ...hero.primaryButton, visible: e.target.checked })} className="accent-luxury-gold" />
              Visible
            </label>
          </Panel>
          <Panel title="Explore Rooms Button (Secondary)">
            <AdminInput label="Text" value={hero.secondaryButton.text} onChange={(e) => patchNested("secondaryButton", { ...hero.secondaryButton, text: e.target.value })} />
            <AdminInput label="URL" value={hero.secondaryButton.href} onChange={(e) => patchNested("secondaryButton", { ...hero.secondaryButton, href: e.target.value })} />
            <AdminInput label="Border Color" value={hero.secondaryButton.borderColor} onChange={(e) => patchNested("secondaryButton", { ...hero.secondaryButton, borderColor: e.target.value })} />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.secondaryButton.visible} onChange={(e) => patchNested("secondaryButton", { ...hero.secondaryButton, visible: e.target.checked })} className="accent-luxury-gold" />
              Visible
            </label>
          </Panel>
        </>
      )}

      {tab === "Booking Bar" && (
        <>
          <Panel title="Booking Bar">
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.bookingBar.enabled} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, enabled: e.target.checked })} className="accent-luxury-gold" />
              Enable Booking Bar
            </label>
            <AdminInput label="Button Text" value={hero.bookingBar.buttonText} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonText: e.target.value })} />
            <AdminInput label="Background" value={hero.bookingBar.background} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, background: e.target.value })} />
            <AdminInput label="Shadow" value={hero.bookingBar.shadow} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, shadow: e.target.value })} />
            <AdminInput label="Border Radius" value={hero.bookingBar.borderRadius} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, borderRadius: e.target.value })} />
            <AdminInput label="Padding" value={hero.bookingBar.padding} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, padding: e.target.value })} />
            <AdminInput label="Field Border Radius" value={hero.bookingBar.fieldBorderRadius} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, fieldBorderRadius: e.target.value })} />
            <AdminInput label="Field Padding" value={hero.bookingBar.fieldPadding} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, fieldPadding: e.target.value })} />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.bookingBar.fixedPosition ?? true} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, fixedPosition: e.target.checked })} className="accent-luxury-gold" />
              Fixed Position
            </label>
            <AdminInput label="Gap" value={hero.bookingBar.gap ?? "0"} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, gap: e.target.value })} />
            <AdminInput label="Button Width" value={hero.bookingBar.buttonWidth ?? "300px"} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonWidth: e.target.value })} />
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.bookingBar.glassEffect} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, glassEffect: e.target.checked })} className="accent-luxury-gold" />
              Glass Effect
            </label>
            <Slider label="Glass Blur" value={hero.bookingBar.blur} min={0} max={40} onChange={(v) => patchNested("bookingBar", { ...hero.bookingBar, blur: v })} />
          </Panel>

          <Panel title="Field Labels">
            {(["checkIn", "checkOut", "guests", "children", "room"] as const).map((field) => (
              <AdminInput
                key={field}
                label={field.replace(/([A-Z])/g, " $1")}
                value={hero.bookingBar.labels[field]}
                onChange={(e) =>
                  patchNested("bookingBar", {
                    ...hero.bookingBar,
                    labels: { ...hero.bookingBar.labels, [field]: e.target.value },
                  })
                }
              />
            ))}
          </Panel>

          <Panel title="Colors">
            {(["label", "value", "divider", "border", "buttonText", "buttonGradientFrom", "buttonGradientTo"] as const).map((key) => (
              <AdminInput
                key={key}
                label={key.replace(/([A-Z])/g, " $1")}
                value={hero.bookingBar.colors[key]}
                onChange={(e) =>
                  patchNested("bookingBar", {
                    ...hero.bookingBar,
                    colors: { ...hero.bookingBar.colors, [key]: e.target.value },
                  })
                }
              />
            ))}
            <AdminInput label="Button Gradient CSS" value={hero.bookingBar.buttonGradient} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonGradient: e.target.value })} />
          </Panel>

          <Panel title="Icons (lucide names)">
            {(["checkIn", "checkOut", "guests", "children", "room"] as const).map((field) => (
              <AdminInput
                key={field}
                label={field.replace(/([A-Z])/g, " $1")}
                value={hero.bookingBar.icons[field]}
                onChange={(e) =>
                  patchNested("bookingBar", {
                    ...hero.bookingBar,
                    icons: { ...hero.bookingBar.icons, [field]: e.target.value },
                  })
                }
              />
            ))}
          </Panel>

          <Panel title="Typography & Spacing">
            <AdminInput label="Label Font Size" value={hero.bookingBar.labelFontSize} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, labelFontSize: e.target.value })} />
            <AdminInput label="Value Font Size" value={hero.bookingBar.valueFontSize} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, valueFontSize: e.target.value })} />
            <AdminInput label="Label Letter Spacing" value={hero.bookingBar.labelLetterSpacing} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, labelLetterSpacing: e.target.value })} />
            <AdminInput label="Button Height" value={hero.bookingBar.buttonHeight} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonHeight: e.target.value })} />
            <AdminInput label="Button Border Radius" value={hero.bookingBar.buttonBorderRadius} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonBorderRadius: e.target.value })} />
            <AdminInput label="Button Shadow" value={hero.bookingBar.buttonShadow} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, buttonShadow: e.target.value })} />
          </Panel>

          <Panel title="Responsive">
            <AdminInput label="Desktop Bottom" value={hero.bookingBar.responsive.desktopBottom} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, desktopBottom: e.target.value } })} />
            <AdminInput label="Desktop Max Width" value={hero.bookingBar.responsive.desktopMaxWidth} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, desktopMaxWidth: e.target.value } })} />
            <AdminInput label="Desktop Width" value={hero.bookingBar.responsive.desktopWidth} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, desktopWidth: e.target.value } })} />
            <AdminInput label="Mobile Bottom" value={hero.bookingBar.responsive.mobileBottom} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, mobileBottom: e.target.value } })} />
            <AdminInput label="Mobile Inset" value={hero.bookingBar.responsive.mobileHorizontalInset} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, mobileHorizontalInset: e.target.value } })} />
            <AdminInput label="Mobile Radius" value={hero.bookingBar.responsive.mobileRadius} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, mobileRadius: e.target.value } })} />
            <AdminInput label="Desktop Min Width" value={hero.bookingBar.responsive.desktopMinWidth ?? "1100px"} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, desktopMinWidth: e.target.value } })} />
            <AdminInput label="Mobile Padding" value={hero.bookingBar.responsive.mobilePadding} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, responsive: { ...hero.bookingBar.responsive, mobilePadding: e.target.value } })} />
          </Panel>

          <Panel title="Animations">
            {(["entrance", "float", "buttonGlow", "hoverGlow", "buttonLift"] as const).map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm capitalize text-white/70">
                <input
                  type="checkbox"
                  checked={hero.bookingBar.animations[key]}
                  onChange={(e) =>
                    patchNested("bookingBar", {
                      ...hero.bookingBar,
                      animations: { ...hero.bookingBar.animations, [key]: e.target.checked },
                    })
                  }
                  className="accent-luxury-gold"
                />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </Panel>

          <Panel title="Visible Fields">
            {(["checkIn", "checkOut", "guests", "children", "room"] as const).map((field) => (
              <label key={field} className="flex items-center gap-3 text-sm capitalize text-white/70">
                <input
                  type="checkbox"
                  checked={hero.bookingBar.fields[field]}
                  onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, fields: { ...hero.bookingBar.fields, [field]: e.target.checked } })}
                  className="accent-luxury-gold"
                />
                Show {field.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </Panel>
        </>
      )}

      {tab === "Effects" && (
        <>
          <Panel title="Background Effects">
            {(["goldenGlow", "creamGlow", "orangeGlow", "greenGlow", "lightRays", "fog", "floatingLeaves", "floatingShapes", "particles"] as const).map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm capitalize text-white/70">
                <input
                  type="checkbox"
                  checked={hero.effects[key]}
                  onChange={(e) => patchNested("effects", { ...hero.effects, [key]: e.target.checked })}
                  className="accent-luxury-gold"
                />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
            <AdminInput label="Background Gradient" value={hero.effects.gradient} onChange={(e) => patchNested("effects", { ...hero.effects, gradient: e.target.value })} />
          </Panel>
          <Panel title="Floating Elements">
            <Slider label="Shape Count" value={hero.floating.shapeCount} min={0} max={12} onChange={(v) => patchNested("floating", { ...hero.floating, shapeCount: v })} />
            <Slider label="Opacity" value={Math.round(hero.floating.opacity * 100)} min={0} max={100} onChange={(v) => patchNested("floating", { ...hero.floating, opacity: v / 100 })} />
            <Slider label="Speed" value={hero.floating.speed} min={5} max={40} onChange={(v) => patchNested("floating", { ...hero.floating, speed: v })} />
          </Panel>
          <Panel title="Animations">
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.animations.mouseParallax} onChange={(e) => patchNested("animations", { ...hero.animations, mouseParallax: e.target.checked })} className="accent-luxury-gold" />
              Mouse Parallax
            </label>
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input type="checkbox" checked={hero.animations.scrollReveal} onChange={(e) => patchNested("animations", { ...hero.animations, scrollReveal: e.target.checked })} className="accent-luxury-gold" />
              Scroll Reveal
            </label>
            <Slider label="Transition Duration (s)" value={hero.animations.transitionDuration} min={0.3} max={2} step={0.1} onChange={(v) => patchNested("animations", { ...hero.animations, transitionDuration: v })} />
          </Panel>
        </>
      )}

      {tab === "Colors" && (
        <Panel title="Hero Color Palette">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(hero.colors).map(([key, value]) => (
              <AdminInput
                key={key}
                label={key.replace(/([A-Z])/g, " $1")}
                value={value}
                onChange={(e) => patchNested("colors", { ...hero.colors, [key]: e.target.value })}
              />
            ))}
          </div>
        </Panel>
      )}

      {tab === "SEO" && (
        <Panel title="Hero SEO">
          <AdminInput label="Hero Title" value={hero.seo.heroTitle} onChange={(e) => patchNested("seo", { ...hero.seo, heroTitle: e.target.value })} />
          <AdminInput label="Meta Title" value={hero.seo.metaTitle} onChange={(e) => patchNested("seo", { ...hero.seo, metaTitle: e.target.value })} />
          <AdminTextarea label="Meta Description" rows={3} value={hero.seo.metaDescription} onChange={(e) => patchNested("seo", { ...hero.seo, metaDescription: e.target.value })} />
          <AdminInput label="OG Image URL" value={hero.seo.ogImage} onChange={(e) => patchNested("seo", { ...hero.seo, ogImage: e.target.value })} />
          <AdminInput label="Image Alt Text" value={hero.seo.altText} onChange={(e) => patchNested("seo", { ...hero.seo, altText: e.target.value })} />
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" checked={hero.seo.schemaEnabled} onChange={(e) => patchNested("seo", { ...hero.seo, schemaEnabled: e.target.checked })} className="accent-luxury-gold" />
            Enable Schema Markup
          </label>
        </Panel>
      )}
    </div>
  );
}
