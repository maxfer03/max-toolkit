export type Granularity = "sentence" | "paragraph" | "word";

export interface TextStats {
  words: number;
  graphemes: number; // user-perceived characters
  charsNoSpaces: number;
  codePoints: number;
  utf16: number;
  bytes: number;
  letters: number;
  digits: number;
  punctuation: number;
  spaces: number; // U+0020 only
  whitespace: number; // all \s
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  longestWord: string;
  avgWordLength: number;
  avgSentenceLength: number; // words per sentence
  readingTime: string; // m:ss
  speakingTime: string; // m:ss
}

/** One run of the input when rendering the colorized map. */
export interface MapToken {
  text: string;
  /** Palette index, or null for an uncolored gap (whitespace / punctuation). */
  colorIndex: number | null;
  words: number;
  graphemes: number;
}

/** ANSI rainbow tokens, in the order segments cycle through them. */
export const ANSI_PALETTE = [
  "var(--color-ansi-green)",
  "var(--color-ansi-cyan)",
  "var(--color-ansi-amber)",
  "var(--color-ansi-magenta)",
  "var(--color-ansi-blue)",
  "var(--color-ansi-red)",
  "var(--color-ansi-yellow)",
] as const;

const hasSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl;
const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

function countGraphemes(text: string): number {
  if (!text) return 0;
  if (hasSegmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...seg.segment(text)].length;
  }
  return [...text].length;
}

function listWords(text: string): string[] {
  if (!text.trim()) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "word" });
    const out: string[] = [];
    for (const part of seg.segment(text)) {
      if (part.isWordLike) out.push(part.segment);
    }
    return out;
  }
  return text.trim().split(/\s+/);
}

function listSentences(text: string): string[] {
  if (!text.trim()) return [];
  if (hasSegmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "sentence" });
    const out: string[] = [];
    for (const part of seg.segment(text)) {
      if (part.segment.trim()) out.push(part.segment);
    }
    return out;
  }
  return text.split(/(?<=[.!?…])\s+/).filter((s) => s.trim());
}

function listParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter((p) => p.trim());
}

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function computeStats(text: string): TextStats {
  const words = listWords(text);
  const sentences = listSentences(text);
  const paragraphs = listParagraphs(text);

  const graphemes = countGraphemes(text);
  const whitespace = countMatches(text, /\s/gu);
  const totalWordLength = words.reduce((sum, w) => sum + countGraphemes(w), 0);
  const longestWord = words.reduce(
    (long, w) => (w.length > long.length ? w : long),
    "",
  );
  const unique = new Set(words.map((w) => w.toLocaleLowerCase()));
  const wordCount = words.length;

  return {
    words: wordCount,
    graphemes,
    charsNoSpaces: graphemes - whitespace,
    codePoints: [...text].length,
    utf16: text.length,
    bytes: encoder ? encoder.encode(text).length : new Blob([text]).size,
    letters: countMatches(text, /\p{L}/gu),
    digits: countMatches(text, /\p{Nd}/gu),
    punctuation: countMatches(text, /\p{P}/gu),
    spaces: countMatches(text, / /g),
    whitespace,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    lines: text === "" ? 0 : text.split("\n").length,
    uniqueWords: unique.size,
    longestWord,
    avgWordLength: wordCount ? totalWordLength / wordCount : 0,
    avgSentenceLength: sentences.length ? wordCount / sentences.length : 0,
    readingTime: formatTime((wordCount / 230) * 60),
    speakingTime: formatTime((wordCount / 130) * 60),
  };
}

function colored(text: string): MapToken {
  return { text, colorIndex: 0, words: listWords(text).length, graphemes: countGraphemes(text) };
}
function gap(text: string): MapToken {
  return { text, colorIndex: null, words: 0, graphemes: 0 };
}

/**
 * Split `text` into render runs covering the WHOLE string, so the colorized
 * map faithfully mirrors the input. Colored runs cycle through the palette;
 * gaps (whitespace between words, blank lines between paragraphs) stay uncolored.
 */
export function buildMap(text: string, granularity: Granularity): MapToken[] {
  if (!text) return [];
  let cycle = 0;
  const paint = (run: MapToken): MapToken =>
    run.colorIndex === null ? run : { ...run, colorIndex: cycle++ };

  if (granularity === "paragraph") {
    // Capturing split keeps the blank-line separators as their own runs.
    return text
      .split(/(\n\s*\n)/)
      .filter((p) => p !== "")
      .map((p) => paint(p.trim() === "" ? gap(p) : colored(p)));
  }

  if (hasSegmenter) {
    const g = granularity === "sentence" ? "sentence" : "word";
    const seg = new Intl.Segmenter(undefined, { granularity: g });
    const tokens: MapToken[] = [];
    for (const part of seg.segment(text)) {
      const t = part.segment;
      const isColored =
        granularity === "word" ? Boolean(part.isWordLike) : t.trim() !== "";
      tokens.push(paint(isColored ? colored(t) : gap(t)));
    }
    return tokens;
  }

  // Fallback without Intl.Segmenter: capture the separators so we keep them.
  const re = granularity === "sentence" ? /(?<=[.!?…])(\s+)/ : /(\s+)/;
  return text
    .split(re)
    .filter((p) => p !== undefined && p !== "")
    .map((p) => paint(/^\s+$/.test(p) ? gap(p) : colored(p)));
}

export function formatSummary(s: TextStats): string {
  return [
    `Words: ${s.words}`,
    `Characters: ${s.graphemes}`,
    `Characters (no spaces): ${s.charsNoSpaces}`,
    `Letters: ${s.letters}`,
    `Digits: ${s.digits}`,
    `Punctuation: ${s.punctuation}`,
    `Spaces: ${s.spaces}`,
    `Sentences: ${s.sentences}`,
    `Paragraphs: ${s.paragraphs}`,
    `Lines: ${s.lines}`,
    `Unique words: ${s.uniqueWords}`,
    `Longest word: ${s.longestWord || "—"}`,
    `Avg word length: ${s.avgWordLength.toFixed(1)}`,
    `Avg sentence length (words): ${s.avgSentenceLength.toFixed(1)}`,
    `Reading time: ${s.readingTime}`,
    `Speaking time: ${s.speakingTime}`,
    ``,
    `Code points: ${s.codePoints}`,
    `UTF-16 units: ${s.utf16}`,
    `Bytes (UTF-8): ${s.bytes}`,
  ].join("\n");
}
