"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, luxuryStagger } from "@/lib/animations";

interface MotionSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  stagger?: boolean;
}

export function MotionSection({
  children,
  className,
  id,
  stagger = false,
  ...props
}: MotionSectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger ? luxuryStagger : fadeUp}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
