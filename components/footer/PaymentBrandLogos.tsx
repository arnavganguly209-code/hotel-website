"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FOOTER } from "@/components/footer/footer-theme";
import { normalizePaymentLogoSrc } from "@/lib/cms/payment-logos";
import { mediaUrl } from "@/lib/cms/media-url";

interface PaymentBrandLogosProps {
  logos: Array<{ id: string; src: string }>;
  className?: string;
}

function PaymentSlot({ id, src, index }: { id: string; src: string; index: number }) {
  const clean = normalizePaymentLogoSrc(src);
  const resolved = clean ? mediaUrl(clean, clean) : "";
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [resolved]);

  const showImage = Boolean(resolved) && !broken;

  return (
    <li>
      <div
        className={cn(
          "flex w-full items-center justify-center overflow-hidden rounded-md",
          "shadow-[0_2px_10px_rgba(0,0,0,0.18)]",
          "transition-all duration-500 ease-[0.22,1,0.36,1]",
          "hover:-translate-y-0.5"
        )}
        style={{
          height: 58,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: `${FOOTER.gold}66`,
          backgroundColor: FOOTER.cream,
          /* ~10% inset → logo fills ~80% of card */
          padding: "5px 6px",
        }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${id}-${resolved}-${index}`}
            src={resolved}
            alt=""
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              objectPosition: "center",
              transform: "scale(1.05)",
            }}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        ) : (
          <span
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: `${FOOTER.gold}40` }}
            aria-hidden
          />
        )}
      </div>
    </li>
  );
}

export function PaymentBrandLogos({ logos, className }: PaymentBrandLogosProps) {
  const slots =
    logos.length >= 6
      ? logos.slice(0, 6)
      : [
          ...logos,
          ...Array.from({ length: Math.max(0, 6 - logos.length) }, (_, i) => ({
            id: `empty-${i}`,
            src: "",
          })),
        ];

  return (
    <ul
      className={cn(
        "mx-auto grid w-full max-w-[280px] grid-cols-2 gap-2.5 sm:max-w-none sm:grid-cols-3 lg:grid-cols-2",
        className
      )}
    >
      {slots.map((slot, index) => (
        <PaymentSlot
          key={`${slot.id}-${normalizePaymentLogoSrc(slot.src) || "empty"}-${index}`}
          id={slot.id}
          src={slot.src}
          index={index}
        />
      ))}
    </ul>
  );
}
