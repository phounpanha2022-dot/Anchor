import { useEffect, useRef, type PointerEvent } from "react";
import { Mic } from "lucide-react";

const HOLD_MS = 420;

interface RantPillProps {
  /** `listening` is true when the pill was held instead of tapped. */
  onOpen: (listening: boolean) => void;
}

/** "Hold or tap to rant…" — tap opens the sheet, hold opens it with the mic on. */
export function RantPill({ onOpen }: RantPillProps) {
  const timer = useRef<number | null>(null);
  const heldRef = useRef(false);

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clear, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    heldRef.current = false;
    clear();
    timer.current = window.setTimeout(() => {
      heldRef.current = true;
      timer.current = null;
      onOpen(true);
    }, HOLD_MS);
  };

  const handleClick = () => {
    clear();
    if (heldRef.current) {
      heldRef.current = false;
      return;
    }
    onOpen(false);
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
      className="group mx-auto flex h-10 w-full max-w-[300px] select-none items-center gap-2.5 rounded-full border border-foreground/[0.08] bg-card/80 pl-1.5 pr-4 text-left transition-[border-color,transform] duration-150 ease-out hover:border-ember/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ember/15 text-ember">
        <Mic className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
      </span>
      <span className="truncate text-[13px] text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
        Hold or tap to rant…
      </span>
    </button>
  );
}