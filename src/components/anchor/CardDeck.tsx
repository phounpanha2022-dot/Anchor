import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import type { Task } from "@/types/task";
import type { DeckAction } from "@/hooks/useDeck";
import { TaskCard, cardVariants } from "./TaskCard";
import { LockInRing } from "./LockInRing";

export interface DeckEmptyState {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

interface CardDeckProps {
  task: Task | null;
  remaining: number;
  lastAction: DeckAction;
  turn: number;
  onNext: () => void;
  onComplete: () => void;
  onDefer: () => void;
  empty: DeckEmptyState;
  /** Locked In: draw the draining focus ring around the card. */
  focusRing?: { startedAt: number; durationMs: number } | null;
}

/** Shows ONE card. Blurred edges of the rest peek from behind. */
export function CardDeck({
  task,
  remaining,
  lastAction,
  turn,
  onNext,
  onComplete,
  onDefer,
  empty,
  focusRing,
}: CardDeckProps) {
  const peeks = Math.min(Math.max(remaining - 1, 0), 2);

  return (
    <div className="relative min-h-[300px] flex-1">
      {/* Cards waiting behind — no titles, just presence */}
      {Array.from({ length: peeks }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-x-0 top-0 h-full rounded-3xl border border-foreground/[0.06] bg-card/70"
          style={{
            transform: `translateY(${(i + 1) * 10}px) scale(${1 - (i + 1) * 0.05})`,
            opacity: 0.55 - i * 0.2,
            filter: "blur(1px)",
          }}
        />
      ))}

      <AnimatePresence>
        {focusRing && task && (
          <motion.div
            key="lock-ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 z-20"
          >
            <LockInRing startedAt={focusRing.startedAt} durationMs={focusRing.durationMs} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout" custom={lastAction} initial={false}>
        {task ? (
          <motion.div
            key={`${task.id}-${turn}`}
            custom={lastAction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <TaskCard task={task} onNext={onNext} onComplete={onComplete} onDefer={onDefer} />
          </motion.div>
        ) : (
          <motion.div
            key={`clear-${empty.title}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-foreground/[0.08] bg-card p-8 text-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-spark/15 text-spark">
              <Sparkles className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-3xl text-foreground">{empty.title}</h2>
            <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">{empty.body}</p>
            <button
              type="button"
              onClick={empty.onAction}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-background/50 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-[color,transform] duration-150 hover:text-foreground active:scale-[0.96]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {empty.actionLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}