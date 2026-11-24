import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Mic, Plus, RotateCcw, Sparkles, X, Zap } from "lucide-react";
import { OverlayShell } from "./OverlayShell";
import { SAMPLE_RANTS, rantToTasks, type RantTask, type RantTriage } from "@/services/rantToTasks";

interface RantSheetProps {
  open: boolean;
  /** Open with the simulated mic already on (the pill was held). */
  startListening: boolean;
  onClose: () => void;
  onAdd: (task: RantTask) => void;
}

export function RantSheet({ open, startListening, onClose, onAdd }: RantSheetProps) {
  // The raw rant is wiped the instant the sheet closes, before it animates away.
  const [text, setText] = useState("");
  const close = useCallback(() => {
    setText("");
    onClose();
  }, [onClose]);

  return (
    <OverlayShell open={open} onClose={close} placement="bottom" labelledBy="rant-title">
      <RantBody text={text} setText={setText} startListening={startListening} onClose={close} onAdd={onAdd} />
    </OverlayShell>
  );
}

interface RantBodyProps extends Omit<RantSheetProps, "open"> {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}

function RantBody({ text, setText, startListening, onClose, onAdd }: RantBodyProps) {
  const [listening, setListening] = useState(startListening);
  const [result, setResult] = useState<RantTriage | null>(null);
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!startListening) textRef.current?.focus({ preventScroll: true });
  }, [startListening]);

  const triage = () => {
    if (!text.trim()) return;
    const next = rantToTasks(text);
    setText("");
    setListening(false);
    setAdded(new Set());
    setResult(next);
  };

  const add = (task: RantTask) => {
    if (added.has(task.id)) return;
    onAdd(task);
    setAdded((current) => new Set(current).add(task.id));
  };

  const addAll = () => result?.tasks.forEach(add);
  const allAdded = !!result && result.tasks.every((task) => added.has(task.id));

  return (
    <div className="px-5 pt-3">
      <span aria-hidden className="mx-auto block h-1 w-10 rounded-full bg-foreground/15" />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h2 id="rant-title" className="font-display text-2xl text-foreground">
            {result ? "Here's a calmer pile" : "Let it all out"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Your words stay on this phone and vanish when you close.</p>
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

      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="pb-4"
          >
            <p className="mt-4 rounded-2xl border border-calm/20 bg-calm/[0.07] px-4 py-3 text-[15px] leading-relaxed text-foreground/90">
              {result.validationLine}
            </p>

            <ul className="mt-4 space-y-2.5">
              {result.tasks.map((task, i) => (
                <TriageCard key={task.id} task={task} index={i} added={added.has(task.id)} onAdd={() => add(task)} />
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-foreground/[0.08] bg-background/50 text-sm font-bold text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                New rant
              </button>
              {allAdded ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                >
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  Back to deck
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addAll}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
                  Add all
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="pb-4"
          >
            <div className="mt-4 flex items-center gap-3">
              <MicToggle listening={listening} onToggle={() => setListening((value) => !value)} />
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {listening ? "Listening… (simulated) — type below while you talk" : "Tap the mic, or just type"}
              </p>
            </div>

            <label htmlFor="rant-text" className="sr-only">
              Your rant
            </label>
            <textarea
              id="rant-text"
              ref={textRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder="Everything that's loud in your head right now…"
              className="mt-3 w-full resize-none rounded-2xl border border-foreground/[0.08] bg-background/70 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ember/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            />

            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Try a sample</p>
            <div className="mt-2 flex flex-col gap-2">
              {SAMPLE_RANTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setText(sample)}
                  className="rounded-xl border border-foreground/[0.08] bg-background/40 px-3.5 py-2.5 text-left text-sm leading-snug text-foreground/85 transition-[border-color,transform] duration-150 ease-out hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                >
                  "{sample}"
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={triage}
              disabled={!text.trim()}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Triage Chaos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MicToggle({ listening, onToggle }: { listening: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start listening"}
      className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-[color,background-color,border-color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] ${
        listening ? "border-ember/50 bg-ember/15 text-ember" : "border-foreground/[0.1] bg-background/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {listening && (
        <>
          <span aria-hidden className="mic-pulse absolute inset-0 rounded-full" />
          <span aria-hidden className="mic-pulse mic-pulse-late absolute inset-0 rounded-full" />
        </>
      )}
      <Mic className="relative h-5 w-5" strokeWidth={2.4} aria-hidden />
    </button>
  );
}

function TriageCard({ task, index, added, onAdd }: { task: RantTask; index: number; added: boolean; onAdd: () => void }) {
  const isAnchor = task.category === "anchor";
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.06 + index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-background/50 p-3.5 ${
        isAnchor ? "card-glow-anchor" : "card-glow-flow"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
              isAnchor ? "bg-ember/10 text-ember" : "bg-chill/10 text-chill"
            }`}
          >
            {isAnchor ? "Hard Anchor" : "Flow"}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {task.minutes} min
          </span>
          <Zap
            className={`h-3 w-3 ${task.chakra === "high" ? "text-spark" : "text-chill"}`}
            fill="currentColor"
            aria-label={task.chakra === "high" ? "High energy" : "Low energy"}
          />
        </div>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">{task.title}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        aria-label={added ? `${task.title} added` : `Add ${task.title} to deck`}
        className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold transition-[color,background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] ${
          added ? "bg-owed/15 text-owed" : "bg-foreground/[0.08] text-foreground hover:bg-foreground/[0.14]"
        }`}
      >
        {added ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
        {added ? "Added" : "Add"}
      </button>
    </motion.li>
  );
}