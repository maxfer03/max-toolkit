import { Outlet } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";
import { TopBar } from "./TopBar";

export function Shell() {
  return (
    <CommandPaletteProvider>
      <div className="flex min-h-dvh flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:py-10">
          <Outlet />
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 text-xs text-fg-subtle">
            <span>max·toolkit</span>
            <a
              href="https://github.com/maxfer03/max-toolkit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-fg"
            >
              view source <ArrowUpRight size={12} />
            </a>
          </div>
        </footer>
      </div>
    </CommandPaletteProvider>
  );
}
