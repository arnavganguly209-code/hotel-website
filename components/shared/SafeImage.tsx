"use client";

import { useEffect, useState } from "react";
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
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolved = mediaUrl(src, src);
  const fallback = mediaUrl(fallbackSrc, fallbackSrc);
  const [displaySrc, setDisplaySrc] = useState(resolved);
  const [retryCount, setRetryCount] = useState(0);
  const enableFade = fadeIn ?? perf.imageFadeIn !== false;
  const lazy = perf.lazyLoadImages !== false;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    setRetryCount(0);
    setDisplaySrc(resolved);
  }, [resolved]);

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
      onError={() => {
        if (retryCount === 0) {
          setRetryCount(1);
          setDisplaySrc(`${resolved}${resolved.includes("?") ? "&" : "?"}retry=${Date.now()}`);
          return;
        }
        if (fallback && !displaySrc.startsWith(fallback)) {
          setRetryCount(2);
          setDisplaySrc(fallback);
          return;
        }
        setFailed(true);
        onError?.();
      }}
    />
  );
}
