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
  Tag,
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
  tag: Tag,
};

const LABEL_GOLD = "#D4AF37";
const FIELD_GLASS = "rgba(255,255,255,0.06)";
const FIELD_BORDER = "rgba(212,175,55,0.28)";
const FRAME_BG =
  "linear-gradient(135deg, rgba(28,62,48,0.92) 0%, rgba(20,46,35,0.9) 48%, rgba(26,56,42,0.92) 100%)";
const VALUE_WHITE = "#FFFFFF";

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
        "group flex min-h-0 min-w-0 flex-col justify-center px-2 py-1 xl:px-2.5",
        bordered && "border-r",
        className
      )}
      style={{ borderColor: bordered ? dividerColor || "rgba(201,164,76,0.22)" : undefined }}
    >
      <label
        htmlFor={id}
        className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase xl:text-[10px]"
        style={{ color: labelColor || LABEL_GOLD, letterSpacing: "0.18em", fontWeight: 700 }}
      >
        <Icon className="h-3 w-3 shrink-0 opacity-95" strokeWidth={2} />
        <span className="truncate">{label}</span>
      </label>
      <div
        className="relative min-w-0 rounded-[10px] px-1.5 py-1 backdrop-blur-md transition-all duration-400 group-hover:border-[#D4AF37]/50"
        style={{
          background: FIELD_GLASS,
          border: `1px solid ${FIELD_BORDER}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
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
    <div className="rounded-[12px] border border-[#D4AF37]/28 bg-white/[0.05] px-2.5 py-2 backdrop-blur-sm">
      <label
        htmlFor={id}
        className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase"
        style={{ color: LABEL_GOLD, letterSpacing: "0.18em", fontWeight: 700 }}
      >
        <Icon className="h-3 w-3 shrink-0" strokeWidth={2} />
        {label}
      </label>
      {children}
    </div>
  );
}

export function PremiumFloatingBookingBar({
  bookingBar,
  className,
}: PremiumFloatingBookingBarProps) {
  const router = useRouter();
  const settings = mergeSettings(bookingBar);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(settings.defaults?.guests || "2");
  const [childrenCount, setChildrenCount] = useState(settings.defaults?.children || "0");
  const [roomQuantity, setRoomQuantity] = useState(settings.defaults?.rooms || "1");
  const [promoCode, setPromoCode] = useState("");

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
        promoCode: promoCode.trim() || undefined,
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
      "0 18px 44px rgba(8,20,14,0.3), 0 1px 0 rgba(255,255,255,0.06) inset",
    boxSizing: "border-box",
  };

  const cellColors = {
    labelColor: LABEL_GOLD,
    dividerColor: "rgba(212,175,55,0.28)",
  };

  const submitButton = (opts: { tall?: boolean; className?: string }) => (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.015, y: -1, boxShadow: "0 16px 36px rgba(190,150,50,0.4)" }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.35, ease: luxuryEase }}
      className={cn(
        "group relative flex w-full items-center justify-center gap-1.5 overflow-hidden text-[9px] font-bold uppercase tracking-[0.12em] xl:text-[10px]",
        opts.tall ? "h-[40px] min-w-[120px] px-2 xl:min-w-[132px]" : "min-h-[42px] px-3",
        opts.className
      )}
      style={{
        background:
          settings.buttonGradient ||
          "linear-gradient(180deg, #E8C878 0%, #C9A44C 48%, #B98B2C 100%)",
        boxShadow:
          settings.buttonShadow ||
          "0 12px 28px rgba(201,164,76,0.32), inset 0 1px 0 rgba(255,255,255,0.35)",
        color: settings.colors.buttonText || settings.buttonColor || "#1E4530",
        borderRadius: settings.buttonBorderRadius || "10px",
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/28 to-transparent"
        initial={{ x: "-150%" }}
        animate={{ x: "220%" }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: luxuryEase }}
      />
      <span className="relative text-center leading-tight">{settings.buttonText}</span>
      <ArrowRight className="relative h-3 w-3 shrink-0 transition-transform duration-400 group-hover:translate-x-0.5" />
    </motion.button>
  );

  const promoInput = (inputId: string, compact?: boolean) => (
    <input
      id={inputId}
      type="text"
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value)}
      placeholder="Optional"
      autoComplete="off"
      spellCheck={false}
      className={cn(
        "w-full bg-transparent font-bold tracking-wide outline-none placeholder:font-medium placeholder:text-[#FFF9F0]/70",
        compact ? "text-[13px]" : "text-[13px] md:text-[14px]"
      )}
      style={{ color: VALUE_WHITE }}
    />
  );

  const desktopForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: luxuryEase }}
      style={{ ...glassStyle, padding: "3px 5px" }}
      className="hidden w-full overflow-visible lg:block"
    >
      <div
        className="grid w-full items-stretch"
        style={{
          gridTemplateColumns:
            "minmax(0,1fr) minmax(0,1fr) minmax(0,0.7fr) minmax(0,0.65fr) minmax(0,0.7fr) minmax(0,0.95fr) minmax(120px,0.85fr)",
        }}
      >
        {show("checkIn") && (
          <FieldCell
            id="hero-check-in"
            label={settings.labels.checkIn}
            icon={resolveIcon(settings.icons.checkIn)}
            {...cellColors}
          >
            <LuxuryDatePicker
              id="hero-check-in"
              value={checkIn}
              onChange={handleCheckIn}
              preferAbove
            />
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
              preferAbove
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
              compact
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
              compact
            />
          </FieldCell>
        )}
        {show("room") && (
          <FieldCell
            id="hero-room"
            label={settings.labels.room}
            icon={resolveIcon(settings.icons.room)}
            {...cellColors}
          >
            <LuxuryNumberStepper
              id="hero-room"
              value={roomQuantity}
              onChange={setRoomQuantity}
              min={1}
              max={PRACTICAL_MAX}
              compact
              suffix={(n) => (n === 1 ? "Room" : "Rooms")}
            />
          </FieldCell>
        )}
        <FieldCell
          id="hero-promo"
          label="Promo Code"
          icon={Tag}
          bordered={false}
          {...cellColors}
        >
          {promoInput("hero-promo")}
        </FieldCell>
        <div className="flex items-center justify-center px-1 py-0.5">
          {submitButton({ tall: true })}
        </div>
      </div>
    </motion.form>
  );

  const mobileForm = (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.08, ease: luxuryEase }}
      style={{
        ...glassStyle,
        borderRadius: settings.responsive.mobileRadius || "16px",
        padding: "10px",
      }}
      className="overflow-visible lg:hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        {show("checkIn") && (
          <MobileField id="m-check-in" label={settings.labels.checkIn} icon={Calendar}>
            <LuxuryDatePicker
              id="m-check-in"
              value={checkIn}
              onChange={handleCheckIn}
              compact
              preferAbove
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
              preferAbove
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
        <MobileField id="m-promo" label="Promo Code" icon={Tag}>
          {promoInput("m-promo", true)}
        </MobileField>
        <div className="col-span-2">
          {submitButton({ tall: false })}
        </div>
      </div>
    </motion.form>
  );

  return (
    <div className={cn("w-full overflow-visible", className)}>
      {desktopForm}
      {mobileForm}
    </div>
  );
}
