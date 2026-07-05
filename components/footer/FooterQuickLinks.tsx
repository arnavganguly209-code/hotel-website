"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

interface FooterQuickLinksProps {
  links: SiteContent["footer"]["quickLinks"];
}

function LinkList({ links }: { links: SiteContent["footer"]["quickLinks"] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group relative inline-flex items-center gap-2 text-sm text-luxury-muted transition-colors duration-300 hover:text-luxury-gold"
          >
            <ChevronRight className="h-3 w-3 text-luxury-gold/70 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
            <span className="relative">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-luxury-gold transition-all duration-500 group-hover:w-full" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FooterQuickLinks({ links }: FooterQuickLinksProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={fadeUp}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-5 flex w-full items-center justify-between lg:pointer-events-none"
        aria-expanded={open}
      >
        <h3 className="font-display text-xs font-medium uppercase tracking-[0.28em] text-luxury-gold">
          Quick Links
        </h3>
        <ChevronDown
          className={cn("h-4 w-4 text-luxury-gold transition-transform lg:hidden", open && "rotate-180")}
        />
      </button>

      <div className="hidden lg:block">
        <LinkList links={links} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <LinkList links={links} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
