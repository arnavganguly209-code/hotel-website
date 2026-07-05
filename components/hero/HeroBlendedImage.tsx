"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { heroImageFilters } from "@/lib/hero/style-utils";
import type { HeroImageSettings } from "@/lib/cms/hero-builder-types";

interface HeroBlendedImageProps {
  image: HeroImageSettings;
  alt: string;
  width: number;
  mouseParallax?: boolean;
}

export function HeroBlendedImage({ image, alt, width, mouseParallax = true }: HeroBlendedImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);

  const src = image.desktopSrc || image.src;
  const filters = heroImageFilters(image);

  const maskStyle = {
    WebkitMaskImage:
      "radial-gradient(ellipse 85% 78% at 52% 48%, #000 52%, transparent 88%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
    maskImage:
      "radial-gradient(ellipse 85% 78% at 52% 48%, #000 52%, transparent 88%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
  };

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto w-full lg:mx-0"
      style={{ maxWidth: width, perspective: 1200, rotateX: mouseParallax ? rotateX : 0, rotateY: mouseParallax ? rotateY : 0 }}
      onMouseMove={(e) => {
        if (!mouseParallax || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Golden glow */}
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,154,61,0.28) 0%, rgba(238,216,179,0.12) 45%, transparent 72%)" }}
        aria-hidden
      />

      <motion.div
        className="group relative aspect-[4/5] w-full sm:aspect-[5/6]"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-full w-full overflow-hidden" style={maskStyle}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={image.preload}
            sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 560px"
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            style={{
              filter: `${filters} drop-shadow(0 24px 60px rgba(24,77,61,0.15))`,
              transform: `scale(${image.scale})`,
              objectPosition: image.position,
            }}
          />
          {image.gradientOverlay && (
            <div
              className="absolute inset-0 mix-blend-soft-light"
              style={{ background: image.gradientOverlay, opacity: Math.max(image.overlayOpacity, 0.15) }}
            />
          )}
          {/* Light bloom */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 60% 35%, rgba(255,248,230,0.35) 0%, transparent 55%), linear-gradient(to left, rgba(248,243,234,0.4) 0%, transparent 25%)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
