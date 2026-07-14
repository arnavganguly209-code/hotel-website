"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FooterSectionHeading } from "@/components/footer/FooterSectionHeading";
import { cn } from "@/lib/utils";

interface FooterAccordionProps {
  title: string;
  children: ReactNode;
  className?: string;
  centerMobile?: boolean;
}

export function FooterAccordion({
  title,
  children,
  className,
  centerMobile = false,
}: FooterAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border-b border-luxury-gold/12 last:border-b-0 md:border-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-start justify-between gap-4 py-5 text-left md:hidden",
          centerMobile && "flex-col items-center gap-2"
        )}
        aria-expanded={open}
      >
        <FooterSectionHeading
          title={title}
          className="mb-0"
          align={centerMobile ? "center" : "left"}
        />
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-luxury-gold/75 transition-transform duration-500",
            centerMobile && "mt-0",
            open && "rotate-180"
          )}
          strokeWidth={1.2}
          aria-hidden
        />
      </button>

      <div className="hidden md:block">
        <FooterSectionHeading title={title} />
        {children}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="pb-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
