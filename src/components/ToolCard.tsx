import { Link } from "react-router-dom";
import { motion } from "motion/react";
import type { Tool } from "@/tools/types";
import { categories } from "@/tools/categories";
import { fadeUp, snap } from "@/lib/motion";

export function ToolCard({ tool }: { tool: Tool }) {
  const cat = categories[tool.category];
  const Icon = tool.icon;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={snap}>
      <Link
        to={`/tools/${tool.id}`}
        className="group flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border"
            style={{
              color: cat.color,
              borderColor: `color-mix(in oklab, ${cat.color} 35%, transparent)`,
              background: `color-mix(in oklab, ${cat.color} 10%, transparent)`,
            }}
          >
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm text-fg">{tool.name}</h3>
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: cat.color }}
            >
              {cat.label}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-fg-muted">{tool.description}</p>
      </Link>
    </motion.div>
  );
}
