"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

interface MediaPlaceholderProps {
  src?: string;
  alt: string;
  label?: string;
  variant?: "room" | "gallery" | "page" | "spa" | "dining" | "event";
  aspect?: "video" | "square" | "portrait" | "landscape" | "auto";
  className?: string;
  priority?: boolean;
  hoverScale?: boolean;
}

const variantGradients = {
  room: "from-stone-800 via-stone-700 to-stone-900",
  gallery: "from-neutral-800 via-stone-800 to-neutral-900",
  page: "from-stone-900 via-stone-800 to-luxury-charcoal",
  spa: "from-stone-700 via-emerald-950/40 to-stone-900",
  dining: "from-stone-800 via-amber-950/30 to-stone-900",
  event: "from-stone-900 via-purple-950/20 to-stone-800",
};

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  auto: "h-full min-h-[280px]",
};

export function MediaPlaceholder({
  src,
  alt,
  label,
  variant = "room",
  aspect = "landscape",
  className,
  priority = false,
  hoverScale = true,
}: MediaPlaceholderProps) {
  const [error, setError] = useState(false);
  const showImage = src && !error;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectClasses[aspect],
        className
      )}
    >
      {showImage ? (
        <motion.div
          className="relative h-full w-full"
          whileHover={hoverScale ? { scale: 1.05 } : undefined}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SafeImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            onError={() => setError(true)}
          />
        </motion.div>
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br",
            variantGradients[variant]
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(198,169,114,0.12)_0%,transparent_70%)]" />
          <div className="relative text-center px-6">
            <div className="mx-auto mb-3 h-px w-12 bg-luxury-gold/50" />
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-luxury-gold/80">
              {label || alt}
            </p>
            <p className="mt-2 text-[9px] uppercase tracking-widest text-white/30">
              Replace in Orbit Media Library
            </p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-charcoal/40 via-transparent to-transparent opacity-60" />
    </div>
  );
}
