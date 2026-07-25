"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";

const GOLD = "#D4B06A";
const EMERALD = "#184D3D";
const CREAM = "#F8F3EA";
const PANEL_W = 320;
const PANEL_H = 360;

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
  /** Prefer opening above the field (hero booking bar). */
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
    const gap = 10;
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
    "appearance-none rounded-full border border-[#D4B06A]/45 bg-white/70 px-2.5 py-1 font-display text-[13px] font-medium text-[#184D3D] outline-none transition hover:border-[#D4B06A] focus:border-[#D4B06A]";

  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Choose date"
          initial={{
            opacity: 0,
            y: coords.placement === "above" ? 10 : -10,
            scale: 0.97,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: coords.placement === "above" ? 8 : -8,
            scale: 0.98,
          }}
          transition={{ duration: 0.28, ease: luxuryEase }}
          className="fixed z-[9999] overflow-hidden rounded-[22px] border border-[#D4B06A]/40 p-4"
          style={{
            top: coords.top,
            left: coords.left,
            width: PANEL_W,
            background: `linear-gradient(165deg, ${CREAM} 0%, #FFFDF8 42%, #F4ECDC 100%)`,
            boxShadow:
              "0 28px 70px rgba(8,20,14,0.32), 0 2px 0 rgba(255,255,255,0.7) inset, 0 0 0 1px rgba(212,176,106,0.12)",
          }}
        >
          <div className="mb-3.5 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4B06A]/45 text-[#184D3D] transition hover:border-[#D4B06A] hover:bg-[#184D3D]/08 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              <label className="sr-only" htmlFor={`${id}-month`}>
                Month
              </label>
              <select
                id={`${id}-month`}
                className={cn(selectClass, "max-w-[58%]")}
                value={view.getMonth()}
                onChange={(e) =>
                  setView(new Date(view.getFullYear(), Number(e.target.value), 1))
                }
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor={`${id}-year`}>
                Year
              </label>
              <select
                id={`${id}-year`}
                className={cn(selectClass, "max-w-[38%]")}
                value={view.getFullYear()}
                onChange={(e) =>
                  setView(new Date(Number(e.target.value), view.getMonth(), 1))
                }
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4B06A]/45 text-[#184D3D] transition hover:border-[#D4B06A] hover:bg-[#184D3D]/08 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span
                key={d}
                className="py-1.5 text-center font-body text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "rgba(24,77,61,0.5)" }}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((cell, i) => {
              if (!cell) return <span key={`empty-${i}`} className="h-10" />;
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
                    "relative flex h-10 items-center justify-center rounded-full font-body text-[14px] transition-all duration-300",
                    disabled && "cursor-not-allowed opacity-30",
                    !disabled && !isSelected && "hover:bg-[#184D3D]/10 hover:scale-105",
                    isSelected && "font-semibold text-[#1A2E26] shadow-[0_10px_22px_rgba(201,164,76,0.42)]",
                    isToday && !isSelected && "font-semibold"
                  )}
                  style={{
                    color: isSelected ? "#1A2E26" : EMERALD,
                    background: isSelected
                      ? "linear-gradient(160deg, #E8C878 0%, #D4B06A 55%, #C9A44C 100%)"
                      : undefined,
                    boxShadow: isToday && !isSelected ? `inset 0 0 0 1.5px ${GOLD}` : undefined,
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
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-[10px] text-left transition-all duration-400",
          compact ? "py-0.5" : "py-0"
        )}
      >
        <span
          id={labelId}
          className={cn(
            "truncate font-semibold tracking-wide",
            compact ? "text-[13px]" : "text-[13px] md:text-[14px]"
          )}
          style={{ color: value ? "#FFFFFF" : "rgba(255,249,240,0.62)" }}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: luxuryEase }}>
          <ChevronDown className="h-3 w-3 shrink-0" style={{ color: GOLD, opacity: 0.85 }} />
        </motion.span>
      </button>

      {mounted ? createPortal(panel, document.body) : null}
    </div>
  );
}

export { formatDisplayDate, toISODate };
