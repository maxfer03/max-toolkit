import { lazy } from "react";
import {
  Binary,
  Braces,
  Fingerprint,
  NotebookPen,
  Percent,
  Pilcrow,
  UserRound,
  WholeWord,
} from "lucide-react";
import type { Tool, ToolShortcut } from "./types";

/**
 * The toolkit's single source of truth.
 *
 * To add a tool:
 *   1. Create `src/tools/<id>/index.tsx` with a default-exported component.
 *   2. Add an entry here.
 * It then appears in the home grid, the command palette (⌘K) and gets its
 * own route automatically.
 */
export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate & minify JSON.",
    icon: Braces,
    keywords: ["json", "format", "beautify", "pretty", "minify", "validate"],
    category: "dev",
    component: lazy(() => import("./json-formatter")),
  },
  {
    id: "base64",
    name: "Base64",
    description: "Encode and decode Base64 text.",
    icon: Binary,
    keywords: ["base64", "encode", "decode", "atob", "btoa", "convert"],
    category: "convert",
    component: lazy(() => import("./base64")),
  },
  {
    id: "uuid",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk.",
    icon: Fingerprint,
    keywords: ["uuid", "guid", "id", "random", "v4", "generate"],
    category: "generate",
    component: lazy(() => import("./uuid-generator")),
  },
  {
    id: "char-counter",
    name: "Char Counter",
    description: "Count everything: characters, words, sentences & more.",
    icon: WholeWord,
    keywords: [
      "count",
      "characters",
      "words",
      "letters",
      "text",
      "sentences",
      "length",
      "counter",
    ],
    category: "text",
    component: lazy(() => import("./char-counter")),
  },
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Quick percentage calculations in plain language.",
    icon: Percent,
    keywords: [
      "percent",
      "percentage",
      "%",
      "calc",
      "calculator",
      "ratio",
      "increase",
      "decrease",
      "change",
    ],
    category: "math",
    component: lazy(() => import("./percentage-calculator")),
  },
  {
    id: "notes",
    name: "Notes",
    description: "A quick, low-friction scratchpad. Saved in your browser.",
    icon: NotebookPen,
    keywords: ["note", "notes", "scratchpad", "memo", "write", "jot", "text"],
    category: "text",
    component: lazy(() => import("./notes")),
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Placeholder text from Borges, classic lorem, or your own.",
    icon: Pilcrow,
    keywords: [
      "lorem",
      "ipsum",
      "placeholder",
      "dummy",
      "filler",
      "text",
      "borges",
      "generator",
    ],
    category: "generate",
    component: lazy(() => import("./lorem-ipsum")),
  },
  {
    id: "fake-data",
    name: "Fake Data",
    description: "Generate realistic placeholder identities, IDs, contacts & more.",
    icon: UserRound,
    keywords: [
      "fake",
      "data",
      "dummy",
      "placeholder",
      "generate",
      "random",
      "identity",
      "profile",
      "persona",
      "dni",
      "rut",
      "cuit",
      "cuil",
      "email",
      "phone",
      "address",
      "credit",
      "card",
      "iban",
      "argentina",
      "chile",
    ],
    category: "generate",
    component: lazy(() => import("./fake-data")),
  },
];

const byId = new Map(tools.map((t) => [t.id, t]));

export const getTool = (id: string | undefined): Tool | undefined =>
  id ? byId.get(id) : undefined;

export const shortcuts: ToolShortcut[] = [
  {
    name: "RUT",
    description: "Generate Chilean RUT numbers",
    keywords: ["rut", "chile", "chileno", "id"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=national-ids&t=rut",
  },
  {
    name: "DNI",
    description: "Generate Argentine DNI numbers",
    keywords: ["dni", "argentina", "argentino", "id"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=national-ids&t=dni",
  },
  {
    name: "CUIT",
    description: "Generate Argentine CUIT numbers",
    keywords: ["cuit", "argentina", "impuesto", "fiscal"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=national-ids&t=cuit",
  },
  {
    name: "CUIL",
    description: "Generate Argentine CUIL numbers",
    keywords: ["cuil", "argentina", "laboral"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=national-ids&t=cuil",
  },
  {
    name: "Fake Email",
    description: "Generate random email addresses",
    keywords: ["fake", "email", "correo", "random"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=contact&t=email",
  },
  {
    name: "Fake Profile",
    description: "Generate complete fake person profiles",
    keywords: ["fake", "profile", "perfil", "persona", "identity"],
    icon: UserRound,
    category: "generate",
    href: "/tools/fake-data?s=profile",
  },
];
