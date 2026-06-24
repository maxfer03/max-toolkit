import { cn } from "@/lib/utils";

/** A blinking terminal cursor. Purely decorative. */
export function Cursor({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-[1em] w-[0.55ch] translate-y-[0.12em] bg-accent",
        className,
      )}
      style={{ animation: "terminal-blink 1.1s steps(1) infinite" }}
    />
  );
}
