import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, Zap } from "lucide-react";

interface TopBarProps {
  presence: string;
  /** Tailwind background class for the presence dot. */
  presenceDot?: string;
  momentumDay: number;
  sparksToday: number;
  triggersOpen: boolean;
  onOpenTriggers: () => void;
}

export function TopBar({
  presence,
  presenceDot = "bg-spark",
  momentumDay,
  sparksToday,
  triggersOpen,
  onOpenTriggers,
}: TopBarProps) {
  return (
    <header className="relative px-4 pt-safe">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenTriggers}
          aria-haspopup="dialog"
          aria-expanded={triggersOpen}
          className="inline-flex items-center gap-1 justify-self-start whitespace-nowrap rounded-full border border-foreground/[0.08] bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
        >
          <FlaskConical className="hidden h-3.5 w-3.5 min-[400px]:block" aria-hidden />
          Test Triggers
        </button>

        <PresencePill label={presence} dot={presenceDot} />

        <MomentumPill day={momentumDay} sparks={sparksToday} />
      </div>
    </header>
  );
}

function PresencePill({ label, dot }: { label: string; dot: string }) {
  return (
    <div
      role="status"
      aria-label={`Presence: ${label}`}
      className="inline-flex min-w-0 max-w-full items-center gap-1.5 justify-self-center overflow-hidden whitespace-nowrap rounded-full border border-foreground/[0.08] bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-foreground/10 transition-colors duration-300 ${dot}`} aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          className="truncate"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function MomentumPill({ day, sparks }: { day: number; sparks: number }) {
  return (
    <div className="relative inline-flex items-center gap-1 justify-self-end whitespace-nowrap rounded-full border border-spark/25 bg-spark/10 px-2.5 py-1.5 text-[11px] font-semibold text-spark">
      <Zap className="hidden h-3.5 w-3.5 min-[400px]:block" fill="currentColor" aria-hidden />
      <span className="tabular-nums">Day {day}</span>
      <span className="text-spark/75">Momentum</span>
      {sparks > 0 && (
        <motion.span
          key={sparks}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
          aria-label={`${sparks} done today`}
          className="absolute -right-1.5 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-spark px-1 text-[10px] font-bold tabular-nums text-accent-foreground"
        >
          +{sparks}
        </motion.span>
      )}
    </div>
  );
}