import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getTool } from "@/tools/registry";
import { categories } from "@/tools/categories";
import { snap } from "@/lib/motion";
import NotFound from "./NotFound";

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = getTool(toolId);

  if (!tool) return <NotFound />;

  const cat = categories[tool.category];
  const Icon = tool.icon;
  const Tool = tool.component;

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-fg-subtle transition-colors hover:text-fg"
      >
        <ArrowLeft size={13} /> all tools
      </Link>

      <header className="mb-7 flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border"
          style={{
            color: cat.color,
            borderColor: `color-mix(in oklab, ${cat.color} 35%, transparent)`,
            background: `color-mix(in oklab, ${cat.color} 10%, transparent)`,
          }}
        >
          <Icon size={20} />
        </span>
        <div>
          <h1 className="text-lg font-medium text-fg">{tool.name}</h1>
          <p className="text-sm text-fg-muted">{tool.description}</p>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="py-10 text-sm text-fg-subtle">loading tool…</div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={snap}
        >
          <Tool />
        </motion.div>
      </Suspense>
    </div>
  );
}
