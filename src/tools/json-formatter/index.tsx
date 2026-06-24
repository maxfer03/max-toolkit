import { useState } from "react";
import { Braces, Check, Copy, Eraser, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useCopy } from "@/hooks/useCopy";

export default function JsonFormatter() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const copy = useCopy();

  const transform = (minify: boolean) => {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const isValid = !error && value.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => transform(false)}>
          <Braces size={14} /> Format
        </Button>
        <Button size="sm" onClick={() => transform(true)}>
          <Minimize2 size={14} /> Minify
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copy(value)}
          disabled={!value}
        >
          <Copy size={14} /> Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue("");
            setError(null);
          }}
          disabled={!value}
        >
          <Eraser size={14} /> Clear
        </Button>

        <span className="ml-auto text-xs">
          {error ? (
            <span className="text-ansi-red">✗ {error}</span>
          ) : isValid ? (
            <span className="inline-flex items-center gap-1 text-accent">
              <Check size={13} /> valid
            </span>
          ) : null}
        </span>
      </div>

      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        placeholder={'{\n  "paste": "your JSON here"\n}'}
        aria-invalid={!!error}
        className="min-h-[360px]"
      />
    </div>
  );
}
