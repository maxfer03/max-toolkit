import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { snap } from "@/lib/motion";

const button = cva(
  "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "border border-accent/30 bg-accent/15 text-accent hover:bg-accent/25",
        default:
          "border border-border bg-surface-2 text-fg hover:border-border-strong hover:bg-surface-3",
        ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      whileTap={{ scale: 0.97 }}
      transition={snap}
      {...props}
    />
  ),
);
Button.displayName = "Button";
