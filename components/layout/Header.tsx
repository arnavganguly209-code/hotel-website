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

  const headerStyle = cn(
    header.sticky !== false && "fixed",
    "left-0 right-0 top-0 z-50 transition-all duration-700",
    useTransparent
      ? "border-b border-[#184D3D]/10 bg-gradient-to-r from-[#F6F3E7] via-[#F3F2E7] to-[#EFF0E5] backdrop-blur-xl"
      : "border-b border-[#C89A3D]/10 bg-gradient-to-r from-[#F6F3E7]/95 via-[#F3F2E7]/95 to-[#EFF0E5]/95 shadow-[0_4px_30px_rgba(24,77,61,0.06)] backdrop-blur-xl"
  );

  return (
    <>
      <header
        className={headerStyle}
        style={{
          minHeight: header.height,
          backgroundColor: useTransparent ? undefined : header.backgroundColor,
        }}
      >
        <div
          className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 lg:px-8"
          style={{ minHeight: header.height }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-luxury-green/8 bg-white/50 text-luxury-green-dark backdrop-blur-sm transition-all active:scale-95 hover:border-luxury-gold/30 hover:shadow-luxury"
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
            className="justify-self-center"
          />

          <div className="flex items-center justify-end gap-3">
            {header.showPhone && (
              <a
                href={`tel:${header.phone}`}
                className="hidden items-center gap-2 text-xs text-luxury-muted transition-colors hover:text-luxury-gold md:flex"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{header.phone}</span>
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
