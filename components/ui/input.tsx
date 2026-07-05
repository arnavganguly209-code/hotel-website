import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-sm border border-luxury-gold/15 bg-white/80 px-4 py-2 text-sm text-luxury-charcoal backdrop-blur-sm transition-all duration-300 placeholder:text-luxury-muted/60 focus:border-luxury-gold/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
