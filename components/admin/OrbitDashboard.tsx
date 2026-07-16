"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Home,
  Building2,
  Utensils,
  MapPin,
  Globe,
  Bed,
  Star,
  Image,
  Search,
  Settings,
  LogOut,
  Save,
  ExternalLink,
  Loader2,
  Sparkles,
  Waves,
  Grid3X3,
  PanelTop,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";
import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { HeroBuilder } from "@/components/admin/HeroBuilder";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { GalleryManager } from "@/components/admin/media/GalleryManager";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import type { SiteContent } from "@/lib/cms/types";
import {
  isPaymentLogoCleared,
  normalizePaymentLogoSrc,
  OFFICIAL_PAYMENT_LOGOS,
  PAYMENT_LOGO_CLEARED,
} from "@/lib/cms/payment-logos";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "theme", label: "Theme Settings", icon: Sparkles },
  { id: "hotel", label: "Hotel Info", icon: Building2 },
  { id: "header", label: "Header", icon: PanelTop },
  { id: "hero", label: "Hero", icon: Home },
  { id: "homepage", label: "Homepage Sections", icon: Grid3X3 },
  { id: "overview", label: "Luxury Showcase", icon: Home },
  { id: "experiences", label: "Home Experiences", icon: Sparkles },
  { id: "culture", label: "Cultural Experience", icon: Globe },
  { id: "facilities", label: "Amenities Section", icon: Grid3X3 },
  { id: "fineDining", label: "Fine Dining Section", icon: Utensils },
  { id: "lobbyCafe", label: "Lobby Café Section", icon: Utensils },
  { id: "rooftopExperience", label: "Rooftop Experience Section", icon: Utensils },
  { id: "rooms", label: "Rooms Section", icon: Bed },
  { id: "dining", label: "Dining Page", icon: Utensils },
  { id: "spa", label: "Spa Page", icon: Waves },
  { id: "culturalExperience", label: "Cultural Page", icon: Globe },
  { id: "about", label: "About Page", icon: Globe },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "reviews", label: "Testimonials", icon: Star },
  { id: "contact", label: "Contact", icon: MessageSquare },
  { id: "footer", label: "Footer", icon: PanelTop },
  { id: "seo", label: "SEO", icon: Search },
  { id: "media", label: "Media Library", icon: Image },
  { id: "backups", label: "Backups", icon: Save },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface OrbitDashboardProps {
  initialContent: SiteContent;
}

export function OrbitDashboard({ initialContent }: OrbitDashboardProps) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [activeSection, setActiveSection] = useState<SectionId>("hotel");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const update = <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setAutoSaveError(false);
  };

  const persistContent = useCallback(
    async (
      payload: SiteContent,
      opts?: { silentPaymentNotice?: boolean }
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      setSaving(true);
      try {
        console.info("[Orbit] Database save started");
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          error?: string;
          details?: string[];
          paymentLogos?: SiteContent["footer"]["paymentLogos"];
          message?: string;
        };

        if (res.ok) {
          setSaved(true);
          setAutoSaveError(false);
          if (data.paymentLogos) {
            setContent((prev) => {
              const next = {
                ...prev,
                footer: { ...prev.footer, paymentLogos: data.paymentLogos! },
              };
              contentRef.current = next;
              return next;
            });
          }
          console.info("[Orbit] Database updated");
          router.refresh();
          console.info("[Orbit] Frontend refreshed");
          return { ok: true };
        }

        const detail =
          Array.isArray(data.details) && data.details.length
            ? `\n${data.details.join("\n")}`
            : "";
        const error = `${data.error || "Database save failed."}${detail}`;
        console.error("[Orbit] Database save failed:", error);
        setAutoSaveError(true);
        if (!opts?.silentPaymentNotice) {
          setPaymentNotice({ type: "err", text: error });
        }
        return { ok: false, error };
      } catch (err) {
        const error = err instanceof Error ? err.message : "Database save failed.";
        console.error("[Orbit] Database save exception:", err);
        if (err instanceof Error && err.stack) console.error(err.stack);
        setAutoSaveError(true);
        if (!opts?.silentPaymentNotice) {
          setPaymentNotice({ type: "err", text: error });
        }
        return { ok: false, error };
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  /** Commit payment logo only after upload succeeded — rollback previous src if DB save fails. */
  const commitPaymentLogo = useCallback(
    async (index: number, src: string) => {
      const previous =
        contentRef.current.footer.paymentLogos?.[index]?.src ||
        OFFICIAL_PAYMENT_LOGOS[index].src;

      const logos = Array.from({ length: 6 }, (_, i) => ({
        id: contentRef.current.footer.paymentLogos?.[i]?.id || `pay${i + 1}`,
        src: contentRef.current.footer.paymentLogos?.[i]?.src ?? "",
      }));
      logos[index] = { id: logos[index].id || `pay${index + 1}`, src };

      const nextPayload: SiteContent = {
        ...contentRef.current,
        footer: { ...contentRef.current.footer, paymentLogos: logos },
      };

      contentRef.current = nextPayload;
      setContent(nextPayload);
      setSaved(false);
      setPaymentNotice(null);

      if (saveTimer.current) clearTimeout(saveTimer.current);

      console.info("[Orbit] Payment logo Image URL", { slot: index + 1, src });

      const result = await persistContent(nextPayload);
      if (!result.ok) {
        console.error(
          "[Orbit] Payment logo save failed — restoring previous image",
          previous
        );
        const rolledLogos = logos.map((slot, i) =>
          i === index ? { ...slot, src: previous } : slot
        );
        const rolled: SiteContent = {
          ...contentRef.current,
          footer: { ...contentRef.current.footer, paymentLogos: rolledLogos },
        };
        contentRef.current = rolled;
        setContent(rolled);
        setPaymentNotice({
          type: "err",
          text: result.error || "Payment logo save failed. Previous logo restored.",
        });
        return;
      }

      setPaymentNotice({
        type: "ok",
        text:
          src === PAYMENT_LOGO_CLEARED
            ? "✓ Payment logo deleted successfully."
            : "✓ Payment logo saved successfully.",
      });
    },
    [persistContent]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persistContent(contentRef.current, { silentPaymentNotice: true });
    }, 1800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, persistContent]);

  const handleSave = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const result = await persistContent(contentRef.current);
    if (result.ok) {
      setPaymentNotice({
        type: "ok",
        text: "✓ All changes saved successfully.",
      });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/orbit/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/orbit");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-luxury-gold/15 bg-luxury-green">
        <div className="border-b border-luxury-gold/15 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-luxury-gold/30 bg-luxury-gold/10">
              <Sparkles className="h-5 w-5 text-luxury-gold" />
            </div>
            <div>
              <p className="font-display text-sm font-medium text-white">Orbit Admin</p>
              <p className="text-[10px] uppercase tracking-wider text-luxury-gold/50">CMS Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-all",
                    activeSection === section.id
                      ? "bg-luxury-gold/15 text-luxury-gold-light"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-luxury-gold/15 p-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full border-luxury-gold/30 text-luxury-gold" asChild>
            <Link href="/" target="_blank">
              <ExternalLink className="h-4 w-4" />
              View Website
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white/50 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-luxury-gold/15 bg-[#0a0f0c]/90 px-8 py-4 backdrop-blur-xl">
          <div>
            <h1 className="font-display text-xl font-medium text-white">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h1>
            <p className="text-xs text-white/40">Edit website content</p>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-luxury-gold">Saving…</span>}
            {!saving && saved && (
              <span className="text-xs text-emerald-400">All changes saved</span>
            )}
            {!saving && autoSaveError && (
              <span className="text-xs text-red-400">Save failed — retry</span>
            )}
            <Button variant="gold" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </header>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          <div className="mx-auto max-w-3xl space-y-6">
            {activeSection === "hotel" && (
              <>
                <AdminInput label="Hotel Name" value={content.hotel.name} onChange={(e) => update("hotel", { ...content.hotel, name: e.target.value })} />
                <AdminInput label="Tagline" value={content.hotel.tagline} onChange={(e) => update("hotel", { ...content.hotel, tagline: e.target.value })} />
                <AdminTextarea label="Description" rows={3} value={content.hotel.description} onChange={(e) => update("hotel", { ...content.hotel, description: e.target.value })} />
                <AdminInput label="Location" value={content.hotel.location} onChange={(e) => update("hotel", { ...content.hotel, location: e.target.value })} />
                <AdminInput label="Address" value={content.hotel.address} onChange={(e) => update("hotel", { ...content.hotel, address: e.target.value })} />
                <AdminInput label="Phone" value={content.hotel.phone} onChange={(e) => update("hotel", { ...content.hotel, phone: e.target.value })} />
                <AdminInput label="Email" value={content.hotel.email} onChange={(e) => update("hotel", { ...content.hotel, email: e.target.value })} />
                <AdminInput label="Facebook URL" value={content.hotel.social.facebook} onChange={(e) => update("hotel", { ...content.hotel, social: { ...content.hotel.social, facebook: e.target.value } })} />
                <AdminInput label="Instagram URL" value={content.hotel.social.instagram} onChange={(e) => update("hotel", { ...content.hotel, social: { ...content.hotel.social, instagram: e.target.value } })} />
                <AdminInput label="Twitter URL" value={content.hotel.social.twitter} onChange={(e) => update("hotel", { ...content.hotel, social: { ...content.hotel.social, twitter: e.target.value } })} />
                <AdminInput label="TripAdvisor URL" value={content.hotel.social.tripadvisor} onChange={(e) => update("hotel", { ...content.hotel, social: { ...content.hotel.social, tripadvisor: e.target.value } })} />
              </>
            )}

            {activeSection === "dashboard" && (
              <div className="space-y-4 rounded border border-luxury-gold/10 p-6">
                <p className="text-sm text-white/70">Welcome to Orbit CMS. Changes auto-save to the database as you edit.</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-white/50">
                  <p>Rooms: {content.rooms.length}</p>
                  <p>Gallery: {content.gallery.length}</p>
                  <p>Reviews: {content.reviews.length}</p>
                  <p>Media: {content.mediaLibrary.length}</p>
                </div>
              </div>
            )}

            {activeSection === "theme" && (
              <>
                <AdminInput label="Primary Color" value={content.theme.primary} onChange={(e) => update("theme", { ...content.theme, primary: e.target.value })} />
                <AdminInput label="Secondary Color" value={content.theme.secondary} onChange={(e) => update("theme", { ...content.theme, secondary: e.target.value })} />
                <AdminInput label="Accent (Gold)" value={content.theme.accent} onChange={(e) => update("theme", { ...content.theme, accent: e.target.value })} />
                <AdminInput label="Champagne Gold" value={content.theme.champagne} onChange={(e) => update("theme", { ...content.theme, champagne: e.target.value })} />
                <AdminInput label="Background" value={content.theme.background} onChange={(e) => update("theme", { ...content.theme, background: e.target.value })} />
                <AdminInput label="Border Radius" value={content.theme.borderRadius} onChange={(e) => update("theme", { ...content.theme, borderRadius: e.target.value })} />
                <AdminInput label="Animation Speed (slow/normal/fast)" value={content.theme.animationSpeed} onChange={(e) => update("theme", { ...content.theme, animationSpeed: e.target.value as "slow" | "normal" | "fast" })} />
                <AdminInput label="Header Style (glass/solid/transparent)" value={content.theme.headerStyle} onChange={(e) => update("theme", { ...content.theme, headerStyle: e.target.value as "glass" | "solid" | "transparent" })} />
                <AdminInput label="Footer Style (cream/gradient/champagne)" value={content.theme.footerStyle} onChange={(e) => update("theme", { ...content.theme, footerStyle: e.target.value as "cream" | "gradient" | "champagne" })} />
              </>
            )}

            {activeSection === "header" && (
              <>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.header.useLogo} onChange={(e) => update("header", { ...content.header, useLogo: e.target.checked })} className="accent-luxury-gold" />
                  Use Logo instead of Text
                </label>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.header.showText} onChange={(e) => update("header", { ...content.header, showText: e.target.checked })} className="accent-luxury-gold" />
                  Show Text
                </label>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.header.hideText} onChange={(e) => update("header", { ...content.header, hideText: e.target.checked })} className="accent-luxury-gold" />
                  Hide Header Text
                </label>
                <AdminInput label="Header Text" value={content.header.headerText} onChange={(e) => update("header", { ...content.header, headerText: e.target.value })} />
                <AdminInput label="Logo URL" value={content.header.logoSrc} onChange={(e) => update("header", { ...content.header, logoSrc: e.target.value })} />
                <ImagePicker label="Header Logo" folder="logo" category="General" value={content.header.logoSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => update("header", { ...content.header, logoSrc: url })} />
                <Button type="button" variant="outline" size="sm" className="border-red-400/30 text-red-400" onClick={() => update("header", { ...content.header, logoSrc: "", useLogo: false })}>Remove Logo</Button>
                <AdminInput label="Logo Size (px)" type="number" value={content.header.logoSize} onChange={(e) => update("header", { ...content.header, logoSize: Number(e.target.value) })} />
                <AdminInput label="Header Height (px)" type="number" value={content.header.height} onChange={(e) => update("header", { ...content.header, height: Number(e.target.value) })} />
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.header.sticky} onChange={(e) => update("header", { ...content.header, sticky: e.target.checked })} className="accent-luxury-gold" />
                  Sticky Header
                </label>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.header.transparent} onChange={(e) => update("header", { ...content.header, transparent: e.target.checked })} className="accent-luxury-gold" />
                  Transparent on Home
                </label>
                <AdminInput label="Background Color" value={content.header.backgroundColor} onChange={(e) => update("header", { ...content.header, backgroundColor: e.target.value })} />
                <AdminInput label="Text Color" value={content.header.textColor} onChange={(e) => update("header", { ...content.header, textColor: e.target.value })} />
                <AdminInput label="Phone" value={content.header.phone} onChange={(e) => update("header", { ...content.header, phone: e.target.value })} />
                <AdminInput label="Book Button Text" value={content.header.bookButtonText} onChange={(e) => update("header", { ...content.header, bookButtonText: e.target.value })} />
              </>
            )}

            {activeSection === "hero" && (
              <HeroBuilder
                hero={content.hero}
                rooms={content.rooms}
                onChange={(hero) => update("hero", hero)}
                library={content.mediaLibrary}
                onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              />
            )}

            {activeSection === "homepage" && (
              <>
                {(Object.keys(content.homeSections) as Array<keyof SiteContent["homeSections"]>).map((key) => {
                  const section = content.homeSections[key];
                  return (
                    <div key={key} className="space-y-3 border border-luxury-gold/10 p-4">
                      <p className="font-medium capitalize text-luxury-gold">{key.replace(/([A-Z])/g, " $1")}</p>
                      <label className="flex items-center gap-3 text-sm text-white/70">
                        <input type="checkbox" checked={section.enabled} onChange={(e) => update("homeSections", { ...content.homeSections, [key]: { ...section, enabled: e.target.checked } })} className="accent-luxury-gold" />
                        Enabled
                      </label>
                      <AdminInput label="Order" type="number" value={section.order} onChange={(e) => update("homeSections", { ...content.homeSections, [key]: { ...section, order: Number(e.target.value) } })} />
                      {"title" in section && (
                        <>
                          <AdminInput label="Title" value={section.title ?? ""} onChange={(e) => update("homeSections", { ...content.homeSections, [key]: { ...section, title: e.target.value } })} />
                          <AdminTextarea label="Description" rows={2} value={section.description ?? ""} onChange={(e) => update("homeSections", { ...content.homeSections, [key]: { ...section, description: e.target.value } })} />
                        </>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {activeSection === "overview" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Luxury Showcase Section</p>
                  <p className="text-xs text-white/40">
                    First content section below the Hero. Not a hero/banner. Edits update the live welcome showcase.
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.homeSections.welcome.enabled}
                      onChange={(e) =>
                        update("homeSections", {
                          ...content.homeSections,
                          welcome: { ...content.homeSections.welcome, enabled: e.target.checked },
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Showcase Section
                  </label>
                  <AdminInput label="Welcome Text (eyebrow)" value={content.overview.eyebrow} onChange={(e) => update("overview", { ...content.overview, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.overview.title} onChange={(e) => update("overview", { ...content.overview, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={3} value={content.overview.content} onChange={(e) => update("overview", { ...content.overview, content: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Colors &amp; Spacing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Top Background" value={content.overview.backgroundTop} onChange={(e) => update("overview", { ...content.overview, backgroundTop: e.target.value })} />
                    <AdminInput label="Stats Band Background" value={content.overview.backgroundBottom} onChange={(e) => update("overview", { ...content.overview, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.overview.headingColor} onChange={(e) => update("overview", { ...content.overview, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.overview.bodyColor} onChange={(e) => update("overview", { ...content.overview, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.overview.goldColor} onChange={(e) => update("overview", { ...content.overview, goldColor: e.target.value })} />
                    <AdminInput label="Section Padding Y (px)" type="number" value={content.overview.spacing.sectionPaddingY} onChange={(e) => update("overview", { ...content.overview, spacing: { ...content.overview.spacing, sectionPaddingY: Number(e.target.value) } })} />
                    <AdminInput label="Slider Max Height (px)" type="number" value={content.overview.spacing.sliderMaxHeight} onChange={(e) => update("overview", { ...content.overview, spacing: { ...content.overview.spacing, sliderMaxHeight: Number(e.target.value) } })} />
                  </div>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Slider Settings</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    {(
                      [
                        ["autoPlay", "Auto Play"],
                        ["loop", "Loop"],
                        ["showArrows", "Show Arrows"],
                        ["showDots", "Show Dots"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(content.overview.slider[key])}
                          onChange={(e) =>
                            update("overview", {
                              ...content.overview,
                              slider: { ...content.overview.slider, [key]: e.target.checked },
                            })
                          }
                          className="accent-luxury-gold"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <AdminInput label="Slide Duration (ms)" type="number" value={content.overview.slider.slideDurationMs} onChange={(e) => update("overview", { ...content.overview, slider: { ...content.overview.slider, slideDurationMs: Number(e.target.value) } })} />
                    <AdminInput label="Transition Speed (ms)" type="number" value={content.overview.slider.transitionSpeedMs} onChange={(e) => update("overview", { ...content.overview, slider: { ...content.overview.slider, transitionSpeedMs: Number(e.target.value) } })} />
                    <AdminInput label="Max Images" type="number" value={content.overview.slider.maxImages} onChange={(e) => update("overview", { ...content.overview, slider: { ...content.overview.slider, maxImages: Number(e.target.value) } })} />
                  </div>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg text-luxury-gold">Slider Images</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-luxury-gold/30 text-luxury-gold"
                      onClick={() => {
                        const slides = [...content.overview.slider.slides];
                        if (slides.length >= (content.overview.slider.maxImages || 12)) return;
                        slides.push({
                          id: `slide-${Date.now()}`,
                          src: "",
                          alt: `Showcase image ${slides.length + 1}`,
                          enabled: true,
                          order: slides.length,
                        });
                        update("overview", {
                          ...content.overview,
                          slider: { ...content.overview.slider, slides },
                          galleryImages: slides.map((s) => s.src).filter(Boolean),
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Image
                    </Button>
                  </div>
                  {[...content.overview.slider.slides]
                    .sort((a, b) => a.order - b.order)
                    .map((slide, sortedIndex) => {
                      const i = content.overview.slider.slides.findIndex((s) => s.id === slide.id);
                      return (
                        <div key={slide.id} className="space-y-3 border border-luxury-gold/10 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-luxury-gold/80">Image {sortedIndex + 1}</p>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 text-xs text-white/60">
                                <input
                                  type="checkbox"
                                  checked={slide.enabled !== false}
                                  onChange={(e) => {
                                    const slides = [...content.overview.slider.slides];
                                    slides[i] = { ...slide, enabled: e.target.checked };
                                    update("overview", {
                                      ...content.overview,
                                      slider: { ...content.overview.slider, slides },
                                    });
                                  }}
                                  className="accent-luxury-gold"
                                />
                                Enabled
                              </label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-red-400/30 text-red-400"
                                onClick={() => {
                                  const slides = content.overview.slider.slides
                                    .filter((_, idx) => idx !== i)
                                    .map((s, order) => ({ ...s, order }));
                                  update("overview", {
                                    ...content.overview,
                                    slider: { ...content.overview.slider, slides },
                                    galleryImages: slides.map((s) => s.src).filter(Boolean),
                                  });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          <ImagePicker
                            label={`Showcase Image ${sortedIndex + 1}`}
                            folder="gallery"
                            category="Gallery"
                            value={slide.src}
                            library={content.mediaLibrary}
                            onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                            onChange={(url) => {
                              const slides = [...content.overview.slider.slides];
                              slides[i] = { ...slide, src: url };
                              update("overview", {
                                ...content.overview,
                                slider: { ...content.overview.slider, slides },
                                galleryImages: slides.map((s) => s.src).filter(Boolean),
                              });
                            }}
                          />
                          <AdminInput
                            label="Alt Text"
                            value={slide.alt}
                            onChange={(e) => {
                              const slides = [...content.overview.slider.slides];
                              slides[i] = { ...slide, alt: e.target.value };
                              update("overview", {
                                ...content.overview,
                                slider: { ...content.overview.slider, slides },
                              });
                            }}
                          />
                          <AdminInput
                            label="Order"
                            type="number"
                            value={slide.order}
                            onChange={(e) => {
                              const slides = [...content.overview.slider.slides];
                              slides[i] = { ...slide, order: Number(e.target.value) };
                              update("overview", {
                                ...content.overview,
                                slider: { ...content.overview.slider, slides },
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Statistics Cards</p>
                  {content.overview.stats.map((stat, i) => (
                    <div key={stat.id || i} className="space-y-3 border border-luxury-gold/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-luxury-gold/80">Card {i + 1}</p>
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={stat.enabled !== false}
                            onChange={(e) => {
                              const stats = [...content.overview.stats];
                              stats[i] = { ...stat, enabled: e.target.checked };
                              update("overview", { ...content.overview, stats });
                            }}
                            className="accent-luxury-gold"
                          />
                          Visible
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <AdminInput label="Number" type="number" value={stat.value} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, value: Number(e.target.value) };
                          update("overview", { ...content.overview, stats });
                        }} />
                        <AdminInput label="Suffix" value={stat.suffix} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, suffix: e.target.value };
                          update("overview", { ...content.overview, stats });
                        }} />
                        <AdminInput label="Order" type="number" value={stat.order} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, order: Number(e.target.value) };
                          update("overview", { ...content.overview, stats });
                        }} />
                      </div>
                      <AdminInput label="Label" value={stat.label} onChange={(e) => {
                        const stats = [...content.overview.stats];
                        stats[i] = { ...stat, label: e.target.value };
                        update("overview", { ...content.overview, stats });
                      }} />
                      <AdminInput label="Icon (crown / bed / users / star / sparkles)" value={stat.icon} onChange={(e) => {
                        const stats = [...content.overview.stats];
                        stats[i] = { ...stat, icon: e.target.value };
                        update("overview", { ...content.overview, stats });
                      }} />
                      <div className="grid grid-cols-3 gap-3">
                        <AdminInput label="Card Background" value={stat.backgroundColor} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, backgroundColor: e.target.value };
                          update("overview", { ...content.overview, stats });
                        }} />
                        <AdminInput label="Text Color" value={stat.textColor} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, textColor: e.target.value };
                          update("overview", { ...content.overview, stats });
                        }} />
                        <AdminInput label="Border Color" value={stat.borderColor} onChange={(e) => {
                          const stats = [...content.overview.stats];
                          stats[i] = { ...stat, borderColor: e.target.value };
                          update("overview", { ...content.overview, stats });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "experiences" && (
              <>
                {content.experiences.map((exp, i) => (
                  <div key={exp.id} className="space-y-4 border border-luxury-gold/10 p-6">
                    <div className="flex items-center gap-2 text-luxury-gold">
                      {exp.variant === "spa" ? <Waves className="h-4 w-4" /> : <Utensils className="h-4 w-4" />}
                      <span className="text-sm font-medium">{exp.title}</span>
                    </div>
                    <AdminInput label="Title" value={exp.title} onChange={(e) => {
                      const experiences = [...content.experiences];
                      experiences[i] = { ...exp, title: e.target.value };
                      update("experiences", experiences);
                    }} />
                    <AdminTextarea label="Content" rows={3} value={exp.content} onChange={(e) => {
                      const experiences = [...content.experiences];
                      experiences[i] = { ...exp, content: e.target.value };
                      update("experiences", experiences);
                    }} />
                    <AdminInput label="Image URL" value={exp.imageSrc} onChange={(e) => {
                      const experiences = [...content.experiences];
                      experiences[i] = { ...exp, imageSrc: e.target.value };
                      update("experiences", experiences);
                    }} />
                    <ImagePicker label="Experience Image" folder="dining" category="Dining" value={exp.imageSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => {
                      const experiences = [...content.experiences];
                      experiences[i] = { ...exp, imageSrc: url };
                      update("experiences", experiences);
                    }} />
                  </div>
                ))}
              </>
            )}

            {activeSection === "culture" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Cultural Experience Section</p>
                  <p className="text-xs text-white/40">
                    Second homepage content section (below Welcome). Not a hero/banner.
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.homeSections.aboutPreview.enabled}
                      onChange={(e) =>
                        update("homeSections", {
                          ...content.homeSections,
                          aboutPreview: { ...content.homeSections.aboutPreview, enabled: e.target.checked },
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.culture.eyebrow} onChange={(e) => update("culture", { ...content.culture, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.culture.title} onChange={(e) => update("culture", { ...content.culture, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={3} value={content.culture.description} onChange={(e) => update("culture", { ...content.culture, description: e.target.value })} />
                  <AdminTextarea label="Long Content (archive / page use)" rows={6} value={content.culture.content} onChange={(e) => update("culture", { ...content.culture, content: e.target.value })} />
                  <AdminInput label="Quote" value={content.culture.quote} onChange={(e) => update("culture", { ...content.culture, quote: e.target.value })} />
                  <AdminInput label="Quote Author" value={content.culture.quoteAuthor} onChange={(e) => update("culture", { ...content.culture, quoteAuthor: e.target.value })} />
                  <AdminInput label="Highlights Label" value={content.culture.highlightsLabel} onChange={(e) => update("culture", { ...content.culture, highlightsLabel: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Colors &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.culture.backgroundTop} onChange={(e) => update("culture", { ...content.culture, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.culture.backgroundBottom} onChange={(e) => update("culture", { ...content.culture, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.culture.headingColor} onChange={(e) => update("culture", { ...content.culture, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.culture.bodyColor} onChange={(e) => update("culture", { ...content.culture, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.culture.goldColor} onChange={(e) => update("culture", { ...content.culture, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.culture.showMist !== false}
                      onChange={(e) => update("culture", { ...content.culture, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Temple Silhouettes
                  </label>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Images</p>
                  <AdminMediaField
                    label="Main Image"
                    folder="culture"
                    value={content.culture.media}
                    onChange={(media) =>
                      update("culture", {
                        ...content.culture,
                        media,
                        imageSrc: media.imageSrc || content.culture.imageSrc,
                      })
                    }
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  />
                  <ImagePicker
                    label="Circular Overlap Image"
                    folder="culture"
                    category="Culture"
                    value={content.culture.circularImage}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                    onChange={(url) => update("culture", { ...content.culture, circularImage: url })}
                  />
                  <AdminInput label="Circular Image Alt" value={content.culture.circularImageAlt} onChange={(e) => update("culture", { ...content.culture, circularImageAlt: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Floating Badge</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.culture.badge.enabled !== false}
                      onChange={(e) => update("culture", { ...content.culture, badge: { ...content.culture.badge, enabled: e.target.checked } })}
                      className="accent-luxury-gold"
                    />
                    Show Badge
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Badge Number" value={content.culture.badge.number} onChange={(e) => update("culture", { ...content.culture, badge: { ...content.culture.badge, number: e.target.value } })} />
                    <AdminInput label="Emphasis Phrase" value={content.culture.badge.emphasis} onChange={(e) => update("culture", { ...content.culture, badge: { ...content.culture.badge, emphasis: e.target.value } })} />
                  </div>
                  <AdminTextarea label="Badge Description" rows={2} value={content.culture.badge.description} onChange={(e) => update("culture", { ...content.culture, badge: { ...content.culture.badge, description: e.target.value } })} />
                  <ImagePicker
                    label="Badge Icon (optional — leave empty for gold seal)"
                    folder="culture"
                    category="Culture"
                    value={content.culture.badge.iconSrc}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                    onChange={(url) => update("culture", { ...content.culture, badge: { ...content.culture.badge, iconSrc: url } })}
                  />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.culture.ctaVisible !== false}
                      onChange={(e) => update("culture", { ...content.culture, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Button
                  </label>
                  <AdminInput label="Button Text" value={content.culture.ctaText} onChange={(e) => update("culture", { ...content.culture, ctaText: e.target.value })} />
                  <AdminInput label="Button Link" value={content.culture.ctaHref} onChange={(e) => update("culture", { ...content.culture, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Statistics</p>
                  {content.culture.stats.map((stat, i) => (
                    <div key={stat.id || i} className="space-y-3 border border-luxury-gold/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-luxury-gold/80">Stat {i + 1}</p>
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={stat.enabled !== false}
                            onChange={(e) => {
                              const stats = [...content.culture.stats];
                              stats[i] = { ...stat, enabled: e.target.checked };
                              update("culture", { ...content.culture, stats });
                            }}
                            className="accent-luxury-gold"
                          />
                          Visible
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <AdminInput label="Value" value={stat.value} onChange={(e) => {
                          const stats = [...content.culture.stats];
                          stats[i] = { ...stat, value: e.target.value };
                          update("culture", { ...content.culture, stats });
                        }} />
                        <AdminInput label="Icon" value={stat.icon} onChange={(e) => {
                          const stats = [...content.culture.stats];
                          stats[i] = { ...stat, icon: e.target.value };
                          update("culture", { ...content.culture, stats });
                        }} />
                        <AdminInput label="Order" type="number" value={stat.order ?? i} onChange={(e) => {
                          const stats = [...content.culture.stats];
                          stats[i] = { ...stat, order: Number(e.target.value) };
                          update("culture", { ...content.culture, stats });
                        }} />
                      </div>
                      <AdminInput label="Label" value={stat.label} onChange={(e) => {
                        const stats = [...content.culture.stats];
                        stats[i] = { ...stat, label: e.target.value };
                        update("culture", { ...content.culture, stats });
                      }} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Feature Cards</p>
                  {content.culture.highlights.map((item, i) => (
                    <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-luxury-gold/80">Card {i + 1}</p>
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={(e) => {
                              const highlights = [...content.culture.highlights];
                              highlights[i] = { ...item, enabled: e.target.checked };
                              update("culture", { ...content.culture, highlights });
                            }}
                            className="accent-luxury-gold"
                          />
                          Visible
                        </label>
                      </div>
                      <AdminInput label="Title" value={item.title} onChange={(e) => {
                        const highlights = [...content.culture.highlights];
                        highlights[i] = { ...item, title: e.target.value };
                        update("culture", { ...content.culture, highlights });
                      }} />
                      <AdminTextarea label="Description" rows={2} value={item.description} onChange={(e) => {
                        const highlights = [...content.culture.highlights];
                        highlights[i] = { ...item, description: e.target.value };
                        update("culture", { ...content.culture, highlights });
                      }} />
                      <div className="grid grid-cols-2 gap-3">
                        <AdminInput label="Icon" value={item.icon} onChange={(e) => {
                          const highlights = [...content.culture.highlights];
                          highlights[i] = { ...item, icon: e.target.value };
                          update("culture", { ...content.culture, highlights });
                        }} />
                        <AdminInput label="Order" type="number" value={item.order ?? i} onChange={(e) => {
                          const highlights = [...content.culture.highlights];
                          highlights[i] = { ...item, order: Number(e.target.value) };
                          update("culture", { ...content.culture, highlights });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "facilities" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Amenities Section</p>
                  <p className="text-xs text-white/40">
                    Homepage World-Class Amenities section (below The Rooms). Exactly 10 amenity cards.
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.homeSections.facilities.enabled}
                      onChange={(e) =>
                        update("homeSections", {
                          ...content.homeSections,
                          facilities: { ...content.homeSections.facilities, enabled: e.target.checked },
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.facilitiesSection.eyebrow} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.facilitiesSection.title} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={4} value={content.facilitiesSection.description} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, description: e.target.value })} />
                  <AdminTextarea label="Second Paragraph (optional)" rows={2} value={content.facilitiesSection.caption} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, caption: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.facilitiesSection.ctaVisible !== false}
                      onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Button
                  </label>
                  <AdminInput label="Button Text" value={content.facilitiesSection.ctaText} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, ctaText: e.target.value })} />
                  <AdminInput label="Button URL" value={content.facilitiesSection.ctaHref} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Background &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.facilitiesSection.backgroundTop} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.facilitiesSection.backgroundBottom} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.facilitiesSection.headingColor} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.facilitiesSection.bodyColor} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.facilitiesSection.goldColor} onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.facilitiesSection.showMist !== false}
                      onChange={(e) => update("facilitiesSection", { ...content.facilitiesSection, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Mountain Silhouettes
                  </label>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Main Image</p>
                  <AdminMediaField
                    label="Amenities Image"
                    folder="facilities"
                    value={content.facilitiesSection.media}
                    onChange={(media) => update("facilitiesSection", { ...content.facilitiesSection, media })}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Amenity Cards (10)</p>
                  {content.facilities.map((facility, i) => (
                    <div key={facility.id} className="space-y-3 border border-luxury-gold/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-luxury-gold/80">Card {i + 1}</p>
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={facility.enabled !== false}
                            onChange={(e) => {
                              const facilities = [...content.facilities];
                              facilities[i] = { ...facility, enabled: e.target.checked };
                              update("facilities", facilities);
                            }}
                            className="accent-luxury-gold"
                          />
                          Visible
                        </label>
                      </div>
                      <AdminInput label="Title" value={facility.name} onChange={(e) => {
                        const facilities = [...content.facilities];
                        facilities[i] = { ...facility, name: e.target.value };
                        update("facilities", facilities);
                      }} />
                      <AdminTextarea label="Description" rows={2} value={facility.description} onChange={(e) => {
                        const facilities = [...content.facilities];
                        facilities[i] = { ...facility, description: e.target.value };
                        update("facilities", facilities);
                      }} />
                      <div className="grid grid-cols-2 gap-3">
                        <AdminInput label="Icon (Lucide name)" value={facility.icon} onChange={(e) => {
                          const facilities = [...content.facilities];
                          facilities[i] = { ...facility, icon: e.target.value };
                          update("facilities", facilities);
                        }} />
                        <AdminInput label="Order" type="number" value={facility.order ?? i} onChange={(e) => {
                          const facilities = [...content.facilities];
                          facilities[i] = { ...facility, order: Number(e.target.value) };
                          update("facilities", facilities);
                        }} />
                      </div>
                      <ImagePicker
                        label="Custom Icon Image (optional — overrides Lucide)"
                        folder="facilities"
                        category="General"
                        value={facility.iconSrc || ""}
                        library={content.mediaLibrary}
                        onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                        onChange={(url) => {
                          const facilities = [...content.facilities];
                          facilities[i] = { ...facility, iconSrc: url };
                          update("facilities", facilities);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "fineDining" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Fine Dining Section</p>
                  <p className="text-xs text-white/40">
                    Homepage Fine Dining section — Garden View &amp; Korean Restaurant (below World-Class Amenities).
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.homeSections.dining.enabled}
                      onChange={(e) =>
                        update("homeSections", {
                          ...content.homeSections,
                          dining: { ...content.homeSections.dining, enabled: e.target.checked },
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.fineDiningSection.eyebrow} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.fineDiningSection.title} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={4} value={content.fineDiningSection.description} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, description: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.fineDiningSection.ctaVisible !== false}
                      onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Button
                  </label>
                  <AdminInput label="Button Text" value={content.fineDiningSection.ctaText} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, ctaText: e.target.value })} />
                  <AdminInput label="Button URL" value={content.fineDiningSection.ctaHref} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Background &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.fineDiningSection.backgroundTop} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.fineDiningSection.backgroundBottom} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.fineDiningSection.headingColor} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.fineDiningSection.bodyColor} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.fineDiningSection.goldColor} onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.fineDiningSection.showMist !== false}
                      onChange={(e) => update("fineDiningSection", { ...content.fineDiningSection, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Mountain Silhouettes
                  </label>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Main Image</p>
                  <AdminMediaField
                    label="Fine Dining Image"
                    folder="dining"
                    value={content.fineDiningSection.media}
                    onChange={(media) => update("fineDiningSection", { ...content.fineDiningSection, media })}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  />
                </div>
              </>
            )}

            {activeSection === "lobbyCafe" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Lobby Café Section</p>
                  <p className="text-xs text-white/40">
                    Homepage Lobby Café section — Cafe in Lobby Area (below Fine Dining).
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.lobbyCafeSection.enabled !== false}
                      onChange={(e) =>
                        update("lobbyCafeSection", {
                          ...content.lobbyCafeSection,
                          enabled: e.target.checked,
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.lobbyCafeSection.eyebrow} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.lobbyCafeSection.title} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={4} value={content.lobbyCafeSection.description} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, description: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.lobbyCafeSection.ctaVisible !== false}
                      onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Button
                  </label>
                  <AdminInput label="Button Text" value={content.lobbyCafeSection.ctaText} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, ctaText: e.target.value })} />
                  <AdminInput label="Button URL" value={content.lobbyCafeSection.ctaHref} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Background &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.lobbyCafeSection.backgroundTop} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.lobbyCafeSection.backgroundBottom} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.lobbyCafeSection.headingColor} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.lobbyCafeSection.bodyColor} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.lobbyCafeSection.goldColor} onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.lobbyCafeSection.showMist !== false}
                      onChange={(e) => update("lobbyCafeSection", { ...content.lobbyCafeSection, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Mountain Silhouettes
                  </label>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Main Image</p>
                  <AdminMediaField
                    label="Lobby Café Image"
                    folder="dining"
                    value={content.lobbyCafeSection.media}
                    onChange={(media) => update("lobbyCafeSection", { ...content.lobbyCafeSection, media })}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  />
                </div>
              </>
            )}

            {activeSection === "rooftopExperience" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Rooftop Experience Section</p>
                  <p className="text-xs text-white/40">
                    Homepage Rooftop Experience section — Sky Lounge Restaurant &amp; Bar (below Lobby Café).
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.rooftopExperienceSection.enabled !== false}
                      onChange={(e) =>
                        update("rooftopExperienceSection", {
                          ...content.rooftopExperienceSection,
                          enabled: e.target.checked,
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.rooftopExperienceSection.eyebrow} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.rooftopExperienceSection.title} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, title: e.target.value })} />
                  <AdminTextarea label="Description" rows={4} value={content.rooftopExperienceSection.description} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, description: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.rooftopExperienceSection.ctaVisible !== false}
                      onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Button
                  </label>
                  <AdminInput label="Button Text" value={content.rooftopExperienceSection.ctaText} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, ctaText: e.target.value })} />
                  <AdminInput label="Button URL" value={content.rooftopExperienceSection.ctaHref} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Background &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.rooftopExperienceSection.backgroundTop} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.rooftopExperienceSection.backgroundBottom} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.rooftopExperienceSection.headingColor} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.rooftopExperienceSection.bodyColor} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.rooftopExperienceSection.goldColor} onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.rooftopExperienceSection.showMist !== false}
                      onChange={(e) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Mountain Silhouettes
                  </label>
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Main Image</p>
                  <AdminMediaField
                    label="Rooftop Experience Image"
                    folder="dining"
                    value={content.rooftopExperienceSection.media}
                    onChange={(media) => update("rooftopExperienceSection", { ...content.rooftopExperienceSection, media })}
                    library={content.mediaLibrary}
                    onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                  />
                </div>
              </>
            )}

            {activeSection === "rooms" && (
              <>
                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Rooms Section</p>
                  <p className="text-xs text-white/40">
                    Homepage Accommodations section (below Cultural Experience). Card structure stays; atmosphere is editable.
                  </p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.homeSections.rooms.enabled}
                      onChange={(e) =>
                        update("homeSections", {
                          ...content.homeSections,
                          rooms: { ...content.homeSections.rooms, enabled: e.target.checked },
                        })
                      }
                      className="accent-luxury-gold"
                    />
                    Show Section
                  </label>
                  <AdminInput label="Small Label (eyebrow)" value={content.roomsSection.eyebrow} onChange={(e) => update("roomsSection", { ...content.roomsSection, eyebrow: e.target.value })} />
                  <AdminInput label="Main Heading" value={content.roomsSection.title} onChange={(e) => update("roomsSection", { ...content.roomsSection, title: e.target.value })} />
                  <AdminTextarea label="Description (archive)" rows={2} value={content.roomsSection.description} onChange={(e) => update("roomsSection", { ...content.roomsSection, description: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Discover Button</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.roomsSection.ctaVisible !== false}
                      onChange={(e) => update("roomsSection", { ...content.roomsSection, ctaVisible: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Discover Button
                  </label>
                  <AdminInput label="Button Text" value={content.roomsSection.ctaText} onChange={(e) => update("roomsSection", { ...content.roomsSection, ctaText: e.target.value })} />
                  <AdminInput label="Button URL" value={content.roomsSection.ctaHref} onChange={(e) => update("roomsSection", { ...content.roomsSection, ctaHref: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Background &amp; Atmosphere</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Background Top" value={content.roomsSection.backgroundTop} onChange={(e) => update("roomsSection", { ...content.roomsSection, backgroundTop: e.target.value })} />
                    <AdminInput label="Background Bottom" value={content.roomsSection.backgroundBottom} onChange={(e) => update("roomsSection", { ...content.roomsSection, backgroundBottom: e.target.value })} />
                    <AdminInput label="Heading Color" value={content.roomsSection.headingColor} onChange={(e) => update("roomsSection", { ...content.roomsSection, headingColor: e.target.value })} />
                    <AdminInput label="Body Color" value={content.roomsSection.bodyColor} onChange={(e) => update("roomsSection", { ...content.roomsSection, bodyColor: e.target.value })} />
                    <AdminInput label="Gold Accent" value={content.roomsSection.goldColor} onChange={(e) => update("roomsSection", { ...content.roomsSection, goldColor: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={content.roomsSection.showMist !== false}
                      onChange={(e) => update("roomsSection", { ...content.roomsSection, showMist: e.target.checked })}
                      className="accent-luxury-gold"
                    />
                    Show Mist / Mountain Silhouettes
                  </label>
                </div>

                <div className="flex items-center justify-between border border-luxury-gold/10 p-4">
                  <p className="font-display text-lg text-luxury-gold">Room Cards</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-luxury-gold/30 text-luxury-gold"
                    onClick={() => update("rooms", [...content.rooms, {
                      id: `room-${Date.now()}`,
                      name: "New Room",
                      price: 50,
                      guests: "2 Guests",
                      maxGuests: 2,
                      size: "30 m²",
                      bedType: "Queen Bed",
                      features: ["Premium Comfort"],
                      description: "A luxurious room designed for your comfort.",
                      longDescription: "A luxurious room designed for your comfort with premium amenities and refined service.",
                      imageSrc: "/media/rooms/super-deluxe.jpg",
                      gallery: ["/media/rooms/super-deluxe.jpg"],
                      amenities: ["Premium Comfort", "Complimentary Wi-Fi"],
                      policies: ["Check-in from 2:00 PM · Check-out by 12:00 PM"],
                      available: true,
                      visible: true,
                      order: content.rooms.length,
                      exploreText: "Explore Room",
                      breakfastPrice: 15,
                    }])}
                  >
                    <Plus className="h-4 w-4" /> Add Room
                  </Button>
                </div>
                {content.rooms.map((room, i) => (
                  <div key={room.id} className="space-y-4 border border-luxury-gold/10 p-6">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg text-luxury-gold">{room.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => update("rooms", content.rooms.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <AdminInput label="Room Name" value={room.name} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, name: e.target.value };
                      update("rooms", rooms);
                    }} />
                    <div className="grid grid-cols-2 gap-4">
                      <AdminInput label="Price ($/night)" type="number" value={room.price} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, price: Number(e.target.value) };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Breakfast add-on ($)" type="number" value={room.breakfastPrice ?? 15} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, breakfastPrice: Number(e.target.value) };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Guests label" value={room.guests} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, guests: e.target.value };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Max guests" type="number" value={room.maxGuests ?? 2} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, maxGuests: Number(e.target.value) };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Size" value={room.size} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, size: e.target.value };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Bed Type" value={room.bedType} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, bedType: e.target.value };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Display Order" type="number" value={room.order ?? i} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, order: Number(e.target.value) };
                        update("rooms", rooms);
                      }} />
                      <AdminInput label="Explore Button Text" value={room.exploreText || "Explore Room"} onChange={(e) => {
                        const rooms = [...content.rooms];
                        rooms[i] = { ...room, exploreText: e.target.value };
                        update("rooms", rooms);
                      }} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={room.visible !== false}
                          onChange={(e) => {
                            const rooms = [...content.rooms];
                            rooms[i] = { ...room, visible: e.target.checked };
                            update("rooms", rooms);
                          }}
                          className="accent-luxury-gold"
                        />
                        Show on Homepage
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={room.available !== false}
                          onChange={(e) => {
                            const rooms = [...content.rooms];
                            rooms[i] = { ...room, available: e.target.checked };
                            update("rooms", rooms);
                          }}
                          className="accent-luxury-gold"
                        />
                        Available for booking
                      </label>
                    </div>
                    <AdminInput label="Features (comma separated)" value={room.features.join(", ")} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, features: e.target.value.split(",").map((f) => f.trim()) };
                      update("rooms", rooms);
                    }} />
                    <AdminTextarea label="Description" rows={2} value={room.description} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, description: e.target.value };
                      update("rooms", rooms);
                    }} />
                    <AdminTextarea label="Long Description (Detail Page)" rows={4} value={room.longDescription} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, longDescription: e.target.value };
                      update("rooms", rooms);
                    }} />
                    <ImagePicker label="Room Cover Image" folder="rooms" category="Rooms" value={room.imageSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, imageSrc: url };
                      update("rooms", rooms);
                    }} />
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">Gallery images</p>
                      {(room.gallery.length ? room.gallery : [room.imageSrc]).map((src, gi) => (
                        <div key={`${room.id}-gallery-${gi}`} className="flex items-end gap-2">
                          <div className="flex-1">
                            <ImagePicker label={`Gallery Image ${gi + 1}`} folder="rooms" category="Rooms" value={src} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => {
                                const rooms = [...content.rooms];
                                const gallery = [...(room.gallery.length ? room.gallery : [room.imageSrc])];
                                gallery[gi] = url;
                                rooms[i] = { ...room, gallery };
                                update("rooms", rooms);
                              }} />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-400"
                            onClick={() => {
                              const rooms = [...content.rooms];
                              const gallery = (room.gallery.length ? room.gallery : [room.imageSrc]).filter((_, idx) => idx !== gi);
                              rooms[i] = { ...room, gallery: gallery.length ? gallery : [room.imageSrc] };
                              update("rooms", rooms);
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
                        onClick={() => {
                          const rooms = [...content.rooms];
                          const gallery = [...(room.gallery.length ? room.gallery : [room.imageSrc]), room.imageSrc];
                          rooms[i] = { ...room, gallery };
                          update("rooms", rooms);
                        }}
                      >
                        <Plus className="h-4 w-4" /> Add Gallery Image
                      </Button>
                    </div>
                    <AdminInput label="Amenities (comma separated)" value={room.amenities.join(", ")} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, amenities: e.target.value.split(",").map((f) => f.trim()).filter(Boolean) };
                      update("rooms", rooms);
                    }} />
                    <AdminTextarea label="Policies (one per line)" rows={4} value={room.policies.join("\n")} onChange={(e) => {
                      const rooms = [...content.rooms];
                      rooms[i] = { ...room, policies: e.target.value.split("\n").map((f) => f.trim()).filter(Boolean) };
                      update("rooms", rooms);
                    }} />
                  </div>
                ))}
                <div className="space-y-3 border border-luxury-gold/10 p-4">
                  <p className="text-sm font-medium text-luxury-gold">Room Booking Form</p>
                  <AdminInput label="Submit Label" value={content.roomBooking.submitLabel} onChange={(e) => update("roomBooking", { ...content.roomBooking, submitLabel: e.target.value })} />
                  <AdminInput label="Pay Online Label" value={content.roomBooking.payOnlineLabel} onChange={(e) => update("roomBooking", { ...content.roomBooking, payOnlineLabel: e.target.value })} />
                  <AdminInput label="Pay At Hotel Label" value={content.roomBooking.payAtHotelLabel} onChange={(e) => update("roomBooking", { ...content.roomBooking, payAtHotelLabel: e.target.value })} />
                  <AdminInput label="Special Request Label" value={content.roomBooking.specialRequestLabel} onChange={(e) => update("roomBooking", { ...content.roomBooking, specialRequestLabel: e.target.value })} />
                  <AdminTextarea label="Availability Note" rows={2} value={content.roomBooking.availabilityNote} onChange={(e) => update("roomBooking", { ...content.roomBooking, availabilityNote: e.target.value })} />
                  <AdminInput label="Breakfast Room Only Label" value={content.roomBooking.breakfastRoomOnlyLabel ?? "Room Only"} onChange={(e) => update("roomBooking", { ...content.roomBooking, breakfastRoomOnlyLabel: e.target.value })} />
                  <AdminInput label="Breakfast With Label" value={content.roomBooking.breakfastWithLabel ?? "With Breakfast"} onChange={(e) => update("roomBooking", { ...content.roomBooking, breakfastWithLabel: e.target.value })} />
                  <AdminTextarea label="Breakfast Note" rows={2} value={content.roomBooking.breakfastNote ?? ""} onChange={(e) => update("roomBooking", { ...content.roomBooking, breakfastNote: e.target.value })} />
                  <AdminInput label="Confirmation Title" value={content.roomBooking.confirmationTitle ?? ""} onChange={(e) => update("roomBooking", { ...content.roomBooking, confirmationTitle: e.target.value })} />
                  <AdminTextarea label="Confirmation Message" rows={2} value={content.roomBooking.confirmationMessage ?? ""} onChange={(e) => update("roomBooking", { ...content.roomBooking, confirmationMessage: e.target.value })} />
                </div>
              </>
            )}

            {activeSection === "reviews" && (
              <>
                {content.reviews.map((review, i) => (
                  <div key={review.id} className="space-y-4 border border-luxury-gold/10 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <AdminInput label="Guest Name" value={review.name} onChange={(e) => {
                        const reviews = [...content.reviews];
                        reviews[i] = { ...review, name: e.target.value };
                        update("reviews", reviews);
                      }} />
                      <AdminInput label="Country" value={review.country} onChange={(e) => {
                        const reviews = [...content.reviews];
                        reviews[i] = { ...review, country: e.target.value };
                        update("reviews", reviews);
                      }} />
                    </div>
                    <AdminTextarea label="Review" rows={3} value={review.review} onChange={(e) => {
                      const reviews = [...content.reviews];
                      reviews[i] = { ...review, review: e.target.value };
                      update("reviews", reviews);
                    }} />
                  </div>
                ))}
              </>
            )}

            {activeSection === "gallery" && (
              <GalleryManager
                gallery={content.gallery}
                onChange={(gallery) => update("gallery", gallery)}
                library={content.mediaLibrary}
                onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                sectionTitle={content.gallerySection.title}
                sectionDescription={content.gallerySection.description}
                onSectionMetaChange={(meta) =>
                  update("gallerySection", {
                    ...content.gallerySection,
                    title: meta.title,
                    description: meta.description,
                  })
                }
              />
            )}

            {activeSection === "dining" && (
              <>
                <AdminInput label="Hero Title" value={content.diningPage.hero.title} onChange={(e) => update("diningPage", { ...content.diningPage, hero: { ...content.diningPage.hero, title: e.target.value } })} />
                <AdminTextarea label="Intro Content" rows={3} value={content.diningPage.intro.content} onChange={(e) => update("diningPage", { ...content.diningPage, intro: { ...content.diningPage.intro, content: e.target.value } })} />
                {content.diningPage.venues.map((venue, i) => (
                  <div key={venue.id} className="space-y-4 border border-luxury-gold/10 p-6">
                    <AdminInput label="Venue Name" value={venue.name} onChange={(e) => {
                      const venues = [...content.diningPage.venues];
                      venues[i] = { ...venue, name: e.target.value };
                      update("diningPage", { ...content.diningPage, venues });
                    }} />
                    <AdminTextarea label="Description" rows={2} value={venue.description} onChange={(e) => {
                      const venues = [...content.diningPage.venues];
                      venues[i] = { ...venue, description: e.target.value };
                      update("diningPage", { ...content.diningPage, venues });
                    }} />
                    <AdminInput label="Image URL" value={venue.imageSrc} onChange={(e) => {
                      const venues = [...content.diningPage.venues];
                      venues[i] = { ...venue, imageSrc: e.target.value };
                      update("diningPage", { ...content.diningPage, venues });
                    }} />
                    <ImagePicker label="Venue Image" folder="dining" category="Dining" value={venue.imageSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => {
                      const venues = [...content.diningPage.venues];
                      venues[i] = { ...venue, imageSrc: url };
                      update("diningPage", { ...content.diningPage, venues });
                    }} />
                  </div>
                ))}
                <AdminInput label="CTA Title" value={content.diningPage.cta.title} onChange={(e) => update("diningPage", { ...content.diningPage, cta: { ...content.diningPage.cta, title: e.target.value } })} />
              </>
            )}

            {activeSection === "spa" && (
              <>
                <AdminInput label="Hero Title" value={content.spaPage.hero.title} onChange={(e) => update("spaPage", { ...content.spaPage, hero: { ...content.spaPage.hero, title: e.target.value } })} />
                <AdminTextarea label="Philosophy" rows={4} value={content.spaPage.philosophy.content} onChange={(e) => update("spaPage", { ...content.spaPage, philosophy: { ...content.spaPage.philosophy, content: e.target.value } })} />
                <ImagePicker label="Philosophy Image" folder="spa" category="Spa" value={content.spaPage.philosophy.imageSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => update("spaPage", { ...content.spaPage, philosophy: { ...content.spaPage.philosophy, imageSrc: url } })} />
                {content.spaPage.services.map((service, i) => (
                  <div key={service.id} className="space-y-3 border border-luxury-gold/10 p-4">
                    <AdminInput label="Service Name" value={service.name} onChange={(e) => {
                      const services = [...content.spaPage.services];
                      services[i] = { ...service, name: e.target.value };
                      update("spaPage", { ...content.spaPage, services });
                    }} />
                    <AdminTextarea label="Description" rows={2} value={service.description} onChange={(e) => {
                      const services = [...content.spaPage.services];
                      services[i] = { ...service, description: e.target.value };
                      update("spaPage", { ...content.spaPage, services });
                    }} />
                  </div>
                ))}
                <AdminInput label="CTA Title" value={content.spaPage.cta.title} onChange={(e) => update("spaPage", { ...content.spaPage, cta: { ...content.spaPage.cta, title: e.target.value } })} />
              </>
            )}

            {activeSection === "culturalExperience" && (
              <>
                <AdminInput label="Hero Title" value={content.culturalExperiencePage.hero.title} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, hero: { ...content.culturalExperiencePage.hero, title: e.target.value } })} />
                <AdminInput label="Hero Subtitle" value={content.culturalExperiencePage.hero.subtitle} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, hero: { ...content.culturalExperiencePage.hero, subtitle: e.target.value } })} />
                <AdminTextarea label="Hero Description" rows={2} value={content.culturalExperiencePage.hero.description} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, hero: { ...content.culturalExperiencePage.hero, description: e.target.value } })} />
                <AdminMediaField
                  label="Hero Media (Image / Video)"
                  folder="culture"
                  value={content.culturalExperiencePage.hero.media}
                  onChange={(media) =>
                    update("culturalExperiencePage", {
                      ...content.culturalExperiencePage,
                      hero: {
                        ...content.culturalExperiencePage.hero,
                        media,
                        imageSrc: media.imageSrc || content.culturalExperiencePage.hero.imageSrc,
                      },
                    })
                  }
                  library={content.mediaLibrary}
                  onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                />
                <AdminInput label="SEO Title" value={content.culturalExperiencePage.seo.title} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, seo: { ...content.culturalExperiencePage.seo, title: e.target.value } })} />
                <AdminTextarea label="SEO Description" rows={2} value={content.culturalExperiencePage.seo.description} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, seo: { ...content.culturalExperiencePage.seo, description: e.target.value } })} />
                <AdminInput label="OG Image URL" value={content.culturalExperiencePage.seo.ogImage ?? ""} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, seo: { ...content.culturalExperiencePage.seo, ogImage: e.target.value } })} />
                <AdminInput label="Story Title" value={content.culturalExperiencePage.story.title} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, story: { ...content.culturalExperiencePage.story, title: e.target.value } })} />
                <AdminTextarea label="Culture Story (Rich Text)" rows={14} value={content.culturalExperiencePage.story.content} onChange={(e) => update("culturalExperiencePage", { ...content.culturalExperiencePage, story: { ...content.culturalExperiencePage.story, content: e.target.value } })} />
                {content.culturalExperiencePage.gallery.map((item, i) => (
                  <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
                    <AdminInput label="Title" value={item.title} onChange={(e) => {
                      const gallery = [...content.culturalExperiencePage.gallery];
                      gallery[i] = { ...item, title: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, gallery });
                    }} />
                    <AdminInput label="Image URL" value={item.src} onChange={(e) => {
                      const gallery = [...content.culturalExperiencePage.gallery];
                      gallery[i] = { ...item, src: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, gallery });
                    }} />
                    <ImagePicker label="Culture Image" folder="culture" category="Culture" value={item.src} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => {
                      const gallery = [...content.culturalExperiencePage.gallery];
                      gallery[i] = { ...item, src: url };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, gallery });
                    }} />
                  </div>
                ))}
                {content.culturalExperiencePage.experienceCards.map((card, i) => (
                  <div key={card.id} className="space-y-3 border border-luxury-gold/10 p-4">
                    <AdminInput label="Title" value={card.title} onChange={(e) => {
                      const experienceCards = [...content.culturalExperiencePage.experienceCards];
                      experienceCards[i] = { ...card, title: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, experienceCards });
                    }} />
                    <AdminTextarea label="Description" rows={2} value={card.description} onChange={(e) => {
                      const experienceCards = [...content.culturalExperiencePage.experienceCards];
                      experienceCards[i] = { ...card, description: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, experienceCards });
                    }} />
                  </div>
                ))}
                {content.culturalExperiencePage.faq.map((item, i) => (
                  <div key={item.id} className="space-y-3 border border-luxury-gold/10 p-4">
                    <AdminInput label="Question" value={item.question} onChange={(e) => {
                      const faq = [...content.culturalExperiencePage.faq];
                      faq[i] = { ...item, question: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, faq });
                    }} />
                    <AdminTextarea label="Answer" rows={3} value={item.answer} onChange={(e) => {
                      const faq = [...content.culturalExperiencePage.faq];
                      faq[i] = { ...item, answer: e.target.value };
                      update("culturalExperiencePage", { ...content.culturalExperiencePage, faq });
                    }} />
                  </div>
                ))}
              </>
            )}

            {activeSection === "about" && (
              <>
                <AdminTextarea label="History" rows={4} value={content.aboutPage.history.content} onChange={(e) => update("aboutPage", { ...content.aboutPage, history: { ...content.aboutPage.history, content: e.target.value } })} />
                <AdminTextarea label="Mission" rows={3} value={content.aboutPage.mission.content} onChange={(e) => update("aboutPage", { ...content.aboutPage, mission: { ...content.aboutPage.mission, content: e.target.value } })} />
                <AdminTextarea label="Vision" rows={3} value={content.aboutPage.vision.content} onChange={(e) => update("aboutPage", { ...content.aboutPage, vision: { ...content.aboutPage.vision, content: e.target.value } })} />
                {content.aboutPage.timeline.map((item, i) => (
                  <div key={item.year} className="grid grid-cols-3 gap-4 border border-luxury-gold/10 p-4">
                    <AdminInput label="Year" value={item.year} onChange={(e) => {
                      const timeline = [...content.aboutPage.timeline];
                      timeline[i] = { ...item, year: e.target.value };
                      update("aboutPage", { ...content.aboutPage, timeline });
                    }} />
                    <AdminInput label="Title" value={item.title} onChange={(e) => {
                      const timeline = [...content.aboutPage.timeline];
                      timeline[i] = { ...item, title: e.target.value };
                      update("aboutPage", { ...content.aboutPage, timeline });
                    }} />
                    <AdminTextarea label="Description" rows={2} value={item.description} onChange={(e) => {
                      const timeline = [...content.aboutPage.timeline];
                      timeline[i] = { ...item, description: e.target.value };
                      update("aboutPage", { ...content.aboutPage, timeline });
                    }} />
                  </div>
                ))}
              </>
            )}

            {activeSection === "contact" && (
              <>
                <AdminInput label="Eyebrow" value={content.contact.eyebrow} onChange={(e) => update("contact", { ...content.contact, eyebrow: e.target.value })} />
                <AdminInput label="Title" value={content.contact.title} onChange={(e) => update("contact", { ...content.contact, title: e.target.value })} />
                <AdminTextarea label="Description" rows={3} value={content.contact.description} onChange={(e) => update("contact", { ...content.contact, description: e.target.value })} />
                <AdminInput label="Working Hours" value={content.contact.workingHours} onChange={(e) => update("contact", { ...content.contact, workingHours: e.target.value })} />
                <AdminTextarea label="Google Map Embed URL" rows={2} value={content.contact.mapEmbedUrl} onChange={(e) => update("contact", { ...content.contact, mapEmbedUrl: e.target.value })} />
                <AdminInput label="Phone (Hotel Info)" value={content.hotel.phone} onChange={(e) => update("hotel", { ...content.hotel, phone: e.target.value })} />
                <AdminInput label="Email (Hotel Info)" value={content.hotel.email} onChange={(e) => update("hotel", { ...content.hotel, email: e.target.value })} />
                <AdminInput label="Address (Hotel Info)" value={content.hotel.address} onChange={(e) => update("hotel", { ...content.hotel, address: e.target.value })} />
              </>
            )}

            {activeSection === "seo" && (
              <>
                <AdminInput label="Page Title" value={content.seo.title} onChange={(e) => update("seo", { ...content.seo, title: e.target.value })} />
                <AdminTextarea label="Meta Description" rows={3} value={content.seo.description} onChange={(e) => update("seo", { ...content.seo, description: e.target.value })} />
                <AdminTextarea label="Keywords" rows={2} value={content.seo.keywords} onChange={(e) => update("seo", { ...content.seo, keywords: e.target.value })} />
                <AdminInput label="Open Graph Image URL" value={content.seo.ogImage} onChange={(e) => update("seo", { ...content.seo, ogImage: e.target.value })} />
                <ImagePicker label="OG Image" folder="seo" category="General" value={content.seo.ogImage} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => update("seo", { ...content.seo, ogImage: url })} />
                <AdminInput label="Favicon URL" value={content.seo.favicon} onChange={(e) => update("seo", { ...content.seo, favicon: e.target.value })} />
                <ImagePicker label="Favicon" folder="seo" category="General" value={content.seo.favicon} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => update("seo", { ...content.seo, favicon: url })} />
                <AdminInput label="Google Analytics ID" value={content.seo.googleAnalytics} onChange={(e) => update("seo", { ...content.seo, googleAnalytics: e.target.value })} />
                <AdminInput label="Google Tag Manager ID" value={content.seo.googleTagManager} onChange={(e) => update("seo", { ...content.seo, googleTagManager: e.target.value })} />
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={content.seo.robotsAllow} onChange={(e) => update("seo", { ...content.seo, robotsAllow: e.target.checked })} className="accent-luxury-gold" />
                  Allow search engines to index site (robots.txt)
                </label>
              </>
            )}

            {activeSection === "settings" && (
              <>
                <AdminInput label="Booking Email" value={content.settings.bookingEmail} onChange={(e) => update("settings", { ...content.settings, bookingEmail: e.target.value })} />
                <p className="text-xs text-white/40">Booking inquiries are routed to this email address.</p>
              </>
            )}

            {activeSection === "footer" && (
              <>
                <p className="text-sm text-white/50">Footer Settings — logo (240px, transparent), description, links, guest services, newsletter, payment logos, legal. Brand name: Hotel Thamel Park (no &amp; SPA).</p>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Footer Brand</p>
                  <AdminInput label="Brand Name (aria / accessibility)" value={content.footer.brandName} onChange={(e) => update("footer", { ...content.footer, brandName: e.target.value })} />
                  <AdminTextarea label="Luxury Description" rows={3} value={content.footer.description} onChange={(e) => update("footer", { ...content.footer, description: e.target.value })} />
                  <AdminInput label="Tagline (optional)" value={content.footer.tagline} onChange={(e) => update("footer", { ...content.footer, tagline: e.target.value })} />
                  <AdminInput label="Footer Logo URL" value={content.footer.logoSrc} onChange={(e) => update("footer", { ...content.footer, logoSrc: e.target.value })} />
                  <ImagePicker label="Footer Logo (240px width)" folder="logo" category="General" value={content.footer.logoSrc} library={content.mediaLibrary} onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)} onChange={(url) => update("footer", { ...content.footer, logoSrc: url })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-luxury-gold">Quick Links</p>
                    <Button type="button" variant="outline" size="sm" className="border-luxury-gold/30 text-luxury-gold" onClick={() => update("footer", { ...content.footer, quickLinks: [...content.footer.quickLinks, { label: "New Link", href: "/" }] })}>
                      <Plus className="h-4 w-4" /> Add Link
                    </Button>
                  </div>
                  {content.footer.quickLinks.map((link, i) => (
                    <div key={`${link.href}-${i}`} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                      <AdminInput label="Label" value={link.label} onChange={(e) => {
                        const quickLinks = [...content.footer.quickLinks];
                        quickLinks[i] = { ...link, label: e.target.value };
                        update("footer", { ...content.footer, quickLinks });
                      }} />
                      <AdminInput label="URL" value={link.href} onChange={(e) => {
                        const quickLinks = [...content.footer.quickLinks];
                        quickLinks[i] = { ...link, href: e.target.value };
                        update("footer", { ...content.footer, quickLinks });
                      }} />
                      <Button type="button" variant="ghost" size="sm" className="mt-6 text-red-400" onClick={() => update("footer", { ...content.footer, quickLinks: content.footer.quickLinks.filter((_, idx) => idx !== i) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Guest Services</p>
                  <AdminInput label="Phone" value={content.footer.contact.phone} onChange={(e) => update("footer", { ...content.footer, contact: { ...content.footer.contact, phone: e.target.value } })} />
                  <AdminInput label="Email" value={content.footer.contact.email} onChange={(e) => update("footer", { ...content.footer, contact: { ...content.footer.contact, email: e.target.value } })} />
                  <AdminInput label="Location" value={content.footer.contact.location} onChange={(e) => update("footer", { ...content.footer, contact: { ...content.footer.contact, location: e.target.value } })} />
                  <AdminInput label="24/7 Reception text" value={content.footer.contact.frontDesk} onChange={(e) => update("footer", { ...content.footer, contact: { ...content.footer.contact, frontDesk: e.target.value } })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Stay Connected</p>
                  <AdminInput label="Heading" value={content.footer.newsletter.heading} onChange={(e) => update("footer", { ...content.footer, newsletter: { ...content.footer.newsletter, heading: e.target.value } })} />
                  <AdminTextarea label="Description" rows={2} value={content.footer.newsletter.description} onChange={(e) => update("footer", { ...content.footer, newsletter: { ...content.footer.newsletter, description: e.target.value } })} />
                  <AdminInput label="Placeholder" value={content.footer.newsletter.placeholder} onChange={(e) => update("footer", { ...content.footer, newsletter: { ...content.footer.newsletter, placeholder: e.target.value } })} />
                  <AdminInput label="Button Text" value={content.footer.newsletter.buttonText} onChange={(e) => update("footer", { ...content.footer, newsletter: { ...content.footer.newsletter, buttonText: e.target.value } })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Social Icons &amp; URLs</p>
                  <p className="text-xs text-white/40">
                    Four icons only (Facebook, Instagram, Tripadvisor, Google Reviews). Upload a custom icon or leave
                    empty for the default gold glyph. Save to update the live footer immediately.
                  </p>
                  {(
                    [
                      {
                        label: "Facebook",
                        urlKey: "facebook" as const,
                        iconKey: "facebookIcon" as const,
                      },
                      {
                        label: "Instagram",
                        urlKey: "instagram" as const,
                        iconKey: "instagramIcon" as const,
                      },
                      {
                        label: "Tripadvisor",
                        urlKey: "tripadvisor" as const,
                        iconKey: "tripadvisorIcon" as const,
                      },
                      {
                        label: "Google Reviews",
                        urlKey: "googleReviews" as const,
                        iconKey: "googleReviewsIcon" as const,
                      },
                    ] as const
                  ).map((item) => (
                    <div key={item.urlKey} className="space-y-3 border border-luxury-gold/10 p-4">
                      <p className="text-sm text-luxury-gold/80">{item.label}</p>
                      <ImagePicker
                        label={`${item.label} Icon Upload`}
                        folder="social"
                        category="General"
                        value={content.footer.social[item.iconKey] || ""}
                        library={content.mediaLibrary}
                        onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                        onChange={(url) =>
                          update("footer", {
                            ...content.footer,
                            social: { ...content.footer.social, [item.iconKey]: url },
                          })
                        }
                      />
                      <AdminInput
                        label={`${item.label} URL`}
                        value={content.footer.social[item.urlKey] || ""}
                        onChange={(e) =>
                          update("footer", {
                            ...content.footer,
                            social: { ...content.footer.social, [item.urlKey]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Footer Payment Logos</p>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input type="checkbox" checked={content.footer.showPayments} onChange={(e) => update("footer", { ...content.footer, showPayments: e.target.checked })} className="accent-luxury-gold" />
                    Show Secure Payments
                  </label>
                  <AdminInput label="Payment Section Label" value={content.footer.paymentLabel} onChange={(e) => update("footer", { ...content.footer, paymentLabel: e.target.value })} />
                  <p className="text-xs text-white/40">
                    Payment Logo 1–6 (Visa, Mastercard, UnionPay, Alipay, UPI, eSewa). Upload verifies the file on disk
                    before saving. If upload or save fails, the previous logo is kept and an error is shown.
                  </p>
                  {paymentNotice ? (
                    <p
                      className={
                        paymentNotice.type === "ok"
                          ? "rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 whitespace-pre-wrap"
                          : "rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 whitespace-pre-wrap"
                      }
                    >
                      {paymentNotice.text}
                    </p>
                  ) : null}
                  {OFFICIAL_PAYMENT_LOGOS.map((official, i) => {
                    const raw = content.footer.paymentLogos?.[i]?.src ?? official.src;
                    const displaySrc = isPaymentLogoCleared(raw)
                      ? ""
                      : normalizePaymentLogoSrc(raw) || official.src;
                    const label = `Payment Logo ${i + 1} — ${official.label}`;
                    return (
                      <div key={`pay-slot-${i}`} className="space-y-2 border border-luxury-gold/10 p-4">
                        <p className="text-sm text-luxury-gold/80">{label}</p>
                        <ImagePicker
                          key={displaySrc || `empty-${i}`}
                          label={label}
                          folder="payments"
                          category="General"
                          value={displaySrc}
                          library={content.mediaLibrary}
                          keepValueOnFailedUpload
                          onLibraryChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
                          onUploadError={(message) =>
                            setPaymentNotice({ type: "err", text: message })
                          }
                          onUploadSuccess={(url) => {
                            console.info("[Orbit] Upload completed — Image URL", url);
                            setPaymentNotice({
                              type: "ok",
                              text: "Upload completed. Saving to database…",
                            });
                          }}
                          onChange={(url) => {
                            // Upload / library / clear all flow through here AFTER ImagePicker validates
                            if (!url?.trim()) {
                              void commitPaymentLogo(i, PAYMENT_LOGO_CLEARED);
                              return;
                            }
                            void commitPaymentLogo(i, url.trim());
                          }}
                        />
                        {displaySrc ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-400/30 text-red-400"
                            onClick={() => void commitPaymentLogo(i, PAYMENT_LOGO_CLEARED)}
                          >
                            Delete Logo
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Legal & Developer</p>
                  <AdminInput label="Copyright Text (after year)" value={content.footer.copyrightText} onChange={(e) => update("footer", { ...content.footer, copyrightText: e.target.value })} />
                  <AdminInput label="Developer Label" value={content.footer.developerLabel} onChange={(e) => update("footer", { ...content.footer, developerLabel: e.target.value })} />
                  <AdminInput label="Developer URL" value={content.footer.developerUrl} onChange={(e) => update("footer", { ...content.footer, developerUrl: e.target.value })} />
                </div>

                <div className="space-y-4 border border-luxury-gold/10 p-6">
                  <p className="font-display text-lg text-luxury-gold">Colors & Spacing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Top Background" value={content.footer.colors.topBackground} onChange={(e) => update("footer", { ...content.footer, colors: { ...content.footer.colors, topBackground: e.target.value } })} />
                    <AdminInput label="Bottom Background" value={content.footer.colors.bottomBackground} onChange={(e) => update("footer", { ...content.footer, colors: { ...content.footer.colors, bottomBackground: e.target.value } })} />
                    <AdminInput label="Gold Accent" value={content.footer.colors.gold} onChange={(e) => update("footer", { ...content.footer, colors: { ...content.footer.colors, gold: e.target.value } })} />
                    <AdminInput label="Text Color" value={content.footer.colors.text} onChange={(e) => update("footer", { ...content.footer, colors: { ...content.footer.colors, text: e.target.value } })} />
                  </div>
                  <AdminInput label="Section Padding Y (px)" type="number" value={content.footer.spacing.sectionPaddingY} onChange={(e) => update("footer", { ...content.footer, spacing: { ...content.footer.spacing, sectionPaddingY: Number(e.target.value) } })} />
                </div>
              </>
            )}

            {activeSection === "media" && (
              <MediaLibrary
                library={content.mediaLibrary}
                onChange={(mediaLibrary) => update("mediaLibrary", mediaLibrary)}
              />
            )}

            {activeSection === "backups" && (
              <>
                <p className="text-sm text-white/50 mb-4">Create a snapshot of all website content. Restores apply instantly.</p>
                <Button variant="gold" onClick={async () => {
                  await fetch("/api/backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", label: `Manual backup ${new Date().toLocaleString()}` }) });
                  setSaved(true);
                }}>Create Backup Now</Button>
                <p className="mt-4 text-xs text-white/40">Backups are stored in PostgreSQL.</p>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
