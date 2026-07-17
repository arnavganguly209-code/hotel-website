"use client";

import { useEffect, useState } from "react";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";

/** Detect prefers-reduced-motion and narrow viewports for lighter continuous animations. */
export function useMotionPreference() {
  const perf = usePerformanceSettings();
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");

    const sync = () => {
      setReduced(mqMotion.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();

    mqMotion.addEventListener("change", sync);
    mqMobile.addEventListener("change", sync);
    return () => {
      mqMotion.removeEventListener("change", sync);
      mqMobile.removeEventListener("change", sync);
    };
  }, []);

  const reduceOnMobile = perf.reduceMotionOnMobile !== false;

  return {
    reduced,
    isMobile,
    /** Skip continuous loops on mobile (when enabled) or when user prefers reduced motion */
    skipLoops: reduced || (reduceOnMobile && isMobile),
  };
}
