import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/navigation";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  name?: string;
  headerText?: string;
  useLogo?: boolean;
  showText?: boolean;
  hideText?: boolean;
  logoSrc?: string;
  logoSize?: number;
  showStars?: boolean;
  centered?: boolean;
}

export function Logo({
  variant = "dark",
  className,
  name = "Hotel Thamel Park",
  headerText,
  useLogo = false,
  showText = true,
  hideText = false,
  logoSrc = "",
  logoSize = 48,
  showStars = false,
  centered = false,
}: LogoProps) {
  const displayText = (headerText || name).toUpperCase();
  const showName = showText && !hideText && !useLogo;
  const showLogoImage = useLogo && logoSrc;

  return (
    <Link
      href={routes.home}
      className={cn(
        "group flex flex-col items-center gap-1",
        !centered && "sm:flex-row sm:gap-3",
        className
      )}
      aria-label={`${name} — Home`}
    >
      {showLogoImage ? (
        <SafeImage
          src={logoSrc}
          alt={name}
          width={logoSize * 2}
          height={logoSize}
          className="h-auto object-contain"
          style={{ maxHeight: logoSize }}
          priority
        />
      ) : showName ? (
        <span
          className={cn(
            "text-center font-display text-[10px] font-medium leading-relaxed tracking-[0.2em] transition-colors sm:text-xs md:text-sm",
            variant === "light"
              ? "text-white group-hover:text-luxury-champagne"
              : "text-luxury-green-dark group-hover:text-luxury-gold"
          )}
        >
          {displayText}
        </span>
      ) : null}
    </Link>
  );
}
