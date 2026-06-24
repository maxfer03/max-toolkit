import "@fontsource-variable/jetbrains-mono";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-strong)",
          color: "var(--color-fg)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          borderRadius: "8px",
        },
      }}
    />
  </StrictMode>,
);
