"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hasMediaSrc, mediaUrl, stripMediaQuery } from "@/lib/cms/media-url";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";

interface SafeVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  style?: React.CSSProperties;
  onError?: () => void;
  onReady?: () => void;
  "aria-label"?: string;
}

function videoMime(src: string) {
  const path = stripMediaQuery(src).toLowerCase();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

const MAX_RETRIES = 5;
const RECOVER_MS = 3000;

/**
 * Orbit-aware video: cache-busts with mediaRevision, retries on failure,
 * soft-recovers forever while src exists, never permanently blanks Orbit media.
 */
export function SafeVideo({
  src,
  poster,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "metadata",
  controls = false,
  style,
  onError,
  onReady,
  "aria-label": ariaLabel,
}: SafeVideoProps) {
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const pathKey = stripMediaQuery(src);
  const resolved = hasMediaSrc(src) ? mediaUrl(src, revision || undefined) : "";
  // Poster only when Orbit provides one — never invent demo posters.
  const posterUrl = hasMediaSrc(poster) ? mediaUrl(poster, revision || undefined) : "";

  const videoRef = useRef<HTMLVideoElement>(null);
  const genRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const [attempt, setAttempt] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    genRef.current += 1;
    clearTimers();
    setAttempt(0);
    setRetryToken(0);
    return clearTimers;
  }, [pathKey, clearTimers]);

  const displaySrc =
    resolved && attempt > 0
      ? `${resolved}${resolved.includes("?") ? "&" : "?"}r=${retryToken}`
      : resolved;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !displaySrc) return;
    try {
      if (el.getAttribute("src") !== displaySrc) {
        el.setAttribute("src", displaySrc);
        el.load();
      }
      if (autoPlay) {
        const play = el.play();
        if (play && typeof play.catch === "function") play.catch(() => undefined);
      }
    } catch {
      /* ignore abort while swapping */
    }
  }, [displaySrc, autoPlay, attempt, retryToken]);

  const handleError = useCallback(() => {
    const gen = genRef.current;
    if (attempt + 1 >= MAX_RETRIES) {
      onError?.();
      const id = window.setTimeout(() => {
        if (genRef.current !== gen) return;
        setAttempt(0);
        setRetryToken(Date.now());
      }, RECOVER_MS);
      timersRef.current.push(id);
      return;
    }
    const delay = Math.min(250 * 2 ** attempt, 2000);
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
    <video
      ref={videoRef}
      key={`${pathKey}-${attempt}-${retryToken || "0"}`}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload={preload}
      poster={posterUrl || undefined}
      className={cn(
        controls ? "max-h-[70vh] w-full object-contain" : "h-full w-full object-cover",
        className
      )}
      style={style}
      aria-label={ariaLabel}
      controlsList={controls ? "nodownload" : undefined}
      onContextMenu={controls ? (e) => e.preventDefault() : undefined}
      onLoadedData={() => onReady?.()}
      onError={handleError}
    >
      <source src={displaySrc} type={videoMime(src)} />
    </video>
  );
}
