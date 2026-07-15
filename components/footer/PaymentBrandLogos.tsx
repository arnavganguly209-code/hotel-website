"use client";

import { cn } from "@/lib/utils";

interface PaymentBrandLogosProps {
  logos: Array<{ id: string; src: string }>;
  className?: string;
}

export function PaymentBrandLogos({ logos, className }: PaymentBrandLogosProps) {
  const slots = logos.length >= 6 ? logos.slice(0, 6) : [
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
      {slots.map((slot) => (
        <li key={slot.id}>
          <div
            className={cn(
              "flex h-12 items-center justify-center rounded-md px-2.5",
              "border border-[#C8A145]/40 bg-[#FAF6EE]",
              "shadow-[0_2px_10px_rgba(0,0,0,0.18)]",
              "transition-all duration-500 ease-[0.22,1,0.36,1]",
              "hover:-translate-y-0.5 hover:border-[#C8A145]/70",
              "hover:shadow-[0_8px_18px_rgba(200,161,69,0.18)]"
            )}
          >
            {slot.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slot.src}
                alt=""
                className="max-h-7 w-auto max-w-[72px] object-contain"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="h-1.5 w-8 rounded-full bg-[#C8A145]/25" aria-hidden />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
