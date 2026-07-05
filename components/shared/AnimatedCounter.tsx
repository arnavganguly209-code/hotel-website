"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  light?: boolean;
}

export function AnimatedCounter({ value, suffix = "", label, light = false }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useAnimatedCounter(value, 2000, true, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={light ? "text-left" : "text-center"}
    >
      <p className={cn("font-display text-4xl font-light md:text-5xl", light ? "text-luxury-gold-light" : "text-luxury-green")}>
        {count}
        {suffix}
      </p>
      <p className={cn("mt-2 text-xs uppercase tracking-[0.2em]", light ? "text-white/50" : "text-luxury-muted")}>
        {label}
      </p>
    </motion.div>
  );
}
