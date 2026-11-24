import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Check, Timer, X } from "lucide-react";
import { PixelTotem } from "./PixelTotem";
import { useEscape } from "@/hooks/useEscape";
import { SNAPSHOT_TTL_HOURS, type ArrivalSnapshot } from "@/lib/snapshot";

interface RewindStep {
  n: number;
  name: string;
  body: string;
}

const STEPS: RewindStep[] = [
  { n: 5, name: "Freeze", body: "Stop walking. Sit down for 15 seconds. Take one slow breath." },
  { n: 4, name: "Immediate Radius", body: "Scan waist-height surfaces within 5 feet of where you just stood." },
  {
    n: 3,
    name: "Container Blindness",
    body: "Did the packaging change? Look for brown paper bags, coat pockets, or backpacks—not just the original bottle.",
  },
  { n: 2, name: "Last Arrival Snapshot", body: "Here's where you set things down the last time you got home." },
  {
    n: 1,
    name: "Grounding Reset",
    body: "If it's not here, it is safely inside your last anchor spot. Breathe—nothing bad has happened.",
  },
];

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 28 * dir }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: -28 * dir, transition: { duration: 0.18 } }),
};

interface PanicRewindProps {
  snapshot: ArrivalSnapshot;
  onExit: () => void;
}

/** Panic: a slow, full-screen 5 → 1 rewind for when something important is missing. */
export function PanicRewind({ snapshot, onExit }: PanicRewindProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEscape(true, onExit);

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((current) => Math.min(STEPS.length - 1, Math.max(0, current + delta)));
  };

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panic-step-title"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="bg-panic-dusk absolute inset-0 z-40 flex flex-col focus:outline-none"
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-safe">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-calm">Panic rewind</p>
          <ol className="mt-2 flex items-center gap-1.5" aria-label={`Step ${step.n}, counting down from 5`}>
            {STEPS.map((item, i) => (
              <li
                key={item.n}
                aria-hidden
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === index ? "w-6 bg-calm" : i < index ? "w-1.5 bg-calm/60" : "w-1.5 bg-calm/20"
                }`}
              />
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-calm/20 bg-calm/[0.08] px-3.5 text-xs font-bold text-calm transition-[background-color,transform] duration-150 ease-out hover:bg-calm/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm active:scale-[0.96]"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Exit
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-6 text-center">
        <div className="my-auto flex w-full flex-col items-center">
          <div
            className={`relative grid shrink-0 place-items-center transition-[width,height] duration-300 ${
              step.n === 2 ? "h-20 w-20" : "h-40 w-40"
            }`}
          >
            <AnimatePresence>{step.n === 5 && <BreathingRing key="ring" />}</AnimatePresence>
            <PixelTotem state="panic" size={step.n === 2 ? 48 : 72} />
          </div>

          <AnimatePresence mode="wait" custom={reduce ? 0 : direction} initial={false}>
            <motion.div
              key={step.n}
              custom={reduce ? 0 : direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex w-full flex-col items-center"
            >
              <p className={`font-display leading-none tabular-nums text-calm ${step.n === 2 ? "mt-2 text-4xl" : "mt-6 text-6xl"}`}>
                {step.n}
              </p>
              <h2 id="panic-step-title" className="mt-2 font-display text-2xl text-foreground">
                {step.name}
              </h2>
              <p className="mt-3 max-w-[300px] text-[17px] leading-relaxed text-foreground/80">{step.body}</p>
              {step.n === 2 && <SnapshotCard snapshot={snapshot} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="grid grid-cols-2 gap-3 px-5 pb-safe pt-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={isFirst}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-calm/15 bg-calm/[0.05] text-[15px] font-bold text-calm transition-[opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm active:scale-[0.98] disabled:opacity-35"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={isLast ? onExit : () => go(1)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-calm/90 text-[15px] font-bold text-panic transition-[background-color,transform] duration-150 ease-out hover:bg-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm focus-visible:ring-offset-2 focus-visible:ring-offset-panic active:scale-[0.98]"
        >
          {isLast ? (
            <>
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              I'm okay
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </footer>
    </motion.div>
  );
}

/** Slow 4-second in, 4-second out ring. Holds still when motion is reduced. */
function BreathingRing() {
  const reduce = useReducedMotion();
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setInhale((value) => !value), 4000);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-calm/45 bg-calm/[0.07]"
        initial={{ scale: reduce ? 0.9 : 0.68 }}
        animate={{ scale: reduce ? 0.9 : inhale ? 1 : 0.68 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />
      <span className="absolute inset-[18%] rounded-full border border-calm/15" />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-calm/80">
        {reduce ? "Slow breath in, slow breath out" : inhale ? "Breathe in…" : "Breathe out…"}
      </span>
    </motion.div>
  );
}

function SnapshotCard({ snapshot }: { snapshot: ArrivalSnapshot }) {
  const hoursLeft = snapshot.takenAt
    ? Math.max(1, Math.ceil((snapshot.takenAt + SNAPSHOT_TTL_HOURS * 3_600_000 - Date.now()) / 3_600_000))
    : null;

  return (
    <figure className="mt-5 w-full max-w-[300px] overflow-hidden rounded-2xl border border-calm/20 bg-foreground/[0.03] text-left">
      <div className="relative aspect-[4/3] w-full bg-foreground/[0.04]">
        {snapshot.imageUrl ? (
          <img
            src={snapshot.imageUrl}
            alt={`Snapshot: ${snapshot.note}`}
            width={1200}
            height={896}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-calm/25 text-calm/70">
            <Camera className="h-6 w-6" aria-hidden />
            <span className="px-4 text-center text-xs">No photo in this slot yet</span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-panic/85 px-2 py-1 text-[10px] font-bold text-calm backdrop-blur-sm">
          <Timer className="h-3 w-3" aria-hidden />
          {SNAPSHOT_TTL_HOURS}h auto-delete
        </span>
      </div>
      <figcaption className="p-3.5">
        <p className="text-sm leading-snug text-foreground">
          <span className="font-bold tabular-nums text-calm">{snapshot.when}</span> — {snapshot.note}
        </p>
        {hoursLeft !== null && (
          <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">Deletes itself in {hoursLeft}h</p>
        )}
      </figcaption>
    </figure>
  );
}