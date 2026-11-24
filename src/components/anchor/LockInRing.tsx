import { useEffect } from "react";
import { animate, motion, useMotionTemplate, useMotionValue } from "framer-motion";

const MASK = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

const ringMask = {
  WebkitMask: MASK,
  WebkitMaskComposite: "xor",
  mask: MASK,
  maskComposite: "exclude",
} as const;

function remainingMs(startedAt: number, durationMs: number) {
  return Math.max(0, startedAt + durationMs - Date.now());
}

interface LockInRingProps {
  startedAt: number;
  durationMs: number;
}

/**
 * Ambient ring that slowly drains around the card over the lock-in window.
 * No numbers, no ticking — just color shrinking back toward the top.
 */
export function LockInRing({ startedAt, durationMs }: LockInRingProps) {
  const deg = useMotionValue((360 * remainingMs(startedAt, durationMs)) / durationMs);
  const background = useMotionTemplate`conic-gradient(hsl(var(--spark)) 0deg, hsl(var(--ember)) ${deg}deg, transparent ${deg}deg)`;

  useEffect(() => {
    let controls: { stop: () => void } | null = null;

    const run = () => {
      controls?.stop();
      const left = remainingMs(startedAt, durationMs);
      deg.set((360 * left) / durationMs);
      controls = animate(deg, 0, { duration: left / 1000, ease: "linear" });
    };

    // Re-sync after the tab was hidden, so the ring matches real time.
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };

    run();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controls?.stop();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [startedAt, durationMs, deg]);

  return (
    <div aria-hidden className="pointer-events-none absolute -inset-[6px] z-20 rounded-[30px]">
      <div
        className="absolute inset-[3px] rounded-[27px]"
        style={{ boxShadow: "0 0 28px -8px hsl(var(--ember) / 0.55)" }}
      />
      <div
        className="absolute inset-0 rounded-[30px] p-[3px]"
        style={{ background: "hsl(var(--ember) / 0.14)", ...ringMask }}
      />
      <motion.div className="absolute inset-0 rounded-[30px] p-[3px]" style={{ backgroundImage: background, ...ringMask }} />
    </div>
  );
}