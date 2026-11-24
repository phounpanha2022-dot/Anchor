import { useEffect, useRef } from "react";
import { Flame, X } from "lucide-react";
import type { Task } from "@/types/task";
import { OverlayShell } from "./OverlayShell";
import { PixelTotem } from "./PixelTotem";
import { HoldButton } from "./HoldButton";

interface RealityCheckModalProps {
  open: boolean;
  /** The top unfinished Hard Anchor, or null if they're all done. */
  anchor: Task | null;
  claimsToday: number;
  onLockIn: () => void;
  /** Called the moment the 5-second hold completes. */
  onGrant: () => void;
  onClose: () => void;
}

/** The 5-second reality check before a second free-time claim. */
export function RealityCheckModal({ open, anchor, claimsToday, onLockIn, onGrant, onClose }: RealityCheckModalProps) {
  return (
    <OverlayShell open={open} onClose={onClose} placement="center" labelledBy="reality-title" dismissOnBackdrop={false}>
      <RealityBody anchor={anchor} claimsToday={claimsToday} onLockIn={onLockIn} onGrant={onGrant} onClose={onClose} />
    </OverlayShell>
  );
}

function RealityBody({ anchor, claimsToday, onLockIn, onGrant, onClose }: Omit<RealityCheckModalProps, "open">) {
  const closeTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    []
  );

  const handleGranted = () => {
    onGrant();
    // Let "Break granted" register before the modal leaves.
    closeTimer.current = window.setTimeout(onClose, 750);
  };

  const minutes = anchor?.minutes ?? 0;
  const claimLine =
    claimsToday === 0
      ? "First break of the day."
      : `You've already claimed ${claimsToday} ${claimsToday === 1 ? "break" : "breaks"} today.`;

  return (
    <div className="relative bg-[radial-gradient(120%_60%_at_0%_0%,hsl(var(--ember)/0.1),transparent_60%)] p-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex items-center gap-3 pr-10">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-owed/25 bg-owed/10">
          <PixelTotem state="owed" size={32} decorative />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-spark">Reality check</p>
          <p className="text-xs text-muted-foreground">{claimLine}</p>
        </div>
      </div>

      <h2 id="reality-title" className="mt-5 font-display text-[1.75rem] leading-[1.1] text-foreground">
        Are you sure?
      </h2>

      {anchor ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          You could finish <strong className="font-bold text-foreground">{anchor.title}</strong> in{" "}
          <strong className="font-bold tabular-nums text-ember">
            {minutes} {minutes === 1 ? "min" : "mins"}
          </strong>{" "}
          if you lock in for 20m right now.
        </p>
      ) : (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Every Hard Anchor is done today. This break is fully earned.
        </p>
      )}

      <div className="mt-6 space-y-2.5">
        {anchor && (
          <button
            type="button"
            onClick={onLockIn}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98]"
          >
            <Flame className="h-4 w-4" strokeWidth={2.6} aria-hidden />
            Lock In 20m
          </button>
        )}
        <HoldButton label={anchor ? "Hold 5s to Take Break Anyway" : "Hold 5s to Take My Break"} onComplete={handleGranted} />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">No guilt either way. You decide.</p>
    </div>
  );
}