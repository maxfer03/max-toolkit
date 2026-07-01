import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopy } from "@/hooks/useCopy";

const make = (n: number): string[] =>
  Array.from({ length: n }, () => crypto.randomUUID());

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>(() => make(5));
  const copy = useCopy();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => setIds(make(count))}>
          <RefreshCw size={14} /> Generate
        </Button>

        <div className="inline-flex items-center gap-2 text-xs text-fg-muted">
          <label htmlFor="uuid-count">count</label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
            className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-fg focus:border-accent/50 focus:outline-none"
          />
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => copy(ids.join("\n"), `Copied ${ids.length} UUIDs`)}
          disabled={!ids.length}
        >
          <Copy size={14} /> Copy all
        </Button>
      </div>

      <ul className="overflow-hidden rounded-lg border border-border">
        {ids.map((id, i) => (
          <li
            key={id}
            role="button"
            tabIndex={0}
            onClick={() => copy(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                copy(id);
              }
            }}
            aria-label={`Copy ${id}`}
            className="group flex cursor-pointer items-center gap-3 border-b border-border bg-surface px-3 py-2 last:border-b-0 hover:bg-surface-2"
          >
            <span className="w-6 text-right text-xs text-fg-subtle">
              {i + 1}
            </span>
            <code className="text-sm text-fg">{id}</code>
            <Copy
              size={14}
              className="ml-auto text-fg-subtle opacity-0 transition-opacity group-hover:text-accent group-hover:opacity-100"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
