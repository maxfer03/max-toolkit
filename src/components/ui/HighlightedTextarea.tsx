import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface HighlightSegment {
  text: string;
  /** CSS color for this run; omit for plain (inherits foreground). */
  color?: string;
}

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  /** Colored runs that, concatenated, must equal `value`. */
  segments: HighlightSegment[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * A textarea whose content is colorized live. A real (transparent) textarea
 * sits on top for native editing — caret, selection, IME, mobile keyboard —
 * while a perfectly-aligned backdrop renders the colored text behind it.
 *
 * The textarea and backdrop MUST share identical typography + box metrics
 * (see `shared`) or the colors drift out of alignment.
 */
export function HighlightedTextarea({
  value,
  onChange,
  segments,
  placeholder,
  className,
  ariaLabel,
}: HighlightedTextareaProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // 16px on mobile prevents iOS Safari's focus auto-zoom; 14px from sm up.
  const shared =
    "px-3 py-2.5 font-mono text-base leading-relaxed whitespace-pre-wrap break-words sm:text-sm";

  return (
    <div
      className={cn(
        "relative rounded-md border border-border bg-surface transition-colors focus-within:border-accent/50",
        className,
      )}
    >
      <div
        ref={backdropRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden text-fg",
          shared,
        )}
      >
        {segments.map((s, i) =>
          s.color ? (
            <span
              key={i}
              className="rounded-[3px]"
              style={{
                color: s.color,
                backgroundColor: `color-mix(in oklab, ${s.color} 12%, transparent)`,
              }}
            >
              {s.text}
            </span>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
        {/* keep the final empty line visible when the text ends in a newline */}
        {value.endsWith("\n") ? " " : ""}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          const bd = backdropRef.current;
          if (bd) {
            bd.scrollTop = e.currentTarget.scrollTop;
            bd.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          "relative block min-h-[180px] w-full resize-y bg-transparent text-transparent caret-fg outline-none placeholder:text-fg-subtle",
          shared,
        )}
      />
    </div>
  );
}
