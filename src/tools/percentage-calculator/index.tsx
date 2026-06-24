import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Copy } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { snap } from "@/lib/motion";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Parse a free-text number (tolerates spaces/commas); null when not usable. */
function parseNum(s: string): number | null {
  const t = s.replace(/[\s,]/g, "");
  if (t === "" || t === "-" || t === "." || t === "-.") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function round(n: number, dp = 4): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}
const formatResult = (n: number) =>
  round(n).toLocaleString(undefined, { maximumFractionDigits: 4 });
const rawResult = (n: number) => String(round(n));

// ── building blocks ───────────────────────────────────────────────────────────

function NumField({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      placeholder="0"
      className="inline-block w-20 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-base tabular-nums text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60 sm:text-sm"
    />
  );
}

/** Live result; click to copy the raw, unformatted value. */
function ResultPill({ value, suffix }: { value: number | null; suffix?: string }) {
  const copy = useCopy();

  if (value === null) {
    return (
      <span className="inline-flex items-center rounded-md border border-dashed border-border px-3 py-1 text-fg-subtle">
        —
      </span>
    );
  }

  const raw = rawResult(value);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={snap}
      onClick={() => copy(raw, `Copied ${raw}`)}
      aria-label="Copy result"
      className="group inline-flex cursor-pointer items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-1 tabular-nums text-accent transition-colors hover:bg-accent/20"
    >
      <span>
        {formatResult(value)}
        {suffix}
      </span>
      <Copy
        size={12}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.button>
  );
}

function Row({
  result,
  suffix,
  children,
}: {
  result: number | null;
  suffix?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-fg-muted">
        {children}
        <div className="ml-auto">
          <ResultPill value={result} suffix={suffix} />
        </div>
      </div>
    </div>
  );
}

// ── operations ────────────────────────────────────────────────────────────────

function PercentOfRow() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const na = parseNum(a);
  const nb = parseNum(b);
  const result = na !== null && nb !== null ? (na / 100) * nb : null;
  return (
    <Row result={result}>
      <span>what is</span>
      <NumField value={a} onChange={setA} ariaLabel="percent" />
      <span>% of</span>
      <NumField value={b} onChange={setB} ariaLabel="value" />
      <span>?</span>
    </Row>
  );
}

function WhatPercentRow() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const na = parseNum(a);
  const nb = parseNum(b);
  const result = na !== null && nb !== null && nb !== 0 ? (na / nb) * 100 : null;
  return (
    <Row result={result} suffix="%">
      <NumField value={a} onChange={setA} ariaLabel="part" />
      <span>is what percent of</span>
      <NumField value={b} onChange={setB} ariaLabel="whole" />
      <span>?</span>
    </Row>
  );
}

function PercentChangeRow() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const na = parseNum(a);
  const nb = parseNum(b);
  const result =
    na !== null && nb !== null && na !== 0 ? ((nb - na) / na) * 100 : null;
  return (
    <Row result={result} suffix="%">
      <span>what is the % increase / decrease from</span>
      <NumField value={a} onChange={setA} ariaLabel="from" />
      <span>to</span>
      <NumField value={b} onChange={setB} ariaLabel="to" />
      <span>?</span>
    </Row>
  );
}

// ── tool ────────────────────────────────────────────────────────────────────

export default function PercentageCalculator() {
  return (
    <div className="space-y-3">
      <PercentOfRow />
      <WhatPercentRow />
      <PercentChangeRow />
    </div>
  );
}
