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
      className="group relative flex items-center gap-4 rounded-2xl px-5 py-5 transition-all duration-500 hover:-translate-y-1 md:gap-5 md:px-6 md:py-6"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}99`,
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,0.28), 0 0 24px ${goldColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.22)";
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border md:h-14 md:w-14"
        style={{ borderColor: `${border}CC`, color: text }}
      >
        <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.35} />
      </div>
      <div className="min-w-0 text-left">
        <p
          className="font-display text-3xl font-semibold leading-none tracking-wide md:text-[2.15rem]"
          style={{ color: text }}
        >
          {count}
          {stat.suffix}
        </p>
        <p
          className="mt-2 font-body text-[10px] font-medium uppercase tracking-[0.22em] md:text-[11px]"
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
      <div className="mx-auto max-w-[1320px] px-3 pb-14 pt-10 sm:px-5 md:pb-16 md:pt-12 lg:px-6">
        <div className="mb-5 flex justify-center" aria-hidden>
          <span
            className="h-1.5 w-1.5 rotate-45"
            style={{ backgroundColor: `${goldColor}AA` }}
          />
        </div>
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-3 sm:gap-4 md:grid-cols-3 md:gap-5"
        >
          {items.map((stat) => (
            <StatCard key={stat.id || stat.label} stat={stat} goldColor={goldColor} />
          ))}
        </motion.div>
        <div className="mt-5 flex justify-center" aria-hidden>
          <span
            className="h-1.5 w-1.5 rotate-45"
            style={{ backgroundColor: `${goldColor}AA` }}
          />
        </div>
      </div>
    </div>
  );
}
