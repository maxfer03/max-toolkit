# AGENTS.md

Development guide for **max·toolkit**. Read this before writing code: it defines
what we're building, the rules that don't bend, and the design language.
`CLAUDE.md` imports this file, so this is the single source of truth.

---

## 1. What this is

max·toolkit is a personal collection of **small, fast web utilities** (JSON
formatter, Base64, UUID generator, …), hosted free and always available. Built
**for Max first**, public second.

The motivation: stop reaching for slow, ugly, ad-infested "online tool" websites
and instead have one centralized, always-on, genuinely nice place for these
little tasks.

**Implication for every decision:** this is a tool used daily. _Friction is the
enemy._ Optimize relentlessly for "open → use → done" in seconds.

---

## 2. Non-negotiables

These don't bend. If a task seems to require breaking one, stop and raise it
explicitly — it's an exception to be discussed, not a default to assume.

1. **Client-side only.** No backend, no server, no secret-bearing API calls.
   Tools process data in the browser; nothing leaves the device. This is what
   keeps hosting free + zero-maintenance and keeps data private. A tool that
   genuinely needs a server is a deliberate exception, never the default.
2. **No ads, no tracking, no telemetry, no analytics. Ever.** This whole project
   is a reaction against exactly that.
3. **The registry is the single source of truth.** `src/tools/registry.ts`.
   Adding a tool = create a folder + add one entry. **Never** hardcode a tool
   list in the palette, the home grid, or the router — they all derive from the
   registry.
4. **Speed is a feature.** Every tool is `lazy()`-loaded (code-split) so the
   shell stays light as the toolkit grows. Don't pull a heavy dependency into
   the shared bundle for the sake of one tool — keep it inside that tool's
   chunk. Justify any new shared dependency.
5. **Keyboard-first.** ⌘K must always open the palette and reach every tool. New
   tools must ship with good `keywords` for fuzzy search.
6. **TypeScript strict, no escape hatches.** No `any`, no `@ts-ignore`.
   `verbatimModuleSyntax` is on → use `import type { … }` for type-only imports.
   `pnpm build` (tsc + vite) **must pass** before anything is considered done.
7. **Accessibility is part of quality.** `:focus-visible`, real labels / ARIA,
   and `prefers-reduced-motion` are wired globally — don't undo them.
8. **The bar is "premium", not "functional".** If it works but feels cheap, it's
   not done. Tactile feedback, alignment, spacing, and consistency matter.

---

## 3. Aesthetic — "modern terminal"

The design language is **locked**. Dark-native, retro/terminal-inspired but
executed cleanly and modern (think Warp, Ghostty, Raycast, Vercel Geist).
Anachronistic, **never skeuomorphic** (no fake CRT bezels, no costume retro).

### Color
- All tokens live in `src/index.css` under `@theme`. **Never hardcode hex
  values in components** — use the token utilities.
- The UI itself is **neutral**: backgrounds (`bg`, `surface`, `surface-2/3`),
  lines (`border`, `border-strong`), text (`fg`, `fg-muted`, `fg-subtle`).
- The **retro ANSI rainbow** (`ansi-red/amber/yellow/green/cyan/blue/magenta`)
  is used **semantically only** — per-category color, highlights, syntax,
  status. Color must _mean_ something; don't sprinkle it decoratively.
- **Signature accent = `--color-accent`** (terminal green). Changing that one
  line re-skins the whole app, and it can be overridden at runtime. Always use
  `accent` / `bg-accent` / `text-accent`, never a literal green.

### Typography
- **Full-mono** (JetBrains Mono Variable, `--font-mono`). The structure allows
  adding a secondary font later for a specific need, but default to mono.

### Motion
- Use the presets in `src/lib/motion.ts`: `snap` (tactile spring, **no
  overshoot**), `fadeUp`, `stagger`.
- Snappy and quick (~150–220ms feel). Press feedback = subtle scale + opacity.
- **Forbidden:** bouncy overshoot, parallax, confetti, gratuitous motion
  everywhere. Animation should feel _tactile_, not busy.
- Terminal touches (blinking `Cursor`, `>` / `$` prompts) belong in a **few key
  spots only**, not on every element.
- Respect `prefers-reduced-motion` (global CSS handles it). Keep animations
  subtle enough that disabling them loses nothing essential.

### Background
- Flat/clean for now. A CRT grain/scanline overlay (~2–3% opacity) is a planned
  **optional toggle** — not on by default.

---

## 4. Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — tokens via `@theme` in `src/index.css`; there is **no
  `tailwind.config.js`**
- **cmdk** — command palette · **motion** — animation · **react-router-dom**
  (data mode) — routing · **sonner** — toasts · **lucide-react** — icons
- Package manager: **pnpm**

---

## 5. Project structure

```
src/
  index.css                  # Tailwind v4 import + ALL design tokens (@theme) + base layer
  main.tsx                   # entry: fonts, router, <Toaster>
  router.tsx                 # routes (Shell + Home + ToolPage + NotFound)
  lib/
    utils.ts                 # cn() class merger
    motion.ts                # snap / fadeUp / stagger presets
  hooks/
    useCopy.ts               # clipboard + toast
  components/
    Cursor.tsx               # blinking terminal cursor
    ToolCard.tsx             # home grid card
    ui/                      # shared primitives (Button, Textarea, …)
    layout/                  # Shell, TopBar
    command-palette/         # CommandPaletteProvider (⌘K) + useCommandPalette()
  pages/
    Home.tsx · ToolPage.tsx · NotFound.tsx
  tools/
    types.ts                 # the Tool contract + CategoryId
    categories.ts            # category metadata + ANSI color per category
    registry.ts              # ⭐ SINGLE SOURCE OF TRUTH — the tool list
    <tool-id>/index.tsx      # one folder per tool, default-exported component
```

---

## 6. Adding a tool (the core workflow)

1. Create `src/tools/<id>/index.tsx` exporting a component as `default`.
2. Add one entry to `src/tools/registry.ts`:
   ```ts
   {
     id: "my-tool",                         // kebab-case, matches folder + route
     name: "My Tool",
     description: "One short line.",
     icon: SomeLucideIcon,
     keywords: ["search", "terms", "alias"], // for ⌘K fuzzy search
     category: "dev",                        // see categories.ts
     component: lazy(() => import("./my-tool")),
   }
   ```
3. Build the UI from the **shared primitives**: `Button`, `Textarea`,
   `useCopy()`, the motion presets, and the category color.

It then appears in the home grid, is searchable in the palette, and gets its
route at `/tools/<id>` — automatically, and code-split.

**Per-tool conventions**
- Self-contained inside its folder; tool-specific helpers live alongside it.
- All processing client-side and instant — no network calls.
- Use `useCopy()` for copy actions (gives the toast for free).
- Show errors inline in `text-ansi-red`; show success with the accent / a
  `Check` icon.
- If you write something genuinely reusable, promote it to `src/components/ui/`
  instead of duplicating it.

---

## 7. Conventions

- Import alias **`@/` → `src/`** (e.g. `import { Button } from "@/components/ui/Button"`).
- Merge classes with **`cn()`** from `@/lib/utils`.
- Components: `PascalCase`. Tool folders & ids: `kebab-case` and must match.
- Prefer existing primitives over new one-offs.
- Never hardcode colors, spacing-by-magic-number where a token/util exists, or a
  tool list outside the registry.

---

## 8. Commands

```bash
pnpm install      # install deps
pnpm dev          # dev server (http://localhost:5173)
pnpm build        # tsc --noEmit && vite build  (must pass)
pnpm preview      # serve the production build locally
pnpm typecheck    # tsc --noEmit only
```

---

## 9. Deployment

100% static / client-side → deploys free to any static host (Cloudflare Pages,
Vercel, GitHub Pages). Build output is `dist/`. Because routing is client-side,
configure the host to **fall back to `index.html`** for unknown paths (SPA
rewrite).

---

## 10. Backlog / known considerations

- **Bundle size:** `motion` dominates the main chunk (~168 kB gzip). When
  trimming, switch to `LazyMotion` + `domAnimation` features.
- Planned polish: runtime accent switcher, View Transitions between routes, the
  optional CRT-grain toggle.
