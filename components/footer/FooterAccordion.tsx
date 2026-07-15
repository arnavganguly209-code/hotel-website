"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FooterSectionHeading } from "@/components/footer/FooterSectionHeading";
import { FOOTER } from "@/components/footer/footer-theme";
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
      className={cn("border-b last:border-b-0 md:border-none md:!border-0", className)}
      style={{ borderColor: `${FOOTER.gold}33` }}
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
            "mt-0.5 h-4 w-4 shrink-0 transition-transform duration-500",
            open && "rotate-180"
          )}
          style={{ color: FOOTER.gold }}
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
