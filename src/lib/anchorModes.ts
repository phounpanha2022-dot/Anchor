import type { CSSProperties } from "react";
import { BatteryCharging, Flame, ShieldCheck, Waves, type LucideIcon } from "lucide-react";

/** The four orb modes. Each one maps to a pixel totem of the same name. */
export type OrbMode = "low" | "locked" | "owed" | "panic";
export type OrbDirection = "up" | "down" | "left" | "right";

export interface ModeMeta {
  mode: OrbMode;
  /** Name on the orb menu. */
  label: string;
  /** What the top Presence Pill says. */
  presence: string;
  direction: OrbDirection;
  icon: LucideIcon;
  /** CSS custom property holding this mode's HSL triplet. */
  colorVar: string;
  text: string;
  soft: string;
  dot: string;
  bar: string;
}

export const MODES: Record<OrbMode, ModeMeta> = {
  low: {
    mode: "low",
    label: "Low Chakra",
    presence: "Charging",
    direction: "down",
    icon: BatteryCharging,
    colorVar: "--chill",
    text: "text-chill",
    soft: "border-chill/30 bg-chill/10",
    dot: "bg-chill",
    bar: "bg-chill",
  },
  locked: {
    mode: "locked",
    label: "Locked In",
    presence: "Locked In",
    direction: "up",
    icon: Flame,
    colorVar: "--ember",
    text: "text-ember",
    soft: "border-ember/30 bg-ember/10",
    dot: "bg-ember",
    bar: "bg-ember",
  },
  owed: {
    mode: "owed",
    label: "Owed to Me",
    presence: "Me Time Protected",
    direction: "left",
    icon: ShieldCheck,
    colorVar: "--owed",
    text: "text-owed",
    soft: "border-owed/30 bg-owed/10",
    dot: "bg-owed",
    bar: "bg-owed",
  },
  panic: {
    mode: "panic",
    label: "Panic",
    presence: "Panic",
    direction: "right",
    icon: Waves,
    colorVar: "--calm",
    text: "text-calm",
    soft: "border-calm/30 bg-calm/10",
    dot: "bg-calm",
    bar: "bg-calm",
  },
};

export const DIRECTION_TO_MODE: Record<OrbDirection, OrbMode> = {
  up: "locked",
  down: "low",
  left: "owed",
  right: "panic",
};

export const LOCK_IN_MS = 20 * 60_000;
export const OWED_MS = 30 * 60_000;

/** Timed modes end on their own; the others stay on until you exit. */
export function modeDuration(mode: OrbMode): number | null {
  if (mode === "locked") return LOCK_IN_MS;
  if (mode === "owed") return OWED_MS;
  return null;
}

/** Sets --orb for the orb zone so the glow follows the active mode. */
export function orbStyle(mode: OrbMode | null): CSSProperties {
  const meta = MODES[mode ?? "low"];
  return { "--orb": `var(${meta.colorVar})` } as CSSProperties;
}