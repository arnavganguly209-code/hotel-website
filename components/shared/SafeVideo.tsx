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

const MAX_RETRIES = 3;

/**
 * Orbit-aware video: cache-busts with mediaRevision, retries on failure,
 * never keeps playing a deleted asset after revision/src clears.
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
  const resolved = hasMediaSrc(src) ? mediaUrl(src, revision || undefined) : "";
  const posterUrl = hasMediaSrc(poster) ? mediaUrl(poster, revision || undefined) : "";

  const videoRef = useRef<HTMLVideoElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [retryToken, setRetryToken] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setRetryToken(0);
    setFailed(false);
    const el = videoRef.current;
    if (el) {
      try {
        el.pause();
        el.removeAttribute("src");
        el.load();
      } catch {
        /* ignore */
      }
    }
  }, [resolved, revision]);

  const displaySrc =
    resolved && attempt > 0 && attempt < MAX_RETRIES
      ? `${resolved}${resolved.includes("?") ? "&" : "?"}r=${retryToken}`
      : resolved;

  const handleError = useCallback(() => {
    if (attempt + 1 >= MAX_RETRIES) {
      setFailed(true);
      onError?.();
      return;
    }
    const delay = Math.min(250 * 2 ** attempt, 2000);
    window.setTimeout(() => {
      setAttempt((a) => a + 1);
      setRetryToken(Date.now());
    }, delay);
  }, [attempt, onError]);

  if (!resolved || failed || !displaySrc) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      key={`${displaySrc}-${attempt}`}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload={preload}
      poster={posterUrl || undefined}
      className={cn(controls ? "max-h-[70vh] w-full object-contain" : "h-full w-full object-cover", className)}
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
