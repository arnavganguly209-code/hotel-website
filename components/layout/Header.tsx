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
import { HEADER_CREAM_GREEN } from "@/lib/header-theme";
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
          className="block h-[1.5px] w-full origin-center rounded-full bg-[#8B6914]"
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
  const barHeight = Math.max(52, Math.round((header.height || 72) * 0.8));

  const headerStyle = cn(
    header.sticky !== false && "fixed",
    "left-0 right-0 top-0 z-50 will-change-[backdrop-filter,box-shadow]",
    "border-b border-[rgba(140,170,120,0.28)]",
    "backdrop-blur-[12px]",
    "transition-[box-shadow,background-color,border-color] duration-500 ease-out",
    useTransparent
      ? "shadow-[0_2px_14px_rgba(24,60,45,0.06)]"
      : "shadow-[0_6px_22px_rgba(24,60,45,0.10)]"
  );

  return (
    <>
      <header className={headerStyle} style={{ minHeight: barHeight, ...HEADER_CREAM_GREEN }}>
        <div
          className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 min-[375px]:gap-3 min-[375px]:px-4 sm:gap-4 sm:px-5 lg:grid-cols-[1fr_auto_1fr] lg:px-8"
          style={{ minHeight: barHeight }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8B6914]/25 bg-white/45 transition-all active:scale-95 hover:border-[#8B6914]/50 hover:bg-white/65 hover:shadow-luxury sm:h-10 sm:w-10"
            aria-label="Open menu"
          >
            <HamburgerIcon open={false} />
          </button>

          <Logo
            variant="dark"
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
              <motion.a
                href={phoneHref}
                className="group/phone relative hidden items-center gap-2 rounded-full border border-[#3d5c45]/20 bg-[rgba(235,242,228,0.75)] px-3.5 py-1.5 text-[13px] font-bold tracking-[0.04em] text-[#3d5c45] shadow-[0_2px_10px_rgba(45,70,50,0.08)] md:flex lg:px-4 lg:text-[15px]"
                aria-label={`Call ${phoneDisplay}`}
                initial={{ opacity: 0.92, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-[#3d5c45] transition-transform duration-500 group-hover/phone:rotate-12"
                  aria-hidden
                />
                <span className="hidden whitespace-nowrap lg:inline">{phoneDisplay}</span>
              </motion.a>
            )}
            <Button
              size="sm"
              className="hidden h-9 rounded-full border-0 bg-gradient-to-r from-[#C89A3D] to-[#E9A546] px-4 uppercase tracking-[0.16em] text-white shadow-[0_6px_24px_rgba(200,154,61,0.35)] hover:opacity-95 sm:inline-flex"
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
