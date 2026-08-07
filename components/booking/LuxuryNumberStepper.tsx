"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD = "#D4AF37";
/** Matches LuxuryDatePicker trigger row so Guests/Children/Rooms stay equal height. */
const CONTROL_H = 28;

interface LuxuryNumberStepperProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  /** Soft ceiling for practical hotel bookings — not a tiny dropdown limit. */
  max?: number;
  suffix?: (n: number) => string;
  compact?: boolean;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function LuxuryNumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max = 999,
  suffix,
  compact = false,
}: LuxuryNumberStepperProps) {
  const numeric = clamp(Number(value) || min, min, max);
  const [draft, setDraft] = useState(String(numeric));

  useEffect(() => {
    setDraft(String(clamp(Number(value) || min, min, max)));
  }, [value, min, max]);

  const commit = (next: number) => {
    const clamped = clamp(next, min, max);
    setDraft(String(clamped));
    onChange(String(clamped));
  };

  const label = suffix?.(numeric) ?? String(numeric);
  const atMin = numeric <= min;
  const atMax = numeric >= max;

  return (
    <div
      className="flex w-full min-w-0 items-center gap-1"
      style={{ height: CONTROL_H }}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={atMin}
        onClick={() => commit(numeric - 1)}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/45 transition",
          "hover:border-[#D4AF37] hover:bg-white/10 active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        )}
      >
        <Minus className="h-3 w-3" style={{ color: GOLD }} strokeWidth={2.25} />
      </button>

      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label={label}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={numeric}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          setDraft(raw);
          if (raw === "") return;
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(String(clamp(n, min, max)));
        }}
        onBlur={() => {
          commit(draft === "" ? min : Number(draft));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            commit(numeric + 1);
          }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            commit(numeric - 1);
          }
        }}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-center font-bold tracking-wide text-white outline-none",
          compact ? "text-[12px] xl:text-[13px]" : "text-[13px] md:text-[14px]"
        )}
      />

      <button
        type="button"
        aria-label="Increase"
        disabled={atMax}
        onClick={() => commit(numeric + 1)}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/45 transition",
          "hover:border-[#D4AF37] hover:bg-white/10 active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        )}
      >
        <Plus className="h-3 w-3" style={{ color: GOLD }} strokeWidth={2.25} />
      </button>
    </div>
  );
}
