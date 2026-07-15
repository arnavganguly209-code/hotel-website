"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/cms/media-url";

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
  objectFit,
  onError,
  style,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = mediaUrl(src, src);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={resolved}
      src={resolved}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        fill && "absolute inset-0 h-full w-full",
        objectFit === "contain" && "object-contain object-center",
        objectFit === "cover" && "object-cover object-center",
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
      onError={() => {
        setFailed(true);
        onError?.();
      }}
    />
  );
}
