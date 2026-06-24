import { useId } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { snap } from "@/lib/motion";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

/**
 * A segmented control with a tactile sliding indicator (shared-layout
 * animation via `layoutId`). Reusable across the toolkit.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  const layoutId = useId();
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-lg border border-border bg-surface p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
              pad,
              active ? "text-accent" : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={snap}
                className="absolute inset-0 rounded-md border border-accent/30 bg-accent/15"
              />
            )}
            {Icon && (
              <Icon size={size === "sm" ? 13 : 14} className="relative z-10" />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
