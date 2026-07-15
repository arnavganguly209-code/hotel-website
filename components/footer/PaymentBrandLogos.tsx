"use client";

import { cn } from "@/lib/utils";
import { FOOTER } from "@/components/footer/footer-theme";

interface PaymentBrandLogosProps {
  logos: Array<{ id: string; src: string }>;
  className?: string;
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
        "mx-auto grid w-full max-w-[280px] grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-3 lg:grid-cols-2",
        className
      )}
    >
      {slots.map((slot) => (
        <li key={slot.id}>
          <div
            className={cn(
              "flex h-[52px] items-center justify-center rounded-md p-3",
              "shadow-[0_2px_10px_rgba(0,0,0,0.18)]",
              "transition-all duration-500 ease-[0.22,1,0.36,1]",
              "hover:-translate-y-0.5"
            )}
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: `${FOOTER.gold}66`,
              backgroundColor: FOOTER.cream,
            }}
          >
            {slot.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slot.src}
                alt=""
                className="h-full w-full object-contain object-center"
                loading="lazy"
                decoding="async"
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
      ))}
    </ul>
  );
}
