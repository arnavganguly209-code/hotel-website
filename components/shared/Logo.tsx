"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  name?: string;
  headerText?: string;
  useLogo?: boolean;
  showText?: boolean;
  hideText?: boolean;
  logoSrc?: string;
  /** Width in px for horizontal logo lockups. */
  logoSize?: number;
  showStars?: boolean;
  centered?: boolean;
  /** Soften solid black logo plates on dark headers. */
  blendDarkBackground?: boolean;
}

function scrollToHero() {
  const hero = document.getElementById("hero");
  if (hero) {
    hero.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  logoSize = 308,
  centered = false,
  blendDarkBackground = false,
}: LogoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const brandLabel = (headerText || name)
    .replace(/\s*&\s*SPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const displayText = brandLabel.toUpperCase();
  const showName = showText && !hideText && !useLogo;
  const showLogoImage = useLogo && logoSrc;
  const isHome = pathname === "/" || pathname === "";
  const logoWidth = Math.max(120, logoSize || 308);
  const maxH = Math.max(52, Math.round(logoWidth * 0.38));

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isHome) {
      e.preventDefault();
      scrollToHero();
      if (typeof window !== "undefined" && window.location.hash !== "#hero") {
        window.history.replaceState(null, "", "/#hero");
      }
      return;
    }
    e.preventDefault();
    router.push("/#hero");
  }

  return (
    <Link
      href="/#hero"
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-2",
        centered ? "flex-col justify-center" : "flex-row",
        className
      )}
      aria-label={`${brandLabel} — Home`}
      style={showLogoImage ? { background: "transparent" } : undefined}
    >
      {showLogoImage ? (
        <SafeImage
          src={logoSrc}
          alt={brandLabel}
          width={logoWidth}
          height={Math.round(logoWidth * 0.36)}
          className={cn(
            "h-auto w-auto max-w-none bg-transparent object-contain object-left",
            blendDarkBackground && "mix-blend-lighten"
          )}
          style={{
            width: logoWidth,
            maxWidth: `min(${logoWidth}px, 58vw)`,
            height: "auto",
            maxHeight: maxH,
            background: "transparent",
          }}
          priority
        />
      ) : showName ? (
        <span
          className={cn(
            "text-left font-display text-[13px] font-extrabold leading-none tracking-[0.14em] min-[360px]:tracking-[0.18em] sm:text-[15px] sm:tracking-[0.22em] md:text-[15px] lg:text-[16px]",
            "text-[#111111] transition-colors duration-300 group-hover:text-[#000000]",
            variant === "light" && "text-white group-hover:text-[#F5E6C8]"
          )}
        >
          {displayText}
        </span>
      ) : null}
    </Link>
  );
}
