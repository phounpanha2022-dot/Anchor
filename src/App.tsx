import { useState, useCallback } from "react";
import "@/App.css";

import { PhoneFrame } from "@/components/anchor/PhoneFrame";
import { TopBar } from "@/components/anchor/TopBar";
import { StoryBars } from "@/components/anchor/StoryBars";
import { ModeBanner } from "@/components/anchor/ModeBanner";
import { CardDeck, type DeckEmptyState } from "@/components/anchor/CardDeck";
import { TactileOrb } from "@/components/anchor/TactileOrb";
import { RantPill } from "@/components/anchor/RantPill";
import { FogOfWar } from "@/components/anchor/FogOfWar";
import { TriggerDrawer } from "@/components/anchor/TriggerDrawner";
import { RantSheet } from "@/components/anchor/RantSheet";
import { SnapshotModal } from "@/components/anchor/SnapshotModal";
import { RealityCheckModal } from "@/components/anchor/RealityCheckModal";
import { DoomscrollIntercept } from "@/components/anchor/DoomscrollIntercept";
import { IosBanner } from "@/components/anchor/IosBanner";
import { PanicRewind } from "@/components/anchor/PanicRewind";

import { SAMPLE_TASKS } from "@/data/sampleTasks";
import { MODES, modeDuration, type OrbMode } from "@/lib/anchorModes";
import type { Task } from "@/types/task";
import type { DeckAction } from "@/hooks/useDeck";
import type { TriggerId, BannerKind } from "@/lib/triggers";
import type { ArrivalSnapshot } from "@/lib/snapshot";
import type { RantTask } from "@/services/rantToTasks";

/* ───── deck helpers ───── */
function useDeck(initial: Task[]) {
  const [tasks, setTasks] = useState(initial);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [lastAction, setLastAction] = useState<DeckAction>("next");

  const current = tasks.length > 0 ? tasks[index % tasks.length] : null;
  const remaining = tasks.length;

  const next = useCallback(() => {
    setLastAction("next");
    setTurn((t) => t + 1);
    setIndex((i) => (tasks.length > 0 ? (i + 1) % tasks.length : 0));
  }, [tasks.length]);

  const complete = useCallback(() => {
    setLastAction("complete");
    setTurn((t) => t + 1);
    setTasks((prev) => prev.filter((_, i) => i !== index % prev.length));
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, [index]);

  const defer = useCallback(() => {
    setLastAction("defer");
    setTurn((t) => t + 1);
    setIndex((i) => (tasks.length > 0 ? (i + 1) % tasks.length : 0));
  }, [tasks.length]);

  const addTask = useCallback((task: RantTask) => {
    setTasks((prev) => [
      ...prev,
      { ...task, autoVanishHours: task.category === "flow" ? 24 : undefined },
    ]);
  }, []);

  const reset = useCallback(() => {
    setTasks(initial);
    setIndex(0);
    setTurn(0);
    setLastAction("next");
  }, [initial]);

  return { current, remaining, index, turn, lastAction, next, complete, defer, addTask, reset, tasks };
}

/* ───── App ───── */
function App() {
  /* deck state */
  const deck = useDeck(SAMPLE_TASKS);

  /* mode state */
  const [mode, setMode] = useState<OrbMode | null>(null);
  const [modeEndsAt, setModeEndsAt] = useState<number | null>(null);
  const [modeDurationMs, setModeDurationMs] = useState<number | null>(null);

  /* ui overlays */
  const [triggersOpen, setTriggersOpen] = useState(false);
  const [rantOpen, setRantOpen] = useState(false);
  const [rantListening, setRantListening] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [realityOpen, setRealityOpen] = useState(false);
  const [doomscrollOpen, setDoomscrollOpen] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [banner, setBanner] = useState<BannerKind | null>(null);

  /* snapshot + sparks state */
  const [snapshot, setSnapshot] = useState<ArrivalSnapshot>({
    imageUrl: null,
    note: "",
    when: "Just now",
    takenAt: null,
  });
  const [sparks, setSparks] = useState(0);
  const [claims, setClaims] = useState(0);

  /* mode selection */
  const selectMode = useCallback(
    (m: OrbMode) => {
      if (mode === m) {
        setMode(null);
        setModeEndsAt(null);
        setModeDurationMs(null);
        return;
      }
      setMode(m);
      const dur = modeDuration(m);
      if (dur) {
        setModeEndsAt(Date.now() + dur);
        setModeDurationMs(dur);
      } else {
        setModeEndsAt(null);
        setModeDurationMs(null);
      }
      if (m === "panic") setPanicOpen(true);
    },
    [mode],
  );

  const exitMode = useCallback(() => {
    setMode(null);
    setModeEndsAt(null);
    setModeDurationMs(null);
    setPanicOpen(false);
  }, []);

  /* trigger handler */
  const handleTrigger = useCallback(
    (id: TriggerId) => {
      setTriggersOpen(false);
      switch (id) {
        case "leaving-home":
          setBanner("leaving-home");
          break;
        case "leaving-cafe":
          setBanner("leaving-cafe");
          break;
        case "arriving-home":
          setSnapshotOpen(true);
          break;
        case "over-press":
          setRealityOpen(true);
          break;
        case "doomscroll":
          setDoomscrollOpen(true);
          break;
      }
    },
    [],
  );

  /* complete handler with sparks */
  const handleComplete = useCallback(() => {
    deck.complete();
    setSparks((s) => s + 1);
  }, [deck]);

  /* mode data */
  const meta = mode ? MODES[mode] : MODES.low;
  const presence = mode ? meta.presence : "Idle";
  const presenceDot = mode ? meta.dot : "bg-foreground/30";

  /* visible cards for mode filter */
  const visibleCount = mode === "low"
    ? deck.tasks.filter((t) => t.minutes <= 5).length
    : deck.remaining;

  /* focus ring for locked mode */
  const focusRing =
    mode === "locked" && modeEndsAt && modeDurationMs
      ? { startedAt: modeEndsAt - modeDurationMs, durationMs: modeDurationMs }
      : null;

  /* empty state */
  const emptyState: DeckEmptyState = {
    title: "All clear",
    body: "Every card is done. Momentum builds in silence.",
    actionLabel: "Reload sample cards",
    onAction: deck.reset,
  };

  /* top anchor for reality check */
  const topAnchor = deck.tasks.find((t) => t.category === "anchor") ?? null;

  return (
    <PhoneFrame perimeter={mode === "owed"}>
      <TopBar
        presence={presence}
        presenceDot={presenceDot}
        momentumDay={1}
        sparksToday={sparks}
        triggersOpen={triggersOpen}
        onOpenTriggers={() => setTriggersOpen(true)}
      />

      <StoryBars count={deck.remaining} active={deck.index} />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-safe">
        <ModeBanner
          mode={mode}
          endsAt={modeEndsAt}
          durationMs={modeDurationMs}
          visibleCount={visibleCount}
          onExit={exitMode}
        />
        <CardDeck
          task={deck.current}
          remaining={deck.remaining}
          lastAction={deck.lastAction}
          turn={deck.turn}
          onNext={deck.next}
          onComplete={handleComplete}
          onDefer={deck.defer}
          empty={emptyState}
          focusRing={focusRing}
        />
        <div className="mt-5">
          <TactileOrb mode={mode} onSelect={selectMode} />
        </div>
        <div className="mt-4 pb-2">
          <RantPill
            onOpen={(listening) => {
              setRantListening(listening);
              setRantOpen(true);
            }}
          />
        </div>
        <FogOfWar />
      </div>

      {/* overlays */}
      <TriggerDrawer open={triggersOpen} onClose={() => setTriggersOpen(false)} onTrigger={handleTrigger} />
      <RantSheet
        open={rantOpen}
        startListening={rantListening}
        onClose={() => setRantOpen(false)}
        onAdd={deck.addTask}
      />
      <SnapshotModal
        open={snapshotOpen}
        onClose={() => setSnapshotOpen(false)}
        onSave={(url, note) => {
          setSnapshot({ imageUrl: url, note, when: "Just now", takenAt: Date.now() });
          setSnapshotOpen(false);
          setBanner("snapshot-saved");
        }}
      />
      <RealityCheckModal
        open={realityOpen}
        anchor={topAnchor}
        claimsToday={claims}
        onLockIn={() => {
          setRealityOpen(false);
          selectMode("locked");
        }}
        onGrant={() => {
          setClaims((c) => c + 1);
          selectMode("owed");
        }}
        onClose={() => setRealityOpen(false)}
      />

      {/* full-screen overlays */}
      {doomscrollOpen && (
        <DoomscrollIntercept onGoodnight={() => setDoomscrollOpen(false)} />
      )}
      {panicOpen && (
        <PanicRewind snapshot={snapshot} onExit={exitMode} />
      )}

      <IosBanner kind={banner} onDismiss={() => setBanner(null)} />
    </PhoneFrame>
  );
}

export default App;
