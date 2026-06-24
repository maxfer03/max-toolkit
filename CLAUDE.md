# CLAUDE.md

The complete development guide for this project — objective, non-negotiables,
the "modern terminal" aesthetic, architecture, and conventions — lives in
@AGENTS.md. **Read it before making any change.**

CLAUDE.md intentionally defers to AGENTS.md to keep a single source of truth and
avoid the two files drifting apart.

## Quick reference

- Package manager: **pnpm**. `pnpm dev` · `pnpm build` (must pass before "done").
- Adding a tool = a folder in `src/tools/<id>/` + one entry in
  `src/tools/registry.ts`. The registry is the single source of truth; never
  hardcode tool lists elsewhere.
- Client-side only, no tracking, keyboard-first, TypeScript strict.
- Design tokens live in `src/index.css` (`@theme`). Never hardcode colors —
  the signature accent is `--color-accent`.
- Motion presets are in `src/lib/motion.ts` (`snap` / `fadeUp` / `stagger`).
  Tactile, no bouncy overshoot.
