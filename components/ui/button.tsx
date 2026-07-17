import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-luxury-charcoal text-white hover:bg-luxury-slate shadow-luxury hover:shadow-luxury-lg",
        gold: "bg-gradient-to-r from-luxury-gold-dark via-luxury-gold to-luxury-gold-light text-white hover:shadow-float hover:brightness-110 shadow-luxury-gold",
        outline:
          "border border-luxury-gold/30 bg-transparent text-luxury-charcoal hover:bg-luxury-gold/5 hover:border-luxury-gold/50",
        ghost:
          "text-luxury-charcoal hover:bg-luxury-gold/5 hover:text-luxury-gold",
        glass:
          "bg-white/60 backdrop-blur-xl border border-white/40 text-luxury-charcoal hover:bg-white/80 shadow-glass",
      },
      size: {
        default: "h-12 min-h-12 px-6 py-2",
        sm: "h-12 min-h-12 px-4 text-xs tracking-wide uppercase",
        lg: "h-12 min-h-12 px-8 text-base tracking-wide",
        icon: "h-12 w-12 min-h-12 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
