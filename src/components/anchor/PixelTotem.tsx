import { useEffect, useState } from "react";

export type TotemState = "low" | "locked" | "owed" | "panic";

/**
 * 16x16 pixel totems. Each grid uses:
 *   "."  empty      "1" light     "2" mid     "3" shadow     "W" highlight
 * The solid black outer outline is added automatically around the shape,
 * so the art stays easy to edit. To swap in a PNG sprite later, pass
 * `spriteSrc` and the SVG is skipped.
 */
type Grid = readonly string[];
type Palette = Record<string, string>;

interface TotemArt {
  name: string;
  palette: Palette;
  frames: Grid[];
  frameMs?: number;
  motionClass: string;
}

const OUTLINE = "#000000";
const SIZE = 16;

const LOW_EMBER: Grid = [
  "................",
  "................",
  "................",
  ".......22.......",
  "......2222......",
  "......2112......",
  ".....221122.....",
  ".....211112.....",
  "....2211W112....",
  "....211WW112....",
  "....211WW113....",
  "....32111123....",
  ".....321123.....",
  "......3333......",
  "................",
  "................",
];

const FLAME_BASE: Grid = [
  "..3233211233223.",
  "..3222111122223.",
  "..32211W1112223.",
  "..3211WWW111223.",
  "..3211WWWW11223.",
  "...3211WW11223..",
  "...32211112233..",
  "....332222333...",
  "......33333.....",
  "................",
];

const FLAME_A: Grid = [
  "................",
  ".......3........",
  "......33....3...",
  "......323..33...",
  "..3..3223..323..",
  "..33.32123.3223.",
  ...FLAME_BASE,
];

const FLAME_B: Grid = [
  "................",
  "........3.......",
  ".......33..3....",
  ".......323.33...",
  "...3..3223.323..",
  "..323.32123.323.",
  ...FLAME_BASE,
];

const EMERALD_SHIELD: Grid = [
  "................",
  "................",
  "...111111122....",
  "..11222222333...",
  "..11222222333...",
  "..112WW2WW333...",
  "..11WWWWWWW33...",
  "..112WWWWW333...",
  "..1122WWW2333...",
  "..11222W22333...",
  "...122222233....",
  "....2222223.....",
  ".....22223......",
  "......223.......",
  ".......3........",
  "................",
];

const WATER_RIPPLE: Grid = [
  "................",
  "................",
  ".....111111.....",
  "....1WW11111....",
  "...1W11111111...",
  "..112211112211..",
  "..222222222222..",
  "..22WW2222WW22..",
  "..222222222222..",
  "..223322223322..",
  "..333333333333..",
  "...3323333233...",
  "....33333333....",
  ".....333333.....",
  "................",
  "................",
];

const TOTEMS: Record<TotemState, TotemArt> = {
  low: {
    name: "Low ember",
    palette: { W: "#D6ECFF", "1": "#8EC1F2", "2": "#4A86C8", "3": "#27497E" },
    frames: [LOW_EMBER],
    motionClass: "totem-flicker",
  },
  locked: {
    name: "Chakra flame",
    palette: { W: "#FFF4C2", "1": "#FFD04A", "2": "#FF6A2B", "3": "#C81E36" },
    frames: [FLAME_A, FLAME_B],
    frameMs: 220,
    motionClass: "totem-flame",
  },
  owed: {
    name: "Emerald shield",
    palette: { W: "#E8FFF1", "1": "#8DF2B5", "2": "#2EC777", "3": "#137A48" },
    frames: [EMERALD_SHIELD],
    motionClass: "totem-glow",
  },
  panic: {
    name: "Water ripple",
    palette: { W: "#DDE3FA", "1": "#A7B2DE", "2": "#6874AB", "3": "#3B4472" },
    frames: [WATER_RIPPLE],
    motionClass: "totem-ripple",
  },
};

interface PixelRun {
  x: number;
  y: number;
  w: number;
  fill: string;
}

/** Turns a grid into horizontal runs of same-colored pixels, adding the black outline. */
function rasterize(grid: Grid, palette: Palette): PixelRun[] {
  const read = (x: number, y: number): string => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return ".";
    return grid[y]?.[x] ?? ".";
  };
  const resolve = (x: number, y: number): string => {
    const cell = read(x, y);
    if (cell !== ".") return cell;
    const touchesShape =
      read(x - 1, y) !== "." || read(x + 1, y) !== "." || read(x, y - 1) !== "." || read(x, y + 1) !== ".";
    return touchesShape ? "K" : ".";
  };

  const runs: PixelRun[] = [];
  for (let y = 0; y < SIZE; y++) {
    let x = 0;
    while (x < SIZE) {
      const cell = resolve(x, y);
      if (cell === ".") {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < SIZE && resolve(end, y) === cell) end++;
      runs.push({ x, y, w: end - x, fill: cell === "K" ? OUTLINE : palette[cell] ?? OUTLINE });
      x = end;
    }
  }
  return runs;
}

const RASTERS: Record<TotemState, PixelRun[][]> = {
  low: TOTEMS.low.frames.map((frame) => rasterize(frame, TOTEMS.low.palette)),
  locked: TOTEMS.locked.frames.map((frame) => rasterize(frame, TOTEMS.locked.palette)),
  owed: TOTEMS.owed.frames.map((frame) => rasterize(frame, TOTEMS.owed.palette)),
  panic: TOTEMS.panic.frames.map((frame) => rasterize(frame, TOTEMS.panic.palette)),
};

function useFrame(count: number, frameMs: number, enabled: boolean) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!enabled || count < 2 || !frameMs) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % count), frameMs);
    return () => window.clearInterval(timer);
  }, [count, frameMs, enabled]);
  return frame;
}

interface PixelTotemProps {
  state: TotemState;
  /** Rendered size in px (the art is always 16x16). */
  size?: number;
  className?: string;
  animated?: boolean;
  /** Hide from screen readers when a parent already describes it. */
  decorative?: boolean;
  /** Optional PNG sprite to use instead of the built-in pixel art. */
  spriteSrc?: string;
}

export function PixelTotem({
  state,
  size = 48,
  className = "",
  animated = true,
  decorative = false,
  spriteSrc,
}: PixelTotemProps) {
  const art = TOTEMS[state];
  const frames = RASTERS[state];
  const frame = useFrame(frames.length, art.frameMs ?? 0, animated);
  const classes = `${animated ? art.motionClass : ""} ${className}`.trim();
  const label = `${art.name} totem`;

  if (spriteSrc) {
    return (
      <img
        src={spriteSrc}
        alt={decorative ? "" : label}
        width={size}
        height={size}
        className={classes}
        style={{ imageRendering: "pixelated" }}
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={classes}
      data-totem={state}
    >
      {frames[frame % frames.length].map((run, i) => (
        <rect key={i} x={run.x} y={run.y} width={run.w} height={1} fill={run.fill} />
      ))}
    </svg>
  );
}