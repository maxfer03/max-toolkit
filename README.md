# max·toolkit

A random assortment of tools and functions I use daily for work and other things. my philosophy: why use an ugly, slow, ad ridden website when i could just centralize it all on a seamless and speedy web app?

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** — design tokens live in `src/index.css`
- **cmdk** — the ⌘K command palette
- **motion** — snappy, tactile animations
- **React Router** — routes generated from the tool registry
- 100% client-side, so it deploys for free to any static host (Cloudflare
  Pages, Vercel, GitHub Pages…)

## Develop

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm build`, `pnpm preview`, `pnpm typecheck`.

## Architecture

The whole app is driven by a single **tool registry**
(`src/tools/registry.ts`). The home grid, the command palette and the router
all derive from it.

### Add a tool

1. Create `src/tools/<id>/index.tsx` with a default-exported component.
2. Add one entry to `src/tools/registry.ts`:

   ```ts
   {
     id: "my-tool",
     name: "My Tool",
     description: "What it does.",
     icon: SomeLucideIcon,
     keywords: ["search", "terms"],
     category: "dev",
     component: lazy(() => import("./my-tool")),
   }
   ```

It now appears in the home grid, is searchable in the palette (⌘K), and gets
its own route at `/tools/my-tool` — all automatically. Each tool is
code-split, so adding tools never slows the initial load.

## Theming

The visual language is "modern terminal" — dark, full-mono, with a retro ANSI
rainbow used semantically (per-category color). The signature accent is one
line in `src/index.css`:

```css
--color-accent: var(--color-ansi-green);
```

Change it (or override `--color-accent` at runtime) to re-skin the whole app.
