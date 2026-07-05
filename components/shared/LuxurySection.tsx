import { cn } from "@/lib/utils";

type LuxurySectionVariant = "cream" | "ivory" | "green" | "champagne" | "gradient";

interface LuxurySectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: LuxurySectionVariant;
  id?: string;
}

const variants: Record<LuxurySectionVariant, string> = {
  cream:
    "bg-gradient-to-b from-luxury-cream via-luxury-cream-light to-luxury-cream",
  ivory:
    "bg-gradient-to-br from-luxury-cream-light via-luxury-ivory to-luxury-champagne/10",
  green:
    "bg-gradient-to-br from-luxury-green/5 via-luxury-cream to-luxury-green-pale/30",
  champagne:
    "bg-gradient-to-b from-luxury-champagne/15 via-luxury-cream-light to-luxury-cream",
  gradient:
    "bg-[radial-gradient(ellipse_at_top,rgba(216,180,106,0.12),transparent_55%),linear-gradient(180deg,#FDFBF7_0%,#F8F5EE_100%)]",
};

export function LuxurySection({
  children,
  className,
  variant = "gradient",
  id,
}: LuxurySectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden px-6 py-24 md:px-8 md:py-32 lg:py-36",
        variants[variant],
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMyNDQ3MzYiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]" />
      <div className="relative mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
