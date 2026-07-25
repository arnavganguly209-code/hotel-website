"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Baby,
  BedDouble,
  Calendar,
  Users,
} from "lucide-react";
import { LuxuryDatePicker } from "@/components/booking/LuxuryDatePicker";
import { LuxuryNumberStepper } from "@/components/booking/LuxuryNumberStepper";
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
const FIELD_GLASS = "rgba(255,255,255,0.06)";
const FIELD_BORDER = "rgba(212,176,106,0.22)";
const FRAME_BG =
  "linear-gradient(135deg, rgba(28,62,48,0.92) 0%, rgba(20,46,35,0.9) 48%, rgba(26,56,42,0.92) 100%)";

/** Practical hotel booking ceiling — not a tiny dropdown limit. */
const PRACTICAL_MAX = 999;

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Calendar;
}

function mergeSettings(bookingBar?: HeroBookingBarSettings): HeroBookingBarSettings {
  const d = defaultHeroBuilder.bookingBar;
  if (!bookingBar) return { ...d };
  return {
    ...d,
    ...bookingBar,
    background: bookingBar.background || d.background,
    borderColor: bookingBar.borderColor || d.borderColor,
    defaults: { ...d.defaults, ...bookingBar.defaults },
    fields: { ...d.fields, ...bookingBar.fields },
    colors: { ...d.colors, ...bookingBar.colors },
    labels: { ...d.labels, ...bookingBar.labels },
    icons: { ...d.icons, ...bookingBar.icons },
    animations: { ...d.animations, ...bookingBar.animations },
    responsive: { ...d.responsive, ...bookingBar.responsive },
  };
}

interface FieldCellProps {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  bordered?: boolean;
  labelColor?: string;
  dividerColor?: string;
  className?: string;
}

function FieldCell({
  id,
  label,
  icon: Icon,
  children,
  bordered = true,
  labelColor,
  dividerColor,
  className,
}: FieldCellProps) {
  return (
    <div
      className={cn(
        "group flex min-h-0 min-w-0 flex-col justify-center px-3 py-2.5 transition-all duration-500 xl:px-3.5",
        bordered && "border-r",
        className
      )}
      style={{ borderColor: bordered ? dividerColor || "rgba(201,164,76,0.22)" : undefined }}
    >
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase xl:text-[10px]"
        style={{ color: labelColor || LABEL_GOLD, letterSpacing: "0.16em" }}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={1.5} />
        <span className="truncate">{label}</span>
      </label>
      <div
        className="relative min-w-0 rounded-[12px] px-2.5 py-1.5 backdrop-blur-md transition-all duration-500 group-hover:border-[#D4B06A]/45"
        style={{
          background: FIELD_GLASS,
          border: `1px solid ${FIELD_BORDER}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MobileField({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[#D4B06A]/22 bg-white/[0.05] px-3 py-2.5 backdrop-blur-sm">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase"
        style={{ color: LABEL_GOLD, letterSpacing: "0.16em" }}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        {label}
      </label>
      {children}
    </div>
  );
}

export function PremiumFloatingBookingBar({
  bookingBar,
  className,
  variant = "hero",
}: PremiumFloatingBookingBarProps) {
  const router = useRouter();
  const settings = mergeSettings(bookingBar);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(settings.defaults?.guests || "2");
  const [childrenCount, setChildrenCount] = useState(settings.defaults?.children || "0");
  const [roomQuantity, setRoomQuantity] = useState(settings.defaults?.rooms || "1");

  const show = (key: keyof HeroBookingBarSettings["fields"]) => settings.fields[key] !== false;

  const checkoutMin = (() => {
    if (!checkIn) return undefined;
    const next = new Date(`${checkIn}T12:00:00`);
    next.setDate(next.getDate() + 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    const d = String(next.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const handleCheckIn = (value: string) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) {
      const next = new Date(`${value}T12:00:00`);
      next.setDate(next.getDate() + 1);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, "0");
      const d = String(next.getDate()).padStart(2, "0");
      setCheckOut(`${y}-${m}-${d}`);
    }
  };

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

  const glassStyle: React.CSSProperties = {
    background: settings.background || FRAME_BG,
    backdropFilter: `blur(${Math.min(settings.blur ?? 24, 28)}px)`,
    WebkitBackdropFilter: `blur(${Math.min(settings.blur ?? 24, 28)}px)`,
    border: `1px solid ${settings.borderColor || "rgba(212,176,106,0.32)"}`,
    borderRadius: settings.borderRadius || "18px",
    boxShadow:
      settings.shadow ||
      "0 22px 56px rgba(8,20,14,0.32), 0 2px 0 rgba(255,255,255,0.06) inset",
    boxSizing: "border-box",
  };

  const cellColors = {
    labelColor: settings.colors.label || LABEL_GOLD,
    dividerColor: settings.colors.divider || "rgba(201,164,76,0.22)",
  };

  const submitButton = (opts: { tall?: boolean; className?: string }) => (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02, y: -2, boxShadow: "0 22px 48px rgba(190,150,50,0.42)" }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.4, ease: luxuryEase }}
      className={cn(
        "group relative flex w-full items-center justify-center gap-2 overflow-hidden text-[10px] font-bold uppercase tracking-[0.14em]",
        opts.tall ? "h-[68px] min-w-[148px] px-3 xl:min-w-[160px]" : "min-h-[48px] px-4",
        opts.className
      )}
      style={{
        background:
          settings.buttonGradient ||
          "linear-gradient(180deg, #E8C878 0%, #C9A44C 48%, #B98B2C 100%)",
        boxShadow:
          settings.buttonShadow ||
          "0 16px 40px rgba(201,164,76,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
        color: settings.colors.buttonText || settings.buttonColor || "#1E4530",
        borderRadius: settings.buttonBorderRadius || "12px",
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-150%" }}
        animate={{ x: "220%" }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: luxuryEase }}
      />
      <span className="relative text-center leading-tight">{settings.buttonText}</span>
      <ArrowRight className="relative h-3.5 w-3.5 shrink-0 transition-transform duration-500 group-hover:translate-x-1" />
    </motion.button>
  );

  const desktopForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.15, ease: luxuryEase }}
      style={{ ...glassStyle, padding: "6px 8px" }}
      className="hidden w-full lg:block"
    >
      <div
        className="grid w-full items-stretch"
        style={{
          gridTemplateColumns:
            "minmax(0,1.15fr) minmax(0,1.15fr) minmax(0,0.85fr) minmax(0,0.75fr) minmax(0,0.85fr) minmax(148px,0.95fr)",
        }}
      >
        {show("checkIn") && (
          <FieldCell
            id="hero-check-in"
            label={settings.labels.checkIn}
            icon={resolveIcon(settings.icons.checkIn)}
            {...cellColors}
          >
            <LuxuryDatePicker id="hero-check-in" value={checkIn} onChange={handleCheckIn} />
          </FieldCell>
        )}
        {show("checkOut") && (
          <FieldCell
            id="hero-check-out"
            label={settings.labels.checkOut}
            icon={resolveIcon(settings.icons.checkOut)}
            {...cellColors}
          >
            <LuxuryDatePicker
              id="hero-check-out"
              value={checkOut}
              onChange={setCheckOut}
              min={checkoutMin}
            />
          </FieldCell>
        )}
        {show("guests") && (
          <FieldCell
            id="hero-guests"
            label={settings.labels.guests}
            icon={resolveIcon(settings.icons.guests)}
            {...cellColors}
          >
            <LuxuryNumberStepper
              id="hero-guests"
              value={guests}
              onChange={setGuests}
              min={1}
              max={PRACTICAL_MAX}
              suffix={(n) => (n === 1 ? "Guest" : "Guests")}
            />
          </FieldCell>
        )}
        {show("children") && (
          <FieldCell
            id="hero-children"
            label={settings.labels.children}
            icon={resolveIcon(settings.icons.children)}
            {...cellColors}
          >
            <LuxuryNumberStepper
              id="hero-children"
              value={childrenCount}
              onChange={setChildrenCount}
              min={0}
              max={PRACTICAL_MAX}
            />
          </FieldCell>
        )}
        {show("room") && (
          <FieldCell
            id="hero-room"
            label={settings.labels.room}
            icon={resolveIcon(settings.icons.room)}
            bordered={false}
            {...cellColors}
          >
            <LuxuryNumberStepper
              id="hero-room"
              value={roomQuantity}
              onChange={setRoomQuantity}
              min={1}
              max={PRACTICAL_MAX}
              suffix={(n) => (n === 1 ? "Room" : "Rooms")}
            />
          </FieldCell>
        )}
        <div className="flex items-center justify-center px-1.5 py-1">
          {submitButton({ tall: true })}
        </div>
      </div>
    </motion.form>
  );

  const mobileForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.1, ease: luxuryEase }}
      style={{
        ...glassStyle,
        borderRadius: settings.responsive.mobileRadius || "18px",
        padding: "14px",
      }}
      className="lg:hidden"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {show("checkIn") && (
          <MobileField id="m-check-in" label={settings.labels.checkIn} icon={Calendar}>
            <LuxuryDatePicker
              id="m-check-in"
              value={checkIn}
              onChange={handleCheckIn}
              compact
            />
          </MobileField>
        )}
        {show("checkOut") && (
          <MobileField id="m-check-out" label={settings.labels.checkOut} icon={Calendar}>
            <LuxuryDatePicker
              id="m-check-out"
              value={checkOut}
              onChange={setCheckOut}
              min={checkoutMin}
              compact
            />
          </MobileField>
        )}
        {show("guests") && (
          <MobileField id="m-guests" label={settings.labels.guests} icon={Users}>
            <LuxuryNumberStepper
              id="m-guests"
              value={guests}
              onChange={setGuests}
              min={1}
              max={PRACTICAL_MAX}
              compact
              suffix={(n) => (n === 1 ? "Guest" : "Guests")}
            />
          </MobileField>
        )}
        {show("children") && (
          <MobileField id="m-children" label={settings.labels.children} icon={Baby}>
            <LuxuryNumberStepper
              id="m-children"
              value={childrenCount}
              onChange={setChildrenCount}
              min={0}
              max={PRACTICAL_MAX}
              compact
            />
          </MobileField>
        )}
        {show("room") && (
          <MobileField id="m-room" label={settings.labels.room} icon={BedDouble}>
            <LuxuryNumberStepper
              id="m-room"
              value={roomQuantity}
              onChange={setRoomQuantity}
              min={1}
              max={PRACTICAL_MAX}
              compact
              suffix={(n) => (n === 1 ? "Room" : "Rooms")}
            />
          </MobileField>
        )}
        <div className={cn("col-span-2", !show("room") && "col-span-2")}>
          {submitButton({ tall: false, className: "mt-0.5" })}
        </div>
      </div>
    </motion.form>
  );

  return (
    <div className={cn("w-full", className)}>
      {desktopForm}
      {mobileForm}
    </div>
  );
}
