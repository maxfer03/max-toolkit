import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    spellCheck={false}
    autoComplete="off"
    autoCorrect="off"
    autoCapitalize="off"
    className={cn(
      "w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed text-fg placeholder:text-fg-subtle transition-colors focus:border-accent/50 focus:outline-none aria-[invalid=true]:border-ansi-red/60",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
