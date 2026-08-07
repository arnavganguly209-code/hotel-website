"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

function scrollToHero() {
  const hero = document.getElementById("hero");
  if (hero) {
    hero.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-3.5 w-5 flex-col justify-between">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-[1.5px] w-full origin-center rounded-full bg-[#E8C56A] shadow-[0_0_6px_rgba(212,175,55,0.45)]"
          animate={
            open
              ? i === 0
                ? { rotate: 45, y: 6.5 }
                : i === 1
                  ? { opacity: 0, scaleX: 0 }
                  : { rotate: -45, y: -6.5 }
              : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

export function Header({ header, hotelName }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
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
  const barHeight = Math.max(52, Math.min(58, header.height || 56));
  const logoWidth = header.logoSize && header.logoSize > 0 ? header.logoSize : 252;
  const logoFitH = Math.max(40, barHeight - 8);
  const primaryNav =
    header.primaryNavItems?.length > 0
      ? header.primaryNavItems
      : [
          { label: "Overview", href: "/#hero" },
          { label: "Rooms", href: routes.rooms },
          { label: "Restaurant", href: routes.restaurant },
          { label: "Contact", href: routes.contact },
        ];
  const bookHref = header.bookButtonHref || routes.rooms;
  const showPrimaryNav = header.showPrimaryNav !== false;
  const showBook = header.showBookButton !== false;

  function handlePrimaryClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    item: { label: string; href: string }
  ) {
    const toHero =
      /overview/i.test(item.label) ||
      item.href === "/#hero" ||
      item.href === "/#overview" ||
      item.href === "/";
    if (!toHero) return;
    e.preventDefault();
    if (isHome) {
      scrollToHero();
      if (typeof window !== "undefined" && window.location.hash !== "#hero") {
        window.history.replaceState(null, "", "/#hero");
      }
      return;
    }
    router.push("/#hero");
  }

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
      <header className={headerStyle} style={{ height: barHeight, minHeight: barHeight, ...surfaceStyle }}>
        <div
          className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-2 px-3 min-[375px]:px-4 sm:gap-3 sm:px-5 lg:gap-5 lg:px-8"
          style={{ height: barHeight }}
        >
          <div className="flex h-full min-w-0 shrink-0 items-center py-1">
            <Logo
              variant="light"
              name={hotelName}
              headerText={header.headerText}
              useLogo={header.useLogo}
              showText={header.showText}
              hideText={header.hideText}
              logoSrc={header.logoSrc}
              logoSize={logoWidth}
              fitHeight={logoFitH}
              blendDarkBackground
              className="min-w-0"
            />
          </div>

          {showPrimaryNav && (
            <nav
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 md:flex lg:gap-1"
              aria-label="Primary"
            >
              {primaryNav.map((item) => {
                const isOverview =
                  /overview/i.test(item.label) ||
                  item.href === "/#hero" ||
                  item.href === "/#overview" ||
                  item.href === "/";
                const active = isOverview
                  ? isHome
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={isOverview ? "/#hero" : item.href}
                    onClick={(e) => handlePrimaryClick(e, item)}
                    className={cn(
                      "group/nav relative whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] lg:px-3 lg:text-[12px]",
                      "!text-white transition-[color,transform,text-shadow] duration-300 ease-out",
                      "hover:!text-[#E8C56A] hover:scale-[1.03]",
                      "hover:[text-shadow:0_0_18px_rgba(232,197,106,0.55)]",
                      active && "!text-[#FFF8E7] [text-shadow:0_0_14px_rgba(212,175,55,0.35)]"
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "pointer-events-none absolute inset-x-3 -bottom-0.5 h-[1.5px] origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#E8C56A] to-transparent transition-transform duration-300 ease-out",
                        "group-hover/nav:scale-x-100",
                        active && "scale-x-100"
                      )}
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="relative z-10 flex h-full shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            {header.showPhone && (
              <motion.a
                href={phoneHref}
                className="group/phone relative hidden items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] !text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:flex lg:px-3 lg:text-[12px]"
                aria-label={`Call ${phoneDisplay}`}
                initial={{ opacity: 0.92, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-[#E8C56A] transition-transform duration-500 group-hover/phone:rotate-12"
                  aria-hidden
                />
                <span className="hidden whitespace-nowrap xl:inline">{phoneDisplay}</span>
              </motion.a>
            )}
            {showBook && (
              <Button
                size="sm"
                className="hidden h-8 rounded-full border-0 bg-gradient-to-r from-[#C89A3D] to-[#E9A546] px-3 text-[10px] uppercase tracking-[0.14em] text-white shadow-[0_6px_20px_rgba(200,154,61,0.32)] hover:opacity-95 sm:inline-flex lg:px-3.5 lg:text-[11px]"
                asChild
              >
                <Link href={bookHref}>{header.bookButtonText || "Book Now"}</Link>
              </Button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E8C56A]/55 bg-white/[0.10] shadow-[0_0_12px_rgba(232,197,106,0.2)] transition-all active:scale-95 hover:border-[#E8C56A]/85 hover:bg-white/[0.14] sm:h-9 sm:w-9"
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
