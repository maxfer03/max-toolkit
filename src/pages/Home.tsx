import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { LayoutGrid, List } from "lucide-react";
import { tools } from "@/tools/registry";
import { categories, categoryOrder } from "@/tools/categories";
import { ToolCard } from "@/components/ToolCard";
import { Cursor } from "@/components/Cursor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ViewMode = "cards" | "list";

export default function Home() {
  const [view, setView] = useLocalStorage<ViewMode>("toolkit:home-view", "cards");

  return (
    <div>
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      >
        <p className="text-sm text-fg-subtle">$ welcome to</p>
        <h1 className="mt-1 text-2xl font-medium">
          <span className="text-accent">max</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg">toolkit</span>
          <Cursor className="ml-1.5" />
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          my daily tools, so i never have to open another sketchy website. press{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px] text-fg-muted">
            ⌘K
          </kbd>{" "}
          to jump around.
        </p>
      </motion.section>

      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
          <button
            onClick={() => setView("cards")}
            aria-label="Card view"
            aria-pressed={view === "cards"}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "cards" ? "bg-surface-3 text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            <LayoutGrid size={13} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list" ? "bg-surface-3 text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <motion.div
          key="cards"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {tools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </motion.div>
      ) : (
        <div key="list" className="space-y-5">
          {categoryOrder.map((cid) => {
            const items = tools.filter((t) => t.category === cid);
            if (!items.length) return null;
            const cat = categories[cid];
            return (
              <section key={cid}>
                <h2 className="mb-1.5 text-[10px] uppercase tracking-wider text-fg-subtle">
                  <span style={{ color: cat.color }}>#</span> {cat.label}
                </h2>
                <motion.ul
                  className="overflow-hidden rounded-lg border border-border"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {items.map((t) => {
                    const Icon = t.icon;
                    return (
                      <motion.li
                        key={t.id}
                        variants={fadeUp}
                        className="border-b border-border last:border-b-0"
                      >
                        <Link
                          to={`/tools/${t.id}`}
                          className="flex items-center gap-3 bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2"
                        >
                          <Icon size={14} style={{ color: cat.color }} className="shrink-0" />
                          <span className="text-sm text-fg">{t.name}</span>
                          <span className="ml-auto truncate pl-6 text-right text-xs text-fg-subtle">
                            {t.description}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
