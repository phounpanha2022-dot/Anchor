import { useEffect } from "react";

/** Calls `handler` when Escape is pressed while `active` is true. */
export function useEscape(active: boolean, handler: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, handler]);
}
