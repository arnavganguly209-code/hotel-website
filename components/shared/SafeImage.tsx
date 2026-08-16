"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mediaUrl, hasMediaSrc, stripMediaQuery } from "@/lib/cms/media-url";
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

const MAX_RETRIES = 6;
const RECOVER_MS = 2500;

/**
 * Enterprise-stable local image for production.
 * - Cache-busts with Orbit mediaRevision
 * - Detects browser-cached loads (img.complete) so opacity never sticks at 0
 * - Retries failures with backoff, then soft-recovers forever while src exists
 * - Never shows broken-image icons; empty Orbit src renders nothing
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
  const pathKey = stripMediaQuery(src);
  const resolved = hasMediaSrc(src) ? mediaUrl(src, revision || undefined) : "";
  const fallback =
    hasMediaSrc(fallbackSrc) && fallbackSrc !== src
      ? mediaUrl(fallbackSrc, revision || undefined)
      : "";

  const imgRef = useRef<HTMLImageElement>(null);
  const genRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const [attempt, setAttempt] = useState(0);
  const [retryToken, setRetryToken] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const syncLoadedFromDom = useCallback(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
      return true;
    }
    return false;
  }, []);

  // Path change = new asset. Keep prior frame visible until the new one loads
  // (avoids images "disappearing" for a beat on remount/revision churn).
  useEffect(() => {
    genRef.current += 1;
    clearTimers();
    setAttempt(0);
    setRetryToken(0);
    const raf = window.requestAnimationFrame(() => {
      if (!syncLoadedFromDom()) {
        // Only blank if the new path is not already cached/complete.
        setLoaded(false);
      }
    });
    return () => {
      window.cancelAnimationFrame(raf);
      clearTimers();
    };
  }, [pathKey, clearTimers, syncLoadedFromDom]);

  // Revision / URL query change — check complete immediately (cached loads often skip onLoad).
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      syncLoadedFromDom();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [resolved, revision, retryToken, attempt, syncLoadedFromDom]);

  const enableFade = fadeIn ?? false;
  const lazy = perf.lazyLoadImages !== false;
  const showSkeleton = skeleton ?? !priority;

  const useFallback = attempt >= 2 && Boolean(fallback);
  const baseSrc = useFallback ? fallback : resolved;
  const displaySrc =
    baseSrc && attempt > 0
      ? `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}r=${retryToken}`
      : baseSrc;

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    const gen = genRef.current;
    setLoaded(false);

    if (attempt + 1 >= MAX_RETRIES) {
      onError?.();
      // Soft recover forever — Orbit media must reappear after transient failures.
      const id = window.setTimeout(() => {
        if (genRef.current !== gen) return;
        setAttempt(0);
        setRetryToken(Date.now());
      }, RECOVER_MS);
      timersRef.current.push(id);
      return;
    }

    const delay = Math.min(200 * 2 ** attempt, 2000);
    const id = window.setTimeout(() => {
      if (genRef.current !== gen) return;
      setAttempt((a) => a + 1);
      setRetryToken(Date.now());
    }, delay);
    timersRef.current.push(id);
  }, [attempt, onError]);

  if (!resolved || !displaySrc) {
    return null;
  }

  return (
    <>
      {showSkeleton && !loaded ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none bg-gradient-to-br from-[#e8dfd0]/40 via-[#d4c4a8]/25 to-[#c9b896]/35 animate-pulse",
            "absolute inset-0",
            className
          )}
          style={fill ? undefined : { width, height }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={`${pathKey}-${attempt}-${retryToken || "0"}`}
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
          !enableFade && "opacity-100",
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
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
