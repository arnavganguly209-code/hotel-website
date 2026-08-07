"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";

/** Luxury hotel calendar palette — cream + emerald + gold */
const GOLD = "#D4AF37";
const EMERALD = "#184D3D";
const EMERALD_DEEP = "#0F2A22";
const CREAM = "#F8F3EA";
const CREAM_SOFT = "#FFFDF8";
const DISABLED = "#C9C0B0";
const PANEL_W = 340;
const PANEL_H = 400;

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(value: string) {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDisplayDate(value: string) {
  if (!value) return "Select date";
  const date = parseISODate(value);
  if (!date) return "Select date";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface LuxuryDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  compact?: boolean;
  preferAbove?: boolean;
}

export function LuxuryDatePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "Select date",
  compact = false,
  preferAbove = true,
}: LuxuryDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: "above" | "below" }>({
    top: 0,
    left: 0,
    placement: "above",
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = parseISODate(value);
  const minDate = parseISODate(min || "") || startOfDay(new Date());
  const [view, setView] = useState(() => selected || new Date());
  const labelId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (selected) setView(selected);
  }, [value]);

  const placePanel = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 12;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    let placement: "above" | "below" = preferAbove ? "above" : "below";
    if (preferAbove) {
      if (spaceAbove < PANEL_H + gap && spaceBelow > spaceAbove) placement = "below";
    } else if (spaceBelow < PANEL_H + gap && spaceAbove > spaceBelow) {
      placement = "above";
    }

    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - PANEL_W / 2),
      window.innerWidth - PANEL_W - 12
    );
    const top =
      placement === "above"
        ? Math.max(12, rect.top - PANEL_H - gap)
        : Math.min(window.innerHeight - PANEL_H - 12, rect.bottom + gap);

    setCoords({ top, left, placement });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
    const onReposition = () => placePanel();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, preferAbove]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date } | null> = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d, 12) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const today = startOfDay(new Date());
  const yearNow = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = yearNow; y <= yearNow + 8; y++) list.push(y);
    return list;
  }, [yearNow]);

  const pick = (date: Date) => {
    if (startOfDay(date) < startOfDay(minDate)) return;
    onChange(toISODate(date));
    setOpen(false);
  };

  const selectClass =
    "appearance-none cursor-pointer rounded-full border px-3 py-1.5 font-display text-[15px] font-semibold outline-none transition-all duration-300";

  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Choose date"
          initial={{
            opacity: 0,
            y: coords.placement === "above" ? 14 : -14,
            scale: 0.94,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: coords.placement === "above" ? 10 : -10,
            scale: 0.96,
          }}
          transition={{ duration: 0.32, ease: luxuryEase }}
          className="fixed z-[9999] overflow-hidden rounded-[20px] border p-5 backdrop-blur-xl"
          style={{
            top: coords.top,
            left: coords.left,
            width: PANEL_W,
            borderColor: "rgba(212,175,55,0.45)",
            background: `linear-gradient(160deg, ${CREAM} 0%, ${CREAM_SOFT} 38%, #F0E6D2 72%, #E8F0EA 100%)`,
            boxShadow:
              "0 32px 80px rgba(15,42,34,0.38), 0 2px 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(212,175,55,0.18)",
          }}
        >
          {/* Header band */}
          <div
            className="-mx-5 -mt-5 mb-4 flex items-center justify-between gap-2 px-4 py-3.5"
            style={{
              background: `linear-gradient(135deg, ${EMERALD_DEEP} 0%, ${EMERALD} 55%, #1F5A48 100%)`,
              boxShadow: "0 8px 24px rgba(15,42,34,0.25)",
            }}
          >
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
              style={{
                border: `1.5px solid ${GOLD}`,
                color: GOLD,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <label className="sr-only" htmlFor={`${id}-month`}>
                Month
              </label>
              <select
                id={`${id}-month`}
                className={cn(selectClass, "max-w-[56%]")}
                style={{
                  color: GOLD,
                  borderColor: "rgba(212,175,55,0.55)",
                  background: "rgba(15,42,34,0.35)",
                  letterSpacing: "0.04em",
                }}
                value={view.getMonth()}
                onChange={(e) =>
                  setView(new Date(view.getFullYear(), Number(e.target.value), 1))
                }
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i} style={{ color: EMERALD, background: CREAM }}>
                    {name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor={`${id}-year`}>
                Year
              </label>
              <select
                id={`${id}-year`}
                className={cn(selectClass, "max-w-[40%]")}
                style={{
                  color: GOLD,
                  borderColor: "rgba(212,175,55,0.55)",
                  background: "rgba(15,42,34,0.35)",
                  letterSpacing: "0.04em",
                  fontWeight: 700,
                }}
                value={view.getFullYear()}
                onChange={(e) =>
                  setView(new Date(Number(e.target.value), view.getMonth(), 1))
                }
              >
                {years.map((y) => (
                  <option key={y} value={y} style={{ color: EMERALD, background: CREAM }}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
              style={{
                border: `1.5px solid ${GOLD}`,
                color: GOLD,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mb-2.5 grid grid-cols-7 gap-1.5">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span
                key={d}
                className="py-2 text-center font-body text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: EMERALD }}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((cell, i) => {
              if (!cell) return <span key={`empty-${i}`} className="h-11" />;
              const disabled = startOfDay(cell.date) < startOfDay(minDate);
              const isToday = sameDay(cell.date, today);
              const isSelected = selected ? sameDay(cell.date, selected) : false;
              return (
                <button
                  key={toISODate(cell.date)}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(cell.date)}
                  className={cn(
                    "relative flex h-11 items-center justify-center rounded-full font-body text-[15px] font-semibold transition-all duration-300",
                    disabled && "cursor-not-allowed",
                    !disabled && !isSelected && "hover:scale-105",
                    isSelected && "font-bold shadow-[0_10px_24px_rgba(212,175,55,0.45)]"
                  )}
                  style={{
                    color: disabled
                      ? DISABLED
                      : isSelected
                        ? "#FFFFFF"
                        : EMERALD,
                    background: isSelected
                      ? `linear-gradient(160deg, #E8C878 0%, ${GOLD} 48%, #B8962E 100%)`
                      : "transparent",
                    boxShadow: isToday && !isSelected ? `inset 0 0 0 2px ${EMERALD}` : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (disabled || isSelected) return;
                    e.currentTarget.style.background = "rgba(212,175,55,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    if (disabled || isSelected) return;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 w-full min-w-0 items-center">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-full w-full items-center justify-between gap-1.5 rounded-[10px] text-left transition-all duration-400",
          "pl-2.5 pr-2"
        )}
      >
        <span
          id={labelId}
          className={cn(
            "truncate leading-none font-bold tracking-wide",
            compact ? "text-[13px]" : "text-[13px] md:text-[14px]"
          )}
          style={{ color: value ? "#FFFFFF" : "rgba(255,249,240,0.7)" }}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <motion.span
          className="flex shrink-0 items-center"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: luxuryEase }}
        >
          <ChevronDown className="h-3 w-3 shrink-0" style={{ color: GOLD, opacity: 0.9 }} />
        </motion.span>
      </button>

      {mounted ? createPortal(panel, document.body) : null}
    </div>
  );
}

export { formatDisplayDate, toISODate };
