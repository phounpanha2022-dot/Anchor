import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Check } from "lucide-react";

function buzz() {
  try {
    navigator.vibrate?.(30);
  } catch {
    // Haptics are a bonus; ignore browsers that refuse.
  }
}

interface HoldButtonProps {
  label: string;
  onComplete: () => void;
  durationMs?: number;
}

/**
 * A real press-and-hold. The fill grows while you hold; let go early and it
 * drains back to empty. Works with a finger, a mouse, or Space/Enter.
 */
export function HoldButton({ label, onComplete, durationMs = 5000 }: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stopFrame = () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  useEffect(() => stopFrame, []);

  const finish = () => {
    startRef.current = null;
    doneRef.current = true;
    stopFrame();
    setHolding(false);
    setDone(true);
    setProgress(1);
    buzz();
    onCompleteRef.current();
  };

  const begin = () => {
    if (doneRef.current || startRef.current !== null) return;
    startRef.current = performance.now();
    setHolding(true);
    const step = (now: number) => {
      const start = startRef.current;
      if (start === null) return;
      const next = Math.min(1, (now - start) / durationMs);
      setProgress(next);
      if (next >= 1) {
        finish();
        return;
      }
      frameRef.current = window.requestAnimationFrame(step);
    };
    frameRef.current = window.requestAnimationFrame(step);
  };

  const cancel = () => {
    if (startRef.current === null) return;
    startRef.current = null;
    stopFrame();
    setHolding(false);
    setProgress(0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    begin();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) begin();
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") cancel();
  };

  const secondsLeft = Math.max(1, Math.ceil(((1 - progress) * durationMs) / 1000));
  const text = done ? "Break granted" : holding ? `Keep holding… ${secondsLeft}s` : label;

  return (
    <button
      type="button"
      disabled={done}
      onPointerDown={handlePointerDown}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={cancel}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={done ? "Break granted" : `${label}. Press and hold for ${Math.round(durationMs / 1000)} seconds.`}
      className="relative h-12 w-full touch-none select-none overflow-hidden rounded-2xl border border-owed/30 bg-owed/[0.06] text-[15px] font-bold text-owed transition-[transform,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-default"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-owed/30"
        style={{
          width: `${progress * 100}%`,
          transition: holding ? "none" : "width 360ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <span className="relative inline-flex items-center justify-center gap-2 tabular-nums">
        {done && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
        {text}
      </span>
      <span className="sr-only" aria-live="polite">
        {holding ? `${secondsLeft} seconds left` : ""}
      </span>
    </button>
  );
}