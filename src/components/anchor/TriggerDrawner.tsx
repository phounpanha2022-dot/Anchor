import { Coffee, DoorOpen, Footprints, MoonStar, ShieldAlert, X, type LucideIcon } from "lucide-react";
import { OverlayShell } from "./OverlayShell";
import type { TriggerId } from "@/lib/triggers";

interface TriggerItem {
  id: TriggerId;
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
}

const TRIGGERS: TriggerItem[] = [
  {
    id: "leaving-home",
    title: "Leaving Home (35 Steps)",
    detail: "Step counter passes the front door",
    icon: Footprints,
    tone: "border-spark/25 bg-spark/10 text-spark",
  },
  {
    id: "leaving-cafe",
    title: "Leaving Cafe (Dwell → Walk)",
    detail: "Sat still for 40 min, then started walking",
    icon: Coffee,
    tone: "border-chill/25 bg-chill/10 text-chill",
  },
  {
    id: "arriving-home",
    title: "Arriving Home w/ Errand Bag",
    detail: "One silent photo of where it landed",
    icon: DoorOpen,
    tone: "border-calm/25 bg-calm/10 text-calm",
  },
  {
    id: "over-press",
    title: "Over-Press Free Time",
    detail: "Opens the 5-second reality check",
    icon: ShieldAlert,
    tone: "border-owed/25 bg-owed/10 text-owed",
  },
  {
    id: "doomscroll",
    title: "2:00 AM Doomscroll Intercept",
    detail: "Late-night screen time detected",
    icon: MoonStar,
    tone: "border-calm/25 bg-calm/10 text-calm",
  },
];

interface TriggerDrawerProps {
  open: boolean;
  onClose: () => void;
  onTrigger: (id: TriggerId) => void;
}

/** Slide-down drawer that fakes the phone sensors so every trigger can be tried. */
export function TriggerDrawer({ open, onClose, onTrigger }: TriggerDrawerProps) {
  return (
    <OverlayShell open={open} onClose={onClose} placement="top" labelledBy="trigger-title">
      <div className="px-5 pb-5">
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-spark">Sensor simulator</p>
            <h2 id="trigger-title" className="mt-1 font-display text-2xl text-foreground">
              Test Triggers
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Pretend your phone just noticed one of these.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {TRIGGERS.map((trigger, i) => {
            const Icon = trigger.icon;
            return (
              <li key={trigger.id}>
                <button
                  type="button"
                  onClick={() => onTrigger(trigger.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-foreground/[0.07] bg-background/50 p-3 text-left transition-[border-color,transform] duration-150 ease-out hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${trigger.tone}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">
                      <span className="mr-1.5 tabular-nums text-muted-foreground">{i + 1}.</span>
                      {trigger.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{trigger.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-foreground/15" />
    </OverlayShell>
  );
}