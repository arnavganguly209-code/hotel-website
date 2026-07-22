"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/cms/types";

type PerformanceSettings = SiteContent["performanceSettings"];

const PerformanceContext = createContext<PerformanceSettings>({
  lazyLoadImages: true,
  reduceMotionOnMobile: true,
  pwaEnabled: true,
  imageFadeIn: true,
  cacheStaticAssets: true,
  mediaRevision: "",
});

export function PerformanceProvider({
  value,
  children,
}: {
  value: PerformanceSettings;
  children: React.ReactNode;
}) {
  return (
    <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>
  );
}

export function usePerformanceSettings() {
  return useContext(PerformanceContext);
}
