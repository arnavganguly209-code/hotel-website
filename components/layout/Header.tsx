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
import { HEADER_SEARCH_MATCH } from "@/lib/header-theme";
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
          className="block h-[1.5px] w-full origin-center rounded-full bg-[#C5A059]"
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
  const barHeight = Math.max(56, Math.min(72, header.height || 64));
  const logoWidth = header.logoSize || 220;
  const primaryNav =
    header.primaryNavItems?.length > 0
      ? header.primaryNavItems
      : [
          { label: "Overview", href: "/#overview" },
          { label: "Rooms", href: routes.rooms },
          { label: "Restaurant", href: routes.restaurant },
          { label: "Contact", href: routes.contact },
        ];
  const bookHref = header.bookButtonHref || routes.rooms;
  const showPrimaryNav = header.showPrimaryNav !== false;
  const showBook = header.showBookButton !== false;

  const headerStyle = cn(
    header.sticky !== false && "fixed",
    "left-0 right-0 top-0 z-50 will-change-[backdrop-filter,box-shadow]",
    "border-b border-[rgba(212,176,106,0.32)]",
    "backdrop-blur-[24px]",
    "transition-[box-shadow,background-color,border-color] duration-500 ease-out",
    useTransparent && "border-transparent shadow-none"
  );

  const surfaceStyle = useTransparent
    ? {
        backgroundColor: "transparent",
        backgroundImage: "none",
        boxShadow: "none",
      }
    : HEADER_SEARCH_MATCH;

  return (
    <>
      <header className={headerStyle} style={{ minHeight: barHeight, ...surfaceStyle }}>
        <div
          className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-3 min-[375px]:px-4 sm:gap-4 sm:px-5 lg:gap-6 lg:px-8"
          style={{ minHeight: barHeight }}
        >
          {/* Left — brand logo */}
          <div className="flex min-w-0 shrink-0 items-center">
            <Logo
              variant="light"
              name={hotelName}
              headerText={header.headerText}
              useLogo={header.useLogo}
              showText={header.showText}
              hideText={header.hideText}
              logoSrc={header.logoSrc}
              logoSize={logoWidth}
              blendDarkBackground
              className="min-w-0"
            />
          </div>

          {/* Center — primary pages */}
          {showPrimaryNav && (
            <nav
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex lg:gap-2"
              aria-label="Primary"
            >
              {primaryNav.map((item) => {
                const active =
                  item.href === "/" || item.href.startsWith("/#")
                    ? isHome
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className={cn(
                      "relative whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 lg:px-3.5 lg:text-[13px]",
                      active
                        ? "text-[#F5F0E6]"
                        : "text-[#E8F0E4]/72 hover:text-[#F5F0E6]"
                    )}
                  >
                    {item.label}
                    {active && (
                      <span
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right — phone, book, menu */}
          <div className="relative z-10 flex shrink-0 items-center justify-end gap-1.5 sm:gap-2.5">
            {header.showPhone && (
              <motion.a
                href={phoneHref}
                className="group/phone relative hidden items-center gap-2 rounded-full border border-[#D4AF37]/28 bg-white/[0.06] px-3 py-1.5 text-[12px] font-bold tracking-[0.04em] text-[#E8F0E4] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:flex lg:px-3.5 lg:text-[13px]"
                aria-label={`Call ${phoneDisplay}`}
                initial={{ opacity: 0.92, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-[#D4AF37] transition-transform duration-500 group-hover/phone:rotate-12"
                  aria-hidden
                />
                <span className="hidden whitespace-nowrap xl:inline">{phoneDisplay}</span>
              </motion.a>
            )}
            {showBook && (
              <Button
                size="sm"
                className="hidden h-9 rounded-full border-0 bg-gradient-to-r from-[#C89A3D] to-[#E9A546] px-3.5 text-[11px] uppercase tracking-[0.16em] text-white shadow-[0_6px_24px_rgba(200,154,61,0.35)] hover:opacity-95 sm:inline-flex lg:px-4 lg:text-[12px]"
                asChild
              >
                <Link href={bookHref}>{header.bookButtonText || "Book Now"}</Link>
              </Button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/[0.06] transition-all active:scale-95 hover:border-[#D4AF37]/60 hover:bg-white/[0.10] sm:h-10 sm:w-10"
              aria-label="Open menu"
            >
              <HamburgerIcon open={false} />
            </button>
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
