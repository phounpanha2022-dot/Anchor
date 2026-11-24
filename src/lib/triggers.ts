/** Identifiers for the five sensor-based triggers. */
export type TriggerId =
  | "leaving-home"
  | "leaving-cafe"
  | "arriving-home"
  | "over-press"
  | "doomscroll";

/** Banner kinds the iOS-style banner can show. */
export type BannerKind = "leaving-home" | "leaving-cafe" | "snapshot-saved";
