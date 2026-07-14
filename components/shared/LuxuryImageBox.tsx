"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

interface LuxuryImageBoxProps {
  src?: string;
  alt: string;
  label?: string;
  variant?: "dining" | "cafe" | "lounge" | "spa" | "culture" | "room" | "gallery";
  className?: string;
}

const variantStyles = {
  dining: "from-luxury-green via-luxury-green-mid to-luxury-green-light",
  cafe: "from-luxury-green-mid via-luxury-slate to-luxury-green",
  lounge: "from-luxury-charcoal via-luxury-green-mid to-luxury-green",
  spa: "from-luxury-green-light via-luxury-green-mid to-luxury-green",
  culture: "from-luxury-green via-amber-950/30 to-luxury-green-mid",
  room: "from-luxury-slate via-luxury-green-mid to-luxury-charcoal",
  gallery: "from-luxury-cream via-luxury-sand to-luxury-charcoal",
};

export function LuxuryImageBox({
  src,
  alt,
  label,
  variant = "dining",
  className,
}: LuxuryImageBoxProps) {
  const [error, setError] = useState(false);
  const showImage = src && !error;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden border border-luxury-gold/20 shadow-luxury-lg lg:aspect-auto lg:min-h-[480px]",
        className
      )}
    >
      {showImage ? (
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <SafeImage
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setError(true)}
          />
        </motion.div>
      ) : (
        <div
          className={cn(
            "relative flex h-full min-h-[320px] w-full flex-col items-center justify-center bg-gradient-to-br lg:min-h-[480px]",
            variantStyles[variant]
          )}
        >
          <div className="absolute inset-0 animate-shimmer bg-green-shimmer bg-[length:200%_100%]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(201,169,98,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(45,90,61,0.3)_0%,transparent_50%)]" />

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-luxury-gold/40"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}

          <div className="relative z-10 text-center px-8">
            <motion.div
              className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-luxury-gold to-transparent"
              animate={{ scaleX: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <p className="font-display text-xs font-medium uppercase tracking-[0.4em] text-luxury-gold-light">
              {label || alt}
            </p>
            <p className="mt-3 font-accent text-lg italic text-white/40">
              Luxury Experience
            </p>
          </div>

          <div className="absolute inset-0 border border-luxury-gold/10 transition-colors duration-500 group-hover:border-luxury-gold/30" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-charcoal/50 via-transparent to-luxury-gold/5 opacity-70" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
    </motion.div>
  );
}
