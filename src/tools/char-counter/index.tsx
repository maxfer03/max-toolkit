import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Eraser, Sparkles, WholeWord } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
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
  type MapToken,
  type TextStats,
} from "./stats";

type Mode = "simple" | "advanced";

const SAMPLE =
  "max·toolkit is fast. No ads, no nonsense — just tools.\n\n" +
  "Dr. Max built it in an afternoon ☕. ¿Funciona con acentos y emojis? 👨‍👩‍👧 ¡Claro que sí!";

// ── building blocks ─────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  big,
  color,
}: {
  label: string;
  value: ReactNode;
  big?: boolean;
  color?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "rounded-lg border border-border bg-surface px-4 py-3",
        big && "sm:py-5",
      )}
    >
      <div
        className={cn(
          "truncate font-medium tabular-nums text-fg",
          big ? "text-3xl sm:text-4xl" : "text-xl",
        )}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] lowercase tracking-wide text-fg-muted">
        {label}
      </div>
    </motion.div>
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
      <Stat big color="var(--color-ansi-green)" label="words" value={stats.words.toLocaleString()} />
      <Stat big color="var(--color-ansi-cyan)" label="characters" value={stats.graphemes.toLocaleString()} />
      <Stat big color="var(--color-ansi-amber)" label="letters" value={stats.letters.toLocaleString()} />
      <Stat big color="var(--color-ansi-magenta)" label="paragraphs" value={stats.paragraphs.toLocaleString()} />
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
          <Stat label="words" value={stats.words.toLocaleString()} />
          <Stat label="characters" value={stats.graphemes.toLocaleString()} />
          <Stat label="chars no spaces" value={stats.charsNoSpaces.toLocaleString()} />
          <Stat label="letters" value={stats.letters.toLocaleString()} />
          <Stat label="digits" value={stats.digits.toLocaleString()} />
          <Stat label="punctuation" value={stats.punctuation.toLocaleString()} />
          <Stat label="spaces" value={stats.spaces.toLocaleString()} />
          <Stat label="whitespace" value={stats.whitespace.toLocaleString()} />
          <Stat label="sentences" value={stats.sentences.toLocaleString()} />
          <Stat label="paragraphs" value={stats.paragraphs.toLocaleString()} />
          <Stat label="lines" value={stats.lines.toLocaleString()} />
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
          <Stat label="graphemes" value={stats.graphemes.toLocaleString()} />
          <Stat label="code points" value={stats.codePoints.toLocaleString()} />
          <Stat label="utf-16 units" value={stats.utf16.toLocaleString()} />
          <Stat label="bytes (utf-8)" value={stats.bytes.toLocaleString()} />
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
          <Stat label="unique words" value={stats.uniqueWords.toLocaleString()} />
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

function TextMap({
  tokens,
  interactive,
}: {
  tokens: MapToken[];
  interactive: boolean;
}) {
  if (!tokens.length) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-fg-subtle">
        $ paste or type above to see the map…
      </div>
    );
  }

  return (
    <div className="overflow-hidden whitespace-pre-wrap break-words rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed">
      {tokens.map((tok, i) => {
        if (tok.colorIndex === null) return <span key={i}>{tok.text}</span>;
        const color = ANSI_PALETTE[tok.colorIndex % ANSI_PALETTE.length];
        return (
          <span
            key={i}
            className={cn(
              "rounded-[3px] transition-[filter] duration-150",
              interactive && "cursor-default hover:brightness-150",
            )}
            style={{
              color,
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }}
            title={
              interactive
                ? `${tok.words} ${tok.words === 1 ? "word" : "words"} · ${tok.graphemes} chars`
                : undefined
            }
          >
            {tok.text}
          </span>
        );
      })}
    </div>
  );
}

// ── tool ────────────────────────────────────────────────────────────────────

export default function CharCounter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useLocalStorage<Mode>("char-counter:mode", "simple");
  const [granularity, setGranularity] = useState<Granularity>("word");
  const copy = useCopy();

  const stats = useMemo(() => computeStats(text), [text]);
  const mapTokens = useMemo(
    () => buildMap(text, mode === "simple" ? "word" : granularity),
    [text, mode, granularity],
  );

  return (
    <div className="space-y-5">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here…"
        className="min-h-[180px]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedToggle<Mode>
          ariaLabel="Detail level"
          value={mode}
          onChange={setMode}
          options={[
            { value: "simple", label: "Simple" },
            { value: "advanced", label: "Advanced", icon: WholeWord },
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

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs uppercase tracking-wider text-fg-muted">
            <span className="text-accent">#</span>{" "}
            {mode === "simple" ? "word map" : "text map"}
          </h3>
          {mode === "advanced" && (
            <SegmentedToggle<Granularity>
              size="sm"
              ariaLabel="Segment by"
              value={granularity}
              onChange={setGranularity}
              options={[
                { value: "sentence", label: "sentences" },
                { value: "paragraph", label: "paragraphs" },
                { value: "word", label: "words" },
              ]}
            />
          )}
        </div>
        <TextMap tokens={mapTokens} interactive={mode === "advanced"} />
        {mode === "advanced" && text && (
          <p className="text-[11px] text-fg-subtle">
            hover a segment to inspect its counts.
          </p>
        )}
      </section>
    </div>
  );
}
