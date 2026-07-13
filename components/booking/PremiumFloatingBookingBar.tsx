"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Baby,
  BedDouble,
  Calendar,
  ChevronDown,
  Users,
} from "lucide-react";
import { buildAvailabilityUrl } from "@/lib/booking/utils";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";
import { defaultHeroBuilder } from "@/lib/cms/hero-builder-defaults";
import type { HeroBookingBarSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumFloatingBookingBarProps {
  rooms?: SiteContent["rooms"];
  bookingBar?: HeroBookingBarSettings;
  className?: string;
  variant?: "hero" | "inline";
}

const ICON_MAP: Record<string, LucideIcon> = {
  calendar: Calendar,
  users: Users,
  baby: Baby,
  "bed-double": BedDouble,
};

const LABEL_GOLD = "#D4B06A";
const VALUE_WHITE = "#FFFFFF";
const PLACEHOLDER_IVORY = "rgba(255,249,240,0.65)";
const FIELD_GLASS = "rgba(24,52,38,0.72)";
const FIELD_BORDER = "rgba(212,176,106,0.28)";
const FRAME_BG =
  "linear-gradient(135deg, rgba(36,71,54,0.94) 0%, rgba(24,52,38,0.92) 42%, rgba(36,71,54,0.9) 100%)";

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Calendar;
}

function formatDisplayDate(value: string) {
  if (!value) return "Select date";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mergeSettings(bookingBar?: HeroBookingBarSettings): HeroBookingBarSettings {
  const d = defaultHeroBuilder.bookingBar;
  if (!bookingBar) return { ...d, background: FRAME_BG };
  return {
    ...d,
    ...bookingBar,
    fields: { ...d.fields, ...bookingBar.fields },
    colors: { ...d.colors, ...bookingBar.colors },
    labels: { ...d.labels, ...bookingBar.labels },
    icons: { ...d.icons, ...bookingBar.icons },
    animations: { ...d.animations, ...bookingBar.animations },
    responsive: { ...d.responsive, ...bookingBar.responsive },
    background: FRAME_BG,
  };
}

interface FieldCellProps {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  bordered?: boolean;
}

function FieldCell({ id, label, icon: Icon, children, bordered = true }: FieldCellProps) {
  return (
    <div
      className={cn(
        "group flex min-h-[88px] min-w-0 flex-col justify-center px-4 py-3 transition-all duration-700",
        bordered && "border-r"
      )}
      style={{ borderColor: bordered ? "rgba(246,236,215,0.4)" : undefined }}
    >
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase"
        style={{ color: LABEL_GOLD, letterSpacing: "2px" }}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="truncate">{label}</span>
      </label>
      <div
        className="relative min-w-0 rounded-[16px] px-3.5 py-2.5 backdrop-blur-md transition-all duration-500"
        style={{
          background: FIELD_GLASS,
          border: `1px solid ${FIELD_BORDER}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DateValue({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative min-w-0">
      <div className="pointer-events-none flex items-center justify-between gap-2">
        <span
          className="truncate text-base font-bold tracking-wide md:text-lg"
          style={{ color: value ? VALUE_WHITE : PLACEHOLDER_IVORY }}
        >
          {value ? formatDisplayDate(value) : "mm / dd / yyyy"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0" style={{ color: LABEL_GOLD, opacity: 0.7 }} />
      </div>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  );
}

function SelectValue({
  id,
  value,
  onChange,
  display,
  children,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  display: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <div className="pointer-events-none flex items-center justify-between gap-2">
        <span className="truncate text-base font-bold tracking-wide md:text-lg" style={{ color: VALUE_WHITE }}>
          {display}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0" style={{ color: LABEL_GOLD, opacity: 0.7 }} />
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {children}
      </select>
    </div>
  );
}

function MobileAccordionItem({
  id,
  label,
  icon: Icon,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-luxury-gold/25 bg-luxury-green-dark/55 transition-colors duration-500 hover:border-luxury-gold/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[58px] w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0" style={{ color: LABEL_GOLD }} strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: LABEL_GOLD }}>
              {label}
            </p>
            <p className="truncate text-sm font-bold text-white">
              {summary}
            </p>
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.5, ease: luxuryEase }}>
          <ChevronDown className="h-4 w-4" style={{ color: LABEL_GOLD }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: luxuryEase }}
            className="overflow-hidden border-t border-luxury-gold/15 px-4 pb-4 pt-1"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function PremiumFloatingBookingBar({
  rooms = [],
  bookingBar,
  className,
  variant = "hero",
}: PremiumFloatingBookingBarProps) {
  const router = useRouter();
  const settings = mergeSettings(bookingBar);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [childrenCount, setChildrenCount] = useState("0");
  const [roomQuantity, setRoomQuantity] = useState("1");
  const [mobileOpen, setMobileOpen] = useState<string | null>("checkIn");

  const show = (key: keyof HeroBookingBarSettings["fields"]) => settings.fields[key] !== false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      buildAvailabilityUrl({
        checkIn,
        checkOut,
        guests,
        children: childrenCount,
        rooms: roomQuantity,
      })
    );
  };

  const roomLabel = `${roomQuantity} ${roomQuantity === "1" ? "Room" : "Rooms"}`;
  const guestLabel = `${guests} ${guests === "1" ? "Guest" : "Guests"}`;

  const visibleFieldCount = (
    ["checkIn", "checkOut", "guests", "children", "room"] as const
  ).filter((key) => show(key)).length;
  const gridColumns = `repeat(${visibleFieldCount}, minmax(0, 1fr)) minmax(168px, 1.25fr)`;

  const glassStyle: React.CSSProperties = {
    background: settings.background || FRAME_BG,
    backdropFilter: `blur(${settings.blur ?? 32}px)`,
    WebkitBackdropFilter: `blur(${settings.blur ?? 32}px)`,
    border: "1px solid rgba(212,176,106,0.35)",
    borderRadius: settings.borderRadius || "28px",
    boxShadow:
      settings.shadow ||
      "0 32px 90px rgba(10,24,18,0.35), 0 0 0 1px rgba(212,176,106,0.15), inset 0 1px 0 rgba(255,255,255,0.12)",
    boxSizing: "border-box",
  };

  const heroShellStyle: React.CSSProperties =
    variant === "hero"
      ? {
          position: "absolute",
          left: "50%",
          bottom: settings.responsive.desktopBottom ?? "0px",
          transform: "translateX(-50%)",
          width: settings.responsive.desktopWidth || "95%",
          maxWidth: settings.responsive.desktopMaxWidth || "1700px",
          zIndex: 40,
          boxSizing: "border-box",
        }
      : {};

  const mobileShellStyle: React.CSSProperties =
    variant === "hero"
      ? {
          position: "absolute",
          left: settings.responsive.mobileHorizontalInset || "12px",
          right: settings.responsive.mobileHorizontalInset || "12px",
          bottom: settings.responsive.mobileBottom ?? "0px",
          width: "auto",
          zIndex: 40,
          boxSizing: "border-box",
        }
      : {};

  const desktopForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2, ease: luxuryEase }}
      style={{ ...glassStyle, minHeight: "108px", height: "auto", padding: "8px 10px" }}
      className="hidden w-full lg:block"
    >
      <div className="grid h-full w-full items-stretch" style={{ gridTemplateColumns: gridColumns }}>
        {show("checkIn") && (
          <FieldCell id="hero-check-in" label={settings.labels.checkIn} icon={resolveIcon(settings.icons.checkIn)}>
            <DateValue id="hero-check-in" value={checkIn} onChange={setCheckIn} />
          </FieldCell>
        )}
        {show("checkOut") && (
          <FieldCell id="hero-check-out" label={settings.labels.checkOut} icon={resolveIcon(settings.icons.checkOut)}>
            <DateValue id="hero-check-out" value={checkOut} onChange={setCheckOut} />
          </FieldCell>
        )}
        {show("guests") && (
          <FieldCell id="hero-guests" label={settings.labels.guests} icon={resolveIcon(settings.icons.guests)}>
            <SelectValue id="hero-guests" value={guests} onChange={setGuests} display={guestLabel}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </SelectValue>
          </FieldCell>
        )}
        {show("children") && (
          <FieldCell id="hero-children" label={settings.labels.children} icon={resolveIcon(settings.icons.children)}>
            <SelectValue id="hero-children" value={childrenCount} onChange={setChildrenCount} display={childrenCount}>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </SelectValue>
          </FieldCell>
        )}
        {show("room") && (
          <FieldCell id="hero-room" label={settings.labels.room} icon={resolveIcon(settings.icons.room)} bordered={false}>
            <SelectValue id="hero-room" value={roomQuantity} onChange={setRoomQuantity} display={roomLabel}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Room" : "Rooms"}
                </option>
              ))}
            </SelectValue>
          </FieldCell>
        )}
        <div className="flex min-w-[168px] items-center justify-center px-1.5">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04, y: -3, boxShadow: "0 32px 70px rgba(190,150,50,0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.5, ease: luxuryEase }}
            className="group relative flex h-[80px] w-full min-w-[168px] items-center justify-center gap-2 overflow-hidden rounded-[22px] px-3 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-white xl:text-[11px] xl:tracking-[0.14em]"
            style={{
              background: settings.buttonGradient || "linear-gradient(180deg, #E8C878 0%, #C9A44C 45%, #B98B2C 100%)",
              boxShadow: settings.buttonShadow || "0 24px 60px rgba(201,164,76,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <motion.span
              className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: luxuryEase }}
            />
            <span className="relative text-center">{settings.buttonText}</span>
            <ArrowRight className="relative h-4 w-4 shrink-0 transition-transform duration-500 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.form>
  );

  const mobileForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease: luxuryEase }}
      style={{
        ...glassStyle,
        borderRadius: settings.responsive.mobileRadius || "26px",
        padding: settings.responsive.mobilePadding || "18px",
      }}
      className="lg:hidden"
    >
      <div className="flex flex-col gap-2.5">
        {show("checkIn") && (
          <MobileAccordionItem
            id="m-check-in"
            label={settings.labels.checkIn}
            icon={Calendar}
            summary={checkIn ? formatDisplayDate(checkIn) : "Select date"}
            open={mobileOpen === "checkIn"}
            onToggle={() => setMobileOpen((v) => (v === "checkIn" ? null : "checkIn"))}
          >
            <DateValue id="m-check-in" value={checkIn} onChange={setCheckIn} />
          </MobileAccordionItem>
        )}
        {show("checkOut") && (
          <MobileAccordionItem
            id="m-check-out"
            label={settings.labels.checkOut}
            icon={Calendar}
            summary={checkOut ? formatDisplayDate(checkOut) : "Select date"}
            open={mobileOpen === "checkOut"}
            onToggle={() => setMobileOpen((v) => (v === "checkOut" ? null : "checkOut"))}
          >
            <DateValue id="m-check-out" value={checkOut} onChange={setCheckOut} />
          </MobileAccordionItem>
        )}
        {show("guests") && (
          <MobileAccordionItem
            id="m-guests"
            label={settings.labels.guests}
            icon={Users}
            summary={guestLabel}
            open={mobileOpen === "guests"}
            onToggle={() => setMobileOpen((v) => (v === "guests" ? null : "guests"))}
          >
            <SelectValue id="m-guests" value={guests} onChange={setGuests} display={guestLabel}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </SelectValue>
          </MobileAccordionItem>
        )}
        {show("children") && (
          <MobileAccordionItem
            id="m-children"
            label={settings.labels.children}
            icon={Baby}
            summary={childrenCount}
            open={mobileOpen === "children"}
            onToggle={() => setMobileOpen((v) => (v === "children" ? null : "children"))}
          >
            <SelectValue id="m-children" value={childrenCount} onChange={setChildrenCount} display={childrenCount}>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </SelectValue>
          </MobileAccordionItem>
        )}
        {show("room") && (
          <MobileAccordionItem
            id="m-room"
            label={settings.labels.room}
            icon={BedDouble}
            summary={roomLabel}
            open={mobileOpen === "room"}
            onToggle={() => setMobileOpen((v) => (v === "room" ? null : "room"))}
          >
            <SelectValue id="m-room" value={roomQuantity} onChange={setRoomQuantity} display={roomLabel}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </SelectValue>
          </MobileAccordionItem>
        )}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03, y: -2, boxShadow: "0 28px 60px rgba(190,150,50,0.45)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.5, ease: luxuryEase }}
          className="group relative mt-2 flex min-h-[60px] w-full items-center justify-center gap-2 overflow-hidden rounded-[20px] text-xs font-bold uppercase tracking-[0.18em] text-white"
          style={{
            background: settings.buttonGradient || "linear-gradient(180deg, #E8C878 0%, #C9A44C 45%, #B98B2C 100%)",
            boxShadow: settings.buttonShadow || "0 24px 60px rgba(201,164,76,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-150%" }}
            animate={{ x: "250%" }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: luxuryEase }}
          />
          <span className="relative">{settings.buttonText}</span>
          <ArrowRight className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </motion.form>
  );

  if (variant !== "hero") {
    return (
      <div className={cn("w-full", className)}>
        {desktopForm}
        {mobileForm}
      </div>
    );
  }

  return (
    <>
      <div style={heroShellStyle} className={cn("pointer-events-none hidden lg:block", className)}>
        <div className="pointer-events-auto">{desktopForm}</div>
      </div>
      <div style={mobileShellStyle} className={cn("pointer-events-none lg:hidden", className)}>
        <div className="pointer-events-auto">{mobileForm}</div>
      </div>
    </>
  );
}
