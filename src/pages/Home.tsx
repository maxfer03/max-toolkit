import { motion } from "motion/react";
import { tools } from "@/tools/registry";
import { categories, categoryOrder } from "@/tools/categories";
import { ToolCard } from "@/components/ToolCard";
import { Cursor } from "@/components/Cursor";
import { stagger } from "@/lib/motion";

export default function Home() {
  return (
    <div>
      <motion.section
        className="mb-12"
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
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
          my daily tools, so i never have to open another sketchy website. press{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px] text-fg-muted">
            ⌘K
          </kbd>{" "}
          to jump around.
        </p>
      </motion.section>

      {categoryOrder.map((cid) => {
        const items = tools.filter((t) => t.category === cid);
        if (!items.length) return null;
        const cat = categories[cid];
        return (
          <section key={cid} className="mb-10">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-fg-muted">
              <span style={{ color: cat.color }}>#</span> {cat.label}
            </h2>
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {items.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}
