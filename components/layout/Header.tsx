"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/useScrolled";
import type { SiteContent } from "@/lib/cms/types";

const PremiumNavDrawer = dynamic(
  () => import("@/components/shared/PremiumNavDrawer").then((m) => m.PremiumNavDrawer),
  { ssr: false, loading: () => null }
);

interface HeaderProps {
  header: SiteContent["header"];
  hotelName: string;
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-6 flex-col justify-between">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-px w-full origin-center bg-current"
          animate={
            open
              ? i === 0
                ? { rotate: 45, y: 9 }
                : i === 1
                  ? { opacity: 0, scaleX: 0 }
                  : { rotate: -45, y: -9 }
              : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

export function Header({ header, hotelName }: HeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const useTransparent = header.transparent && isHome && !scrolled;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const phoneDisplay = header.phone || "+977 014701536";
  const phoneHref = `tel:${phoneDisplay.replace(/[^\d+]/g, "")}`;

  /* Cream-green glass — ~48% opacity, soft blur, luxury lobby feel */
  const headerStyle = cn(
    header.sticky !== false && "fixed",
    "left-0 right-0 top-0 z-50 will-change-[backdrop-filter,box-shadow]",
    "border-b border-[rgba(197,160,89,0.22)]",
    "bg-[rgba(236,242,232,0.48)] backdrop-blur-[18px] backdrop-saturate-150",
    "supports-[backdrop-filter]:bg-[rgba(236,242,232,0.45)]",
    "transition-[box-shadow,background-color,border-color] duration-500 ease-out",
    useTransparent
      ? "shadow-[0_4px_20px_rgba(24,60,45,0.04)]"
      : "shadow-[0_8px_28px_rgba(24,60,45,0.10)]"
  );

  return (
    <>
      <header className={headerStyle} style={{ minHeight: header.height }}>
        <div
          className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 min-[375px]:gap-3 min-[375px]:px-4 sm:gap-4 sm:px-5 lg:grid-cols-[1fr_auto_1fr] lg:px-8"
          style={{ minHeight: header.height }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(24,77,61,0.10)] bg-white/40 text-luxury-green-dark backdrop-blur-sm transition-all active:scale-95 hover:border-luxury-gold/30 hover:bg-white/55 hover:shadow-luxury sm:h-12 sm:w-12"
            aria-label="Open menu"
          >
            <HamburgerIcon open={false} />
          </button>

          <Logo
            variant={useTransparent ? "dark" : "dark"}
            name={hotelName}
            headerText={header.headerText}
            useLogo={header.useLogo}
            showText={header.showText}
            hideText={header.hideText}
            logoSrc={header.logoSrc}
            logoSize={header.logoSize}
            centered
            className="min-w-0 justify-self-center px-1"
          />

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {header.showPhone && (
              <a
                href={phoneHref}
                className="hidden items-center gap-2 text-[13px] font-semibold tracking-[0.04em] text-[#1a3d30] transition-colors hover:text-[#9a7a3a] md:flex lg:text-[15px]"
                aria-label={`Call ${phoneDisplay}`}
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#b8934a]" aria-hidden />
                <span className="hidden whitespace-nowrap lg:inline">{phoneDisplay}</span>
              </a>
            )}
            <Button
              size="sm"
              className="hidden rounded-full border-0 bg-gradient-to-r from-[#C89A3D] to-[#E9A546] px-5 uppercase tracking-[0.16em] text-white shadow-[0_6px_24px_rgba(200,154,61,0.35)] hover:opacity-95 sm:inline-flex"
              asChild
            >
              <Link href={routes.rooms}>{header.bookButtonText}</Link>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <PremiumNavDrawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            header={header}
            hotelName={hotelName}
          />
        )}
      </AnimatePresence>
    </>
  );
}
