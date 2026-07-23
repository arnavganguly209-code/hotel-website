"use client";

import { useState } from "react";
import { SafeImage } from "@/components/shared/SafeImage";
import { SafeVideo } from "@/components/shared/SafeVideo";
import { hasMediaSrc } from "@/lib/cms/media-url";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MediaBackgroundProps {
  type?: "video" | "image";
  videoSrc?: string;
  imageSrc?: string;
  poster?: string;
  overlay?: "dark" | "light" | "gold";
  className?: string;
  parallax?: boolean;
  priority?: boolean;
}

export function MediaBackground({
  type = "image",
  videoSrc,
  imageSrc,
  poster,
  overlay = "dark",
  className,
  parallax = false,
  priority = false,
}: MediaBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const hasVideo = type === "video" && hasMediaSrc(videoSrc);
  const hasImage = hasMediaSrc(imageSrc);
  const showVideo = hasVideo && !videoFailed;
  // Video failure may fall back to poster/image when Orbit still has one — never to demo assets.
  const showImage = hasImage && !imageFailed && (type === "image" || videoFailed);

  const overlayClass = {
    dark: "bg-gradient-to-b from-luxury-charcoal/70 via-luxury-charcoal/50 to-luxury-charcoal/80",
    light: "bg-gradient-to-b from-white/40 via-white/20 to-luxury-cream/60",
    gold: "bg-gradient-to-br from-luxury-charcoal/60 via-luxury-gold/20 to-luxury-charcoal/70",
  }[overlay];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {showVideo ? (
        <SafeVideo
          src={videoSrc!}
          poster={poster}
          className="absolute inset-0"
          preload={priority ? "auto" : "metadata"}
          onError={() => setVideoFailed(true)}
        />
      ) : showImage ? (
        <SafeImage
          src={imageSrc!}
          alt=""
          fill
          priority={priority}
          objectFit="cover"
          className="object-cover"
          onError={() => setImageFailed(true)}
          sizes="100vw"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(198,169,114,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(214,185,140,0.1)_0%,transparent_50%),linear-gradient(160deg,#1a1a1a_0%,#2d2a26_40%,#1a1816_100%)]"
          aria-hidden
        />
      )}

      <div className={cn("absolute inset-0", overlayClass)} />

      {parallax && (
        <>
          <motion.div
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-luxury-gold/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-luxury-gold-light/10 blur-3xl"
          />
        </>
      )}

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40" />
    </div>
  );
}
