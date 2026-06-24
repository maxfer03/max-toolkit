import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Copy, Download, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useCopy } from "@/hooks/useCopy";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

const newNote = (): Note => ({
  id: crypto.randomUUID(),
  body: "",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** First non-empty line, used as the tab label + export filename. */
function titleOf(n: Note): string {
  const first = n.body.split("\n").find((l) => l.trim());
  return first ? first.trim().slice(0, 80) : "Untitled";
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "note"
  );
}

function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes:list", []);
  const [activeId, setActiveId] = useLocalStorage<string>("notes:active", "");
  const copy = useCopy();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const active = notes.find((n) => n.id === activeId) ?? notes[0] ?? null;

  // Keep activeId valid, and focus the editor when the active note changes.
  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId, setActiveId]);

  useEffect(() => {
    editorRef.current?.focus();
  }, [active?.id]);

  const addNote = () => {
    const note = newNote();
    setNotes((prev) => [...prev, note]);
    setActiveId(note.id);
  };

  const updateBody = (body: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === active?.id ? { ...n, body, updatedAt: Date.now() } : n,
      ),
    );
  };

  const closeNote = (id: string) => {
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const removed = notes[idx];
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (activeId === id) {
      const fallback = next[idx - 1] ?? next[0];
      setActiveId(fallback ? fallback.id : "");
    }
    toast("Note deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          setNotes((prev) => {
            const restored = [...prev];
            restored.splice(Math.min(idx, restored.length), 0, removed);
            return restored;
          });
          setActiveId(removed.id);
        },
      },
    });
  };

  const deleteAll = () => {
    if (!notes.length) return;
    const snapshot = notes;
    const prevActive = activeId;
    setNotes([]);
    setActiveId("");
    toast("All notes deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          setNotes(snapshot);
          setActiveId(prevActive);
        },
      },
    });
  };

  const exportNote = (ext: "txt" | "md") => {
    if (!active) return;
    download(
      `${slug(titleOf(active))}.${ext}`,
      active.body,
      ext === "md" ? "text/markdown" : "text/plain",
    );
  };

  return (
    <div className="space-y-3">
      {/* tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {notes.map((n) => {
          const isActive = active?.id === n.id;
          return (
            <div
              key={n.id}
              className={cn(
                "group flex shrink-0 items-center gap-1 border-b-2 pl-3 pr-1.5",
                isActive ? "border-accent" : "border-transparent",
              )}
            >
              <button
                onClick={() => setActiveId(n.id)}
                className={cn(
                  "max-w-[160px] truncate py-2 text-sm",
                  isActive ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {titleOf(n)}
              </button>
              <button
                onClick={() => closeNote(n.id)}
                aria-label="Close note"
                className="rounded p-0.5 text-fg-subtle opacity-0 transition-opacity hover:text-ansi-red group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
        <button
          onClick={addNote}
          aria-label="New note"
          className="shrink-0 rounded-md p-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-accent"
        >
          <Plus size={16} />
        </button>
      </div>

      {active ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-fg-subtle">
              {notes.length} {notes.length === 1 ? "note" : "notes"} · saved
              locally
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(active.body, "Note copied")}
                disabled={!active.body}
              >
                <Copy size={14} /> Copy all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportNote("txt")}
                disabled={!active.body}
              >
                <Download size={14} /> .txt
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportNote("md")}
                disabled={!active.body}
              >
                <Download size={14} /> .md
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={deleteAll}
                className="hover:text-ansi-red"
              >
                <Trash2 size={14} /> Delete all
              </Button>
            </div>
          </div>

          <Textarea
            ref={editorRef}
            value={active.body}
            onChange={(e) => updateBody(e.target.value)}
            placeholder="Start typing… (first line becomes the title)"
            className="min-h-[52vh]"
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-fg-muted">no notes yet</p>
          <Button variant="primary" size="sm" onClick={addNote}>
            <Plus size={14} /> New note
          </Button>
        </div>
      )}
    </div>
  );
}
