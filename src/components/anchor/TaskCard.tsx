import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type PanInfo, type Variants } from "framer-motion";
import { Anchor, ArrowDown, ArrowUp, ChevronRight, Clock, Hourglass, Waves, Zap } from "lucide-react";
import type { Task } from "@/types/task";
import type { DeckAction } from "@/hooks/useDeck";

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

interface TaskCardProps {
  task: Task;
  onNext: () => void;
  onComplete: () => void;
  onDefer: () => void;
}

/** How the PREVIOUS card leaves — read through AnimatePresence's `custom`. */
export const cardVariants: Variants = {
  enter: { opacity: 0, y: 26, scale: 0.94 },
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 30 },
  },
  exit: (action: DeckAction) =>
    action === "focus"
      ? { opacity: 0, scale: 0.92, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }
      : action === "complete"
      ? { opacity: 0, y: -260, scale: 0.9, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }
      : action === "defer"
        ? { opacity: 0, y: 220, scale: 0.9, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }
        : { opacity: 0, x: -220, rotate: -6, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } },
};

export function TaskCard({ task, onNext, onComplete, onDefer }: TaskCardProps) {
  const isAnchor = task.category === "anchor";
  const y = useMotionValue(0);
  const doneHint = useTransform(y, [-SWIPE_DISTANCE, -20], [1, 0]);
  const deferHint = useTransform(y, [20, SWIPE_DISTANCE], [0, 1]);
  // A swipe that ends over the tap zone must not also count as a tap.
  const draggedRef = useRef(false);

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 60);
    if (info.offset.y < -SWIPE_DISTANCE || info.velocity.y < -SWIPE_VELOCITY) onComplete();
    else if (info.offset.y > SWIPE_DISTANCE || info.velocity.y > SWIPE_VELOCITY) onDefer();
  };

  const handleTapNext = () => {
    if (draggedRef.current) return;
    onNext();
  };

  return (
    <motion.article
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      dragSnapToOrigin
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      style={{ y }}
      aria-label={`${task.title}, ${task.minutes} minutes`}
      className={`relative z-10 flex h-full cursor-grab touch-none select-none flex-col overflow-hidden rounded-3xl border border-foreground/[0.08] bg-card p-6 shadow-elegant active:cursor-grabbing ${
        isAnchor ? "card-glow-anchor" : "card-glow-flow"
      }`}
    >
      {/* Swipe hints */}
      <motion.div
        style={{ opacity: doneHint }}
        className="pointer-events-none absolute inset-x-0 top-3 flex justify-center"
        aria-hidden
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-spark/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-spark">
          <ArrowUp className="h-3 w-3" /> Done
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: deferHint }}
        className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
        aria-hidden
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-chill/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-chill">
          <ArrowDown className="h-3 w-3" /> Later
        </span>
      </motion.div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {isAnchor ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ember">
            <Anchor className="h-3 w-3" strokeWidth={2.75} aria-hidden />
            Hard Anchor
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-chill/30 bg-chill/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-chill">
            <Waves className="h-3 w-3" strokeWidth={2.75} aria-hidden />
            Flow
            <span className="font-semibold normal-case tracking-normal text-chill/80">
              · Vanishes in {task.autoVanishHours ?? 24}h
            </span>
          </span>
        )}
        <ChakraTag chakra={task.chakra} />
      </div>

      {/* Body */}
      <div className="relative mt-6 flex min-h-0 flex-1 flex-col justify-center">
        <h2 className="pr-10 font-display text-[2rem] leading-[1.08] tracking-[-0.01em] text-foreground">
          {task.title}
        </h2>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden />
          <span className="font-semibold tabular-nums text-foreground/85">{task.minutes} min</span>
          {task.minutes <= 2 && <span className="text-chill">· micro-task</span>}
        </p>

        {/* Right-side tap zone = next card (Stories-style) */}
        <button
          type="button"
          onClick={handleTapNext}
          aria-label="Next card"
          className="group absolute inset-y-0 right-0 flex w-[45%] items-center justify-end rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className="-mr-2 grid h-9 w-9 place-items-center rounded-full border border-foreground/[0.08] bg-background/60 text-muted-foreground transition-[color,transform] duration-150 ease-out group-hover:text-foreground group-active:scale-[0.96]"
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-[1fr_1.4fr_1fr] gap-2">
        <CardAction label="Defer" onClick={onDefer} tone="muted">
          <Hourglass className="h-4 w-4" aria-hidden />
        </CardAction>
        <CardAction label="Done" onClick={onComplete} tone="primary">
          <ArrowUp className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </CardAction>
        <CardAction label="Next" onClick={onNext} tone="muted">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </CardAction>
      </div>
    </motion.article>
  );
}

function ChakraTag({ chakra }: { chakra: Task["chakra"] }) {
  const high = chakra === "high";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      <Zap className={`h-3 w-3 ${high ? "text-spark" : "text-chill"}`} fill="currentColor" aria-hidden />
      {high ? "High energy" : "Low energy"}
    </span>
  );
}

function CardAction({
  label,
  onClick,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  tone: "primary" | "muted";
  children: ReactNode;
}) {
  const styles =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-foreground/[0.08] bg-background/50 text-muted-foreground hover:text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      // Buttons never start a swipe.
      onPointerDownCapture={(event) => event.stopPropagation()}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-[transform,color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] ${styles}`}
    >
      {children}
      {label}
    </button>
  );
}