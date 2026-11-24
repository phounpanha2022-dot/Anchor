import { AnimatePresence, motion } from "framer-motion";
import { Camera, Coffee, Footprints, type LucideIcon } from "lucide-react";
import type { BannerKind } from "@/lib/triggers";

interface BannerCopy {
  title: string;
  body: string;
  action: string;
  icon: LucideIcon;
}

const COPY: Record<BannerKind, BannerCopy> = {
  "leaving-home": {
    title: "Leaving home",
    body: "Heading out—got your keys, wallet, meds, & bag?",
    action: "Got 'em",
    icon: Footprints,
  },
  "leaving-cafe": {
    title: "On the move",
    body: "Leaving Cafe? Check the table & seat before walking away.",
    action: "Checked",
    icon: Coffee,
  },
  "snapshot-saved": {
    title: "Snapshot saved",
    body: "It's in Panic step 2 and deletes itself in 48 hours.",
    action: "OK",
    icon: Camera,
  },
};

interface IosBannerProps {
  kind: BannerKind | null;
  onDismiss: () => void;
}

/** iOS-style notification that drops in from the top of the phone. */
export function IosBanner({ kind, onDismiss }: IosBannerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[45] px-3 pt-safe" role="status" aria-live="polite">
      <AnimatePresence>
        {kind && <BannerBody key={kind} kind={kind} onDismiss={onDismiss} />}
      </AnimatePresence>
    </div>
  );
}

function BannerBody({ kind, onDismiss }: { kind: BannerKind; onDismiss: () => void }) {
  const copy = COPY[kind];
  const Icon = copy.icon;

  return (
    <motion.div
      initial={{ y: -90, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -90, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0.1 }}
      onDragEnd={(_event, info) => {
        if (info.offset.y < -24) onDismiss();
      }}
      className="pointer-events-auto flex items-center gap-3 rounded-[1.4rem] border border-foreground/[0.1] bg-card/90 p-3 pr-2.5 shadow-elegant backdrop-blur-xl"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          ANCHOR <span aria-hidden>·</span> <span className="normal-case tracking-normal">now</span>
        </p>
        <p className="text-sm font-bold text-foreground">{copy.title}</p>
        <p className="text-[13px] leading-snug text-foreground/80">{copy.body}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-full bg-foreground/[0.1] px-3 py-2 text-xs font-bold text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-foreground/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
      >
        {copy.action}
      </button>
    </motion.div>
  );
}