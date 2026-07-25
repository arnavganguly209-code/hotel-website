"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD = "#D4B06A";

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

  const label =
    suffix?.(numeric) ??
    String(numeric);

  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label={label}
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
          if (e.key === "ArrowUp") {
            e.preventDefault();
            commit(numeric + 1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            commit(numeric - 1);
          }
        }}
        className={cn(
          "min-w-0 flex-1 bg-transparent font-semibold tracking-wide text-white outline-none",
          compact ? "text-[14px]" : "text-[15px] md:text-base"
        )}
      />
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          aria-label="Increase"
          onClick={() => commit(numeric + 1)}
          className="flex h-5 w-6 items-center justify-center rounded-md border border-[#D4B06A]/35 transition hover:border-[#D4B06A] hover:bg-white/10 active:scale-95"
        >
          <ChevronUp className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => commit(numeric - 1)}
          className="flex h-5 w-6 items-center justify-center rounded-md border border-[#D4B06A]/35 transition hover:border-[#D4B06A] hover:bg-white/10 active:scale-95"
        >
          <ChevronDown className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
