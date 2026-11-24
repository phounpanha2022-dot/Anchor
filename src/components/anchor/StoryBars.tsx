import { motion } from "framer-motion";
import { Anchor } from "lucide-react";

interface StoryBarsProps {
  count: number;
  active: number;
}

/**
 * Instagram Story-style segments, one per card left in the deck.
 * Seen cards are dim, the current card glows ember, upcoming cards are empty.
 */
export function StoryBars({ count, active }: StoryBarsProps) {
  const segments = Math.max(count, 1);

  return (
    <div className="mt-4 flex items-center gap-2.5 px-4">
      <span
        data-app-icon
        className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
        aria-hidden
      >
        <Anchor className="h-3.5 w-3.5" strokeWidth={2.75} />
      </span>

      <div
        className="flex flex-1 gap-1.5"
        role="progressbar"
        aria-label="Deck progress"
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={count ? active + 1 : 0}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const state = count === 0 ? "empty" : i < active ? "seen" : i === active ? "current" : "empty";
          return (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                className={state === "current" ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-foreground/45"}
                initial={false}
                animate={{ width: state === "empty" ? "0%" : "100%" }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}