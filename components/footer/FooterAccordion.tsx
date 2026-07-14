"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterAccordionProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** Always open on md+; accordion only below md */
  defaultOpenMobile?: boolean;
}

export function FooterAccordion({
  title,
  children,
  className,
  defaultOpenMobile = false,
}: FooterAccordionProps) {
  const [open, setOpen] = useState(defaultOpenMobile);

  return (
    <div className={cn("border-b border-luxury-gold/15 md:border-none", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left md:pointer-events-none md:cursor-default md:py-0 md:pb-5"
        aria-expanded={open}
      >
        <h3 className="font-display text-[11px] font-medium uppercase tracking-[0.3em] text-luxury-gold">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-luxury-gold/80 transition-transform duration-400 md:hidden",
            open && "rotate-180"
          )}
          strokeWidth={1.25}
          aria-hidden
        />
      </button>

      <div className="hidden md:block">{children}</div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
