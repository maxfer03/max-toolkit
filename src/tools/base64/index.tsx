import { useMemo, useState } from "react";
import { ArrowRightLeft, Copy, Eraser } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

/** UTF-8 safe Base64 encode. */
function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** UTF-8 safe Base64 decode. */
function decode(b64: string): string {
  const bytes = Uint8Array.from(atob(b64.trim()), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const copy = useCopy();

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null as string | null };
    try {
      return {
        output: mode === "encode" ? encode(input) : decode(input),
        error: null,
      };
    } catch {
      return {
        output: "",
        error:
          mode === "decode" ? "Invalid Base64 input" : "Could not encode input",
      };
    }
  }, [input, mode]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border p-0.5">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-3 py-1 text-xs capitalize transition-colors",
                mode === m
                  ? "bg-accent/15 text-accent"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setMode((m) => (m === "encode" ? "decode" : "encode"))}
        >
          <ArrowRightLeft size={14} /> Swap
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copy(output)}
          disabled={!output}
        >
          <Copy size={14} /> Copy output
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <Eraser size={14} /> Clear
        </Button>
        {error && <span className="ml-auto text-xs text-ansi-red">✗ {error}</span>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-fg-subtle">
            input
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Text to encode…" : "Base64 to decode…"}
            className="min-h-[300px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-fg-subtle">
            output
          </label>
          <Textarea
            value={output}
            readOnly
            placeholder="…"
            className="min-h-[300px] text-fg-muted"
          />
        </div>
      </div>
    </div>
  );
}
