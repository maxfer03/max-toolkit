import type { CategoryId } from "./types";

export interface Category {
  id: CategoryId;
  label: string;
  /** A retro ANSI rainbow token used to tint this category throughout the UI. */
  color: string;
}

export const categories: Record<CategoryId, Category> = {
  dev: { id: "dev", label: "Developer", color: "var(--color-ansi-green)" },
  text: { id: "text", label: "Text", color: "var(--color-ansi-cyan)" },
  convert: { id: "convert", label: "Convert", color: "var(--color-ansi-amber)" },
  math: { id: "math", label: "Math", color: "var(--color-ansi-red)" },
  generate: { id: "generate", label: "Generate", color: "var(--color-ansi-magenta)" },
  web: { id: "web", label: "Web", color: "var(--color-ansi-blue)" },
};

/** Display order for category sections / palette groups. */
export const categoryOrder: CategoryId[] = [
  "dev",
  "text",
  "convert",
  "math",
  "generate",
  "web",
];
