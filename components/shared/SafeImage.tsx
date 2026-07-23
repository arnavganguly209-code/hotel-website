"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { mediaUrl, hasMediaSrc } from "@/lib/cms/media-url";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  objectFit?: "contain" | "cover" | "none";
  onError?: () => void;
  style?: React.CSSProperties;
  fadeIn?: boolean;
  /**
   * Optional same-asset retry sibling only. Never pass deleted/demo media —
   * empty Orbit fields must stay empty.
   */
  fallbackSrc?: string;
  /** Soft skeleton while loading (default true for non-priority) */
  skeleton?: boolean;
}

const MAX_RETRIES = 4;

/**
 * Enterprise-stable local image for Hostinger VPS.
 * - Always cache-busts with Orbit mediaRevision
 * - Retries failed loads automatically
 * - Soft skeleton while loading; never flashes broken icons
 * - Empty src → renders nothing (no demo fallback)
 */
export function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  objectFit,
  onError,
  style,
  fadeIn,
  fallbackSrc,
  skeleton,
}: SafeImageProps) {
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const resolved = hasMediaSrc(src) ? mediaUrl(src, revision || undefined) : "";
  const fallback =
    hasMediaSrc(fallbackSrc) && fallbackSrc !== src
      ? mediaUrl(fallbackSrc, revision || undefined)
      : "";

  const [attempt, setAttempt] = useState(0);
  const [retryToken, setRetryToken] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Reset when Orbit src or revision changes (upload/replace/delete)
  useEffect(() => {
    setAttempt(0);
    setRetryToken(0);
    setLoaded(false);
    setFailed(false);
  }, [resolved, revision]);

  const enableFade = fadeIn ?? perf.imageFadeIn !== false;
  const lazy = perf.lazyLoadImages !== false;
  const showSkeleton = skeleton ?? !priority;

  const useFallback = attempt >= 2 && Boolean(fallback);
  const baseSrc = useFallback ? fallback : resolved;
  const displaySrc =
    baseSrc && attempt > 0 && attempt < MAX_RETRIES
      ? `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}r=${retryToken}`
      : baseSrc;

  const handleError = useCallback(() => {
    setLoaded(false);
    if (attempt + 1 >= MAX_RETRIES) {
      setFailed(true);
      onError?.();
      return;
    }
    // Exponential backoff: 200ms, 400ms, 800ms…
    const delay = Math.min(200 * 2 ** attempt, 1600);
    window.setTimeout(() => {
      setAttempt((a) => a + 1);
      setRetryToken(Date.now());
    }, delay);
  }, [attempt, onError]);

  if (!resolved || failed || !displaySrc) {
    return null;
  }

  return (
    <>
      {showSkeleton && !loaded ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none bg-gradient-to-br from-[#e8dfd0]/40 via-[#d4c4a8]/25 to-[#c9b896]/35 animate-pulse",
            fill ? "absolute inset-0" : "absolute inset-0",
            className
          )}
          style={fill ? undefined : { width, height }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${displaySrc}-${attempt}`}
        src={displaySrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        loading={priority || !lazy ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          fill && "absolute inset-0 h-full w-full",
          objectFit === "contain" && "object-contain object-center",
          objectFit === "cover" && "object-cover object-center",
          enableFade && "transition-opacity duration-500 ease-out",
          enableFade && (loaded || priority ? "opacity-100" : "opacity-0"),
          className
        )}
        style={{
          ...(objectFit
            ? {
                objectFit,
                objectPosition: "center",
                maxWidth: "100%",
                maxHeight: "100%",
              }
            : null),
          ...style,
        }}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
}
