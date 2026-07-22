"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  Undo2,
  Redo2,
  Eye,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { PremiumHero } from "@/components/hero/PremiumHero";
import { mediaUrl } from "@/lib/cms/media-url";
import type { HeroBuilderSettings, HeroMediaMode } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

const TABS = [
  "Preview",
  "Hero Media",
  "Booking Bar",
  "SEO",
] as const;

const MEDIA_MODES: { value: HeroMediaMode; label: string; hint: string }[] = [
  { value: "video", label: "Hero Video", hint: "Autoplay, muted, looping" },
  { value: "image", label: "Hero Image", hint: "Full-bleed image, original quality" },
];

type Tab = (typeof TABS)[number];

interface HeroBuilderProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  onChange: (hero: HeroBuilderSettings) => void;
  library: SiteContent["mediaLibrary"];
  onLibraryChange: (library: SiteContent["mediaLibrary"]) => void;
  onPublish?: () => Promise<void> | void;
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

export function HeroBuilder({
  hero,
  rooms,
  onChange,
  library,
  onLibraryChange,
  onPublish,
}: HeroBuilderProps) {
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

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [publishing, setPublishing] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const prevMedia = hero.previousMedia ?? { imageSrc: "", videoSrc: "" };
  const activeMediaMode: HeroMediaMode = hero.mediaMode === "image" ? "image" : "video";

  /** Set/replace the hero image, stashing the current one so it can be restored. */
  const setHeroImage = (url: string) => {
    if (!url) {
      patch({
        mediaMode: hero.videoSrc?.trim() ? "video" : "none",
        image: { ...hero.image, src: "", desktopSrc: "", tabletSrc: "", mobileSrc: "" },
      });
      return;
    }
    patch({
      mediaMode: "image",
      previousMedia: {
        ...prevMedia,
        imageSrc: hero.image.src && hero.image.src !== url ? hero.image.src : prevMedia.imageSrc,
      },
      image: { ...hero.image, src: url, desktopSrc: url, tabletSrc: url, mobileSrc: url },
    });
  };

  /** Set/replace the hero video, stashing the current one so it can be restored. */
  const setHeroVideo = (url: string) => {
    patch({
      mediaMode: "video",
      previousMedia: {
        ...prevMedia,
        videoSrc: hero.videoSrc && hero.videoSrc !== url ? hero.videoSrc : prevMedia.videoSrc,
      },
      videoSrc: url,
      poster: "",
    });
  };

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true);
    setVideoError("");
    setUploadSuccess("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "hero");
      // NOTE: old video is intentionally kept on disk so "Restore Previous Media" works.
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
      }
      setHeroVideo((data.urlWithBust || data.url) as string);
      setUploadSuccess("Upload Successful");
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  };

  /** Clear Orbit hero media. Never restore demo assets — empty = elegant blank hero. */
  const removeHeroMedia = () => {
    patch({
      mediaMode: "none",
      previousMedia: { imageSrc: "", videoSrc: "" },
      videoSrc: "",
      poster: "",
      image: { ...hero.image, src: "", desktopSrc: "", tabletSrc: "", mobileSrc: "" },
    });
    setUploadSuccess("Hero media cleared");
  };

  /** Swap current and previous media (works after Replace or Remove). */
  const restorePreviousMedia = () => {
    if (!prevMedia.imageSrc && !prevMedia.videoSrc) return;
    const restoreMode: HeroMediaMode = prevMedia.videoSrc ? "video" : "image";
    patch({
      mediaMode: restoreMode,
      videoSrc: prevMedia.videoSrc || hero.videoSrc,
      image: prevMedia.imageSrc
        ? {
            ...hero.image,
            src: prevMedia.imageSrc,
            desktopSrc: prevMedia.imageSrc,
            tabletSrc: prevMedia.imageSrc,
            mobileSrc: prevMedia.imageSrc,
          }
        : hero.image,
      previousMedia: { imageSrc: hero.image.src || "", videoSrc: hero.videoSrc || "" },
    });
  };

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

  const publishLive = async () => {
    if (!onPublish) return;
    setPublishing(true);
    try {
      await onPublish();
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">Hero Manager — preview, save and publish the live homepage hero.</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTab("Preview")}
            className="border-luxury-gold/20 text-luxury-gold"
          >
            <Eye className="mr-1 h-4 w-4" /> Preview
          </Button>
          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => void publishLive()}
            disabled={publishing || !onPublish}
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish Live
          </Button>
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

      {tab === "Hero Media" && (
        <>
          <Panel title="Background Mode">
            <div className="grid gap-3 md:grid-cols-3">
              {MEDIA_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => patch({ mediaMode: m.value })}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    activeMediaMode === m.value
                      ? "border-luxury-gold bg-luxury-gold/10"
                      : "border-white/10 bg-white/[0.02] hover:border-luxury-gold/40"
                  )}
                >
                  <p className={cn("text-sm font-medium", activeMediaMode === m.value ? "text-luxury-gold" : "text-white/80")}>
                    {m.label}
                  </p>
                  <p className="mt-1 text-xs text-white/40">{m.hint}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40">
              Uploaded media is displayed exactly as uploaded — no compression, cropping or quality loss. Use the Preview tab, then Save to publish live.
            </p>
            {(hero.previousMedia?.imageSrc || hero.previousMedia?.videoSrc) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-luxury-gold/20 text-luxury-gold"
                onClick={restorePreviousMedia}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Restore Previous Media
              </Button>
            )}
            {(hero.image.src || hero.videoSrc) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-400/30 text-red-300"
                onClick={removeHeroMedia}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear Hero Media
              </Button>
            )}
            {uploadSuccess ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> {uploadSuccess}
              </p>
            ) : null}
          </Panel>

          {activeMediaMode === "image" && (
            <Panel title="Hero Image">
              <ImagePicker
                label="Hero Image (upload / replace)"
                folder="hero"
                category="Hero"
                value={hero.image.src}
                library={library}
                onLibraryChange={onLibraryChange}
                onChange={setHeroImage}
                onUploadSuccess={() => setUploadSuccess("Upload Successful")}
              />
              <AdminInput label="Image URL" value={hero.image.src} onChange={(e) => setHeroImage(e.target.value)} />
              <AdminInput label="Alt Text" value={hero.image.alt} onChange={(e) => patchNested("image", { ...hero.image, alt: e.target.value })} />
              <AdminInput label="Focal Position (e.g. center, center 40%)" value={hero.image.position} onChange={(e) => patchNested("image", { ...hero.image, position: e.target.value })} />
            </Panel>
          )}

          {activeMediaMode === "video" && (
            <Panel title="Hero Video">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-luxury-gold/20 text-luxury-gold"
                  disabled={videoUploading}
                  onClick={() => videoInputRef.current?.click()}
                >
                  {videoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-3.5 w-3.5" /> {hero.videoSrc ? "Replace Video" : "Upload Video"}
                    </>
                  )}
                </Button>
                <span className="text-xs text-white/40">MP4, WEBM or MOV — original quality preserved, size limited only by server storage.</span>
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleVideoUpload(file);
                  e.target.value = "";
                }}
              />
              {videoError && <p className="text-xs text-red-300">{videoError}</p>}
              <AdminInput label="Video URL (or paste external URL)" value={hero.videoSrc} onChange={(e) => setHeroVideo(e.target.value)} />
              {hero.videoSrc ? (
                <div className="overflow-hidden rounded-xl border border-luxury-gold/20 bg-black">
                  <video
                    key={hero.videoSrc}
                    src={mediaUrl(hero.videoSrc, hero.videoSrc)}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="max-h-64 w-full object-contain"
                  />
                </div>
              ) : (
                <p className="text-xs text-white/40">No video selected yet.</p>
              )}
              <ImagePicker
                label="Poster Image (shown while video loads)"
                folder="hero"
                category="Hero"
                value={hero.poster}
                library={library}
                onLibraryChange={onLibraryChange}
                onChange={(url) => patch({ poster: url })}
                onUploadSuccess={() => setUploadSuccess("Upload Successful")}
              />
            </Panel>
          )}

          <Panel title="Playback, Sizing & Overlay">
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                ["videoAutoplay", "Enable Autoplay"],
                ["videoLoop", "Enable Loop"],
                ["videoMuted", "Enable Mute"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={hero[key] !== false}
                    onChange={(e) => patch({ [key]: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AdminInput
                label="Desktop Height"
                value={hero.desktopHeight || "72vh"}
                onChange={(e) => patch({ desktopHeight: e.target.value })}
              />
              <AdminInput
                label="Mobile Height"
                value={hero.mobileHeight || "540px"}
                onChange={(e) => patch({ mobileHeight: e.target.value })}
              />
              <AdminInput
                label="Booking Position (bottom)"
                value={hero.bookingPosition || "32px"}
                onChange={(e) => patch({ bookingPosition: e.target.value })}
              />
            </div>
            <Slider
              label="Overlay Opacity"
              value={Math.round((hero.overlayOpacity ?? 0.18) * 100)}
              min={0}
              max={85}
              onChange={(v) => patch({ overlayOpacity: v / 100 })}
            />
            <AdminInput
              label="Overlay Color"
              value={hero.overlayColor}
              onChange={(e) => patch({ overlayColor: e.target.value })}
            />
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
            <AdminInput label="Background Color / Gradient (CSS)" value={hero.bookingBar.background} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, background: e.target.value })} />
            <AdminInput label="Border Color (soft gold frame)" value={hero.bookingBar.borderColor ?? "rgba(201,164,76,0.45)"} onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, borderColor: e.target.value })} />
            <div className="grid grid-cols-3 gap-4">
              <AdminInput
                label="Default Guests"
                value={hero.bookingBar.defaults?.guests ?? "2"}
                onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, defaults: { ...hero.bookingBar.defaults, guests: e.target.value } })}
              />
              <AdminInput
                label="Default Children"
                value={hero.bookingBar.defaults?.children ?? "0"}
                onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, defaults: { ...hero.bookingBar.defaults, children: e.target.value } })}
              />
              <AdminInput
                label="Default Rooms"
                value={hero.bookingBar.defaults?.rooms ?? "1"}
                onChange={(e) => patchNested("bookingBar", { ...hero.bookingBar, defaults: { ...hero.bookingBar.defaults, rooms: e.target.value } })}
              />
            </div>
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
