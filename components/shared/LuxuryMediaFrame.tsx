"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { luxuryEase } from "@/lib/animations";
import type { CmsMedia } from "@/lib/cms/types";
import { hasMediaSrc } from "@/lib/cms/media-url";
import { SafeImage } from "@/components/shared/SafeImage";
import { SafeVideo } from "@/components/shared/SafeVideo";

interface LuxuryMediaFrameProps {
  media: CmsMedia;
  label?: string;
  aspectClass?: string;
  roundedClass?: string;
  className?: string;
  href?: string;
  priority?: boolean;
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 7.5) % 84}%`,
  top: `${12 + (i * 11) % 76}%`,
  size: i % 3 === 0 ? 3 : 2,
  delay: i * 0.35,
  duration: 4 + (i % 4),
}));

function LuxuryPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-shift bg-[length:200%_200%]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #FAF6EE 0%, #F6ECD7 25%, #EAF2E8 50%, #F9F0DB 75%, #FFF9F2 100%)",
        }}
      />
      <motion.div
        className="absolute -left-1/4 top-1/4 h-2/3 w-2/3 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(201,164,76,0.22) 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: luxuryEase }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-1/2 w-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(234,242,232,0.9) 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: luxuryEase }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] opacity-60" />
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-luxury-gold/35"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: luxuryEase }}
        />
      ))}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <motion.div
          className="mb-5 h-px w-20 bg-gradient-to-r from-transparent via-luxury-gold to-transparent"
          animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: luxuryEase }}
        />
        <p className="font-display text-[11px] font-medium uppercase tracking-[0.4em] text-luxury-gold">
          {label}
        </p>
        <p className="mt-3 font-accent text-lg italic text-luxury-forest/40">Luxury Awaits</p>
      </div>
    </div>
  );
}

export function LuxuryMediaFrame({
  media,
  label,
  aspectClass = "aspect-[4/5]",
  roundedClass = "rounded-[34px]",
  className,
  href,
  priority = false,
}: LuxuryMediaFrameProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const showVideo = media.type === "video" && hasMediaSrc(media.videoSrc) && !videoError;
  const imageSrc = media.imageSrc || "";
  const showImage = !showVideo && hasMediaSrc(imageSrc) && !imageError;

  const frame = (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: luxuryEase }}
      className={cn(
        "group relative overflow-hidden border border-white/65 shadow-float",
        aspectClass,
        roundedClass,
        className
      )}
      style={{
        boxShadow:
          "0 35px 90px rgba(24,56,47,0.14), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(201,164,76,0.12)",
      }}
    >
      {showVideo ? (
        <SafeVideo
          src={media.videoSrc!}
          poster={media.poster}
          className="absolute inset-0"
          preload={priority ? "auto" : "metadata"}
          onError={() => setVideoError(true)}
        />
      ) : showImage ? (
        <SafeImage
          src={imageSrc}
          alt={media.alt}
          fill
          priority={priority}
          objectFit="cover"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          onError={() => setImageError(true)}
        />
      ) : (
        <LuxuryPlaceholder label={label || media.caption || media.alt || "Premium Media"} />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-forest/25 via-transparent to-white/10" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_40%,rgba(201,164,76,0.06)_100%)]" />

      <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-luxury-gold/50" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-luxury-gold/50" />

      {media.caption && showImage ? (
        <p className="pointer-events-none absolute bottom-6 left-6 right-6 font-accent text-sm italic text-white/85">
          {media.caption}
        </p>
      ) : null}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full w-full transition-transform duration-700 hover:-translate-y-1">
        {frame}
      </Link>
    );
  }

  return frame;
}
