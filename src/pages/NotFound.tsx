import { Link } from "react-router-dom";
import { Cursor } from "@/components/Cursor";

export default function NotFound() {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/unknown";

  return (
    <div className="py-16">
      <p className="text-sm text-fg-subtle">$ open {path}</p>
      <p className="mt-2 text-sm">
        <span className="text-ansi-red">error:</span>{" "}
        <span className="text-fg-muted">no such tool</span>
      </p>
      <p className="mt-6 text-sm text-fg-muted">
        <Link to="/" className="text-accent hover:underline">
          cd ~
        </Link>{" "}
        to go back home
        <Cursor className="ml-1.5" />
      </p>
    </div>
  );
}
