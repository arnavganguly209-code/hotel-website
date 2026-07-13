"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumNavDrawerProps {
  open: boolean;
  onClose: () => void;
  header: SiteContent["header"];
  hotelName: string;
}

const itemVariants = {
  hidden: { opacity: 0, x: -32 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 + i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

export function PremiumNavDrawer({ open, onClose, header, hotelName }: PremiumNavDrawerProps) {
  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="fixed inset-0 z-[90] bg-luxury-green-dark/40 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-[100] flex w-full max-w-md flex-col border-r border-white/10 bg-luxury-cream-light/90 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-luxury-green/10 px-6 py-5">
          <Logo
            variant="dark"
            name={hotelName}
            headerText={header.headerText}
            useLogo={header.useLogo}
            showText={header.showText}
            hideText={header.hideText}
            logoSrc={header.logoSrc}
            logoSize={header.logoSize}
          />
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-luxury-green/10 bg-white/60 text-luxury-green-dark transition-colors hover:border-luxury-gold/40"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-10" aria-label="Main navigation">
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.35em] text-luxury-gold/80">
            Explore
          </p>
          {header.menuItems.map((item, i) => (
            <motion.div
              key={item.href}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="group relative flex items-center justify-between py-4"
              >
                <span className="font-display text-xl font-light tracking-wide text-luxury-green-dark transition-colors group-hover:text-luxury-gold">
                  {item.label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-luxury-gold/0 transition-all group-hover:text-luxury-gold/70" />
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-luxury-gold to-luxury-champagne transition-all duration-500 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="border-t border-luxury-green/10 bg-gradient-to-t from-luxury-champagne/10 to-transparent p-6">
          <a
            href={`tel:${header.phone}`}
            className="mb-4 flex items-center justify-center gap-2 text-sm text-luxury-muted hover:text-luxury-gold"
          >
            <Phone className="h-4 w-4" />
            {header.phone}
          </a>
          <Button variant="gold" size="lg" className="w-full rounded-xl uppercase tracking-wider" asChild>
            <Link href={routes.contact} onClick={onClose}>
              {header.bookButtonText}
            </Link>
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
