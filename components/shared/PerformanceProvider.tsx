"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SiteContent } from "@/lib/cms/types";

type PerformanceSettings = SiteContent["performanceSettings"];

type PerformanceContextValue = PerformanceSettings & {
  /** Live-update mediaRevision without forcing every image to remount via RSC. */
  setMediaRevision: (revision: string) => void;
};

const PerformanceContext = createContext<PerformanceContextValue>({
  lazyLoadImages: true,
  reduceMotionOnMobile: true,
  pwaEnabled: true,
  imageFadeIn: false,
  cacheStaticAssets: true,
  mediaRevision: "",
  setMediaRevision: () => undefined,
});

export function PerformanceProvider({
  value,
  children,
}: {
  value: PerformanceSettings;
  children: React.ReactNode;
}) {
  const serverRevision = value.mediaRevision || "";
  const [liveRevision, setLiveRevision] = useState(serverRevision);

  useEffect(() => {
    if (!serverRevision) return;
    setLiveRevision((prev) => {
      if (!prev) return serverRevision;
      // Prefer the newer numeric timestamp when both are epoch-like strings.
      const a = Number(prev);
      const b = Number(serverRevision);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        return b >= a ? serverRevision : prev;
      }
      return serverRevision !== prev ? serverRevision : prev;
    });
  }, [serverRevision]);

  const setMediaRevision = useCallback((revision: string) => {
    if (!revision) return;
    setLiveRevision(revision);
  }, []);

  const merged = useMemo<PerformanceContextValue>(
    () => ({
      ...value,
      // Fade-in is opt-in only — default off to prevent opacity-0 stuck states.
      imageFadeIn: value.imageFadeIn === true,
      mediaRevision: liveRevision || serverRevision,
      setMediaRevision,
    }),
    [value, liveRevision, serverRevision, setMediaRevision]
  );

  return (
    <PerformanceContext.Provider value={merged}>{children}</PerformanceContext.Provider>
  );
}

export function usePerformanceSettings() {
  return useContext(PerformanceContext);
}
