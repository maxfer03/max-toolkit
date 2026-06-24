import { useCallback } from "react";
import { toast } from "sonner";

/** Copy text to the clipboard with a small toast confirmation. */
export function useCopy() {
  return useCallback(async (text: string, label = "Copied to clipboard") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }, []);
}
