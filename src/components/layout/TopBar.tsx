import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/components/command-palette/CommandPaletteProvider";

export function TopBar() {
  const { open } = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="text-sm tracking-tight transition-opacity hover:opacity-80">
          <span className="text-accent">max</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg">toolkit</span>
        </Link>

        <button
          onClick={open}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg-subtle transition-colors hover:border-border-strong hover:text-fg-muted"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search tools</span>
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-fg-muted">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
