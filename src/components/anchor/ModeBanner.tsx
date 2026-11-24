import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MODES, type OrbMode } from "@/lib/anchorModes";
import { useNow } from "@/hooks/useNow";

interface ModeBannerProps {
  mode: OrbMode | null;
  endsAt: number | null;
  durationMs: number | null;
  /** Cards on stage in the current mode. */
  visibleCount: number;
  onExit: () => void;
}

function describe(mode: OrbMode, count: number): string {
  switch (mode) {
    case "low":
      if (count === 0) return "No micro-tasks left. Rest counts too.";
      return count === 1 ? "1 micro-task, 5 min or less" : `${count} micro-tasks, 5 min or less`;
    case "locked":
      return "20 minutes on your top Hard Anchor";
    case "owed":
      return "Protected time. Nothing is due right now.";
    case "panic":
      return "Rewinding 5 → 1. Nothing bad has happened.";
  }
}

/** One calm line under the story bars saying which mode is on. */
export function ModeBanner({ mode, endsAt, durationMs, visibleCount, onExit }: ModeBannerProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mb-4"
        >
          <BannerBody mode={mode} endsAt={endsAt} durationMs={durationMs} visibleCount={visibleCount} onExit={onExit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BannerBody({
  mode,
  endsAt,
  durationMs,
  visibleCount,
  onExit,
}: Omit<ModeBannerProps, "mode"> & { mode: OrbMode }) {
  const meta = MODES[mode];
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border px-3.5 py-3 ${meta.soft}`} role="status">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background/60 ${meta.text}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold ${meta.text}`}>{meta.label}</p>
          <p className="text-xs leading-snug text-muted-foreground">{describe(mode, visibleCount)}</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          aria-label={`End ${meta.label}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {mode === "owed" && endsAt && durationMs && <ProtectedTimer endsAt={endsAt} durationMs={durationMs} />}
    </div>
  );
}

/** Calm minute countdown for protected time. Updates quietly, never shows seconds. */
function ProtectedTimer({ endsAt, durationMs }: { endsAt: number; durationMs: number }) {
  const now = useNow(15_000);
  const left = Math.max(0, endsAt - now);
  const minutes = Math.max(1, Math.ceil(left / 60_000));
  const fraction = Math.min(1, left / durationMs);

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="shrink-0 rounded-full border border-owed/30 bg-owed/10 px-2.5 py-1 text-[11px] font-bold tabular-nums text-owed">
        {minutes} min left
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-owed/15">
        <div
          className="h-full rounded-full bg-owed transition-[width] duration-1000 ease-linear"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}