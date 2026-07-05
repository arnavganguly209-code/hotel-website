import type { CSSProperties } from "react";
import type { HeroTextStyle } from "@/lib/cms/hero-builder-types";

export function heroTextStyle(style: HeroTextStyle, breakpoint: "mobile" | "tablet" | "desktop" = "desktop"): CSSProperties {
  const fontSize =
    breakpoint === "mobile"
      ? style.mobileFontSize
      : breakpoint === "tablet"
        ? style.tabletFontSize
        : style.desktopFontSize || style.fontSize;

  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontSize,
    color: style.gradient ? undefined : style.color,
    background: style.gradient || undefined,
    WebkitBackgroundClip: style.gradient ? "text" : undefined,
    WebkitTextFillColor: style.gradient ? "transparent" : undefined,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    textAlign: style.alignment,
    textShadow: style.textShadow !== "none" ? style.textShadow : undefined,
  };
}

export function heroImageFilters(image: {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
}): string {
  const transforms = [
    image.rotate ? `rotate(${image.rotate}deg)` : "",
    image.flipX ? "scaleX(-1)" : "",
    image.flipY ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `brightness(${image.brightness}%)`,
    `contrast(${image.contrast}%)`,
    `saturate(${image.saturation}%)`,
    image.blur ? `blur(${image.blur}px)` : "",
    transforms ? transforms : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function pickHeroImageSrc(
  image: { src: string; mobileSrc: string; tabletSrc: string; desktopSrc: string },
  viewport: "mobile" | "tablet" | "desktop"
) {
  if (viewport === "mobile" && image.mobileSrc) return image.mobileSrc;
  if (viewport === "tablet" && image.tabletSrc) return image.tabletSrc;
  if (viewport === "desktop" && image.desktopSrc) return image.desktopSrc;
  return image.src;
}
