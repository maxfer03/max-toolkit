import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { tools } from "@/tools/registry";
import { categories, categoryOrder } from "@/tools/categories";
import { snap } from "@/lib/motion";

interface CommandPaletteApi {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = createContext<CommandPaletteApi | null>(null);

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  const api = useMemo<CommandPaletteApi>(
    () => ({
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((o) => !o),
    }),
    [isOpen],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const select = useCallback(
    (id: string) => {
      setOpen(false);
      navigate(`/tools/${id}`);
    },
    [navigate],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="w-full max-w-xl overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl shadow-black/50"
              initial={{ opacity: 0, scale: 0.97, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={snap}
            >
              <Command label="Command Menu" className="w-full">
                <div className="flex items-center gap-2 border-b border-border px-4">
                  <span className="select-none text-accent">&gt;</span>
                  <Command.Input
                    autoFocus
                    placeholder="Search tools…"
                    className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
                  />
                  <Search size={15} className="text-fg-subtle" />
                </div>
                <Command.List className="max-h-[50vh] overflow-y-auto p-2">
                  <Command.Empty className="px-3 py-8 text-center text-sm text-fg-subtle">
                    No tools found.
                  </Command.Empty>
                  {categoryOrder.map((cid) => {
                    const items = tools.filter((t) => t.category === cid);
                    if (!items.length) return null;
                    const cat = categories[cid];
                    return (
                      <Command.Group
                        key={cid}
                        heading={cat.label}
                        className="text-fg-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                      >
                        {items.map((t) => {
                          const Icon = t.icon;
                          return (
                            <Command.Item
                              key={t.id}
                              value={`${t.name} ${t.keywords.join(" ")}`}
                              onSelect={() => select(t.id)}
                              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-fg-muted aria-selected:bg-surface-2 aria-selected:text-fg data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg"
                            >
                              <Icon size={16} style={{ color: cat.color }} />
                              <span className="text-fg">{t.name}</span>
                              <span className="ml-auto truncate pl-3 text-xs text-fg-subtle">
                                {t.description}
                              </span>
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    );
                  })}
                </Command.List>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
