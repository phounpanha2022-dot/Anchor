import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { PixelTotem } from "./PixelTotem";
import { DIRECTION_TO_MODE, MODES, orbStyle, type OrbDirection, type OrbMode } from "@/lib/anchorModes";

/* ---------- Geometry, in px, measured from the orb's home ---------- */
/** Orb diameter. */
const ORB = 72;
/** Distance from home to the center of each + target. */
const REACH = 80;
/** Target button diameter. */
const TARGET = 48;
/** Box the orb can travel in on each axis (with elastic beyond it). */
const DRAG_LIMIT = 90;
/** Within this distance of a target center, the orb locks on. */
const SNAP = 35;
/** Travel before the nearest target starts to light up. */
const LEAN = 16;
/** The orb's home, measured from the top of the orb zone. */
const HOME_Y = 52;
/** Backing disc behind the crosshair so targets read over the card. */
const PLATE = REACH * 2 + 96;
/** Visible arm length from home to each target edge. */
const ARM = REACH - TARGET / 2;

const NAV_ORDER: OrbMode[] = ["low", "locked", "owed", "panic"];
const CROSS: OrbDirection[] = ["up", "left", "right", "down"];

const TARGETS: Record<OrbDirection, { x: number; y: number }> = {
  up: { x: 0, y: -REACH },
  down: { x: 0, y: REACH },
  left: { x: -REACH, y: 0 },
  right: { x: REACH, y: 0 },
};

const ARMS: Record<OrbDirection, CSSProperties> = {
  up: { left: -1, top: -ARM, width: 2, height: ARM },
  down: { left: -1, top: 0, width: 2, height: ARM },
  left: { top: -1, left: -ARM, width: ARM, height: 2 },
  right: { top: -1, left: 0, width: ARM, height: 2 },
};

const KEY_TO_DIRECTION: Record<string, OrbDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

interface Aim {
  /** Nearest target once the orb has moved a little. */
  lean: OrbDirection | null;
  /** Target the orb is locked onto (within SNAP px). */
  lock: OrbDirection | null;
}

const NO_AIM: Aim = { lean: null, lock: null };

/** Free 2D read: nearest target by straight-line distance, no axis locking. */
function readAim(x: number, y: number): Aim {
  let nearest: OrbDirection = "up";
  let best = Infinity;
  for (const dir of CROSS) {
    const distance = Math.hypot(x - TARGETS[dir].x, y - TARGETS[dir].y);
    if (distance < best) {
      best = distance;
      nearest = dir;
    }
  }
  return {
    lean: Math.hypot(x, y) >= LEAN ? nearest : null,
    lock: best <= SNAP ? nearest : null,
  };
}

function tint(colorVar: string, alpha: number) {
  return `hsl(var(${colorVar}) / ${alpha})`;
}

function buzz() {
  try {
    navigator.vibrate?.(12);
  } catch {
    // Haptics are a bonus; ignore browsers that refuse.
  }
}

interface TactileOrbProps {
  mode: OrbMode | null;
  onSelect: (mode: OrbMode) => void;
}

/**
 * The 4-way tactile orb.
 * - Tap: a flat 4-button nav bar with the orb in the middle.
 * - Drag the orb: the bar fades and a + crosshair appears. Move freely in 2D;
 *   near a target the orb magnetically locks on. Release to switch modes.
 * - Arrow keys on the orb work too.
 */
export function TactileOrb({ mode, onSelect }: TactileOrbProps) {
  const [dragging, setDragging] = useState(false);
  const [aim, setAim] = useState<Aim>(NO_AIM);
  const aimRef = useRef<Aim>(NO_AIM);

  // Where the finger has the orb.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Extra offset that pulls the visible orb onto a locked target.
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const magnetX = useSpring(pullX, { stiffness: 640, damping: 34, mass: 0.6 });
  const magnetY = useSpring(pullY, { stiffness: 640, damping: 34, mass: 0.6 });

  const updateAim = useCallback((next: Aim) => {
    const current = aimRef.current;
    if (current.lean === next.lean && current.lock === next.lock) return;
    if (next.lock && next.lock !== current.lock) buzz();
    aimRef.current = next;
    setAim(next);
  }, []);

  const handleDragStart = () => {
    setDragging(true);
    updateAim(NO_AIM);
  };

  const handleDrag = () => {
    const px = x.get();
    const py = y.get();
    const next = readAim(px, py);
    if (next.lock) {
      pullX.set(TARGETS[next.lock].x - px);
      pullY.set(TARGETS[next.lock].y - py);
    } else {
      pullX.set(0);
      pullY.set(0);
    }
    updateAim(next);
  };

  const handleDragEnd = () => {
    const locked = aimRef.current.lock;
    pullX.set(0);
    pullY.set(0);
    updateAim(NO_AIM);
    setDragging(false);
    if (locked) onSelect(DIRECTION_TO_MODE[locked]);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const dir = KEY_TO_DIRECTION[event.key];
    if (!dir) return;
    event.preventDefault();
    onSelect(DIRECTION_TO_MODE[dir]);
  };

  const lockedMode = aim.lock ? DIRECTION_TO_MODE[aim.lock] : null;
  const preview = lockedMode ?? mode;
  const totem = preview ?? "low";
  const currentLabel = mode ? MODES[mode].label : null;

  return (
    <div style={orbStyle(mode)} className="relative mx-auto h-[164px] w-full max-w-[360px]">
      {/* 1. Default: flat 4-button nav bar, orb in the middle */}
      <motion.nav
        aria-label="Modes"
        animate={{ opacity: dragging ? 0 : 1, y: dragging ? 6 : 0, scale: dragging ? 0.97 : 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute inset-x-0 top-[14px] ${dragging ? "pointer-events-none" : ""}`}
      >
        <div className="grid h-[80px] grid-cols-[1fr_1fr_84px_1fr_1fr] items-start rounded-[1.75rem] border border-foreground/[0.06] bg-card/70 px-1 pt-[18px]">
          <NavButton mode={NAV_ORDER[0]} active={mode === NAV_ORDER[0]} onSelect={onSelect} />
          <NavButton mode={NAV_ORDER[1]} active={mode === NAV_ORDER[1]} onSelect={onSelect} />
          <span aria-hidden />
          <NavButton mode={NAV_ORDER[2]} active={mode === NAV_ORDER[2]} onSelect={onSelect} />
          <NavButton mode={NAV_ORDER[3]} active={mode === NAV_ORDER[3]} onSelect={onSelect} />
        </div>
      </motion.nav>

      <motion.p
        animate={{ opacity: dragging ? 0 : 1 }}
        transition={{ duration: 0.16 }}
        className="pointer-events-none absolute inset-x-0 top-[106px] text-center text-[11px] text-muted-foreground"
      >
        {currentLabel ? (
          <>
            <span className={`font-bold ${MODES[mode as OrbMode].text}`}>{currentLabel}</span> on · drag the orb to aim
          </>
        ) : (
          "Tap a mode, or drag the orb to aim"
        )}
      </motion.p>

      {/* 2. Drag: + crosshair centered on the orb's home */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 z-20 h-0 w-0" style={{ top: HOME_Y }}>
        <AnimatePresence>
          {dragging && (
            <motion.div
              key="crosshair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              transition={{ duration: 0.18 }}
            >
              <span
                className="crosshair-plate absolute rounded-full"
                style={{ width: PLATE, height: PLATE, left: -PLATE / 2, top: -PLATE / 2 }}
              />
              <span
                className="absolute rounded-full border border-dashed border-foreground/[0.08]"
                style={{ width: REACH * 2, height: REACH * 2, left: -REACH, top: -REACH }}
              />
              <span
                className="absolute rounded-full border border-dashed border-foreground/15"
                style={{ width: ORB, height: ORB, left: -ORB / 2, top: -ORB / 2 }}
              />
              {CROSS.map((dir) => (
                <Arm key={`arm-${dir}`} dir={dir} aim={aim} />
              ))}
              {CROSS.map((dir, index) => (
                <Target key={`target-${dir}`} dir={dir} index={index} aim={aim} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. The orb: free 2D drag, magnetic lock-on */}
      <div className="absolute left-1/2 z-30 h-0 w-0" style={{ top: HOME_Y }}>
        <motion.button
          type="button"
          drag
          dragConstraints={{ top: -DRAG_LIMIT, left: -DRAG_LIMIT, right: DRAG_LIMIT, bottom: DRAG_LIMIT }}
          dragElastic={0.2}
          dragMomentum={false}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 460, bounceDamping: 26 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onKeyDown={handleKeyDown}
          whileTap={{ scale: 0.96 }}
          whileDrag={{ scale: 1.04 }}
          style={{ x, y, width: ORB, height: ORB, left: -ORB / 2, top: -ORB / 2 }}
          aria-label={`Mode orb${currentLabel ? `, ${currentLabel} on` : ""}. Drag it onto a mode, or use the arrow keys.`}
          className="absolute cursor-grab touch-none select-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <motion.span
            aria-hidden
            style={{ x: magnetX, y: magnetY }}
            animate={{ scale: lockedMode ? 0.8 : 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
            className="pointer-events-none absolute inset-0"
          >
            <span style={orbStyle(preview)} className="absolute inset-0">
              <span className="orb-halo absolute -inset-7 rounded-full" />
              {preview === "panic" && <span className="orb-ripple absolute inset-0 rounded-full" />}
              <span className="orb absolute inset-0 grid place-items-center rounded-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={totem}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.16 }}
                    className="grid place-items-center"
                  >
                    <PixelTotem state={totem} size={42} decorative />
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

interface NavButtonProps {
  mode: OrbMode;
  active: boolean;
  onSelect: (mode: OrbMode) => void;
}

function NavButton({ mode, active, onSelect }: NavButtonProps) {
  const meta = MODES[mode];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      aria-pressed={active}
      className="group mx-auto flex min-w-0 flex-col items-center gap-1.5 rounded-xl transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-2xl border transition-colors duration-200 ${
          active ? `${meta.soft} ${meta.text}` : "border-foreground/[0.07] bg-background/60 text-muted-foreground group-hover:text-foreground"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
      </span>
      <span className={`whitespace-nowrap text-[10px] font-bold leading-none ${active ? meta.text : "text-muted-foreground"}`}>
        {meta.label}
      </span>
    </button>
  );
}

function Arm({ dir, aim }: { dir: OrbDirection; aim: Aim }) {
  const meta = MODES[DIRECTION_TO_MODE[dir]];
  const locked = aim.lock === dir;
  const lit = locked || aim.lean === dir;
  return (
    <span
      className="absolute rounded-full"
      style={{
        ...ARMS[dir],
        backgroundColor: lit ? tint(meta.colorVar, locked ? 0.9 : 0.55) : "hsl(var(--foreground) / 0.12)",
        transition: "background-color 160ms ease",
      }}
    />
  );
}

function Target({ dir, index, aim }: { dir: OrbDirection; index: number; aim: Aim }) {
  const meta = MODES[DIRECTION_TO_MODE[dir]];
  const Icon = meta.icon;
  const pos = TARGETS[dir];
  const locked = aim.lock === dir;
  const leaning = !locked && aim.lean === dir;
  const color = meta.colorVar;

  return (
    <motion.div
      className="absolute"
      style={{ left: pos.x - TARGET / 2, top: pos.y - TARGET / 2, width: TARGET, height: TARGET }}
      initial={{ opacity: 0, scale: 0.4, x: -pos.x * 0.55, y: -pos.y * 0.55 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, x: -pos.x * 0.4, y: -pos.y * 0.4, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 520, damping: 30, delay: index * 0.03 }}
    >
      <motion.span
        className="absolute inset-0 grid place-items-center rounded-full border"
        animate={{ scale: locked ? 1.45 : leaning ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 560, damping: 24 }}
        style={{
          color: `hsl(var(${color}))`,
          borderColor: tint(color, locked ? 0.95 : leaning ? 0.6 : 0.32),
          backgroundColor: tint(color, locked ? 0.24 : leaning ? 0.16 : 0.1),
          boxShadow: locked ? `0 0 0 3px ${tint(color, 0.22)}, 0 0 32px 6px ${tint(color, 0.5)}` : "none",
          transition: "border-color 160ms ease, background-color 160ms ease, box-shadow 200ms ease",
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={2.4} />
      </motion.span>
      <span
        className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold leading-none ${
          dir === "up" ? "bottom-full mb-2" : "top-full mt-2"
        } ${locked || leaning ? meta.text : "text-muted-foreground"}`}
      >
        {meta.label}
      </span>
    </motion.div>
  );
}