import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";

export type CategoryId = "dev" | "text" | "convert" | "math" | "generate" | "web";

/**
 * The single contract every tool fulfils. The registry is a list of these,
 * and the command palette, home grid and router all derive from that list.
 */
export interface Tool {
  /** URL-safe id, also the route segment: /tools/<id> */
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Extra search terms for the command palette's fuzzy matching. */
  keywords: string[];
  category: CategoryId;
  /** Lazy-loaded so each tool is code-split and the shell stays fast. */
  component: LazyExoticComponent<ComponentType>;
}

/**
 * A palette shortcut that deep-links into a tool section without creating a
 * new route. Used for entries like "RUT" -> /tools/fake-data?s=national-ids&t=rut.
 */
export interface ToolShortcut {
  name: string;
  description: string;
  keywords: string[];
  icon: LucideIcon;
  category: CategoryId;
  /** Internal href with query params, e.g. "/tools/fake-data?s=national-ids&t=rut". */
  href: string;
}
