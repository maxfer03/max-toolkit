import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Eraser, Sparkles, WholeWord } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HighlightedTextarea } from "@/components/ui/HighlightedTextarea";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { useCopy } from "@/hooks/useCopy";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";
import {
  ANSI_PALETTE,
  buildMap,
  computeStats,
  formatSummary,
  type Granularity,
  type TextStats,
} from "./stats";

type Mode = "simple" | "advanced";

const SAMPLE =
  "max·toolkit is fast. No ads, no nonsense — just tools.\n\n" +
  "Dr. Max built it in an afternoon ☕. ¿Funciona con acentos y emojis? 👨‍👩‍👧 ¡Claro que sí!";

// ── building blocks ─────────────────────────────────────────────────────────

/**
 * A single metric. Click (or Enter/Space) copies the raw value — numbers are
 * copied unformatted (1,245 → 1245).
 */
function Stat({
  label,
  value,
  big,
  color,
}: {
  label: string;
  value: number | string;
  big?: boolean;
  color?: string;
}) {
  const copy = useCopy();
  const display = typeof value === "number" ? value.toLocaleString() : value;
  const raw = typeof value === "number" ? String(value) : value;

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileTap={{ scale: 0.985 }}
      onClick={() => copy(raw, `Copied ${raw}`)}
      aria-label={`Copy ${label}`}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2",
        big && "sm:py-5",
      )}
    >
      <Copy
        size={13}
        className="absolute right-2.5 top-2.5 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div
        className={cn(
          "truncate font-medium tabular-nums text-fg",
          big ? "text-3xl sm:text-4xl" : "text-xl",
        )}
        style={color ? { color } : undefined}
      >
        {display}
      </div>
      <div className="mt-1 text-[11px] lowercase tracking-wide text-fg-muted">
        {label}
      </div>
    </motion.button>
  );
}

function GroupHeader({ color, children }: { color: string; children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs uppercase tracking-wider text-fg-muted">
      <span style={{ color }}>#</span> {children}
    </h3>
  );
}

function SimpleStats({ stats }: { stats: TextStats }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      <Stat big color="var(--color-ansi-green)" label="words" value={stats.words} />
      <Stat big color="var(--color-ansi-cyan)" label="characters" value={stats.graphemes} />
      <Stat big color="var(--color-ansi-amber)" label="letters" value={stats.letters} />
      <Stat big color="var(--color-ansi-magenta)" label="paragraphs" value={stats.paragraphs} />
    </motion.div>
  );
}

function AdvancedStats({ stats }: { stats: TextStats }) {
  return (
    <div className="space-y-5">
      <div>
        <GroupHeader color="var(--color-ansi-green)">counts</GroupHeader>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
        >
          <Stat label="words" value={stats.words} />
          <Stat label="characters" value={stats.graphemes} />
          <Stat label="chars no spaces" value={stats.charsNoSpaces} />
          <Stat label="letters" value={stats.letters} />
          <Stat label="digits" value={stats.digits} />
          <Stat label="punctuation" value={stats.punctuation} />
          <Stat label="spaces" value={stats.spaces} />
          <Stat label="whitespace" value={stats.whitespace} />
          <Stat label="sentences" value={stats.sentences} />
          <Stat label="paragraphs" value={stats.paragraphs} />
          <Stat label="lines" value={stats.lines} />
        </motion.div>
      </div>

      <div>
        <GroupHeader color="var(--color-ansi-cyan)">unicode</GroupHeader>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          <Stat label="graphemes" value={stats.graphemes} />
          <Stat label="code points" value={stats.codePoints} />
          <Stat label="utf-16 units" value={stats.utf16} />
          <Stat label="bytes (utf-8)" value={stats.bytes} />
        </motion.div>
      </div>

      <div>
        <GroupHeader color="var(--color-ansi-amber)">insights</GroupHeader>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        >
          <Stat label="unique words" value={stats.uniqueWords} />
          <Stat label="longest word" value={stats.longestWord || "—"} />
          <Stat label="avg word length" value={stats.avgWordLength.toFixed(1)} />
          <Stat label="avg sentence (words)" value={stats.avgSentenceLength.toFixed(1)} />
          <Stat label="reading time" value={stats.readingTime} />
          <Stat label="speaking time" value={stats.speakingTime} />
        </motion.div>
      </div>
    </div>
  );
}

// ── tool ────────────────────────────────────────────────────────────────────

export default function CharCounter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useLocalStorage<Mode>("char-counter:mode", "simple");
  const [grouping, setGrouping] = useLocalStorage<Granularity>(
    "char-counter:grouping",
    "word",
  );
  const copy = useCopy();

  const stats = useMemo(() => computeStats(text), [text]);
  const segments = useMemo(
    () =>
      buildMap(text, grouping).map((t) => ({
        text: t.text,
        color:
          t.colorIndex === null
            ? undefined
            : ANSI_PALETTE[t.colorIndex % ANSI_PALETTE.length],
      })),
    [text, grouping],
  );

  return (
    <div className="space-y-5">
      <HighlightedTextarea
        value={text}
        onChange={setText}
        segments={segments}
        placeholder="Paste or type your text here…"
        ariaLabel="Text to analyze"
      />

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedToggle<Granularity>
          size="sm"
          ariaLabel="Color grouping"
          value={grouping}
          onChange={setGrouping}
          options={[
            { value: "none", label: "none" },
            { value: "word", label: "words" },
            { value: "sentence", label: "sentences" },
            { value: "paragraph", label: "paragraphs" },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          {!text && (
            <Button size="sm" variant="ghost" onClick={() => setText(SAMPLE)}>
              <Sparkles size={14} /> Load sample
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copy(formatSummary(stats), "Stats copied")}
            disabled={!text}
          >
            <Copy size={14} /> Copy stats
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setText("")}
            disabled={!text}
          >
            <Eraser size={14} /> Clear
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs uppercase tracking-wider text-fg-muted">
            <span className="text-accent">#</span> stats
          </h3>
          <SegmentedToggle<Mode>
            size="sm"
            ariaLabel="Detail level"
            value={mode}
            onChange={setMode}
            options={[
              { value: "simple", label: "Simple" },
              { value: "advanced", label: "Advanced", icon: WholeWord },
            ]}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {mode === "simple" ? (
              <SimpleStats stats={stats} />
            ) : (
              <AdvancedStats stats={stats} />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
