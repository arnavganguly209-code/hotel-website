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
  const brandLabel = (headerText || name)
    .replace(/\s*&\s*SPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const displayText = brandLabel.toUpperCase();
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
      aria-label={`${brandLabel} — Home`}
      style={showLogoImage ? { background: "transparent" } : undefined}
    >
      {showLogoImage ? (
        <SafeImage
          src={logoSrc}
          alt={brandLabel}
          width={logoSize * 2}
          height={logoSize}
          className="h-auto bg-transparent object-contain"
          style={{ maxHeight: logoSize, background: "transparent" }}
          priority
        />
      ) : showName ? (
        <span
          className={cn(
            "text-center font-display text-[13px] font-extrabold leading-none tracking-[0.14em] min-[360px]:tracking-[0.18em] sm:text-[15px] sm:tracking-[0.22em] md:text-[15px] md:tracking-[0.22em] lg:text-[16px] lg:tracking-[0.22em]",
            "text-[#111111] transition-colors duration-300 group-hover:text-[#000000]",
            variant === "light" && "text-[#F5F0E6] group-hover:text-white"
          )}
        >
          {displayText}
        </span>
      ) : null}
    </Link>
  );
}
