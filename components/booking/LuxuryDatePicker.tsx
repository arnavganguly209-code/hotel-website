"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";

const GOLD = "#D4B06A";
const EMERALD = "#184D3D";
const CREAM = "#F8F3EA";

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

interface LuxuryDatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  compact?: boolean;
}

export function LuxuryDatePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "Select date",
  compact = false,
}: LuxuryDatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseISODate(value);
  const minDate = parseISODate(min || "") || startOfDay(new Date());
  const [view, setView] = useState(() => selected || new Date());
  const labelId = useId();

  useEffect(() => {
    if (selected) setView(selected);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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
    const cells: Array<{ date: Date; inMonth: boolean } | null> = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d, 12), inMonth: true });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const today = startOfDay(new Date());
  const monthLabel = view.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const pick = (date: Date) => {
    if (startOfDay(date) < startOfDay(minDate)) return;
    onChange(toISODate(date));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[12px] text-left transition-all duration-500",
          compact ? "py-1" : "py-0.5"
        )}
      >
        <span
          id={labelId}
          className={cn(
            "truncate font-semibold tracking-wide",
            compact ? "text-[14px]" : "text-[15px] md:text-base"
          )}
          style={{ color: value ? "#FFFFFF" : "rgba(255,249,240,0.62)" }}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.35, ease: luxuryEase }}>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD, opacity: 0.85 }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Choose date"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: luxuryEase }}
            className="absolute left-0 top-[calc(100%+10px)] z-[60] w-[min(288px,calc(100vw-2rem))] overflow-hidden rounded-[18px] border border-[#D4B06A]/35 p-3.5 shadow-[0_28px_60px_rgba(8,20,14,0.35)]"
            style={{
              background: `linear-gradient(165deg, ${CREAM} 0%, #FFF9F0 48%, #F3EBD9 100%)`,
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4B06A]/40 text-[#184D3D] transition hover:border-[#D4B06A] hover:bg-[#184D3D]/08"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <p
                className="font-display text-[15px] font-medium tracking-[0.04em]"
                style={{ color: EMERALD }}
              >
                {monthLabel}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4B06A]/40 text-[#184D3D] transition hover:border-[#D4B06A] hover:bg-[#184D3D]/08"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-0.5">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span
                  key={d}
                  className="py-1 text-center font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "rgba(24,77,61,0.55)" }}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {days.map((cell, i) => {
                if (!cell) {
                  return <span key={`empty-${i}`} className="h-9" />;
                }
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
                      "relative flex h-9 items-center justify-center rounded-full font-body text-[13px] transition-all duration-300",
                      disabled && "cursor-not-allowed opacity-30",
                      !disabled && !isSelected && "hover:bg-[#184D3D]/10 hover:text-[#184D3D]",
                      isSelected && "text-[#1A2E26] shadow-[0_8px_18px_rgba(201,164,76,0.45)]",
                      isToday && !isSelected && "font-semibold"
                    )}
                    style={{
                      color: isSelected ? "#1A2E26" : EMERALD,
                      background: isSelected
                        ? "linear-gradient(160deg, #E8C878 0%, #D4B06A 55%, #C9A44C 100%)"
                        : undefined,
                      boxShadow: isToday && !isSelected ? `inset 0 0 0 1px ${GOLD}` : undefined,
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
    </div>
  );
}

export { formatDisplayDate, toISODate };
