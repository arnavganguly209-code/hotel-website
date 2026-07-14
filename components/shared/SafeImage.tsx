"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
  style?: React.CSSProperties;
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
  onError,
  style,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      style={style}
      onError={() => {
        setFailed(true);
        onError?.();
      }}
    />
  );
}
