"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BedDouble, Crown, LucideIcon, Sparkles, Star, Users } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

type StatItem = SiteContent["overview"]["stats"][number];

const ICONS: Record<string, LucideIcon> = {
  crown: Crown,
  bed: BedDouble,
  users: Users,
  star: Star,
  sparkles: Sparkles,
};

interface LuxuryShowcaseStatsProps {
  stats: StatItem[];
  goldColor: string;
  bandBackground: string;
}

function StatCard({
  stat,
  goldColor,
}: {
  stat: StatItem;
  goldColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useAnimatedCounter(stat.value, 2000, true, inView);
  const Icon = ICONS[stat.icon] || Crown;
  const text = stat.textColor || goldColor;
  const border = stat.borderColor || goldColor;
  const bg = stat.backgroundColor || "#0F2A22";

  return (
    <motion.div
      ref={ref}
      variants={luxuryFadeUp}
      className="group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-500 hover:-translate-y-0.5 md:gap-4 md:px-5 md:py-4"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}99`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 28px rgba(0,0,0,0.26), 0 0 18px ${goldColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border md:h-11 md:w-11"
        style={{ borderColor: `${border}CC`, color: text }}
      >
        <Icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.35} />
      </div>
      <div className="min-w-0 text-left">
        <p
          className="font-display text-2xl font-semibold leading-none tracking-wide md:text-[1.85rem]"
          style={{ color: text }}
        >
          {count}
          {stat.suffix}
        </p>
        <p
          className="mt-1.5 font-body text-[9px] font-medium uppercase tracking-[0.2em] md:text-[10px]"
          style={{ color: text }}
        >
          {stat.label}
        </p>
      </div>
      <span
        className="pointer-events-none absolute bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rotate-45"
        style={{ backgroundColor: `${goldColor}AA` }}
        aria-hidden
      />
    </motion.div>
  );
}

export function LuxuryShowcaseStats({
  stats,
  goldColor,
  bandBackground,
}: LuxuryShowcaseStatsProps) {
  const items = [...stats]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);

  if (!items.length) return null;

  return (
    <div className="relative" style={{ backgroundColor: bandBackground }}>
      <div className="mx-auto max-w-[1320px] px-3 pb-6 pt-5 sm:px-5 md:pb-7 md:pt-6 lg:px-6">
        <div className="mb-3 flex justify-center" aria-hidden>
          <span
            className="h-1 w-1 rotate-45"
            style={{ backgroundColor: `${goldColor}AA` }}
          />
        </div>
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4"
        >
          {items.map((stat) => (
            <StatCard key={stat.id || stat.label} stat={stat} goldColor={goldColor} />
          ))}
        </motion.div>
        <div className="mt-3 flex justify-center" aria-hidden>
          <span
            className="h-1 w-1 rotate-45"
            style={{ backgroundColor: `${goldColor}AA` }}
          />
        </div>
      </div>
    </div>
  );
}
