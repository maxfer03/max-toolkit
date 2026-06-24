import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { useCopy } from "@/hooks/useCopy";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { BUILTIN_PRESETS, type Preset } from "./presets";
import { buildModel, generate, type Unit } from "./generator";

const DEFAULT_COUNT: Record<Unit, number> = {
  paragraphs: 3,
  sentences: 5,
  words: 50,
};

export default function LoremIpsum() {
  const [custom, setCustom] = useLocalStorage<Preset[]>("lorem:custom", []);
  const [presetId, setPresetId] = useLocalStorage<string>(
    "lorem:preset",
    "borges",
  );
  const [unit, setUnit] = useLocalStorage<Unit>("lorem:unit", "paragraphs");
  const [count, setCount] = useState(DEFAULT_COUNT.paragraphs);
  const [useOpener, setUseOpener] = useState(false);
  const [output, setOutput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCorpus, setFormCorpus] = useState("");
  const copy = useCopy();

  const presets = [...BUILTIN_PRESETS, ...custom];
  const active = presets.find((p) => p.id === presetId) ?? BUILTIN_PRESETS[0];

  const model = useMemo(() => buildModel(active.corpus), [active.corpus]);

  const runGenerate = useCallback(() => {
    setOutput(
      generate(model, unit, count, useOpener ? active.opener : undefined),
    );
  }, [model, unit, count, useOpener, active.opener]);

  useEffect(() => {
    runGenerate();
  }, [runGenerate]);

  const changeUnit = (u: Unit) => {
    setUnit(u);
    setCount(DEFAULT_COUNT[u]);
  };

  const savePreset = () => {
    const corpus = formCorpus.trim();
    if (!corpus) return;
    const preset: Preset = {
      id: crypto.randomUUID(),
      name: formName.trim() || "Custom",
      corpus,
    };
    setCustom((prev) => [...prev, preset]);
    setPresetId(preset.id);
    setFormName("");
    setFormCorpus("");
    setShowForm(false);
  };

  const removePreset = (id: string) => {
    setCustom((prev) => prev.filter((p) => p.id !== id));
    if (presetId === id) setPresetId("borges");
  };

  return (
    <div className="space-y-4">
      {/* preset chips */}
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const isActive = p.id === active.id;
          return (
            <div
              key={p.id}
              className={cn(
                "group flex items-center rounded-md border text-xs transition-colors",
                isActive
                  ? "border-accent/40 bg-accent/10"
                  : "border-border bg-surface",
              )}
            >
              <button
                onClick={() => setPresetId(p.id)}
                className={cn(
                  "py-1 pl-2.5",
                  p.builtin ? "pr-2.5" : "pr-1.5",
                  isActive ? "text-accent" : "text-fg-muted hover:text-fg",
                )}
              >
                {p.name}
              </button>
              {!p.builtin && (
                <button
                  onClick={() => removePreset(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="pr-1.5 text-fg-subtle hover:text-ansi-red"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-fg-muted transition-colors hover:text-accent"
        >
          <Plus size={12} /> preset
        </button>
      </div>

      {/* custom preset form */}
      {showForm && (
        <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Preset name (e.g. Cortázar)"
            className="w-full rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60"
          />
          <Textarea
            value={formCorpus}
            onChange={(e) => setFormCorpus(e.target.value)}
            placeholder="Paste your text(s) here — the more you feed it, the better the remix."
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={savePreset}
              disabled={!formCorpus.trim()}
            >
              Save preset
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedToggle<Unit>
          size="sm"
          ariaLabel="Unit"
          value={unit}
          onChange={changeUnit}
          options={[
            { value: "paragraphs", label: "paragraphs" },
            { value: "sentences", label: "sentences" },
            { value: "words", label: "words" },
          ]}
        />
        <div className="inline-flex items-center gap-2 text-xs text-fg-muted">
          <label htmlFor="lorem-count">count</label>
          <input
            id="lorem-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
            className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-fg outline-none focus:border-accent/60"
          />
        </div>
        {active.opener && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-fg-muted">
            <input
              type="checkbox"
              checked={useOpener}
              onChange={(e) => setUseOpener(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            start with “lorem ipsum…”
          </label>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={runGenerate}>
            <RefreshCw size={14} /> Regenerate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copy(output, "Copied")}
            disabled={!output}
          >
            <Copy size={14} /> Copy
          </Button>
        </div>
      </div>

      {/* output */}
      <div className="min-h-[220px] whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-fg">
        {output || (
          <span className="text-fg-subtle">
            $ feed it a corpus and generate…
          </span>
        )}
      </div>
    </div>
  );
}
