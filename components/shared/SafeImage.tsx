"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/cms/media-url";
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
  /** contain = logos/badges; cover = hero/gallery photography (default when className sets it) */
  objectFit?: "contain" | "cover" | "none";
  onError?: () => void;
  style?: React.CSSProperties;
  /** Soft fade-in when image loads (default follows Orbit performance setting) */
  fadeIn?: boolean;
  /**
   * Optional same-asset retry sibling only. Never pass deleted/demo media here —
   * empty Orbit fields must stay empty (elegant placeholder), not flash old files.
   */
  fallbackSrc?: string;
}

/**
 * Local-first image for Hostinger VPS.
 * Uses a native <img> so /uploads and /media never hit the Next.js image optimizer
 * (which often fails when a CMS path points at a missing or newly uploaded file).
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
}: SafeImageProps) {
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const resolved = mediaUrl(src, revision || src);
  const fallback = mediaUrl(fallbackSrc, revision || fallbackSrc);
  const [errorState, setErrorState] = useState({
    source: "",
    attempt: 0,
    token: 0,
  });
  const [loadedSrc, setLoadedSrc] = useState("");
  const enableFade = fadeIn ?? perf.imageFadeIn !== false;
  const lazy = perf.lazyLoadImages !== false;
  const attempt = errorState.source === resolved ? errorState.attempt : 0;
  const hasFallback = Boolean(fallback && fallback !== resolved);
  const failed = attempt >= (hasFallback ? 3 : 2);
  const baseSrc = attempt >= 2 && hasFallback ? fallback : resolved;
  const displaySrc =
    attempt === 1 && baseSrc
      ? `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}retry=${errorState.token}`
      : baseSrc;

  if (!displaySrc || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={displaySrc}
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
        enableFade && (loadedSrc === displaySrc || priority ? "opacity-100" : "opacity-0"),
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
      onLoad={() => setLoadedSrc(displaySrc)}
      onError={() => {
        const nextAttempt = attempt + 1;
        setErrorState({
          source: resolved,
          attempt: nextAttempt,
          token: Date.now(),
        });
        if (nextAttempt >= (hasFallback ? 3 : 2)) onError?.();
      }}
    />
  );
}
